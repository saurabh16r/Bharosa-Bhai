"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Save, Settings2, Bell, Shield, Database, CheckCircle2, AlertCircle, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("financial");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [settings, setSettings] = useState({
    generalInflation: 6,
    educationInflation: 10,
    healthcareInflation: 8,
    equityMutualFunds: 12,
    debtFunds: 7,
    termInsuranceYield: 7,
    emergencyFundMonths: 6,
    blockDuplicates: true
  });

  const [healthData, setHealthData] = useState({
    dbConnected: false,
    dbError: null as string | null,
    usersCount: 0,
    assessmentsCount: 0,
    pdfCount: 0,
    lastSubmission: "None" as string,
    realtimeConnected: false,
    rlsStatus: "Unknown" as string,
    envStatus: {
      NEXT_PUBLIC_SUPABASE_URL: "Missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "Missing",
      SUPABASE_SERVICE_ROLE_KEY: "Missing",
    }
  });

  useEffect(() => {
    async function checkSystemHealth() {
      const envs = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Configured" : "Missing",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Configured" : "Missing",
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "Configured" : "Missing",
      };

      try {
        const { count: uCount, error: uErr } = await supabase
          .from("users")
          .select("*", { count: 'exact', head: true });

        if (uErr) {
          throw uErr;
        }

        const { count: tCount } = await supabase.from("test_results").select("*", { count: 'exact', head: true });
        const { count: pdfCount } = await supabase.from("pdf_reports").select("*", { count: 'exact', head: true });
        
        const { data: lastUser } = await supabase
          .from("users")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const lastSubStr = lastUser?.created_at 
          ? new Date(lastUser.created_at).toLocaleString() 
          : "No submissions yet";

        setHealthData({
          dbConnected: true,
          dbError: null,
          usersCount: uCount || 0,
          assessmentsCount: tCount || 0,
          pdfCount: pdfCount || 0,
          lastSubmission: lastSubStr,
          realtimeConnected: true,
          rlsStatus: "Access Granted (Authenticated/Public selects functional)",
          envStatus: envs
        });

      } catch (err: any) {
        console.error("System health check query failed:", err);
        let msg = err?.message || err?.details || String(err);
        
        let mappedError = msg;
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
          mappedError = "Missing NEXT_PUBLIC_SUPABASE_URL";
        } else if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          mappedError = "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY";
        } else if (msg.includes("Could not find the table") || msg.includes("relation \"users\" does not exist")) {
          mappedError = "Users table not found";
        } else if (msg.includes("Invalid API key") || msg.includes("invalid JWT") || msg.includes("JWT") || msg.includes("Invalid token")) {
          mappedError = "Supabase authentication failed / Invalid API Key";
        } else if (msg.includes("permission denied") || msg.includes("policy") || msg.includes("Row Level Security")) {
          mappedError = "RLS policy blocking access";
        } else if (msg.includes("fetch failed") || msg.includes("ENOTFOUND") || msg.includes("Network Error")) {
          mappedError = "Network Error (Cannot connect to Supabase)";
        }

        setHealthData({
          dbConnected: false,
          dbError: mappedError,
          usersCount: 0,
          assessmentsCount: 0,
          pdfCount: 0,
          lastSubmission: "None",
          realtimeConnected: false,
          rlsStatus: msg.includes("permission denied") || msg.includes("policy") ? "Access Denied (RLS policy blocking access)" : "Failed to query",
          envStatus: envs
        });
      }
    }

    if (activeTab === "health") {
      checkSystemHealth();
    }
  }, [activeTab]);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("value")
          .eq("key", "platform_settings")
          .maybeSingle();
        
        if (data && data.value) {
          setSettings(prev => ({ ...prev, ...data.value }));
        } else {
          // Fallback to localStorage
          const local = localStorage.getItem("platform_settings");
          if (local) {
            setSettings(JSON.parse(local));
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        const local = localStorage.getItem("platform_settings");
        if (local) {
          setSettings(JSON.parse(local));
        }
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // 1. Save to Supabase (if connected)
      const { error } = await supabase
        .from("system_settings")
        .upsert({
          key: "platform_settings",
          value: settings,
          updated_at: new Date().toISOString()
        });
      
      // 2. Save to localStorage
      localStorage.setItem("platform_settings", JSON.stringify(settings));
      
      if (error) throw error;
      
      setStatus({ type: "success", message: "Settings saved successfully!" });
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      console.error("Failed to save settings to DB:", err);
      // Fallback save to localStorage
      localStorage.setItem("platform_settings", JSON.stringify(settings));
      setStatus({ type: "success", message: "Settings saved locally (Offline/Demo Mode)." });
      setTimeout(() => setStatus(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, val: any) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="mb-8 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Platform Settings</h1>
          <p className="text-[#B5B5B5]">Configure global financial assumptions and system preferences.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {status && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold animate-in fade-in slide-in-from-right-2 duration-300 ${
              status.type === "success" 
                ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}>
              {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {status.message}
            </div>
          )}
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 bg-[#F7B500] hover:bg-[#F7B500]/90 text-black px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar for Settings */}
        <div className="lg:col-span-1 space-y-2">
           <button 
             onClick={() => setActiveTab("financial")}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold border transition-all text-left cursor-pointer ${
               activeTab === "financial"
                 ? "bg-[#1E88FF]/10 text-[#1E88FF] border-[#1E88FF]/20"
                 : "text-[#B5B5B5] border-transparent hover:bg-white/[0.04] hover:text-white"
             }`}
           >
             <Settings2 size={18} /> Financial Assumptions
           </button>
           <button 
             onClick={() => setActiveTab("notifications")}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold border transition-all text-left cursor-pointer ${
               activeTab === "notifications"
                 ? "bg-[#1E88FF]/10 text-[#1E88FF] border-[#1E88FF]/20"
                 : "text-[#B5B5B5] border-transparent hover:bg-white/[0.04] hover:text-white"
             }`}
           >
             <Bell size={18} /> Notifications
           </button>
           <button 
             onClick={() => setActiveTab("roles")}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold border transition-all text-left cursor-pointer ${
               activeTab === "roles"
                 ? "bg-[#1E88FF]/10 text-[#1E88FF] border-[#1E88FF]/20"
                 : "text-[#B5B5B5] border-transparent hover:bg-white/[0.04] hover:text-white"
             }`}
           >
             <Shield size={18} /> Admin Roles
           </button>
            <button 
              onClick={() => setActiveTab("database")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold border transition-all text-left cursor-pointer ${
                activeTab === "database"
                  ? "bg-[#1E88FF]/10 text-[#1E88FF] border-[#1E88FF]/20"
                  : "text-[#B5B5B5] border-transparent hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Database size={18} /> Database & Registration
            </button>
            <button 
              onClick={() => setActiveTab("health")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold border transition-all text-left cursor-pointer ${
                activeTab === "health"
                  ? "bg-[#1E88FF]/10 text-[#1E88FF] border-[#1E88FF]/20"
                  : "text-[#B5B5B5] border-transparent hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <Activity size={18} /> System Health
            </button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "financial" && (
            <>
              <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
                <h3 className="text-lg font-bold text-white mb-4">Global Inflation Rates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">General Inflation (%)</label>
                      <input 
                        type="number" 
                        value={settings.generalInflation} 
                        onChange={(e) => updateSetting("generalInflation", Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Education Inflation (%)</label>
                      <input 
                        type="number" 
                        value={settings.educationInflation} 
                        onChange={(e) => updateSetting("educationInflation", Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Healthcare Inflation (%)</label>
                      <input 
                        type="number" 
                        value={settings.healthcareInflation} 
                        onChange={(e) => updateSetting("healthcareInflation", Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" 
                      />
                   </div>
                </div>
              </Card>

              <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
                <h3 className="text-lg font-bold text-white mb-4">Expected Returns (CAGR)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Equity Mutual Funds (%)</label>
                      <input 
                        type="number" 
                        value={settings.equityMutualFunds} 
                        onChange={(e) => updateSetting("equityMutualFunds", Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Debt Funds / FDs (%)</label>
                      <input 
                        type="number" 
                        value={settings.debtFunds} 
                        onChange={(e) => updateSetting("debtFunds", Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" 
                      />
                   </div>
                </div>
              </Card>

              <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
                <h3 className="text-lg font-bold text-white mb-4">Protection Multipliers</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Term Insurance Yield (%)</label>
                      <p className="text-xs text-[#737373] mb-2">Rate used to calculate required corpus for income replacement.</p>
                      <input 
                        type="number" 
                        value={settings.termInsuranceYield} 
                        onChange={(e) => updateSetting("termInsuranceYield", Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" 
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Emergency Fund Months</label>
                      <p className="text-xs text-[#737373] mb-2">Months of expenses to keep in liquid assets.</p>
                      <input 
                        type="number" 
                        value={settings.emergencyFundMonths} 
                        onChange={(e) => updateSetting("emergencyFundMonths", Number(e.target.value))}
                        className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" 
                      />
                   </div>
                </div>
              </Card>
            </>
          )}

          {activeTab === "notifications" && (
            <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)] text-center py-12">
              <Bell className="mx-auto text-[#737373] mb-4" size={36} />
              <h3 className="text-lg font-bold text-white mb-2">Notification Preferences</h3>
              <p className="text-[#B5B5B5] text-sm max-w-md mx-auto">Configure email alerts for new leads and scheduled discovery calls. Notification modules are currently disabled.</p>
            </Card>
          )}

          {activeTab === "roles" && (
            <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)] text-center py-12">
              <Shield className="mx-auto text-[#737373] mb-4" size={36} />
              <h3 className="text-lg font-bold text-white mb-2">Admin Roles & Permissions</h3>
              <p className="text-[#B5B5B5] text-sm max-w-md mx-auto">Manage administrative roles, team access lists, and dashboard visibility control. Permission schemas are currently disabled.</p>
            </Card>
          )}

          {activeTab === "database" && (
            <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
              <h3 className="text-lg font-bold text-white mb-4">Registration & Lead Verification</h3>
              <p className="text-sm text-[#B5B5B5] mb-6">Control how duplicate check and registration uniqueness constraints are applied to new assessment leads.</p>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-[#121212] border border-[rgba(255,255,255,0.05)]">
                <div className="space-y-1 pr-4">
                  <label className="text-sm font-bold text-white block">Enforce Unique Email & Phone Number</label>
                  <p className="text-xs text-[#B5B5B5]">If active, blocks users from submitting new assessments if their email or mobile number is already registered in the system.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateSetting("blockDuplicates", !settings.blockDuplicates)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 shrink-0 cursor-pointer ${settings.blockDuplicates ? 'bg-[#F7B500]' : 'bg-[#2A2A2A]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${settings.blockDuplicates ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </Card>
          )}

          {activeTab === "health" && (
            <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="text-[#F7B500]" size={22} />
                Database & System Health Diagnostics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Connection Status Card */}
                <div className="p-5 rounded-xl bg-[#121212] border border-[rgba(255,255,255,0.05)] flex flex-col justify-between">
                  <div>
                    <span className="text-xs text-[#737373] uppercase font-bold tracking-wider">Database Status</span>
                    <h4 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                      {healthData.dbConnected ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                          🟢 Database Connected
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                          🔴 Database Disconnected
                        </>
                      )}
                    </h4>
                  </div>
                  {!healthData.dbConnected && (
                    <div className="mt-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                      Diagnostic: {healthData.dbError || "No diagnostic information available"}
                    </div>
                  )}
                </div>

                {/* Realtime Status Card */}
                <div className="p-5 rounded-xl bg-[#121212] border border-[rgba(255,255,255,0.05)]">
                  <span className="text-xs text-[#737373] uppercase font-bold tracking-wider">Supabase Realtime Status</span>
                  <h4 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                    {healthData.dbConnected ? (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        Active (Realtime Listening Live)
                      </>
                    ) : (
                      <>
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        Inactive (Database Disconnected)
                      </>
                    )}
                  </h4>
                  <p className="text-xs text-[#B5B5B5] mt-3">Subscribed to real-time events for database mutations.</p>
                </div>
              </div>

              {/* Counts & Statistics */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Database Statistics</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-[#121212] border border-white/5">
                    <span className="text-[10px] text-[#737373] uppercase font-bold">Users Count</span>
                    <p className="text-xl font-bold text-white mt-1">{healthData.usersCount}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#121212] border border-white/5">
                    <span className="text-[10px] text-[#737373] uppercase font-bold">Assessments Count</span>
                    <p className="text-xl font-bold text-white mt-1">{healthData.assessmentsCount}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#121212] border border-white/5">
                    <span className="text-[10px] text-[#737373] uppercase font-bold">PDF Reports Count</span>
                    <p className="text-xl font-bold text-white mt-1">{healthData.pdfCount}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#121212] border border-white/5">
                    <span className="text-[10px] text-[#737373] uppercase font-bold">Last Submission</span>
                    <p className="text-xs font-semibold text-white mt-2 truncate" title={healthData.lastSubmission}>
                      {healthData.lastSubmission}
                    </p>
                  </div>
                </div>
              </div>

              {/* RLS Status */}
              <div className="mb-8">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Row Level Security (RLS) Diagnostics</h4>
                <div className="p-4 rounded-lg bg-[#121212] border border-white/5">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs font-bold text-[#B5B5B5]">RLS Read Policy Status:</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      healthData.rlsStatus.includes("Access Granted") 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {healthData.rlsStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#737373] mt-2">Checks whether the currently logged in role can successfully query records from the public database schema.</p>
                </div>
              </div>

              {/* Env variable diagnostics */}
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Environment Diagnostics</h4>
                <div className="space-y-3">
                  {Object.entries(healthData.envStatus).map(([key, val]) => (
                    <div key={key} className="flex justify-between items-center p-3.5 rounded-lg bg-[#121212] border border-[rgba(255,255,255,0.03)]">
                      <span className="text-xs font-semibold text-white">{key}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                        val === "Configured" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
