"use client";

import * as React from "react";
import { UserDetails, TestAnswers } from "@/store/useTestStore";
import { Card } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Map, Flag, TrendingUp, AlertTriangle, ShieldCheck, HeartPulse, CheckCircle } from "lucide-react";
import { DashboardMetrics } from "@/lib/scoring";

interface LifeJourneyTabProps {
  user: Partial<UserDetails>;
  answers: Partial<TestAnswers>;
  metrics: DashboardMetrics;
}

export function LifeJourneyTab({ user, answers, metrics }: LifeJourneyTabProps) {
  const currentAge = user.age || 30;
  const retireAt = user.retireAt || 60;
  
  // What-If Simulator State
  const [expectedReturn, setExpectedReturn] = React.useState(12);
  const [inflation, setInflation] = React.useState(6);
  const [currentSip, setCurrentSip] = React.useState(answers.monthlySip || 0);
  const currentInvestments = answers.existingInvestments || 0;

  // Synthesis: Build Master Goal List
  const activeGoals = answers.goals || [];
  
  // Base default profiles mapping
  const DEFAULT_PROFILES: Record<string, { baseCost: number, offsetYears: number }> = {
    "Dream House": { baseCost: 10000000, offsetYears: 10 },
    "Dream Car": { baseCost: 2000000, offsetYears: 5 },
    "Vacation": { baseCost: 500000, offsetYears: 2 },
    "Child Education": { baseCost: 2500000, offsetYears: 15 },
    "Child Marriage": { baseCost: 3000000, offsetYears: 20 }
  };

  const milestones = activeGoals
    .filter(g => g !== "Retirement")
    .map(name => {
      const p = DEFAULT_PROFILES[name] || { baseCost: 1000000, offsetYears: 10 };
      return {
        name,
        ageTrigger: currentAge + p.offsetYears,
        baseCost: p.baseCost
      };
    });

  // Always append retirement
  const totalOutflow = (answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0);
  const yearsToRetire = Math.max(0, retireAt - currentAge);
  const futureAnnualExpense = (totalOutflow * Math.pow(1 + (inflation / 100), yearsToRetire)) * 12;
  const requiredCorpus = futureAnnualExpense * 30; // Rule of 30
  
  milestones.push({
    name: "Retirement",
    ageTrigger: retireAt,
    baseCost: requiredCorpus / Math.pow(1 + (inflation / 100), yearsToRetire) // Back-calculate "today's cost" so inflation formula works uniformly
  });

  // Sort chronologically
  milestones.sort((a, b) => a.ageTrigger - b.ageTrigger);

  // Generate Chronological Roadmap & Chart Data
  let totalFutureGoalsValue = 0;
  const chartData = [];
  const monthlyRate = expectedReturn / 100 / 12;

  const inflatedMilestones = milestones.map(m => {
    const yearsRemaining = m.ageTrigger - currentAge;
    const futureCost = m.baseCost * Math.pow(1 + (inflation / 100), yearsRemaining);
    totalFutureGoalsValue += futureCost;
    return { ...m, futureCost, yearsRemaining };
  });

  // Simulate wealth trajectory year by year
  const maxSimAge = Math.min(85, retireAt + 5);
  let runningWealth = currentInvestments;

  for (let age = currentAge; age <= maxSimAge; age++) {
    // Grow wealth by 1 year
    const y = age - currentAge;
    runningWealth = runningWealth * (1 + (expectedReturn / 100));
    
    // Add 1 year of SIPs (if working)
    if (age <= retireAt) {
      const m = 12;
      const sipFv = currentSip * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
      runningWealth += sipFv;
    }

    // Check if any goals trigger this year and deduct their cost
    let withdrawalAmt = 0;
    inflatedMilestones.filter(m => m.ageTrigger === age && m.name !== "Retirement").forEach(m => {
       withdrawalAmt += m.futureCost;
    });

    runningWealth -= withdrawalAmt;

    chartData.push({
      age: age,
      wealth: Math.max(0, Math.round(runningWealth)),
      withdrawal: Math.round(withdrawalAmt)
    });
  }

  // Final scoring synthesis
  const projectedRetirementWealth = chartData.find(d => d.age === retireAt)?.wealth || 0;
  let journeyScore = Math.round((metrics.protectionScore * 0.3) + (metrics.retirementScore * 0.4) + (metrics.goalsScore * 0.3));
  
  const formatCur = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const w = payload[0].payload.withdrawal;
      return (
        <div className="bg-[#171717] border border-[rgba(255,255,255,0.1)] p-3 rounded-lg shadow-xl">
          <p className="text-[#B5B5B5] text-xs mb-1 uppercase font-bold">Age {label}</p>
          <p className="text-[#1E88FF] font-bold">Net Worth: {formatCur(payload[0].value)}</p>
          {w > 0 && <p className="text-[#F7B500] text-xs mt-1">Goal Withdrawal: -{formatCur(w)}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. SUMMARY OVERVIEW ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#1E88FF]/20 to-[#121212] border border-[#1E88FF]/30 rounded-xl">
          <p className="text-[10px] text-[#1E88FF] uppercase font-bold tracking-wider mb-1">Current Age</p>
          <h3 className="text-xl font-bold text-white">{currentAge} Years</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Years Ahead</p>
          <h3 className="text-xl font-bold text-white">{yearsToRetire} Years</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Total Future Goal Value</p>
          <h3 className="text-xl font-bold text-white">{formatCur(totalFutureGoalsValue)}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col justify-center">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Journey Score</p>
          <div className="flex items-center gap-2">
             <span className={`text-2xl font-bold ${journeyScore >= 75 ? 'text-green-500' : journeyScore >= 50 ? 'text-[#F7B500]' : 'text-red-500'}`}>{journeyScore}</span>
             <span className="text-xs text-[#B5B5B5]">/ 100</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. CHRONOLOGICAL MILESTONE ROADMAP */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717] h-[500px] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <Map className="text-[#F7B500]" size={20} />
              <h2 className="text-sm font-bold text-white uppercase tracking-wide">Chronological Roadmap</h2>
            </div>
            
            <div className="space-y-6 relative">
              {/* Vertical line connecting milestones */}
              <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#1E88FF]/50 to-[#F7B500]/50" />
              
              {inflatedMilestones.map((m, i) => (
                <div key={i} className="flex gap-4 relative z-10">
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border-2 ${m.name === 'Retirement' ? 'bg-[#F7B500]/20 border-[#F7B500] text-[#F7B500]' : 'bg-[#121212] border-[#1E88FF] text-[#1E88FF]'}`}>
                    {m.name === 'Retirement' ? <Flag size={16} /> : <span className="text-[10px] font-bold">Age {m.ageTrigger}</span>}
                  </div>
                  <div className="bg-[#121212] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg flex-1 hover:border-[#1E88FF]/50 transition-colors">
                    <span className="text-[9px] font-bold text-[#B5B5B5] uppercase tracking-widest block mb-1">In {m.yearsRemaining} Years</span>
                    <h4 className="text-white font-bold text-sm">{m.name}</h4>
                    <p className="text-[#1E88FF] text-xs font-bold mt-1">{formatCur(m.futureCost)} Target</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 3. NET WORTH TRAJECTORY CHART */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717]">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">Net Worth Projection</h3>
            <p className="text-xs text-[#B5B5B5] mb-6">Visualizing your wealth accumulation and milestone withdrawals.</p>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1E88FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1E88FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="age" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Age ${v}`} />
                  <YAxis 
                    stroke="#737373" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="wealth" stroke="#1E88FF" strokeWidth={3} fillOpacity={1} fill="url(#colorWealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. TOTAL GOAL MANAGEMENT & ALLOCATION */}
      <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#121212]">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">Master Goal Allocation</h3>
        <div className="space-y-4">
           {inflatedMilestones.map((m, i) => {
             const pct = totalFutureGoalsValue > 0 ? (m.futureCost / totalFutureGoalsValue) * 100 : 0;
             const colorsArr = ["bg-[#1E88FF]", "bg-[#F7B500]", "bg-[#22C55E]", "bg-[#A855F7]", "bg-[#EC4899]"];
             const color = m.name === 'Retirement' ? "bg-[#F7B500]" : colorsArr[i % colorsArr.length];
             
             return (
               <div key={i} className="flex flex-col gap-1.5">
                 <div className="flex justify-between text-xs">
                   <span className="text-[#B5B5B5]">{m.name}</span>
                   <span className="text-white font-bold">{pct.toFixed(1)}%</span>
                 </div>
                 <div className="w-full h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                   <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                 </div>
               </div>
             );
           })}
        </div>
      </Card>

      {/* 5. SMART RECOMMENDATIONS */}
      <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-gradient-to-r from-[#1E88FF]/5 to-[#171717] relative overflow-hidden">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Journey Insights</h3>
        <ul className="space-y-3">
          {projectedRetirementWealth < requiredCorpus ? (
             <li className="flex items-start gap-2 text-sm text-[#F7B500]"><AlertTriangle size={16} className="mt-0.5 shrink-0" /> Your current trajectory leaves a retirement gap. Increase your Master SIP to ensure chronological goals do not deplete your retirement corpus.</li>
          ) : (
             <li className="flex items-start gap-2 text-sm text-green-500"><CheckCircle size={16} className="mt-0.5 shrink-0" /> Your journey trajectory successfully funds all chronological goals and achieves your retirement corpus.</li>
          )}
          {metrics.protectionScore < 75 && (
             <li className="flex items-start gap-2 text-sm text-red-500"><HeartPulse size={16} className="mt-0.5 shrink-0" /> Your journey is exposed to extreme risk due to inadequate insurance coverage. Fix your protection gaps immediately.</li>
          )}
          {inflatedMilestones.some(m => m.name === 'Child Education' || m.name === 'Dream House') && (
             <li className="flex items-start gap-2 text-sm text-[#1E88FF]"><TrendingUp size={16} className="mt-0.5 shrink-0" /> Goal-based investing: Segregate SIPs into different mutual fund folios tagged exactly to the timeline events shown above to avoid accidental withdrawals.</li>
          )}
        </ul>
      </Card>

      {/* 6. WHAT-IF SIMULATOR */}
      <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">What-If Simulator Engine</h3>
        <p className="text-xs text-[#B5B5B5] mb-6">Adjust your inputs below to see how they instantly impact your lifetime trajectory and net worth chart above.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <label className="text-xs text-[#B5B5B5] uppercase font-bold block mb-2">Master SIP (₹/mo)</label>
            <input type="range" min="0" max="500000" step="1000" value={currentSip} onChange={(e) => setCurrentSip(Number(e.target.value))} className="w-full accent-[#1E88FF]" />
            <div className="flex justify-between text-xs mt-1 font-bold">
              <span className="text-[#B5B5B5]">₹0</span>
              <span className="text-white">{formatCur(currentSip)}</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#B5B5B5] uppercase font-bold block mb-2">Expected Portfolio Return (%)</label>
            <input type="range" min="5" max="20" step="0.5" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full accent-[#F7B500]" />
            <div className="flex justify-between text-xs mt-1 font-bold">
              <span className="text-[#B5B5B5]">5%</span>
              <span className="text-white">{expectedReturn}%</span>
            </div>
          </div>
          <div>
            <label className="text-xs text-[#B5B5B5] uppercase font-bold block mb-2">Inflation Rate (%)</label>
            <input type="range" min="3" max="15" step="0.5" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} className="w-full accent-red-500" />
            <div className="flex justify-between text-xs mt-1 font-bold">
              <span className="text-[#B5B5B5]">3%</span>
              <span className="text-white">{inflation}%</span>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}
