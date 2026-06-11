"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Save, Settings2, Bell, Shield, Database, CheckCircle2, AlertCircle } from "lucide-react";
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
        </div>
      </div>
    </div>
  );
}
