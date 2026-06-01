import * as React from "react";
import { DashboardMetrics } from "@/lib/scoring";
import { UserDetails, TestAnswers } from "@/store/useTestStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ShieldAlert, TrendingUp, CheckCircle, ArrowUpRight, ChevronRight, Activity, Zap, FileText, HeartHandshake } from "lucide-react";

interface OverviewTabProps {
  metrics: DashboardMetrics;
  user: Partial<UserDetails>;
  answers: Partial<TestAnswers>;
}

export function OverviewTab({ metrics, user, answers }: OverviewTabProps) {
  const formatCur = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excellent": return "text-green-500 bg-green-500/10 border-green-500";
      case "Good": return "text-blue-500 bg-blue-500/10 border-blue-500";
      case "Average": return "text-yellow-500 bg-yellow-500/10 border-yellow-500";
      default: return "text-red-500 bg-red-500/10 border-red-500";
    }
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Work";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Overall Score */}
        <Card className="lg:col-span-2 p-8 border border-[rgba(255,255,255,0.08)] bg-[#171717] relative overflow-hidden">
          <p className="text-xs font-bold text-[#B5B5B5] tracking-widest uppercase mb-1">Overall</p>
          <h2 className="text-2xl font-bold font-heading text-white mb-6">Financial Health Score</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-12">
            
            {/* Main Gauge */}
            <div className="relative w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: metrics.overallScore }, { value: 100 - metrics.overallScore }]}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={85} stroke="none"
                    startAngle={210} endAngle={-30} dataKey="value"
                  >
                    <Cell fill={metrics.overallScore >= 60 ? "#22C55E" : metrics.overallScore >= 40 ? "#F7B500" : "#EF4444"} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span className={`text-5xl font-bold font-heading ${metrics.overallScore >= 60 ? 'text-green-500' : metrics.overallScore >= 40 ? 'text-[#F7B500]' : 'text-red-500'}`}>
                  {metrics.overallScore}
                </span>
                <span className="text-[10px] font-medium text-[#B5B5B5] bg-[#121212] px-3 py-1 rounded-full mt-2 border border-[rgba(255,255,255,0.08)]">
                  {metrics.healthStatus}
                </span>
              </div>
            </div>

            {/* Sub Scores */}
            <div className="flex-1 grid grid-cols-3 gap-4 w-full">
              {[
                { label: "Protection", score: metrics.protectionScore, icon: <ShieldAlert size={16} className="text-blue-500" />, color: "#1E88FF" },
                { label: "Retirement", score: metrics.retirementScore, icon: <TrendingUp size={16} className="text-yellow-500" />, color: "#F7B500" },
                { label: "Goals", score: metrics.goalsScore, icon: <CheckCircle size={16} className="text-green-500" />, color: "#22C55E" }
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center p-4 bg-[#121212] rounded-2xl border border-[rgba(255,255,255,0.03)]">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-[${s.color}]/10`}>
                    {s.icon}
                  </div>
                  <span className="text-2xl font-bold text-white leading-none mb-1">{s.score}</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#B5B5B5] font-semibold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Card 2: Coverage Analysis */}
        <Card className="lg:col-span-1 p-8 border border-[rgba(255,255,255,0.08)] bg-[#171717] flex flex-col">
          <p className="text-xs font-bold text-[#B5B5B5] tracking-widest uppercase mb-1">Coverage Analysis</p>
          <h2 className="text-lg font-bold text-white mb-6">Insurance Gap vs. Current Coverage</h2>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white font-medium">Term Life Insurance</span>
                <span className="text-red-500 font-bold">{Math.round((1 - (metrics.termInsuranceGap / (metrics.termInsuranceRequired || 1))) * 100)}% covered</span>
              </div>
              <div className="w-full h-2 bg-red-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(1 - (metrics.termInsuranceGap / (metrics.termInsuranceRequired || 1))) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#B5B5B5] mt-2">
                <span>Current: {formatCur(metrics.termInsuranceRequired - metrics.termInsuranceGap)}</span>
                <span>Required: {formatCur(metrics.termInsuranceRequired)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-white font-medium">Health Insurance</span>
                <span className="text-red-500 font-bold">{Math.round((1 - (metrics.healthInsuranceGap / (metrics.healthInsuranceRequired || 1))) * 100)}% covered</span>
              </div>
              <div className="w-full h-2 bg-red-500/10 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${(1 - (metrics.healthInsuranceGap / (metrics.healthInsuranceRequired || 1))) * 100}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-[#B5B5B5] mt-2">
                <span>Current: {formatCur(metrics.healthInsuranceRequired - metrics.healthInsuranceGap)}</span>
                <span>Required: {formatCur(metrics.healthInsuranceRequired)}</span>
              </div>
            </div>
          </div>

          <Button className="w-full mt-6 bg-[#0E0E0E] text-[#B5B5B5] hover:text-white border border-[rgba(255,255,255,0.08)]">
            <span className="text-green-500 mr-2">📞</span> Book a Discovery Call <ChevronRight size={16} className="ml-2" />
          </Button>
        </Card>
      </div>

      {/* ROW 2: Main Health Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Meter */}
        <Card className="p-8 border border-[rgba(255,255,255,0.08)] bg-gradient-to-b from-[#1E88FF]/5 to-[#171717] flex flex-col items-center justify-center text-center">
          <p className="text-xs font-bold text-[#B5B5B5] tracking-widest uppercase mb-6">Your Financial Health</p>
          <div className="relative w-48 h-48 mb-6">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: metrics.overallScore }, { value: 100 - metrics.overallScore }]}
                    cx="50%" cy="50%" innerRadius={75} outerRadius={90} stroke="none"
                    startAngle={90} endAngle={-270} dataKey="value"
                  >
                    <Cell fill={metrics.overallScore >= 60 ? "#22C55E" : metrics.overallScore >= 40 ? "#1E88FF" : "#EF4444"} />
                    <Cell fill="rgba(255,255,255,0.05)" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold font-heading text-white">{metrics.overallScore}</span>
                <span className="text-xs text-[#B5B5B5]">out of 100</span>
              </div>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(metrics.healthStatus)} mb-4 flex items-center gap-2`}>
            {metrics.healthStatus === "Excellent" ? '🤩' : metrics.healthStatus === "Good" ? '😊' : '😟'} {metrics.healthStatus}
          </div>
          <p className="text-sm text-[#B5B5B5] leading-relaxed max-w-[200px]">
            There are important gaps to close. Start with the priority actions below.
          </p>
        </Card>

        {/* 6 Analysis Grid */}
        <Card className="lg:col-span-2 p-8 border border-[rgba(255,255,255,0.08)] bg-[#171717]">
          <div className="flex justify-between items-center mb-6">
            <p className="text-xs font-bold text-[#B5B5B5] tracking-widest uppercase">Score Breakdown</p>
            <span className="text-[10px] text-[#B5B5B5]">Click a tab above for details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Box 1 */}
            <div className="p-5 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-2xl relative group hover:border-[rgba(255,255,255,0.2)] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <Activity size={16} className="text-[#1E88FF]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Retirement Readiness</h4>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-[#1E88FF]">{metrics.retirementScore}<span className="text-sm text-[#B5B5B5]">/100</span></span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getScoreStatus(metrics.retirementScore) === "Needs Work" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>{getScoreStatus(metrics.retirementScore)}</span>
              </div>
              <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full mb-3"><div className="h-full bg-[#1E88FF] rounded-full" style={{width: `${metrics.retirementScore}%`}} /></div>
              <p className="text-[10px] text-[#B5B5B5]">Your track to a comfortable retirement.</p>
            </div>

            {/* Box 2 */}
            <div className="p-5 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-2xl relative group hover:border-[rgba(255,255,255,0.2)] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={16} className="text-[#22C55E]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Goal Preparedness</h4>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-[#22C55E]">{metrics.goalsScore}<span className="text-sm text-[#B5B5B5]">/100</span></span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getScoreStatus(metrics.goalsScore) === "Needs Work" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>{getScoreStatus(metrics.goalsScore)}</span>
              </div>
              <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full mb-3"><div className="h-full bg-[#22C55E] rounded-full" style={{width: `${metrics.goalsScore}%`}} /></div>
              <p className="text-[10px] text-[#B5B5B5]">Funding for life goals on time.</p>
            </div>

            {/* Box 3 */}
            <div className="p-5 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-2xl relative group hover:border-[rgba(255,255,255,0.2)] transition-colors">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={16} className="text-[#F7B500]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Protection Strength</h4>
              </div>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-bold text-[#F7B500]">{metrics.protectionScore}<span className="text-sm text-[#B5B5B5]">/100</span></span>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getScoreStatus(metrics.protectionScore) === "Needs Work" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>{getScoreStatus(metrics.protectionScore)}</span>
              </div>
              <div className="w-full h-1 bg-[rgba(255,255,255,0.05)] rounded-full mb-3"><div className="h-full bg-[#F7B500] rounded-full" style={{width: `${metrics.protectionScore}%`}} /></div>
              <p className="text-[10px] text-[#B5B5B5]">Safety net against life's risks.</p>
            </div>

            {/* Income */}
            <div className="p-5 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-2xl relative flex flex-col justify-end min-h-[140px]">
              <ArrowUpRight size={16} className="absolute top-4 right-4 text-[#B5B5B5]" />
              <div className="w-8 h-8 rounded bg-green-500/20 text-green-500 flex items-center justify-center mb-4 absolute top-4 left-4"><TrendingUp size={16} /></div>
              <p className="text-xs text-[#B5B5B5] mb-1">Monthly Income</p>
              <h3 className="text-2xl font-bold text-white">{formatCur(answers.monthlyIncome || 0)}</h3>
            </div>

            {/* Expenses */}
            <div className="p-5 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-2xl relative flex flex-col justify-end min-h-[140px]">
              <ArrowUpRight size={16} className="absolute top-4 right-4 text-[#B5B5B5]" />
              <div className="w-8 h-8 rounded bg-red-500/20 text-red-500 flex items-center justify-center mb-4 absolute top-4 left-4"><ShieldAlert size={16} /></div>
              <p className="text-xs text-[#B5B5B5] mb-1">Monthly Expenses</p>
              <h3 className="text-2xl font-bold text-white">{formatCur((answers.monthlyExpenses || 0) + (answers.monthlyEmi || 0))}</h3>
            </div>

            {/* Savings */}
            <div className="p-5 border border-[rgba(255,255,255,0.08)] bg-[#121212] rounded-2xl relative flex flex-col justify-end min-h-[140px]">
              <ArrowUpRight size={16} className="absolute top-4 right-4 text-[#B5B5B5]" />
              <div className="w-8 h-8 rounded bg-[#1E88FF]/20 text-[#1E88FF] flex items-center justify-center mb-4 absolute top-4 left-4"><Activity size={16} /></div>
              <p className="text-xs text-[#B5B5B5] mb-1">Monthly Savings</p>
              <h3 className={`text-2xl font-bold ${metrics.monthlySavings < 0 ? 'text-red-500' : 'text-white'}`}>{formatCur(metrics.monthlySavings)}</h3>
            </div>

          </div>
        </Card>
      </div>

      {/* ROW 3: Summary Cards 4 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Retirement */}
        <div className="p-6 border border-[rgba(255,255,255,0.08)] bg-white/[0.02] rounded-2xl relative">
           <ArrowUpRight size={16} className="absolute top-4 right-4 text-[#B5B5B5]" />
           <div className="w-8 h-8 bg-[#1E88FF] text-white flex items-center justify-center rounded mb-6"><TrendingUp size={16} /></div>
           <p className="text-[10px] font-bold text-[#B5B5B5] uppercase tracking-wide mb-1">Retirement</p>
           <h3 className="text-2xl font-bold text-white mb-4">{metrics.retirementCorpusRequired >= 10000000 ? `₹${(metrics.retirementCorpusRequired / 10000000).toFixed(2)} Cr` : formatCur(metrics.retirementCorpusRequired)}</h3>
           <p className="text-[10px] text-[#B5B5B5] mb-4">Corpus needed</p>
           <ul className="text-xs text-[#B5B5B5] space-y-1">
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-[#1E88FF] rounded-full" /> Start SIP {formatCur(metrics.requiredRetirementSip)}/mo</li>
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-[#1E88FF] rounded-full" /> Retiring at age {user.retireAt}</li>
           </ul>
        </div>
        
        {/* Life Goals */}
        <div className="p-6 border border-[rgba(255,255,255,0.08)] bg-white/[0.02] rounded-2xl relative">
           <ArrowUpRight size={16} className="absolute top-4 right-4 text-[#B5B5B5]" />
           <div className="w-8 h-8 bg-[#22C55E] text-white flex items-center justify-center rounded mb-6"><CheckCircle size={16} /></div>
           <p className="text-[10px] font-bold text-[#B5B5B5] uppercase tracking-wide mb-1">Life Goals</p>
           <h3 className="text-2xl font-bold text-white mb-4">{metrics.activeGoalsCount}</h3>
           <p className="text-[10px] text-[#B5B5B5] mb-4">Active goals</p>
           <ul className="text-xs text-[#B5B5B5] space-y-1">
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-[#22C55E] rounded-full" /> {(answers.goals || []).includes("Child Education") ? "1 child goal" : "No child goals"}</li>
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-[#22C55E] rounded-full" /> {Math.max(0, metrics.activeGoalsCount - 1)} other goal(s)</li>
           </ul>
        </div>

        {/* Protection */}
        <div className="p-6 border border-[rgba(255,255,255,0.08)] bg-white/[0.02] rounded-2xl relative">
           <ArrowUpRight size={16} className="absolute top-4 right-4 text-[#B5B5B5]" />
           <div className="w-8 h-8 bg-[#F7B500] text-[#0E0E0E] flex items-center justify-center rounded mb-6"><ShieldAlert size={16} /></div>
           <p className="text-[10px] font-bold text-[#B5B5B5] uppercase tracking-wide mb-1">Protection</p>
           <h3 className="text-2xl font-bold text-white mb-4">{metrics.termInsuranceRequired >= 100000 ? `₹${(metrics.termInsuranceRequired / 100000).toFixed(2)} L` : formatCur(metrics.termInsuranceRequired)}</h3>
           <p className="text-[10px] text-[#B5B5B5] mb-4">Term cover needed</p>
           <ul className="text-xs text-[#B5B5B5] space-y-1">
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-[#F7B500] rounded-full" /> Gap: {formatCur(metrics.termInsuranceGap)}</li>
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-[#F7B500] rounded-full" /> Health gap: {formatCur(metrics.healthInsuranceGap)}</li>
           </ul>
        </div>

        {/* Life Journey */}
        <div className="p-6 border border-[rgba(255,255,255,0.08)] bg-white/[0.02] rounded-2xl relative">
           <ArrowUpRight size={16} className="absolute top-4 right-4 text-[#B5B5B5]" />
           <div className="w-8 h-8 bg-[#0E0E0E] border border-[#B5B5B5] text-white flex items-center justify-center rounded mb-6"><FileText size={16} /></div>
           <p className="text-[10px] font-bold text-[#B5B5B5] uppercase tracking-wide mb-1">Life Journey</p>
           <h3 className="text-2xl font-bold text-white mb-4">{Math.max(0, (user.retireAt || 60) - (user.age || 30))} yrs</h3>
           <p className="text-[10px] text-[#B5B5B5] mb-4">To retirement</p>
           <ul className="text-xs text-[#B5B5B5] space-y-1">
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full" /> Current age {user.age}</li>
             <li className="flex items-center gap-1"><span className="w-1 h-1 bg-white rounded-full" /> See full timeline</li>
           </ul>
        </div>
      </div>

      {/* ROW 4: Family Profile */}
      <div className="space-y-4">
        <p className="text-xs font-bold text-[#B5B5B5] tracking-widest uppercase mb-1">Family Profile</p>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
           {/* Parents */}
           {(answers.dependents || []).includes("Parents") && (
             <div className="min-w-[250px] p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 snap-start">
               <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-1">Parents Maintenance</p>
               <h4 className="text-lg font-bold text-white">₹10,000/mo</h4>
             </div>
           )}
           {/* You & Spouse */}
           <div className="min-w-[250px] p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 snap-start">
             <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">You & Spouse</p>
             <h4 className="text-lg font-bold text-white">{formatCur(answers.monthlyExpenses || 0)}/mo</h4>
           </div>
           {/* Children */}
           {(answers.dependents || []).includes("Children") && (
             <div className="min-w-[250px] p-4 rounded-xl bg-white/5 border border-[rgba(255,255,255,0.08)] snap-start">
               <p className="text-[10px] font-bold text-[#B5B5B5] uppercase tracking-widest mb-1">Children</p>
               <h4 className="text-lg font-bold text-white">₹2,000/mo</h4>
             </div>
           )}
        </div>
      </div>

      {/* ROW 5: Priority Actions */}
      <Card className="p-6 md:p-8 border border-[rgba(255,255,255,0.08)] bg-gradient-to-r from-[#171717] to-[#0A0A0A] overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7B500] opacity-[0.03] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-8 h-8 rounded-full bg-[#F7B500]/20 text-[#F7B500] flex items-center justify-center">
             <Zap size={16} />
          </div>
          <h3 className="text-xl font-bold text-white">Priority Actions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          {metrics.termInsuranceGap > 0 && (
            <div className="p-4 rounded-xl bg-[#121212] border border-[rgba(255,255,255,0.05)] hover:border-[#1E88FF]/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2 text-[#1E88FF]">
                <ShieldAlert size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Term Insurance</span>
              </div>
              <h4 className="text-white font-bold text-sm">Increase by {metrics.termInsuranceGap >= 100000 ? `₹${(metrics.termInsuranceGap/100000).toFixed(2)} L` : formatCur(metrics.termInsuranceGap)}</h4>
            </div>
          )}

          {metrics.healthInsuranceGap > 0 && (
            <div className="p-4 rounded-xl bg-[#121212] border border-[rgba(255,255,255,0.05)] hover:border-pink-500/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2 text-pink-500">
                <HeartHandshake size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Health Insurance</span>
              </div>
              <h4 className="text-white font-bold text-sm">Increase by {metrics.healthInsuranceGap >= 100000 ? `₹${(metrics.healthInsuranceGap/100000).toFixed(2)} L` : formatCur(metrics.healthInsuranceGap)}</h4>
            </div>
          )}

          {metrics.retirementCorpusGap > 0 && (
            <div className="p-4 rounded-xl bg-[#121212] border border-[rgba(255,255,255,0.05)] hover:border-[#22C55E]/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2 text-[#22C55E]">
                <TrendingUp size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Retirement Planning</span>
              </div>
              <h4 className="text-white font-bold text-sm">Connect with our consultant</h4>
            </div>
          )}

          {metrics.emergencyFundGap > 0 && (
             <div className="p-4 rounded-xl bg-[#121212] border border-[rgba(255,255,255,0.05)] hover:border-[#F7B500]/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2 text-[#F7B500]">
                <Activity size={14} /> <span className="text-[10px] font-bold uppercase tracking-widest">Emergency Fund</span>
              </div>
              <h4 className="text-white font-bold text-sm">Build {formatCur(metrics.emergencyFundGap)} more</h4>
            </div>
          )}
        </div>
      </Card>

      {/* ROW 6: Calculation Assumptions */}
      <div className="pt-8">
        <p className="text-[10px] font-bold text-[#B5B5B5] tracking-widest uppercase mb-4">Calculation Assumptions</p>
        <div className="flex flex-wrap gap-8 text-sm">
          <div><p className="text-[#B5B5B5] text-[10px] mb-1">Investment Returns</p><span className="text-white font-bold">14% CAGR</span></div>
          <div><p className="text-[#B5B5B5] text-[10px] mb-1">SWP Returns</p><span className="text-white font-bold">10% p.a.</span></div>
          <div><p className="text-[#B5B5B5] text-[10px] mb-1">Education Inflation</p><span className="text-white font-bold">10%</span></div>
          <div><p className="text-[#B5B5B5] text-[10px] mb-1">Retirement Inflation</p><span className="text-white font-bold">6%</span></div>
          <div><p className="text-[#B5B5B5] text-[10px] mb-1">Life Insurance</p><span className="text-white font-bold">20x Income</span></div>
        </div>
        <p className="text-center text-[10px] text-[#B5B5B5] mt-8 pt-4 border-t border-[rgba(255,255,255,0.05)]">
          All calculations are based on long-term average assumptions. Actual returns may vary.
        </p>
      </div>

    </div>
  );
}
