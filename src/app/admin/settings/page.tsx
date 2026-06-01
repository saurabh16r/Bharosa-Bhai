"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Save, Settings2, Bell, Shield, Database } from "lucide-react";

export default function AdminSettings() {
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Platform Settings</h1>
          <p className="text-[#B5B5B5]">Configure global financial assumptions and system preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-[#F7B500] hover:bg-[#F7B500]/90 text-black px-6 py-2.5 rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Sidebar for Settings */}
        <div className="lg:col-span-1 space-y-2">
           <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#1E88FF]/10 text-[#1E88FF] rounded-lg text-sm font-bold border border-[#1E88FF]/20 text-left">
             <Settings2 size={18} /> Financial Assumptions
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-[#B5B5B5] hover:bg-white/[0.04] hover:text-white rounded-lg text-sm font-medium transition-colors text-left">
             <Bell size={18} /> Notifications
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-[#B5B5B5] hover:bg-white/[0.04] hover:text-white rounded-lg text-sm font-medium transition-colors text-left">
             <Shield size={18} /> Admin Roles
           </button>
           <button className="w-full flex items-center gap-3 px-4 py-3 text-[#B5B5B5] hover:bg-white/[0.04] hover:text-white rounded-lg text-sm font-medium transition-colors text-left">
             <Database size={18} /> Database Sync
           </button>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
             <h3 className="text-lg font-bold text-white mb-4">Global Inflation Rates</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">General Inflation (%)</label>
                   <input type="number" defaultValue={6} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Education Inflation (%)</label>
                   <input type="number" defaultValue={10} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Healthcare Inflation (%)</label>
                   <input type="number" defaultValue={8} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" />
                </div>
             </div>
           </Card>

           <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
             <h3 className="text-lg font-bold text-white mb-4">Expected Returns (CAGR)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Equity Mutual Funds (%)</label>
                   <input type="number" defaultValue={12} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Debt Funds / FDs (%)</label>
                   <input type="number" defaultValue={7} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" />
                </div>
             </div>
           </Card>

           <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
             <h3 className="text-lg font-bold text-white mb-4">Protection Multipliers</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Term Insurance Yield (%)</label>
                   <p className="text-xs text-[#737373] mb-2">Rate used to calculate required corpus for income replacement.</p>
                   <input type="number" defaultValue={7} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" />
                </div>
                <div>
                   <label className="block text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-2">Emergency Fund Months</label>
                   <p className="text-xs text-[#737373] mb-2">Months of expenses to keep in liquid assets.</p>
                   <input type="number" defaultValue={6} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white px-4 py-2.5 rounded-lg outline-none focus:border-[#F7B500]" />
                </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
