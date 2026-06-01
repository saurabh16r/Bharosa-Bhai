"use client";

import * as React from "react";
import { UserDetails, TestAnswers } from "@/store/useTestStore";
import { Card } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Shield, Briefcase, Calculator } from "lucide-react";

interface RetirementTabProps {
  user: Partial<UserDetails>;
  answers: Partial<TestAnswers>;
}

export function RetirementTab({ user, answers }: RetirementTabProps) {
  // Local Assumptions State
  const [inflation, setInflation] = React.useState(6);
  const [returnRate, setReturnRate] = React.useState(14);
  const [swpRate, setSwpRate] = React.useState(10);
  const [retirementInflation, setRetirementInflation] = React.useState(6);

  // Constants
  const currentAge = user.age || 30;
  const retireAt = user.retireAt || 60;
  const yearsToRetire = Math.max(0, retireAt - currentAge);
  
  const currentExpense = (answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0);
  const currentSip = answers.monthlySip || 0;
  const existingCorpus = answers.existingInvestments || 0;

  // Real-time Calculations
  const futureMonthlyExpense = currentExpense * Math.pow(1 + (inflation / 100), yearsToRetire);
  const futureAnnualExpense = futureMonthlyExpense * 12;
  // Based on the user requirement: RetirementCorpus = FutureAnnualExpense * 30
  const requiredCorpus = futureAnnualExpense * 30;

  // Projected Corpus based on existing investments and current SIP at expected return rate
  const monthlyRate = returnRate / 100 / 12;
  const months = yearsToRetire * 12;
  const futureValueExisting = existingCorpus * Math.pow(1 + (returnRate/100), yearsToRetire);
  const futureValueSIP = currentSip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const projectedCorpus = futureValueExisting + futureValueSIP;

  const corpusGap = Math.max(0, requiredCorpus - projectedCorpus);
  
  // Calculate Required SIP to hit gap
  const requiredSip = corpusGap > 0 
    ? (corpusGap * monthlyRate) / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate))
    : 0;

  // Score Calculation
  let score = 0;
  if (projectedCorpus >= requiredCorpus) score = 100;
  else score = Math.round((projectedCorpus / requiredCorpus) * 100);

  const formatCur = (val: number) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  // Generate Chart Data
  const chartData = [];
  for (let age = currentAge; age <= retireAt; age++) {
    const y = age - currentAge;
    const m = y * 12;
    const fvE = existingCorpus * Math.pow(1 + (returnRate/100), y);
    const fvS = currentSip * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
    
    // Required corpus growth path (linear for simplicity of target line)
    const targetPath = (requiredCorpus / yearsToRetire) * y;

    chartData.push({
      age: age.toString(),
      Projected: Math.round(fvE + fvS),
      Target: Math.round(targetPath)
    });
  }

  // SWP Table Data
  const swpData = [];
  let currentBalance = requiredCorpus;
  let currentAnnualWithdrawal = futureAnnualExpense;

  for (let age = retireAt; age <= 85; age += 5) {
    swpData.push({
      age,
      withdrawal: currentAnnualWithdrawal,
      remaining: currentBalance
    });
    // Fast forward 5 years
    for(let i=0; i<5; i++) {
       const returnAmt = currentBalance * (swpRate / 100);
       currentBalance = currentBalance + returnAmt - currentAnnualWithdrawal;
       currentAnnualWithdrawal = currentAnnualWithdrawal * (1 + (retirementInflation / 100));
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Current Exp.</p>
          <h3 className="text-xl font-bold text-white">{formatCur(currentExpense)}</h3>
          <p className="text-[10px] text-[#B5B5B5] mt-1">/ month</p>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Exp. at Retire</p>
          <h3 className="text-xl font-bold text-[#F7B500]">{formatCur(futureMonthlyExpense)}</h3>
          <p className="text-[10px] text-[#B5B5B5] mt-1">/ month at age {retireAt}</p>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[#1E88FF]/30 rounded-xl">
          <p className="text-[10px] text-[#1E88FF] uppercase font-bold tracking-wider mb-1">Required Corpus</p>
          <h3 className="text-xl font-bold text-white">{formatCur(requiredCorpus)}</h3>
          <p className="text-[10px] text-[#B5B5B5] mt-1">To sustain lifestyle</p>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Current SIP</p>
          <h3 className="text-xl font-bold text-white">{formatCur(currentSip)}</h3>
          <p className="text-[10px] text-[#B5B5B5] mt-1">/ month</p>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Required SIP</p>
          <h3 className={`text-xl font-bold ${requiredSip > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCur(requiredSip)}</h3>
          <p className="text-[10px] text-[#B5B5B5] mt-1">Additional needed</p>
        </Card>
        <Card className="p-4 bg-[#121212] border border-[rgba(255,255,255,0.08)] rounded-xl">
          <p className="text-[10px] text-[#B5B5B5] uppercase font-bold tracking-wider mb-1">Funding Gap</p>
          <h3 className={`text-xl font-bold ${corpusGap > 0 ? 'text-red-500' : 'text-green-500'}`}>{formatCur(corpusGap)}</h3>
          <p className="text-[10px] text-[#B5B5B5] mt-1">Corpus shortfall</p>
        </Card>
      </div>

      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gauge */}
        <Card className="p-8 border border-[rgba(255,255,255,0.08)] bg-gradient-to-b from-[#1E88FF]/5 to-[#171717] flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-[#B5B5B5] tracking-widest uppercase mb-6">Retirement Readiness</p>
          <div className="relative w-48 h-48 mb-6">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: score }, { value: 100 - score }]}
                    cx="50%" cy="50%" innerRadius={75} outerRadius={90} stroke="none"
                    startAngle={90} endAngle={-270} dataKey="value"
                  >
                    <Cell fill={score >= 90 ? "#22C55E" : score >= 75 ? "#1E88FF" : score >= 50 ? "#F7B500" : "#EF4444"} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-heading text-white">{score}</span>
                <span className="text-xs text-[#B5B5B5]">out of 100</span>
              </div>
          </div>
          <div className="w-full bg-[#121212] border border-[rgba(255,255,255,0.05)] rounded-xl p-4 mt-4">
            {score >= 90 ? (
              <p className="text-sm text-green-500 font-medium">Your retirement plan is healthy.</p>
            ) : score >= 75 ? (
              <p className="text-sm text-blue-500 font-medium">You are on track, but there is a small gap.</p>
            ) : (
              <p className="text-sm text-red-500 font-medium">You are short by {formatCur(corpusGap)}. Increase your investments.</p>
            )}
          </div>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2 p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717]">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-6">Corpus Projection</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E88FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1E88FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F7B500" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F7B500" stopOpacity={0}/>
                  </linearGradient>
                </defs>
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
                  formatter={(value: any) => [formatCur(Number(value || 0)), '']}
                  labelFormatter={(label) => `Age ${label}`}
                />
                <Legend />
                <Area type="monotone" dataKey="Projected" stroke="#1E88FF" strokeWidth={2} fillOpacity={1} fill="url(#colorProjected)" />
                <Area type="monotone" dataKey="Target" stroke="#F7B500" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Timelines and SWP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SWP Table */}
        <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#171717] overflow-hidden">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="text-[#1E88FF]" size={20} />
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Post Retirement (SWP)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-[#B5B5B5] uppercase bg-[#121212]">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Age</th>
                  <th className="px-4 py-3">Annual Withdrawal</th>
                  <th className="px-4 py-3 rounded-tr-lg text-right">Remaining Corpus</th>
                </tr>
              </thead>
              <tbody>
                {swpData.map((row, i) => (
                  <tr key={i} className="border-b border-[rgba(255,255,255,0.03)] last:border-0">
                    <td className="px-4 py-3 text-white font-medium">{row.age}</td>
                    <td className="px-4 py-3 text-[#F7B500]">{formatCur(row.withdrawal)}</td>
                    <td className="px-4 py-3 text-right text-white">
                      {row.remaining > 0 ? formatCur(row.remaining) : <span className="text-red-500">Depleted</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-[#B5B5B5] mt-4 text-center">Assumes {swpRate}% return and {retirementInflation}% inflation during retirement.</p>
        </Card>

        {/* Planning Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-2">Planning Options</h3>
          
          <div className="p-4 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-xl flex items-start gap-4 hover:border-[#1E88FF]/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center shrink-0"><Shield size={18} /></div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Guaranteed Plans</h4>
              <p className="text-[#B5B5B5] text-xs">Fixed returns with 100% capital protection. Best for zero-risk conservative investors.</p>
            </div>
          </div>

          <div className="p-4 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-xl flex items-start gap-4 hover:border-[#1E88FF]/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><Briefcase size={18} /></div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Participating Plans</h4>
              <p className="text-[#B5B5B5] text-xs">Guaranteed base returns + bonus potential from company profits. Low risk.</p>
            </div>
          </div>

          <div className="p-4 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-xl flex items-start gap-4 hover:border-[#1E88FF]/50 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#F7B500]/10 text-[#F7B500] flex items-center justify-center shrink-0"><TrendingUp size={18} /></div>
            <div>
              <h4 className="text-white font-bold text-sm mb-1">Guaranteed + Market Linked</h4>
              <p className="text-[#B5B5B5] text-xs">Mix of guaranteed floor growth and market-linked upside. Medium to high risk.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assumptions Editor */}
      <Card className="p-6 border border-[rgba(255,255,255,0.08)] bg-[#0A0A0A]">
        <h3 className="text-sm font-bold text-white uppercase tracking-wide mb-4">Calculation Assumptions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1">Inv. Return (%)</label>
            <input type="number" value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2 rounded text-sm focus:border-[#1E88FF] outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1">Inflation (%)</label>
            <input type="number" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2 rounded text-sm focus:border-[#1E88FF] outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1">Retire. Inflation (%)</label>
            <input type="number" value={retirementInflation} onChange={(e) => setRetirementInflation(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2 rounded text-sm focus:border-[#1E88FF] outline-none" />
          </div>
          <div>
            <label className="text-[10px] text-[#B5B5B5] uppercase block mb-1">SWP Return (%)</label>
            <input type="number" value={swpRate} onChange={(e) => setSwpRate(Number(e.target.value))} className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white p-2 rounded text-sm focus:border-[#1E88FF] outline-none" />
          </div>
        </div>
      </Card>

    </div>
  );
}
