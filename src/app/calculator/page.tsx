"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const invested = data.Invested;
    const value = data.Value;
    const returns = value - invested;
    const returnPct = invested > 0 ? Math.round((returns / invested) * 100) : 0;
    const multiple = invested > 0 ? (value / invested).toFixed(1) : "1.0";

    return (
      <div className="bg-[#171717] border border-[rgba(255,255,255,0.08)] p-4 rounded-xl shadow-xl font-sans text-xs space-y-2 text-white">
        <p className="font-bold text-[#B5B5B5] border-b border-white/5 pb-1 mb-1">{data.year}</p>
        <div className="flex justify-between gap-6">
          <span className="text-[#B5B5B5]">Invested Amount:</span>
          <span className="font-bold text-white">₹{invested.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-[#1E88FF]">Wealth Generated:</span>
          <span className="font-bold text-[#1E88FF]">₹{returns.toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-[#F7B500]">Total Value:</span>
          <span className="font-bold text-white">₹{value.toLocaleString('en-IN')}</span>
        </div>
        <div className="border-t border-white/5 pt-1.5 mt-1 space-y-1">
          <div className="flex justify-between gap-6 text-[#22C55E]">
            <span>Return %:</span>
            <span className="font-bold">+{returnPct}%</span>
          </div>
          <div className="flex justify-between gap-6 text-[#22C55E]">
            <span>Wealth Multiple:</span>
            <span className="font-bold">{multiple}x</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function SIPCalculatorPage() {
  const [monthlySip, setMonthlySip] = React.useState(5000);
  const [returnRate, setReturnRate] = React.useState(12);
  const [duration, setDuration] = React.useState(10);

  const calculateSIP = () => {
    const monthlyRate = returnRate / 12 / 100;
    const months = duration * 12;
    const investedAmount = monthlySip * months;
    
    // Future Value formula for SIP: P × ({[1 + i]^n - 1} / i) × (1 + i)
    const futureValue = monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const estimatedReturns = futureValue - investedAmount;

    // Generate chart data
    const data = [];
    for (let year = 1; year <= duration; year++) {
      const m = year * 12;
      const inv = monthlySip * m;
      const val = monthlySip * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
      data.push({
        year: `Year ${year}`,
        Invested: Math.round(inv),
        Value: Math.round(val),
      });
    }

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      futureValue: Math.round(futureValue),
      data
    };
  };

  const results = calculateSIP();
  const multiplier = (results.futureValue / results.investedAmount).toFixed(1);
  const totalReturnPercent = Math.round(((results.futureValue - results.investedAmount) / results.investedAmount) * 100);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-heading mb-4 text-white">SIP Calculator</h1>
          <p className="text-[#B5B5B5] text-lg">Calculate how much your monthly investments will grow over time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls */}
          <Card className="lg:col-span-4 p-6 space-y-8">
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-[#B5B5B5]">Monthly Investment</label>
                <div className="bg-[#121212] px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-white font-semibold">
                  ₹{monthlySip.toLocaleString('en-IN')}
                </div>
              </div>
              <input 
                type="range" 
                min="500" max="100000" step="500"
                value={monthlySip}
                onChange={(e) => setMonthlySip(Number(e.target.value))}
                className="w-full h-2 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-[#F7B500]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-[#B5B5B5]">Expected Return Rate (p.a)</label>
                <div className="bg-[#121212] px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-white font-semibold">
                  {returnRate}%
                </div>
              </div>
              <input 
                type="range" 
                min="1" max="30" step="0.5"
                value={returnRate}
                onChange={(e) => setReturnRate(Number(e.target.value))}
                className="w-full h-2 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-[#1E88FF]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm text-[#B5B5B5]">Time Period</label>
                <div className="bg-[#121212] px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-white font-semibold">
                  {duration} Yr
                </div>
              </div>
              <input 
                type="range" 
                min="1" max="40" step="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full h-2 bg-[#121212] rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
              />
            </div>
            
          </Card>

          {/* Results & Chart */}
          <div className="lg:col-span-8 flex flex-col gap-6">
                {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-[#171717]/50 border-t-2 border-t-[#B5B5B5]">
                <p className="text-sm text-[#B5B5B5] mb-2">Invested Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(results.investedAmount)}</p>
                <p className="text-xs text-[#B5B5B5]/60 mt-1">Principal Capital</p>
              </Card>
              <Card className="p-6 bg-[#1E88FF]/10 border-t-2 border-t-[#1E88FF]">
                <p className="text-sm text-[#B5B5B5] mb-2">Estimated Returns</p>
                <p className="text-2xl font-bold text-[#1E88FF]">{formatCurrency(results.estimatedReturns)}</p>
                <p className="text-xs text-[#22C55E] mt-1 font-semibold">+{totalReturnPercent}% Total Return</p>
              </Card>
              <Card className="p-6 bg-[#F7B500]/10 border-t-2 border-t-[#F7B500] glow-primary">
                <p className="text-sm text-[#F7B500] mb-2">Total Value</p>
                <p className="text-3xl font-bold text-white font-heading">{formatCurrency(results.futureValue)}</p>
                <p className="text-xs text-[#F7B500] mt-1 font-semibold">{multiplier}x Wealth Created</p>
              </Card>
            </div>

            {/* Chart */}
            <Card className="p-6 flex-1 min-h-[400px]">
              <h3 className="text-lg font-semibold text-white mb-6">Growth Over Time</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={results.data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7B500" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F7B500" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#B5B5B5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#B5B5B5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" stroke="#B5B5B5" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#B5B5B5" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/100000).toFixed(1)}L`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Value" stroke="#F7B500" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="Invested" stroke="#B5B5B5" strokeWidth={2} fillOpacity={1} fill="url(#colorInv)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
