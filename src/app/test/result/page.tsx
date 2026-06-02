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
import Image from "next/image";

export default function ResultDashboard() {
  const router = useRouter();
  const { answers, userDetails } = useTestStore();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("Overview");
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

      try {
        // 1. Insert User
        const { data: userData, error: userError } = await supabase
          .from("users")
          .insert({
            full_name: userDetails.name,
            email: userDetails.email,
            phone: userDetails.phone || null,
            city: userDetails.city || null,
            age: userDetails.age,
            retire_at: userDetails.retireAt
          })
          .select()
          .single();

        if (userError) throw userError;

        // 2. Insert Test Results
        const journeyScore = Math.round((metrics.protectionScore * 0.3) + (metrics.retirementScore * 0.4) + (metrics.goalsScore * 0.3));
        
        await supabase.from("test_results").insert({
          user_id: userData.id,
          raw_answers: answers,
          health_score: metrics.overallScore,
          retirement_score: metrics.retirementScore,
          goals_score: metrics.goalsScore,
          protection_score: metrics.protectionScore,
          journey_score: journeyScore
        });

        // 3. Insert CRM Lead
        await supabase.from("leads").insert({
          user_id: userData.id,
          status: 'New Lead'
        });

        localStorage.setItem("test_saved", "true");
        console.log("Successfully saved assessment to Supabase CRM");
      } catch (e: any) {
        console.error("Failed to save to Supabase CRM:", e?.message || e?.details || e);
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
