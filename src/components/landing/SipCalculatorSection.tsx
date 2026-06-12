"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Coins, PiggyBank, Award } from "lucide-react";

export function SipCalculatorSection() {
  const [monthlySip, setMonthlySip] = React.useState(5000);
  const [returnRate, setReturnRate] = React.useState(12);
  const [duration, setDuration] = React.useState(15);

  const calculateSIP = () => {
    const monthlyRate = returnRate / 12 / 100;
    const months = duration * 12;
    const investedAmount = monthlySip * months;
    
    // Future Value formula for SIP: P × ({[1 + i]^n - 1} / i) × (1 + i)
    const futureValue = monthlySip * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const estimatedReturns = futureValue - investedAmount;

    return {
      investedAmount: Math.round(investedAmount),
      estimatedReturns: Math.round(estimatedReturns),
      futureValue: Math.round(futureValue),
    };
  };

  const results = calculateSIP();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Percentages for visual progress ring
  const total = results.futureValue;
  const investedPercent = Math.round((results.investedAmount / total) * 100) || 0;
  const returnPercent = 100 - investedPercent;
  const multiplier = (results.futureValue / results.investedAmount).toFixed(1);
  const totalReturnPercent = Math.round(((results.futureValue - results.investedAmount) / results.investedAmount) * 100);

  return (
    <section className="py-24 bg-[#F9FAFB] text-[#121212] overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4 text-[#121212]"
          >
            Aaj invest karega ya kal <span className="text-[#1E88FF] italic">regret</span> karega?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#555555] text-lg font-medium"
          >
            Chhoti monthly investments se shuru karo aur dekho kaise tumhara wealth multiply hota hai.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* Controls Card */}
          <Card className="lg:col-span-6 p-5 sm:p-8 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] shadow-md rounded-3xl flex flex-col justify-between space-y-8">
            
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#121212] uppercase tracking-wider mb-2">SIP Parameters</h3>
              
              {/* Slider 1: Monthly Investment */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <label className="text-xs sm:text-sm font-bold text-[#555555] uppercase tracking-wide">Monthly Investment</label>
                  <div className="w-fit bg-[#1E88FF]/10 px-4 py-2 rounded-xl border border-[#1E88FF]/20 text-[#1E88FF] font-extrabold text-sm sm:text-base">
                    ₹{monthlySip.toLocaleString('en-IN')}
                  </div>
                </div>
                <input 
                  type="range" 
                  min="500" max="100000" step="500"
                  value={monthlySip}
                  onChange={(e) => setMonthlySip(Number(e.target.value))}
                  className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#1E88FF]"
                />
                <div className="flex justify-between text-[10px] font-bold text-[#9CA3AF]">
                  <span>₹500</span>
                  <span>₹50,000</span>
                  <span>₹1,00,000</span>
                </div>
              </div>

              {/* Slider 2: Return Rate */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <label className="text-xs sm:text-sm font-bold text-[#555555] uppercase tracking-wide">Expected Return Rate (p.a)</label>
                  <div className="w-fit bg-[#FF9F1A]/10 px-4 py-2 rounded-xl border border-[#FF9F1A]/20 text-[#FF9F1A] font-extrabold text-sm sm:text-base">
                    {returnRate}%
                  </div>
                </div>
                <input 
                  type="range" 
                  min="5" max="22" step="0.5"
                  value={returnRate}
                  onChange={(e) => setReturnRate(Number(e.target.value))}
                  className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#FF9F1A]"
                />
                <div className="flex justify-between text-[10px] font-bold text-[#9CA3AF]">
                  <span>5%</span>
                  <span>12% (Equity Avg)</span>
                  <span>22%</span>
                </div>
              </div>

              {/* Slider 3: Time Period */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <label className="text-xs sm:text-sm font-bold text-[#555555] uppercase tracking-wide">Time Period</label>
                  <div className="w-fit bg-[#22C55E]/10 px-4 py-2 rounded-xl border border-[#22C55E]/20 text-[#22C55E] font-extrabold text-sm sm:text-base">
                    {duration} Years
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" max="40" step="1"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-[#E5E7EB] rounded-lg appearance-none cursor-pointer accent-[#22C55E]"
                />
                <div className="flex justify-between text-[10px] font-bold text-[#9CA3AF]">
                  <span>1 Year</span>
                  <span>20 Yrs</span>
                  <span>40 Years</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-[rgba(0,0,0,0.03)] text-xs text-[#6B7280] font-medium leading-relaxed">
              💡 **Bhai's Tip**: Pure Equity Mutual Funds historically yield 12% to 15% long-term. SIP is a powerful compounding machine!
            </div>
            
          </Card>

          {/* Projections Card */}
          <Card className="lg:col-span-6 p-5 sm:p-8 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] shadow-md rounded-3xl flex flex-col justify-between">
            
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#121212] uppercase tracking-wider">Future Projections</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 bg-[#F9FAFB] rounded-2xl border border-[rgba(0,0,0,0.03)]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-2">
                    <PiggyBank size={16} className="text-[#6B7280]" />
                    Invested Amount
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#121212]">{formatCurrency(results.investedAmount)}</p>
                </div>
                
                <div className="p-5 bg-[#1E88FF]/5 rounded-2xl border border-[#1E88FF]/10">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#1E88FF] uppercase tracking-wider mb-2">
                    <Coins size={16} />
                    Est. Wealth Gained
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[#1E88FF]">{formatCurrency(results.estimatedReturns)}</p>
                </div>
              </div>

              {/* Highlight Future Value */}
              <div className="p-6 bg-gradient-to-br from-[#1E88FF] to-[#0A88FF] rounded-2xl text-white shadow-[0_8px_25px_rgba(30,136,255,0.25)]">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#D1D5DB] mb-1">
                  <Award size={16} />
                  Total Projected Wealth
                </div>
                <p className="text-2xl sm:text-4xl font-black font-heading">{formatCurrency(results.futureValue)}</p>
              </div>
            </div>

            {/* Circular Ring and Percentage Chart */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-6 border-t border-gray-100 mt-6 sm:mt-0">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#FF9F1A]"
                    strokeWidth="3.5"
                    strokeDasharray={`${returnPercent}, 100`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Growth</span>
                  <span className="text-sm font-black text-[#FF9F1A]">{multiplier}x</span>
                </div>
              </div>
              
              <div className="space-y-3 flex-1 w-full text-left">
                <div className="flex items-center justify-between gap-4 text-xs font-bold text-[#555555]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-gray-200 shrink-0" />
                    <span>Principal Investment ({investedPercent}%)</span>
                  </div>
                  <span className="font-extrabold text-[#121212]">{formatCurrency(results.investedAmount)}</span>
                </div>
                
                <div className="flex items-center justify-between gap-4 text-xs font-bold text-[#FF9F1A]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#FF9F1A] shrink-0" />
                    <span>Wealth Created ({returnPercent}%)</span>
                  </div>
                  <span className="font-extrabold">{formatCurrency(results.estimatedReturns)}</span>
                </div>

                <div className="border-t border-dashed border-gray-200 pt-2 flex items-center justify-between gap-4 text-xs font-bold text-[#22C55E]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#22C55E]/20 border border-[#22C55E] shrink-0" />
                    <span>Total Performance</span>
                  </div>
                  <span className="font-black text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded">
                    {multiplier}x Wealth Created (+{totalReturnPercent}% Return)
                  </span>
                </div>
              </div>
            </div>

          </Card>

        </div>

      </div>
    </section>
  );
}
