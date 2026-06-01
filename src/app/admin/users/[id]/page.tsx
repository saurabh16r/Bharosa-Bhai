"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { RetirementTab } from "@/components/dashboard/RetirementTab";
import { GoalsTab } from "@/components/dashboard/GoalsTab";
import { ProtectionTab } from "@/components/dashboard/ProtectionTab";
import { LifeJourneyTab } from "@/components/dashboard/LifeJourneyTab";
import { DownloadPDFButton } from "@/components/pdf/DownloadPDFButton";
import { ArrowLeft, User as UserIcon, Phone, Mail, MapPin } from "lucide-react";
import { calculateDashboardMetrics } from "@/lib/scoring";

export default function UserProfile() {
  const { id } = useParams();
  const router = useRouter();
  
  const [userRecord, setUserRecord] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [leadRecord, setLeadRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    fetchUserData();
  }, [id]);

  const fetchUserData = async () => {
    try {
      const { data: uData, error: uError } = await supabase.from('users').select('*').eq('id', id).single();
      if (uError) throw uError;
      
      const { data: tData } = await supabase.from('test_results').select('*').eq('user_id', id).order('created_at', { ascending: false }).limit(1);
      const { data: lData } = await supabase.from('leads').select('*').eq('user_id', id).single();

      setUserRecord(uData);
      setTestResult(tData?.[0] || null);
      setLeadRecord(lData || null);

    } catch (err) {
      console.error("Error fetching user data:", err);
      // Fallback for demo if DB isn't connected
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (newStatus: string) => {
    if (!leadRecord) return;
    setLeadRecord({ ...leadRecord, status: newStatus });
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadRecord.id);
  };

  if (loading) {
    return <div className="text-white p-8">Loading User Profile...</div>;
  }

  if (!userRecord) {
    return <div className="text-white p-8">User not found in database.</div>;
  }

  // Reconstruct answers and user profile from DB JSON
  const answers = testResult?.raw_answers || {};
  const userDetails = {
    name: userRecord.full_name,
    email: userRecord.email,
    age: userRecord.age,
    retireAt: userRecord.retire_at,
    city: userRecord.city
  };

  // Recalculate metrics on the fly based on the raw DB answers
  const metrics = testResult ? calculateDashboardMetrics(answers, userDetails) : null;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <button onClick={() => router.push('/admin/users')} className="flex items-center gap-2 text-[#B5B5B5] hover:text-white mb-6 transition-colors">
         <ArrowLeft size={16} /> Back to CRM
      </button>

      {/* CRM HEADER */}
      <div className="bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#1E88FF]/10 text-[#1E88FF] rounded-full flex items-center justify-center">
               <UserIcon size={32} />
            </div>
            <div>
               <h1 className="text-2xl font-bold text-white mb-1">{userRecord.full_name}</h1>
               <div className="flex gap-4 text-sm text-[#B5B5B5]">
                  <span className="flex items-center gap-1"><Mail size={14} /> {userRecord.email}</span>
                  {userRecord.phone && <span className="flex items-center gap-1"><Phone size={14} /> {userRecord.phone}</span>}
                  {userRecord.city && <span className="flex items-center gap-1"><MapPin size={14} /> {userRecord.city}</span>}
               </div>
            </div>
         </div>
         
         <div className="flex flex-col gap-2 w-full md:w-auto">
            <label className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider">CRM Lead Status</label>
            <select 
              value={leadRecord?.status || 'New Lead'}
              onChange={(e) => updateLeadStatus(e.target.value)}
              className="bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2 rounded-lg outline-none focus:border-[#F7B500] w-full md:w-48"
            >
               <option value="New Lead">New Lead</option>
               <option value="Contacted">Contacted</option>
               <option value="Consultation Scheduled">Consultation Scheduled</option>
               <option value="Converted">Converted</option>
               <option value="Lost">Lost</option>
            </select>
         </div>
      </div>

      {!testResult ? (
        <div className="p-12 text-center bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-xl">
           <p className="text-[#B5B5B5]">This user has not completed the financial assessment yet.</p>
        </div>
      ) : (
        <>
          {/* TABS */}
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] mb-8 pb-4">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
               {["Overview", "Retirement", "Goals", "Protection", "Life Journey"].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                     activeTab === tab
                       ? "bg-[#F7B500] text-black shadow-[0_0_15px_rgba(247,181,0,0.3)]"
                       : "bg-[#171717] text-[#B5B5B5] hover:bg-white/[0.04] border border-[rgba(255,255,255,0.08)]"
                   }`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
            <div className="hidden md:block">
               <DownloadPDFButton metrics={metrics!} user={userDetails} answers={answers} />
            </div>
          </div>

          {/* DYNAMIC DASHBOARD RENDER */}
          <div className="w-full">
            {activeTab === "Overview" && <OverviewTab metrics={metrics!} user={userDetails} answers={answers} />}
            {activeTab === "Retirement" && <RetirementTab user={userDetails} answers={answers} />}
            {activeTab === "Goals" && <GoalsTab user={userDetails} answers={answers} />}
            {activeTab === "Protection" && <ProtectionTab user={userDetails} answers={answers} />}
            {activeTab === "Life Journey" && <LifeJourneyTab user={userDetails} answers={answers} metrics={metrics!} />}
          </div>
        </>
      )}

    </div>
  );
}
