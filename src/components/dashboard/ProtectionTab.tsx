"use client";

import * as React from "react";
import { UserDetails, TestAnswers } from "@/store/useTestStore";
import { Card } from "@/components/ui/Card";
import { Shield, ShieldAlert, HeartPulse, Wallet, AlertTriangle, Users, Settings, Plus, Activity } from "lucide-react";

interface ProtectionTabProps {
  user: Partial<UserDetails>;
  answers: Partial<TestAnswers>;
}

export function ProtectionTab({ user, answers }: ProtectionTabProps) {
  const currentAge = user.age || 30;
  const deps = answers.dependents || [];
  const numChildren = answers.numberOfChildren || 0;
  const hasSpouse = deps.includes("Spouse");
  const hasParents = deps.includes("Parents");

  // Editable Assumptions State
  const [currentTermCover, setCurrentTermCover] = React.useState(answers.hasTermInsurance ? 5000000 : 0);
  const [currentHealthCover, setCurrentHealthCover] = React.useState(answers.hasHealthInsurance ? 500000 : 0);
  const [currentEmergencyFund, setCurrentEmergencyFund] = React.useState(answers.emergencyFund || 0);
  const [outstandingLoans, setOutstandingLoans] = React.useState(0);

  // Editable Support Allocations (Monthly)
  const baseExpenses = (answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0);
  
  // Defaults based on typical distribution
  const [spouseSupport, setSpouseSupport] = React.useState(hasSpouse ? Math.round(baseExpenses * 0.5) : 0);
  const [parentSupport, setParentSupport] = React.useState(hasParents ? Math.round(baseExpenses * 0.25) : 0);
  const [childSupport, setChildSupport] = React.useState(numChildren > 0 ? Math.round((baseExpenses * 0.25) / numChildren) * numChildren : 0);

  const formatCur = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // 1. Term Insurance Engine
  // Formula: Support * 12 / 0.07
  const parentCoverRequired = parentSupport > 0 ? (parentSupport * 12) / 0.07 : 0;
  const spouseCoverRequired = spouseSupport > 0 ? (spouseSupport * 12) / 0.07 : 0;
  const childCoverRequired = childSupport > 0 ? (childSupport * 12) / 0.07 : 0;
  
  const totalTermRequired = parentCoverRequired + spouseCoverRequired + childCoverRequired + outstandingLoans;
  const termGap = Math.max(0, totalTermRequired - currentTermCover);
  const termCoveragePercent = totalTermRequired > 0 ? Math.min(100, Math.round((currentTermCover / totalTermRequired) * 100)) : 100;

  // 2. Health Insurance Engine
  let healthRequired = 1000000; // 10L Base
  if (hasSpouse) healthRequired = 1500000; // 15L Married
  if (numChildren > 0) healthRequired = 2000000; // 20L Family
  if (hasParents) healthRequired = 2500000; // 25L with Parents
  
  const healthGap = Math.max(0, healthRequired - currentHealthCover);
  const healthCoveragePercent = Math.min(100, Math.round((currentHealthCover / healthRequired) * 100));

  // 3. Emergency Fund Engine
  const efRequired = baseExpenses * 9; // 9 Months
  const efGap = Math.max(0, efRequired - currentEmergencyFund);
  const efCoveragePercent = efRequired > 0 ? Math.min(100, Math.round((currentEmergencyFund / efRequired) * 100)) : 100;

  // 4. Overall Scoring
  const termScore = termCoveragePercent;
  const healthScore = healthCoveragePercent;
  const efScore = efCoveragePercent;
  
  // Weightage: Term 40%, Health 30%, EF 30%
  const protectionScore = Math.round((termScore * 0.4) + (healthScore * 0.3) + (efScore * 0.3));
  
  let riskStatus = "Critical";
  let riskColor = "text-red-500 bg-red-500/10";
  if (protectionScore >= 90) { riskStatus = "Excellent"; riskColor = "text-green-500 bg-green-500/10"; }
  else if (protectionScore >= 75) { riskStatus = "Good"; riskColor = "text-blue-500 bg-blue-500/10"; }
  else if (protectionScore >= 50) { riskStatus = "Average"; riskColor = "text-[#F7B500] bg-[#F7B500]/10"; }

  const TermBreakdownCard = ({ title, support, required }: { title: string, support: number, required: number }) => {
    if (required === 0) return null;
    return (
      <div className="p-4 border border-[rgba(255,255,255,0.05)] bg-[#121212] rounded-xl flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#1E88FF]/10 text-[#1E88FF] flex items-center justify-center">
               <Users size={16} />
             </div>
             <div>
               <h4 className="text-white font-bold text-sm">{title}</h4>
               <p className="text-[10px] text-[#B5B5B5] uppercase tracking-wider">{formatCur(support)} / mo Support</p>
             </div>
          </div>
        </div>
        <div>
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Required Corpus</p>
          <span className="text-lg font-bold text-[#F7B500]">{formatCur(required)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SUMMARY KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col justify-center">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Protection Score</p>
          <div className="flex items-center gap-2">
             <span className={`text-2xl font-bold ${protectionScore >= 75 ? 'text-green-500' : protectionScore >= 50 ? 'text-[#F7B500]' : 'text-red-500'}`}>{protectionScore}</span>
             <span className="text-xs text-[#B5B5B5]">/ 100</span>
          </div>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Term Insurance Gap</p>
          <h3 className={`text-xl font-bold ${termGap > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCur(termGap)}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Health Ins. Gap</p>
          <h3 className={`text-xl font-bold ${healthGap > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCur(healthGap)}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Emerg. Fund Gap</p>
          <h3 className={`text-xl font-bold ${efGap > 0 ? 'text-[#F7B500]' : 'text-green-500'}`}>{formatCur(efGap)}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[#1E88FF]/30 rounded-xl">
           <p className="text-[10px] text-[#1E88FF] uppercase font-bold tracking-wider mb-1">Risk Status</p>
           <span className={`text-sm font-bold uppercase tracking-wider px-2 py-1 rounded inline-block mt-1 ${riskColor}`}>{riskStatus}</span>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TERM INSURANCE MAIN BLOCK */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717]">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="text-[#F7B500]" size={24} />
              <h2 className="text-lg font-bold text-white uppercase tracking-wide">Term Insurance Analysis</h2>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 mb-8 pb-8 border-b border-[rgba(255,255,255,0.05)]">
               <div className="flex-1">
                 <p className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider mb-2">Total Term Plan Required</p>
                 <h1 className="text-4xl font-bold text-white">{formatCur(totalTermRequired)}</h1>
                 <p className="text-sm text-[#B5B5B5] mt-2 leading-relaxed max-w-md">Calculated using the income-replacement method (0.07 safe withdrawal rate) to ensure your family's lifestyle is protected forever.</p>
               </div>
               
               <div className="flex-1 space-y-4">
                 <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#B5B5B5] font-medium">Coverage Progress</span>
                      <span className="text-white font-bold">{termCoveragePercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${termCoveragePercent >= 100 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${termCoveragePercent}%` }} />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#121212] p-3 rounded">
                      <p className="text-[10px] text-[#B5B5B5] uppercase tracking-wider">Current Cover</p>
                      <p className="text-white font-bold text-sm mt-1">{formatCur(currentTermCover)}</p>
                    </div>
                    <div className="bg-[#121212] p-3 rounded border border-red-500/20">
                      <p className="text-[10px] text-[#B5B5B5] uppercase tracking-wider">Protection Gap</p>
                      <p className="text-red-500 font-bold text-sm mt-1">{formatCur(termGap)}</p>
                    </div>
                 </div>
               </div>
            </div>

            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Required Cover Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <TermBreakdownCard title="Spouse Support" support={spouseSupport} required={spouseCoverRequired} />
              <TermBreakdownCard title="Children Support" support={childSupport} required={childCoverRequired} />
              <TermBreakdownCard title="Parent Support" support={parentSupport} required={parentCoverRequired} />
              {outstandingLoans > 0 && (
                <div className="p-4 border border-[rgba(255,255,255,0.05)] bg-[#121212] rounded-xl flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
                         <Wallet size={16} />
                       </div>
                       <div><h4 className="text-white font-bold text-sm">Liabilities</h4></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Required Corpus</p>
                    <span className="text-lg font-bold text-red-500">{formatCur(outstandingLoans)}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* HEALTH & EMERGENCY BLOCK */}
        <div className="space-y-6">
          <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <HeartPulse className="text-[#1E88FF]" size={20} />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">Health Insurance</h2>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${healthCoveragePercent >= 100 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                {healthCoveragePercent >= 100 ? 'Secured' : 'Gap Detected'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <p className="text-[10px] text-[#B5B5B5] uppercase tracking-wider mb-1">Required Base</p>
                  <p className="text-white font-bold">{formatCur(healthRequired)}</p>
               </div>
               <div>
                  <p className="text-[10px] text-[#B5B5B5] uppercase tracking-wider mb-1">Funding Gap</p>
                  <p className={`font-bold ${healthGap > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCur(healthGap)}</p>
               </div>
            </div>

            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden mb-6">
               <div className="h-full bg-[#1E88FF] rounded-full" style={{ width: `${healthCoveragePercent}%` }} />
            </div>

            <div className="bg-[#1E88FF]/5 border border-[#1E88FF]/20 p-3 rounded text-xs text-[#1E88FF]">
              <div className="flex gap-2 items-start">
                <Activity size={14} className="mt-0.5 shrink-0" />
                <p>Medical inflation runs at 10-15% annually. Upgrade your family floater immediately.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Wallet className="text-[#F7B500]" size={20} />
                <h2 className="text-sm font-bold text-white uppercase tracking-wide">Emergency Fund</h2>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${efCoveragePercent >= 100 ? 'text-green-500 bg-green-500/10' : 'text-[#F7B500] bg-[#F7B500]/10'}`}>
                {efCoveragePercent >= 100 ? 'Secured' : 'Building'}
              </span>
            </div>
            
            <p className="text-xs text-[#B5B5B5] mb-4">9 Months required safety net based on current lifestyle expenses.</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
               <div>
                  <p className="text-[10px] text-[#B5B5B5] uppercase tracking-wider mb-1">Target Corpus</p>
                  <p className="text-white font-bold">{formatCur(efRequired)}</p>
               </div>
               <div>
                  <p className="text-[10px] text-[#B5B5B5] uppercase tracking-wider mb-1">Shortfall</p>
                  <p className={`font-bold ${efGap > 0 ? 'text-[#F7B500]' : 'text-green-500'}`}>{formatCur(efGap)}</p>
               </div>
            </div>

            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
               <div className="h-full bg-[#F7B500] rounded-full" style={{ width: `${efCoveragePercent}%` }} />
            </div>
          </Card>
        </div>
      </div>

      {/* SMART RECOMMENDATIONS */}
      <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#121212] relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className={protectionScore < 75 ? "text-red-500" : "text-[#F7B500]"} size={20} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Actionable Protection Plan</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${termGap > 0 ? 'border-red-500/20 bg-red-500/5' : 'border-green-500/20 bg-green-500/5'}`}>
             <h4 className="text-white text-sm font-bold mb-2">Term Life</h4>
             <p className={`text-xs ${termGap > 0 ? 'text-red-500' : 'text-green-500'}`}>
               {termGap > 0 ? `Increase your pure term cover by ${formatCur(termGap)} immediately to protect dependents.` : "Your term life insurance coverage is adequate."}
             </p>
          </div>
          <div className={`p-4 rounded-xl border ${healthGap > 0 ? 'border-[#F7B500]/20 bg-[#F7B500]/5' : 'border-green-500/20 bg-green-500/5'}`}>
             <h4 className="text-white text-sm font-bold mb-2">Health Plan</h4>
             <p className={`text-xs ${healthGap > 0 ? 'text-[#F7B500]' : 'text-green-500'}`}>
               {healthGap > 0 ? `Buy a ${formatCur(healthGap)} super top-up to bridge your medical emergency gap.` : "Your base health insurance meets current recommendations."}
             </p>
          </div>
          <div className={`p-4 rounded-xl border ${efGap > 0 ? 'border-[#1E88FF]/20 bg-[#1E88FF]/5' : 'border-green-500/20 bg-green-500/5'}`}>
             <h4 className="text-white text-sm font-bold mb-2">Liquidity</h4>
             <p className={`text-xs ${efGap > 0 ? 'text-[#1E88FF]' : 'text-green-500'}`}>
               {efGap > 0 ? `Sweep ${formatCur(efGap)} into a liquid mutual fund to build your 9-month emergency net.` : "Your emergency fund is fully capitalized."}
             </p>
          </div>
        </div>
      </Card>

      {/* ASSUMPTIONS EDITOR */}
      <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="text-[#B5B5B5]" size={16} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Update Your Coverage & Assumptions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1 font-bold tracking-wider">Current Term Cover (₹)</label>
            <input type="number" value={currentTermCover} onChange={(e) => setCurrentTermCover(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2.5 rounded text-sm outline-none focus:border-[#1E88FF]" />
          </div>
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1 font-bold tracking-wider">Current Health Cover (₹)</label>
            <input type="number" value={currentHealthCover} onChange={(e) => setCurrentHealthCover(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2.5 rounded text-sm outline-none focus:border-[#1E88FF]" />
          </div>
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1 font-bold tracking-wider">Current Emerg. Fund (₹)</label>
            <input type="number" value={currentEmergencyFund} onChange={(e) => setCurrentEmergencyFund(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2.5 rounded text-sm outline-none focus:border-[#1E88FF]" />
          </div>
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1 font-bold tracking-wider">Outstanding Loans (₹)</label>
            <input type="number" value={outstandingLoans} onChange={(e) => setOutstandingLoans(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2.5 rounded text-sm outline-none focus:border-red-500" />
          </div>
        </div>

        <div className="border-t border-[rgba(255,255,255,0.08)] pt-6">
          <h4 className="text-xs font-bold text-[#B5B5B5] uppercase tracking-wider mb-4">Edit Nominee Monthly Support</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {hasSpouse && (
               <div>
                 <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1 font-bold">Spouse Requirements (₹/mo)</label>
                 <input type="number" value={spouseSupport} onChange={(e) => setSpouseSupport(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2.5 rounded text-sm outline-none focus:border-[#1E88FF]" />
               </div>
             )}
             {hasParents && (
               <div>
                 <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1 font-bold">Parental Support (₹/mo)</label>
                 <input type="number" value={parentSupport} onChange={(e) => setParentSupport(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2.5 rounded text-sm outline-none focus:border-[#1E88FF]" />
               </div>
             )}
             {numChildren > 0 && (
               <div>
                 <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1 font-bold">Children Support (₹/mo)</label>
                 <input type="number" value={childSupport} onChange={(e) => setChildSupport(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2.5 rounded text-sm outline-none focus:border-[#1E88FF]" />
               </div>
             )}
          </div>
        </div>
      </Card>

    </div>
  );
}
