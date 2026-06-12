"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTestStore } from "@/store/useTestStore";
import { calculateDashboardMetrics } from "@/lib/scoring";
import { Edit, Mail, ArrowLeft, BarChart2, TrendingUp, Target, Shield, Map } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { RetirementTab } from "@/components/dashboard/RetirementTab";
import { GoalsTab } from "@/components/dashboard/GoalsTab";
import { ProtectionTab } from "@/components/dashboard/ProtectionTab";
import { LifeJourneyTab } from "@/components/dashboard/LifeJourneyTab";
import { DownloadPDFButton } from "@/components/pdf/DownloadPDFButton";
import { supabase } from "@/lib/supabase";
import { sanitizeInput } from "@/lib/utils";
import Image from "next/image";

export default function ResultDashboard() {
  const router = useRouter();
  const { answers, userDetails } = useTestStore();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Overview");
  const [saveErrors, setSaveErrors] = React.useState<string[]>([]);
  const reportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
    if (!answers.monthlyIncome && typeof window !== 'undefined') {
      router.push("/test");
    }
  }, [answers, router]);

  const metrics = mounted ? calculateDashboardMetrics(answers, userDetails) : null;

  // Save to Supabase DB on first load
  React.useEffect(() => {
    const saveToDb = async () => {
      // Prevent duplicate saves using localStorage flag
      if (typeof window === "undefined" || localStorage.getItem("test_saved") === "true") return;
      if (!userDetails.email || !metrics) return;

      const errorsToReport: string[] = [];

      try {
        // Sanitize details before saving
        const sanitizedName = sanitizeInput(userDetails.name || "");
        const sanitizedEmail = (userDetails.email || "").trim().toLowerCase();
        const sanitizedPhone = (userDetails.phone || "").trim();
        const sanitizedCity = sanitizeInput(userDetails.city || "");

        // 1. Insert User
        let userData: any = null;
        let userErrorMsg: string | null = null;

        try {
          // Attempt full insert first
          const { data, error } = await supabase
            .from("users")
            .insert({
              full_name: sanitizedName,
              email: sanitizedEmail,
              phone: sanitizedPhone || null,
              city: sanitizedCity || null,
              age: userDetails.age,
              retire_at: userDetails.retireAt,
              parents_selected: answers.parentsSelected ?? false,
              parents_receive_pension: answers.parentsReceivePension || null,
              parent_monthly_pension: answers.parentMonthlyPension ?? 0,
              parent_monthly_support: answers.parentMonthlySupport ?? 0,
              parent_dependency_level: answers.parentDependencyLevel || null,
              parent_dependency_percentage: answers.parentDependencyPercentage ?? 0
            })
            .select()
            .single();

          if (error) throw error;
          userData = data;
        } catch (err: any) {
          console.warn("Full user insert failed, retrying with basic columns. Error:", err?.message || err);
          // Retry with basic columns
          const { data, error } = await supabase
            .from("users")
            .insert({
              full_name: sanitizedName,
              email: sanitizedEmail,
              phone: sanitizedPhone || null,
              city: sanitizedCity || null,
              age: userDetails.age,
              retire_at: userDetails.retireAt
            })
            .select()
            .single();

          if (error) {
            userErrorMsg = err?.message || String(err);
            console.error("Failed to save user:", error.message || error);
            errorsToReport.push(`Failed to save user: ${error.message}`);
          } else {
            userData = data;
          }
        }

        if (userData) {
          console.log("User Saved Successfully");

          // 2. Insert Test Results
          const journeyScore = Math.round((metrics.protectionScore * 0.3) + (metrics.retirementScore * 0.4) + (metrics.goalsScore * 0.3));
          const { error: testResultError } = await supabase.from("test_results").insert({
            user_id: userData.id,
            raw_answers: answers,
            health_score: metrics.overallScore,
            retirement_score: metrics.retirementScore,
            goals_score: metrics.goalsScore,
            protection_score: metrics.protectionScore,
            journey_score: journeyScore
          });

          if (testResultError) {
            console.error("Failed to save assessment:", testResultError.message);
            errorsToReport.push(`Failed to save assessment: ${testResultError.message}`);
          } else {
            console.log("Assessment Saved Successfully");
          }

          // 3. Insert CRM Lead (Attempt 'leads' table first, fallback to 'lead_status')
          const { error: leadError } = await supabase.from("leads").insert({
            user_id: userData.id,
            status: 'New Lead'
          });

          if (leadError) {
            console.warn("Inserting into leads table failed, trying lead_status table:", leadError.message);
            const { error: leadStatusError } = await supabase.from("lead_status").insert({
              user_id: userData.id,
              status: 'New Lead'
            });

            if (leadStatusError) {
              console.error("Failed to create lead:", leadStatusError.message);
              errorsToReport.push(`Failed to create lead: ${leadStatusError.message}`);
            } else {
              console.log("Lead Saved Successfully");
            }
          } else {
            console.log("Lead Saved Successfully");
          }

          // 4. Insert Financial Report (optional, non-blocking)
          try {
            const { error: finReportError } = await supabase.from("financial_reports").insert({
              user_id: userData.id,
              metrics: metrics,
              created_at: new Date().toISOString()
            });

            if (finReportError) {
              console.error("Failed to save financial report:", finReportError.message);
              errorsToReport.push(`Failed to save financial report: ${finReportError.message}`);
            }
          } catch (e: any) {
            console.error("Failed to save financial report:", e?.message || e);
            errorsToReport.push(`Failed to save financial report: ${e?.message || e}`);
          }

          // 5. Insert PDF Report (optional, non-blocking)
          try {
            const { error: pdfReportError } = await supabase.from("pdf_reports").insert({
              user_id: userData.id,
              pdf_url: `/api/pdf?id=${userData.id}`,
              created_at: new Date().toISOString()
            });

            if (pdfReportError) {
              console.error("Failed to save PDF:", pdfReportError.message);
              errorsToReport.push(`Failed to save PDF: ${pdfReportError.message}`);
            } else {
              console.log("PDF Saved Successfully");
            }
          } catch (e: any) {
            console.error("Failed to save PDF:", e?.message || e);
            errorsToReport.push(`Failed to save PDF: ${e?.message || e}`);
          }

          // Set saved flag since the core user was created
          localStorage.setItem("test_saved", "true");
        }
      } catch (e: any) {
        console.error("Failed to save to Supabase CRM:", e?.message || e?.details || e);
        errorsToReport.push(`Failed to save to Supabase CRM: ${e?.message || e}`);
      }

      if (errorsToReport.length > 0) {
        setSaveErrors(errorsToReport);
      }
    };

    if (mounted && metrics) {
      saveToDb();
    }
  }, [mounted, userDetails, answers, metrics]);

  if (!mounted || !answers.monthlyIncome || !metrics) return null;

  const tabs = [
    { id: "Overview", icon: <BarChart2 size={16} /> },
    { id: "Retirement", icon: <TrendingUp size={16} /> },
    { id: "Goals", icon: <Target size={16} /> },
    { id: "Protection", icon: <Shield size={16} /> },
    { id: "Life Journey", icon: <Map size={16} /> }
  ];

  return (
    // We use a fixed full-screen overlay to hide the standard Navbar and Footer
    <div className="fixed inset-0 z-50 bg-[#0A0A0A] overflow-y-auto text-white flex flex-col">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0E0E0E] border-b border-[rgba(255,255,255,0.08)] px-4 sm:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        
        <div className="flex flex-col w-full md:w-auto">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
             <Button variant="ghost" className="p-0 h-auto hover:bg-transparent" onClick={() => router.push("/test")}>
               <ArrowLeft size={20} className="text-[#B5B5B5] hover:text-white" />
             </Button>
             <div className="relative w-8 h-8 overflow-hidden flex items-center justify-center shrink-0">
                <Image 
                  src="/images/logo.png" 
                  alt="Bharosa Bhai Logo" 
                  width={32}
                  height={32}
                  className="object-contain"
                />
             </div>
             <h1 className="text-sm sm:text-base md:text-xl font-black font-heading text-white break-words">
               Bharosa <span className="text-[#F7B500]">Bhai</span> <span className="text-[#B5B5B5] font-normal mx-1 sm:mx-2">|</span> {userDetails.name}'s Financial Plan
             </h1>
          </div>
          <div className="text-xs sm:text-sm text-[#B5B5B5] mt-1 ml-8 sm:ml-10">
            Age {userDetails.age} • {userDetails.city || 'India'} • Retiring at {userDetails.retireAt}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 w-full md:w-auto">
          <Button variant="ghost" className="gap-2 text-[#B5B5B5] hover:text-white border border-[rgba(255,255,255,0.08)] bg-[#121212] text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
            <Edit size={14} /> Edit Details
          </Button>
          <Button variant="ghost" className="gap-2 text-[#B5B5B5] hover:text-white border border-[rgba(255,255,255,0.08)] bg-[#121212] text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2">
            <Mail size={14} /> Email Report
          </Button>
          <DownloadPDFButton metrics={metrics} user={userDetails} answers={answers} />
        </div>

      </header>

      {/* Sticky Tabs */}
      <div className="sticky top-[89px] z-30 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] px-6">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? "border-[#F7B500] text-white" 
                  : "border-transparent text-[#B5B5B5] hover:text-white hover:border-[rgba(255,255,255,0.2)]"
              }`}
            >
              {React.cloneElement(tab.icon as any, { className: activeTab === tab.id ? "text-[#F7B500]" : "text-[#B5B5B5]" })}
              {tab.id}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full" ref={reportRef}>
        {saveErrors.length > 0 && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <h4 className="font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Database Submission Warning
            </h4>
            <p className="text-red-400/90 text-xs">Some records could not be saved to the CRM database due to schema limits. The system will continue, but please notify support.</p>
            <ul className="list-disc list-inside space-y-1 text-red-400 text-xs mt-1">
              {saveErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === "Overview" && <OverviewTab metrics={metrics} user={userDetails} answers={answers} />}
        {activeTab === "Retirement" && <RetirementTab user={userDetails} answers={answers} />}
        {activeTab === "Goals" && <GoalsTab user={userDetails} answers={answers} />}
        {activeTab === "Protection" && <ProtectionTab user={userDetails} answers={answers} />}
        {activeTab === "Life Journey" && <LifeJourneyTab user={userDetails} answers={answers} metrics={metrics} />}
        
        {activeTab !== "Overview" && activeTab !== "Retirement" && activeTab !== "Goals" && activeTab !== "Protection" && activeTab !== "Life Journey" && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 bg-[#171717] rounded-full flex items-center justify-center mb-6 border border-[rgba(255,255,255,0.08)]">
               {React.cloneElement(tabs.find(t => t.id === activeTab)?.icon as any, { size: 32, className: "text-[#F7B500]" })}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{activeTab} Details</h2>
            <p className="text-[#B5B5B5] max-w-md">Detailed charts, projections, and calculators for your {activeTab.toLowerCase()} plan are being prepared. This tab is currently a placeholder.</p>
          </div>
        )}
      </main>

    </div>
  );
}
