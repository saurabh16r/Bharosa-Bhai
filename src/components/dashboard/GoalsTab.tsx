"use client";

import * as React from "react";
import { UserDetails, TestAnswers } from "@/store/useTestStore";
import { Card } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Target, Home, Car, Plane, BookOpen, Heart, TrendingUp, AlertCircle, CheckCircle, Shield, Briefcase, Settings } from "lucide-react";

interface GoalsTabProps {
  user: Partial<UserDetails>;
  answers: Partial<TestAnswers>;
}

// Default profiles for goals if user selected them
const DEFAULT_PROFILES: Record<string, { currentCost: number, yearsRemaining: number, priority: "High" | "Medium" | "Low", icon: any }> = {
  "Dream House": { currentCost: 10000000, yearsRemaining: 10, priority: "High", icon: Home },
  "Dream Car": { currentCost: 2000000, yearsRemaining: 5, priority: "Medium", icon: Car },
  "Vacation": { currentCost: 500000, yearsRemaining: 2, priority: "Low", icon: Plane },
  "Child Education": { currentCost: 2500000, yearsRemaining: 15, priority: "High", icon: BookOpen },
  "Child Marriage": { currentCost: 3000000, yearsRemaining: 20, priority: "Medium", icon: Heart },
  "Retirement": { currentCost: 20000000, yearsRemaining: 30, priority: "High", icon: TrendingUp },
};

export function GoalsTab({ user, answers }: GoalsTabProps) {
  // Global assumptions
  const [globalInflation, setGlobalInflation] = React.useState(6);
  const [globalReturn, setGlobalReturn] = React.useState(12);

  // Parse user goals into local state so they can edit overrides
  const [goalsData, setGoalsData] = React.useState(() => {
    const activeGoals = answers.goals || [];
    return activeGoals.map(goalName => {
      const profile = DEFAULT_PROFILES[goalName] || { currentCost: 1000000, yearsRemaining: 10, priority: "Medium", icon: Target };
      return {
        id: goalName,
        name: goalName,
        currentCost: profile.currentCost,
        yearsRemaining: profile.yearsRemaining,
        currentSavings: 0,
        currentSip: 0,
        priority: profile.priority,
        icon: profile.icon
      };
    });
  });

  // Handle Input Changes for Goals
  const updateGoal = (id: string, field: string, value: number) => {
    setGoalsData(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const formatCur = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Calculations Engine
  let totalFutureCost = 0;
  let totalRequiredSip = 0;
  let totalGap = 0;
  let totalScorePoints = 0;

  const calculatedGoals = goalsData.map(goal => {
    // Math
    const futureCost = goal.currentCost * Math.pow(1 + (globalInflation / 100), goal.yearsRemaining);
    const monthlyRate = globalReturn / 100 / 12;
    const months = goal.yearsRemaining * 12;
    
    const futureValueSavings = goal.currentSavings * Math.pow(1 + (globalReturn / 100), goal.yearsRemaining);
    const futureValueSip = goal.currentSip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    const projectedValue = futureValueSavings + futureValueSip;
    const gap = Math.max(0, futureCost - projectedValue);
    
    let requiredSip = 0;
    if (gap > 0 && months > 0) {
      requiredSip = (gap * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
    }

    // Scoring
    let score = 0;
    if (projectedValue >= futureCost) score = 100;
    else score = Math.min(100, Math.round((projectedValue / futureCost) * 100));

    // Status
    let status = "Critical";
    let color = "text-red-500 bg-red-500/10";
    if (score >= 90) { status = "Fully Funded"; color = "text-green-500 bg-green-500/10"; }
    else if (score >= 75) { status = "On Track"; color = "text-blue-500 bg-blue-500/10"; }
    else if (score >= 50) { status = "Underfunded"; color = "text-yellow-500 bg-yellow-500/10"; }

    // Aggregates
    totalFutureCost += futureCost;
    totalRequiredSip += requiredSip;
    totalGap += gap;
    totalScorePoints += score;

    return { ...goal, futureCost, gap, requiredSip, projectedValue, score, status, color };
  });

  // Sort by priority and years remaining
  calculatedGoals.sort((a, b) => {
    const pMap = { High: 1, Medium: 2, Low: 3 };
    if (pMap[a.priority] !== pMap[b.priority]) return pMap[a.priority] - pMap[b.priority];
    return a.yearsRemaining - b.yearsRemaining;
  });

  const overallReadiness = calculatedGoals.length > 0 ? Math.round(totalScorePoints / calculatedGoals.length) : 0;

  // Chart Data (Aggregated Growth over max 20 years)
  const maxYears = Math.min(30, Math.max(...goalsData.map(g => g.yearsRemaining)) + 5);
  const chartData = [];
  const currentAge = user.age || 30;

  for (let year = 0; year <= maxYears; year += 2) {
    let aggProjected = 0;
    let aggTarget = 0;
    
    calculatedGoals.forEach(g => {
      // If goal is already mature, cap it
      const y = Math.min(year, g.yearsRemaining);
      const m = y * 12;
      const monthlyRate = globalReturn / 100 / 12;
      
      const fvSav = g.currentSavings * Math.pow(1 + (globalReturn / 100), y);
      const fvSip = g.currentSip * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
      
      aggProjected += fvSav + fvSip;
      // Target grows with inflation
      aggTarget += g.currentCost * Math.pow(1 + (globalInflation / 100), y);
    });

    chartData.push({
      age: currentAge + year,
      Projected: Math.round(aggProjected),
      Target: Math.round(aggTarget)
    });
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* SUMMARY KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 bg-[#121212] border border-[#1E88FF]/30 rounded-xl">
          <p className="text-[10px] text-[#1E88FF] uppercase font-bold tracking-wider mb-1">Total Goals</p>
          <h3 className="text-xl font-bold text-white">{calculatedGoals.length}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Total Future Cost</p>
          <h3 className="text-xl font-bold text-white">{formatCur(totalFutureCost)}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Total Required SIP</p>
          <h3 className="text-xl font-bold text-[#F7B500]">{formatCur(totalRequiredSip)}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Total Funding Gap</p>
          <h3 className={`text-xl font-bold ${totalGap > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCur(totalGap)}</h3>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl flex flex-col justify-center">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Readiness Score</p>
          <div className="flex items-center gap-2">
             <span className={`text-2xl font-bold ${overallReadiness >= 75 ? 'text-green-500' : overallReadiness >= 50 ? 'text-[#F7B500]' : 'text-red-500'}`}>{overallReadiness}</span>
             <span className="text-xs text-[#B5B5B5]">/ 100</span>
          </div>
        </Card>
      </div>

      {/* CHART & TIMELINE SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">Aggregated Goals Projection</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="age" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#737373" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#FFF' }}
                  formatter={(value: number) => [formatCur(value), '']}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="Target" stroke="#EF4444" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="Projected" stroke="#22C55E" strokeWidth={3} dot={{ fill: '#22C55E', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* TIMELINE */}
        <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717] overflow-y-auto max-h-[380px]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">Goal Timeline</h3>
          <div className="space-y-6">
            {calculatedGoals.sort((a,b) => a.yearsRemaining - b.yearsRemaining).map((g, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className="flex flex-col items-center">
                   <div className="w-8 h-8 rounded-full bg-[#1E88FF]/10 text-[#1E88FF] flex items-center justify-center relative z-10 border border-[#1E88FF]/30">
                     <g.icon size={14} />
                   </div>
                   {i !== calculatedGoals.length - 1 && <div className="w-[2px] h-full bg-[rgba(255,255,255,0.05)] absolute top-8" />}
                </div>
                <div className="pb-6">
                  <span className="text-[10px] font-bold text-[#F7B500] uppercase tracking-widest">In {g.yearsRemaining} Years (Age {currentAge + g.yearsRemaining})</span>
                  <h4 className="text-white font-bold mt-1">{g.name}</h4>
                  <p className="text-[#B5B5B5] text-xs mt-1">Requires {formatCur(g.futureCost)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SMART RECOMMENDATIONS */}
      <Card className="p-6 border border-red-500/20 bg-gradient-to-r from-red-500/5 to-[#171717] relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="text-red-500" size={20} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Smart Recommendations</h3>
        </div>
        <ul className="space-y-3">
          {calculatedGoals.map((g, i) => {
            if (g.score >= 90) return <li key={i} className="flex items-start gap-2 text-sm text-green-500"><CheckCircle size={16} className="mt-0.5 shrink-0" /> Your {g.name} goal is fully funded and on track.</li>;
            if (g.priority === "High" && g.gap > 0) return <li key={i} className="flex items-start gap-2 text-sm text-red-500"><AlertCircle size={16} className="mt-0.5 shrink-0" /> Priority Alert: {g.name} is underfunded by {formatCur(g.gap)}. Start an SIP of {formatCur(g.requiredSip)} immediately.</li>;
            return <li key={i} className="flex items-start gap-2 text-sm text-[#F7B500]"><TrendingUp size={16} className="mt-0.5 shrink-0" /> Increase SIP by {formatCur(g.requiredSip)} to reach your {g.name} goal.</li>;
          })}
        </ul>
      </Card>

      {/* INDIVIDUAL GOAL CARDS */}
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Detailed Goal Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {calculatedGoals.map((goal, i) => (
            <Card key={i} className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717] flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#1E88FF]/10 text-[#1E88FF] flex items-center justify-center">
                    <goal.icon size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{goal.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase mt-1 inline-block ${goal.color}`}>{goal.status} • {goal.score}/100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#F7B500] uppercase tracking-widest bg-[#F7B500]/10 px-2 py-1 rounded">In {goal.yearsRemaining} Years</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-[#121212] rounded-lg border border-[rgba(255,255,255,0.03)]">
                  <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-widest mb-1">Today's Cost</p>
                  <h5 className="text-sm font-bold text-white">{formatCur(goal.currentCost)}</h5>
                </div>
                <div className="p-3 bg-[#121212] rounded-lg border border-[rgba(255,255,255,0.03)]">
                  <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-widest mb-1">Future Cost</p>
                  <h5 className="text-sm font-bold text-white">{formatCur(goal.futureCost)}</h5>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#B5B5B5] font-medium">Funding Progress</span>
                    <span className="text-white font-bold">{goal.score}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1E88FF] rounded-full" style={{ width: `${goal.score}%` }} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-[rgba(255,255,255,0.08)] pt-4 mt-auto">
                <div>
                  <p className="text-[9px] text-[#B5B5B5] uppercase tracking-wider mb-1">Current SIP</p>
                  <span className="text-xs font-bold text-white">{formatCur(goal.currentSip)}</span>
                </div>
                <div>
                  <p className="text-[9px] text-[#B5B5B5] uppercase tracking-wider mb-1">Required SIP</p>
                  <span className={`text-xs font-bold ${goal.requiredSip > 0 ? 'text-[#F7B500]' : 'text-green-500'}`}>{formatCur(goal.requiredSip)}</span>
                </div>
                <div>
                  <p className="text-[9px] text-[#B5B5B5] uppercase tracking-wider mb-1">Funding Gap</p>
                  <span className={`text-xs font-bold ${goal.gap > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCur(goal.gap)}</span>
                </div>
              </div>

            </Card>
          ))}
        </div>
      </div>

      {/* ASSUMPTIONS EDITOR */}
      <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="text-[#B5B5B5]" size={16} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Goal Assumptions & Tweak Engine</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <label className="text-xs text-[#B5B5B5] uppercase font-bold block mb-2">Global Expected Return (%)</label>
            <input type="range" min="5" max="20" step="0.5" value={globalReturn} onChange={(e) => setGlobalReturn(Number(e.target.value))} className="w-full accent-[#1E88FF]" />
            <div className="text-right text-sm text-white font-bold mt-1">{globalReturn}%</div>
          </div>
          <div>
            <label className="text-xs text-[#B5B5B5] uppercase font-bold block mb-2">Global Inflation (%)</label>
            <input type="range" min="3" max="12" step="0.5" value={globalInflation} onChange={(e) => setGlobalInflation(Number(e.target.value))} className="w-full accent-[#F7B500]" />
            <div className="text-right text-sm text-white font-bold mt-1">{globalInflation}%</div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[rgba(255,255,255,0.08)]">
          <h4 className="text-xs text-[#B5B5B5] uppercase font-bold tracking-widest mb-4">Edit Individual Goals</h4>
          <div className="space-y-4">
            {goalsData.map(g => (
              <div key={g.id} className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center p-3 bg-[#121212] rounded border border-[rgba(255,255,255,0.03)]">
                <span className="text-sm font-bold text-white">{g.name}</span>
                <div>
                  <label className="text-[9px] text-[#B5B5B5] uppercase block mb-1">Current Cost (₹)</label>
                  <input type="number" value={g.currentCost} onChange={(e) => updateGoal(g.id, 'currentCost', Number(e.target.value))} className="w-full bg-[#171717] border border-[rgba(255,255,255,0.1)] text-white p-1.5 rounded text-xs outline-none focus:border-[#1E88FF]" />
                </div>
                <div>
                  <label className="text-[9px] text-[#B5B5B5] uppercase block mb-1">Years Left</label>
                  <input type="number" value={g.yearsRemaining} onChange={(e) => updateGoal(g.id, 'yearsRemaining', Number(e.target.value))} className="w-full bg-[#171717] border border-[rgba(255,255,255,0.1)] text-white p-1.5 rounded text-xs outline-none focus:border-[#1E88FF]" />
                </div>
                <div>
                  <label className="text-[9px] text-[#B5B5B5] uppercase block mb-1">Current SIP (₹/mo)</label>
                  <input type="number" value={g.currentSip} onChange={(e) => updateGoal(g.id, 'currentSip', Number(e.target.value))} className="w-full bg-[#171717] border border-[rgba(255,255,255,0.1)] text-white p-1.5 rounded text-xs outline-none focus:border-[#1E88FF]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

    </div>
  );
}
