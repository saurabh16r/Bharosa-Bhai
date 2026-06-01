"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTestStore } from "@/store/useTestStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, GraduationCap, HeartHandshake, Plane, Home, Activity, Car } from "lucide-react";

export default function TestPage() {
  const router = useRouter();
  const { currentStep, answers, userDetails, setAnswer, setUserDetails, nextStep, prevStep } = useTestStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleNext = () => {
    if (currentStep === 4) {
      router.push("/test/result");
    } else {
      nextStep();
    }
  };

  const steps = [
    { title: "Personal Details", progress: 20 },
    { title: "Goal Selection", progress: 40 },
    { title: "Income & Expenses", progress: 60 },
    { title: "Family & Dependents", progress: 80 },
    { title: "Protection Coverage", progress: 100 },
  ];

  const current = steps[currentStep];

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex flex-col items-center pt-24 pb-20 px-4">
      {/* Progress Bar */}
      <div className="fixed top-20 left-0 w-full h-1.5 bg-[rgba(255,255,255,0.08)] z-40">
        <div 
          className="h-full bg-[#F7B500] transition-all duration-500 ease-out"
          style={{ width: `${current.progress}%` }}
        />
      </div>

      <div className="w-full max-w-2xl">
        <Card className="p-8 md:p-10 relative overflow-hidden bg-[#171717] border-[rgba(255,255,255,0.08)] shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              <StepContent step={currentStep} />

              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[rgba(255,255,255,0.08)]">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="gap-2 text-[#B5B5B5] hover:text-white"
                >
                  <ArrowLeft size={18} /> Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 px-8 bg-[#F7B500] text-black hover:bg-[#F7B500]/90 font-bold"
                  disabled={!isStepValid(currentStep, userDetails, answers)}
                >
                  {currentStep === 4 ? "Generate My Plan" : "Continue"} <ArrowRight size={18} />
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
}

// Extracted Validation Logic
function isStepValid(step: number, userDetails: any, answers: any) {
  if (step === 0) {
    return !!(userDetails.name && userDetails.phone && userDetails.phone.length >= 10 && userDetails.email && userDetails.email.includes("@") && userDetails.age >= 18 && userDetails.age <= 70 && userDetails.retireAt > userDetails.age);
  }
  if (step === 2) {
    return !!answers.monthlyIncome && answers.monthlyIncome > 0 && !!answers.incomeSource;
  }
  return true; // other steps have defaults or optional fields
}

function StepContent({ step }: { step: number }) {
  const { answers, userDetails, setAnswer, setUserDetails } = useTestStore();

  switch (step) {
    case 0:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold font-heading mb-2 text-white">Let's Get to Know You</h2>
            <p className="text-[#B5B5B5]">Basic details to personalise your plan</p>
          </div>
          
          <div className="bg-[#1E88FF]/10 text-[#1E88FF] p-4 rounded-xl text-sm flex items-start gap-3 border border-[#1E88FF]/20">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <p>Your data is encrypted and 100% secure. We only use this to generate your financial roadmap.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[#B5B5B5]">Full Name *</label>
              <Input placeholder="Rajesh Kumar" value={userDetails.name || ""} onChange={(e) => setUserDetails("name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#B5B5B5]">Phone Number *</label>
              <Input type="tel" placeholder="9876543210" value={userDetails.phone || ""} onChange={(e) => setUserDetails("phone", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-[#B5B5B5]">Email Address *</label>
              <Input type="email" placeholder="rajesh@example.com" value={userDetails.email || ""} onChange={(e) => setUserDetails("email", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#B5B5B5]">Current Age *</label>
              <Input type="number" min={18} max={70} placeholder="30" value={userDetails.age || ""} onChange={(e) => setUserDetails("age", Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[#B5B5B5]">City</label>
              <Input placeholder="Mumbai" value={userDetails.city || ""} onChange={(e) => setUserDetails("city", e.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-[#B5B5B5]">Expected Retirement Age *</label>
              <Input type="number" min={40} max={80} placeholder="60" value={userDetails.retireAt || ""} onChange={(e) => setUserDetails("retireAt", Number(e.target.value))} />
            </div>
          </div>
        </div>
      );

    case 1:
      const goalsList = [
        { id: "Retirement", icon: <HeartHandshake size={24} />, locked: true },
        { id: "Child Education", icon: <GraduationCap size={24} /> },
        { id: "Child Marriage", icon: <HeartHandshake size={24} /> },
        { id: "Dream House", icon: <Home size={24} /> },
        { id: "Dream Car", icon: <Car size={24} /> },
        { id: "Vacation", icon: <Plane size={24} /> },
      ];

      const toggleGoal = (id: string, locked?: boolean) => {
        if (locked) return;
        const currentGoals = answers.goals || [];
        if (currentGoals.includes(id)) {
          setAnswer("goals", currentGoals.filter(g => g !== id));
        } else {
          setAnswer("goals", [...currentGoals, id]);
        }
      };

      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold font-heading mb-2 text-white">Select Your Goals</h2>
            <p className="text-[#B5B5B5]">Choose all goals you want to plan for</p>
          </div>

          <div className="bg-[#22C55E]/10 text-[#22C55E] p-4 rounded-xl text-sm flex items-start gap-3 border border-[#22C55E]/20">
            <span className="text-lg">💡</span>
            <p>Did you know? Setting clear goals increases your chances of achieving them by 300%.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {goalsList.map(goal => {
              const isSelected = (answers.goals || []).includes(goal.id);
              return (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id, goal.locked)}
                  className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-200 ${
                    isSelected 
                    ? 'border-[#22C55E] bg-[#22C55E]/10 text-white' 
                    : 'border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)]'
                  } ${goal.locked ? 'cursor-default opacity-80' : 'cursor-pointer'}`}
                >
                  {isSelected && <CheckCircle2 className="absolute top-2 right-2 text-[#22C55E]" size={16} />}
                  <div className={`${isSelected ? 'text-[#22C55E]' : 'text-[#B5B5B5]'}`}>
                    {goal.icon}
                  </div>
                  <span className="text-sm font-medium text-center leading-tight">{goal.id}</span>
                </button>
              );
            })}
          </div>
          <p className="text-center text-sm text-[#B5B5B5] mt-4">
            {(answers.goals?.length || 0)} goals selected — you can always add more later
          </p>
        </div>
      );

    case 2:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold font-heading mb-2 text-white">Income & Expenses</h2>
            <p className="text-[#B5B5B5]">Your cash flow shapes your financial plan</p>
          </div>

          <div className="bg-[#F7B500]/10 text-[#F7B500] p-4 rounded-xl text-sm flex items-start gap-3 border border-[#F7B500]/20">
            <span className="text-lg">💰</span>
            <p>The 50/30/20 rule suggests: 50% for Needs, 30% for Wants, and 20% for Savings & Investments.</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm text-white font-medium">Income Source *</label>
              <div className="grid grid-cols-3 gap-3">
                {["Salaried", "Business", "Professional"].map(src => (
                  <button
                    key={src}
                    onClick={() => setAnswer("incomeSource", src)}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      answers.incomeSource === src
                        ? 'border-[#1E88FF] bg-[#1E88FF]/10 text-white'
                        : 'border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:bg-white/[0.02]'
                    }`}
                  >
                    {src}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyInput label="Monthly Income *" value={answers.monthlyIncome} onChange={(v) => setAnswer("monthlyIncome", v)} />
              <CurrencyInput label="You & Spouse Expenses" value={answers.monthlyExpenses} onChange={(v) => setAnswer("monthlyExpenses", v)} />
              <CurrencyInput label="Total Monthly EMIs" value={answers.monthlyEmi} onChange={(v) => setAnswer("monthlyEmi", v)} />
              <CurrencyInput label="Total Monthly SIPs" value={answers.monthlySip} onChange={(v) => setAnswer("monthlySip", v)} />
              <CurrencyInput label="Total Emergency Fund" value={answers.emergencyFund} onChange={(v) => setAnswer("emergencyFund", v)} />
              <CurrencyInput label="Existing Investments" value={answers.existingInvestments} onChange={(v) => setAnswer("existingInvestments", v)} />
            </div>
          </div>
        </div>
      );

    case 3:
      const depsList = ["Spouse", "Children", "Parents", "Siblings"];
      const toggleDep = (id: string) => {
        const current = answers.dependents || [];
        if (current.includes(id)) setAnswer("dependents", current.filter(d => d !== id));
        else setAnswer("dependents", [...current, id]);
      };

      const hasChildren = (answers.dependents || []).includes("Children");

      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold font-heading mb-2 text-white">Family & Dependents</h2>
            <p className="text-[#B5B5B5]">Who does your income support?</p>
          </div>

          <div className="bg-[#1E88FF]/10 text-[#1E88FF] p-4 rounded-xl text-sm flex items-start gap-3 border border-[#1E88FF]/20">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <p>More dependents usually mean you need higher life insurance coverage to protect them.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {depsList.map(dep => {
              const isSelected = (answers.dependents || []).includes(dep);
              return (
                <button
                  key={dep}
                  onClick={() => toggleDep(dep)}
                  className={`p-4 rounded-xl border text-left transition-colors flex justify-between items-center ${
                    isSelected
                      ? 'border-[#F7B500] bg-[#F7B500]/10 text-white'
                      : 'border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)]'
                  }`}
                >
                  {dep}
                  <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-[#F7B500] border-[#F7B500]' : 'border-[rgba(255,255,255,0.3)]'}`}>
                    {isSelected && <span className="text-[#0E0E0E] text-xs font-bold">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {hasChildren && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="p-4 bg-[#121212] rounded-xl border border-[rgba(255,255,255,0.05)] space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-white">Number of Children</label>
                <select 
                  className="w-full h-10 bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-md px-3 text-white outline-none"
                  value={answers.numberOfChildren || 0}
                  onChange={(e) => {
                    const num = parseInt(e.target.value);
                    setAnswer("numberOfChildren", num);
                    const currentAges = answers.childrenAges || [];
                    if (currentAges.length < num) {
                      setAnswer("childrenAges", [...currentAges, ...Array(num - currentAges.length).fill(0)]);
                    } else if (currentAges.length > num) {
                      setAnswer("childrenAges", currentAges.slice(0, num));
                    }
                  }}
                >
                  {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              {answers.numberOfChildren && answers.numberOfChildren > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {(answers.childrenAges || []).map((age, i) => (
                    <div key={i} className="space-y-1">
                      <label className="text-xs text-[#B5B5B5]">Child {i+1} Age</label>
                      <Input 
                        type="number" min={0} max={30} 
                        value={age} 
                        onChange={(e) => {
                          const newAges = [...(answers.childrenAges || [])];
                          newAges[i] = parseInt(e.target.value) || 0;
                          setAnswer("childrenAges", newAges);
                        }} 
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </motion.div>
          )}
        </div>
      );

    case 4:
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold font-heading mb-2 text-white">Protection Coverage</h2>
            <p className="text-[#B5B5B5]">Your safety net against life's uncertainties</p>
          </div>

          <div className="bg-[#22C55E]/10 text-[#22C55E] p-4 rounded-xl text-sm flex items-start gap-3 border border-[#22C55E]/20">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <p>Medical inflation in India is 14%. Without adequate health insurance, one hospital visit can wipe out years of savings.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#121212] flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Term Life Insurance</h4>
                <p className="text-xs text-[#B5B5B5]">Income replacement protection for family</p>
              </div>
              <SimpleToggle 
                checked={!!answers.hasTermInsurance} 
                onChange={(v) => setAnswer("hasTermInsurance", v)} 
              />
            </div>

            <div className="p-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[#121212] flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium mb-1">Health Insurance</h4>
                <p className="text-xs text-[#B5B5B5]">Medical emergency protection</p>
              </div>
              <SimpleToggle 
                checked={!!answers.hasHealthInsurance} 
                onChange={(v) => setAnswer("hasHealthInsurance", v)} 
              />
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// Currency Input Component
function CurrencyInput({ label, value, onChange }: { label: string, value: any, onChange: (v: number) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-[#B5B5B5]">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5B5B5]">₹</span>
        <Input
          type="number"
          className="pl-8"
          value={value || ""}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

// Simple Toggle Component
function SimpleToggle({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${checked ? 'bg-[#F7B500]' : 'bg-[#2A2A2A]'}`}
    >
      <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );
}
