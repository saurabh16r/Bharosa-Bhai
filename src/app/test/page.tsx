"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTestStore } from "@/store/useTestStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, GraduationCap, HeartHandshake, Plane, Home, Activity, Car, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { validatePhone, validateEmail, sanitizeInput, cn } from "@/lib/utils";

export default function TestPage() {
  const router = useRouter();
  const { currentStep, answers, userDetails, setAnswer, setUserDetails, nextStep, prevStep } = useTestStore();
  const [mounted, setMounted] = React.useState(false);

  const [checkingDuplicates, setCheckingDuplicates] = React.useState(false);
  const [duplicateErrors, setDuplicateErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem("test_saved");
    }
  }, []);

  if (!mounted) return null;

  const handleNext = async () => {
    if (currentStep === 0) {
      setCheckingDuplicates(true);
      setDuplicateErrors({});
      
      try {
        // 1. Fetch system settings to see if duplicate check is overridden
        let checkDuplicatesEnabled = true;
        try {
          const { data: settingData } = await supabase
            .from("system_settings")
            .select("value")
            .eq("key", "platform_settings")
            .maybeSingle();
          if (settingData && settingData.value) {
            checkDuplicatesEnabled = settingData.value.blockDuplicates !== false;
          } else {
            // Check localStorage fallback
            const local = localStorage.getItem("platform_settings");
            if (local) {
              const parsed = JSON.parse(local);
              checkDuplicatesEnabled = parsed.blockDuplicates !== false;
            }
          }
        } catch (err) {
          console.warn("Failed to fetch settings from Supabase, checking localStorage fallback", err);
          const local = localStorage.getItem("platform_settings");
          if (local) {
            const parsed = JSON.parse(local);
            checkDuplicatesEnabled = parsed.blockDuplicates !== false;
          }
        }

        if (checkDuplicatesEnabled) {
          const emailToCheck = (userDetails.email || "").trim().toLowerCase();
          const phoneToCheck = (userDetails.phone || "").trim();

          let errors: Record<string, string> = {};

          if (emailToCheck) {
            const { data: emailExists } = await supabase
              .from("users")
              .select("id")
              .eq("email", emailToCheck)
              .limit(1);

            if (emailExists && emailExists.length > 0) {
              errors.email = "This email has already completed the assessment.";
            }
          }

          if (phoneToCheck) {
            const { data: phoneExists } = await supabase
              .from("users")
              .select("id")
              .eq("phone", phoneToCheck)
              .limit(1);

            if (phoneExists && phoneExists.length > 0) {
              errors.phone = "This mobile number is already registered.";
            }
          }

          if (Object.keys(errors).length > 0) {
            setDuplicateErrors(errors);
            setCheckingDuplicates(false);
            return; // Block step transition
          }
        }
      } catch (err) {
        console.error("Error performing duplicate checks:", err);
      } finally {
        setCheckingDuplicates(false);
      }
      
      nextStep();
    } else if (currentStep === 4) {
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
        <Card className="p-5 sm:p-8 md:p-10 relative overflow-hidden bg-[#171717] border-[rgba(255,255,255,0.08)] shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full"
            >
              <StepContent 
                step={currentStep} 
                duplicateErrors={duplicateErrors} 
                setDuplicateErrors={setDuplicateErrors} 
              />

              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[rgba(255,255,255,0.08)]">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0 || checkingDuplicates}
                  className="gap-2 text-[#B5B5B5] hover:text-white"
                >
                  <ArrowLeft size={18} /> Back
                </Button>
                
                <Button
                  onClick={handleNext}
                  size="lg"
                  className="gap-2 px-8 bg-[#F7B500] text-black hover:bg-[#F7B500]/90 font-bold min-w-[140px] justify-center"
                  disabled={!isStepValid(currentStep, userDetails, answers) || checkingDuplicates}
                >
                  {checkingDuplicates ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      Checking...
                    </span>
                  ) : (
                    <>
                      {currentStep === 4 ? "Generate My Plan" : "Continue"} <ArrowRight size={18} />
                    </>
                  )}
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
    const nameOk = !!(userDetails.name && userDetails.name.trim().length > 0);
    const cityOk = !!(userDetails.city && userDetails.city.trim().length > 0);
    const ageOk = typeof userDetails.age === 'number' && userDetails.age >= 18 && userDetails.age <= 70;
    const retireOk = typeof userDetails.retireAt === 'number' && userDetails.retireAt >= 40 && userDetails.retireAt <= 80 && userDetails.retireAt > (userDetails.age || 0);
    
    const phoneError = validatePhone(userDetails.phone || "");
    const emailError = validateEmail(userDetails.email || "");
    
    return nameOk && cityOk && ageOk && retireOk && !phoneError && !emailError;
  }
  if (step === 2) {
    return !!answers.monthlyIncome && answers.monthlyIncome > 0 && Array.isArray(answers.incomeSource) && answers.incomeSource.length > 0;
  }
  if (step === 3) {
    const hasParents = (answers.dependents || []).includes("Parents");
    if (hasParents) {
      const pensionAnswer = answers.parentsReceivePension;
      const pensionAmount = answers.parentMonthlyPension ?? 0;
      const supportAmount = answers.parentMonthlySupport ?? 0;
      
      const pensionOk = pensionAnswer === "No" || (pensionAnswer === "Yes" && pensionAmount > 0);
      const supportOk = supportAmount >= 0;
      
      return pensionOk && supportOk;
    }
    return true;
  }
  if (step === 4) {
    const termOk = answers.termInsuranceEnabled === false || 
      (answers.termInsuranceEnabled === true && !!answers.termInsuranceCoverage && answers.termInsuranceCoverage > 0);
    const healthOk = answers.healthInsuranceEnabled === false || 
      (answers.healthInsuranceEnabled === true && !!answers.healthInsuranceCoverage && answers.healthInsuranceCoverage > 0);
    return termOk && healthOk && (answers.termInsuranceEnabled !== undefined) && (answers.healthInsuranceEnabled !== undefined);
  }
  return true; // other steps have defaults or optional fields
}

// Validated Input wrapper
function ValidatedInput({
  label,
  field,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  showError,
  showSuccess,
  className,
  min,
  max
}: {
  label: string;
  field: string;
  type?: string;
  placeholder?: string;
  value: any;
  onChange: (val: any) => void;
  onBlur?: () => void;
  error: string | null;
  showError: boolean;
  showSuccess: boolean;
  className?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className={cn("space-y-2 relative", className)}>
      <label className="text-sm text-[#B5B5B5]">{label}</label>
      <div className="relative">
        <Input
          type={type}
          placeholder={placeholder}
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            let val: any = e.target.value;
            if (type === "number") {
              val = e.target.value === "" ? "" : Number(e.target.value);
            }
            onChange(val);
          }}
          onBlur={onBlur}
          className={cn(
            "pr-10 transition-all duration-300",
            showError && "border-red-500 focus-visible:ring-red-500/20",
            showSuccess && "border-green-500 focus-visible:ring-green-500/20"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
          {showSuccess && <CheckCircle2 className="text-green-500 w-5 h-5 animate-in fade-in zoom-in duration-300" />}
          {showError && <AlertCircle className="text-red-500 w-5 h-5 animate-in fade-in zoom-in duration-300" />}
        </div>
      </div>
      {showError && error && (
        <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">{error}</p>
      )}
    </div>
  );
}

function StepContent({ 
  step, 
  duplicateErrors = {}, 
  setDuplicateErrors = () => {} 
}: { 
  step: number; 
  duplicateErrors?: Record<string, string>; 
  setDuplicateErrors?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}) {
  const { answers, userDetails, setAnswer, setUserDetails } = useTestStore();
  
  // Touched state to control when errors/success states are displayed
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  const [incomeSourceTouched, setIncomeSourceTouched] = React.useState(false);

  const toggleIncomeSource = (src: any) => {
    setIncomeSourceTouched(true);
    const current = answers.incomeSource || [];
    let updated;
    if (current.includes(src)) {
      updated = current.filter(s => s !== src);
    } else {
      updated = [...current, src];
    }
    setAnswer("incomeSource", updated);
  };

  React.useEffect(() => {
    if (step === 4) {
      if (answers.termInsuranceEnabled === undefined && answers.hasTermInsurance !== undefined) {
        setAnswer("termInsuranceEnabled", answers.hasTermInsurance);
      }
      if (answers.healthInsuranceEnabled === undefined && answers.hasHealthInsurance !== undefined) {
        setAnswer("healthInsuranceEnabled", answers.hasHealthInsurance);
      }
    }
  }, [step, answers.hasTermInsurance, answers.hasHealthInsurance, answers.termInsuranceEnabled, answers.healthInsuranceEnabled, setAnswer]);

  const getFieldError = (field: string, val: any): string | null => {
    if (duplicateErrors && duplicateErrors[field]) {
      return duplicateErrors[field];
    }
    
    switch (field) {
      case "name":
        if (!val || !val.trim()) return "Full name is required";
        return null;
      case "phone":
        return validatePhone(val || "");
      case "email":
        return validateEmail(val || "");
      case "age":
        if (val === undefined || val === null || val === "") return "Age is required";
        const ageNum = Number(val);
        if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) return "Age must be between 18 and 70";
        return null;
      case "city":
        if (!val || !val.trim()) return "City is required";
        return null;
      case "retireAt":
        if (val === undefined || val === null || val === "") return "Retirement age is required";
        const retireNum = Number(val);
        if (isNaN(retireNum) || retireNum < 40 || retireNum > 80) return "Retirement age must be between 40 and 80";
        if (userDetails.age && retireNum <= Number(userDetails.age)) return "Retirement age must be greater than current age";
        return null;
      default:
        return null;
    }
  };

  const shouldShowError = (field: string, val: any) => {
    if (duplicateErrors && duplicateErrors[field]) return true;
    if (!touched[field]) return false;
    return !!getFieldError(field, val);
  };

  const shouldShowSuccess = (field: string, val: any) => {
    if (duplicateErrors && duplicateErrors[field]) return false;
    if (val === undefined || val === null || val === "") return false;
    if (typeof val === "string" && !val.trim()) return false;
    if (!touched[field] && (val === undefined || val === "")) return false;
    return !getFieldError(field, val);
  };

  const handleFieldChange = (field: string, value: any) => {
    let sanitizedVal = value;
    if (typeof value === "string") {
      if (field === "email") {
        sanitizedVal = value.toLowerCase().replace(/\s/g, "");
      } else {
        sanitizedVal = sanitizeInput(value);
      }
    }
    
    setUserDetails(field as any, sanitizedVal);
    setTouched(prev => ({ ...prev, [field]: true }));
    if (duplicateErrors && duplicateErrors[field]) {
      setDuplicateErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

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
            <ValidatedInput
              label="Full Name *"
              field="name"
              placeholder="Rajesh Kumar"
              value={userDetails.name || ""}
              onChange={(val) => handleFieldChange("name", val)}
              onBlur={() => handleBlur("name")}
              error={getFieldError("name", userDetails.name)}
              showError={shouldShowError("name", userDetails.name)}
              showSuccess={shouldShowSuccess("name", userDetails.name)}
            />
            
            <ValidatedInput
              label="Phone Number *"
              field="phone"
              type="tel"
              placeholder="9876543210"
              value={userDetails.phone || ""}
              onChange={(val) => handleFieldChange("phone", val)}
              onBlur={() => handleBlur("phone")}
              error={getFieldError("phone", userDetails.phone)}
              showError={shouldShowError("phone", userDetails.phone)}
              showSuccess={shouldShowSuccess("phone", userDetails.phone)}
            />

            <ValidatedInput
              label="Email Address *"
              field="email"
              type="email"
              placeholder="rajesh@example.com"
              value={userDetails.email || ""}
              className="md:col-span-2"
              onChange={(val) => handleFieldChange("email", val)}
              onBlur={() => handleBlur("email")}
              error={getFieldError("email", userDetails.email)}
              showError={shouldShowError("email", userDetails.email)}
              showSuccess={shouldShowSuccess("email", userDetails.email)}
            />

            <ValidatedInput
              label="Current Age *"
              field="age"
              type="number"
              min={18}
              max={70}
              placeholder="30"
              value={userDetails.age || ""}
              onChange={(val) => handleFieldChange("age", val)}
              onBlur={() => handleBlur("age")}
              error={getFieldError("age", userDetails.age)}
              showError={shouldShowError("age", userDetails.age)}
              showSuccess={shouldShowSuccess("age", userDetails.age)}
            />

            <ValidatedInput
              label="City *"
              field="city"
              placeholder="Mumbai"
              value={userDetails.city || ""}
              onChange={(val) => handleFieldChange("city", val)}
              onBlur={() => handleBlur("city")}
              error={getFieldError("city", userDetails.city)}
              showError={shouldShowError("city", userDetails.city)}
              showSuccess={shouldShowSuccess("city", userDetails.city)}
            />

            <ValidatedInput
              label="Expected Retirement Age *"
              field="retireAt"
              type="number"
              min={40}
              max={80}
              placeholder="60"
              value={userDetails.retireAt || ""}
              className="md:col-span-2"
              onChange={(val) => handleFieldChange("retireAt", val)}
              onBlur={() => handleBlur("retireAt")}
              error={getFieldError("retireAt", userDetails.retireAt)}
              showError={shouldShowError("retireAt", userDetails.retireAt)}
              showSuccess={shouldShowSuccess("retireAt", userDetails.retireAt)}
            />
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
                {["Salaried", "Business", "Professional"].map(src => {
                  const isSelected = (answers.incomeSource || []).includes(src as any);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => toggleIncomeSource(src)}
                      className={`relative p-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                        isSelected
                          ? 'border-[#1E88FF] bg-[#1E88FF]/10 text-white scale-[1.03] shadow-[0_0_15px_rgba(30,136,255,0.15)] font-bold'
                          : 'border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:bg-white/[0.02] active:scale-95'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="text-[#1E88FF] shrink-0" />}
                      {src}
                    </button>
                  );
                })}
              </div>
              {incomeSourceTouched && (!answers.incomeSource || answers.incomeSource.length === 0) && (
                <p className="text-red-500 text-xs mt-1 animate-in slide-in-from-top-1 duration-200">
                  Please select at least one income source.
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyInput label="Monthly Income *" value={answers.monthlyIncome} onChange={(v) => setAnswer("monthlyIncome", v)} />
              <CurrencyInput label="Monthly Expenses" description="Enter your total monthly household expenses." value={answers.monthlyExpenses} onChange={(v) => setAnswer("monthlyExpenses", v)} />
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
        let updated;
        if (current.includes(id)) {
          updated = current.filter(d => d !== id);
        } else {
          updated = [...current, id];
        }
        setAnswer("dependents", updated);

        if (id === "Parents") {
          const isSelectedNow = updated.includes("Parents");
          setAnswer("parentsSelected", isSelectedNow);
          if (!isSelectedNow) {
            setAnswer("parentsReceivePension", "");
            setAnswer("parentMonthlyPension", 0);
            setAnswer("parentMonthlySupport", 0);
            setAnswer("parentDependencyLevel", "");
            setAnswer("parentDependencyPercentage", 0);
          }
        }
      };

      const computeParentDependency = (pension: number, support: number) => {
        const total = pension + support;
        const pct = total > 0 ? Math.round((support / total) * 100) : 0;
        
        let level = "Low Dependency";
        if (total > 0) {
          if (pct <= 25) level = "Low Dependency";
          else if (pct <= 50) level = "Moderate Dependency";
          else if (pct <= 75) level = "High Dependency";
          else level = "Fully Dependent";
        } else if (support > 0) {
          level = "Fully Dependent";
        }
        
        setAnswer("parentDependencyPercentage", pct);
        setAnswer("parentDependencyLevel", level);
      };

      const handleParentPensionChange = (pensionVal: number) => {
        setAnswer("parentMonthlyPension", pensionVal);
        computeParentDependency(pensionVal, answers.parentMonthlySupport || 0);
      };

      const handleParentSupportChange = (supportVal: number) => {
        setAnswer("parentMonthlySupport", supportVal);
        computeParentDependency(answers.parentMonthlyPension || 0, supportVal);
      };

      const handlePensionReceiveChange = (ans: "Yes" | "No") => {
        setAnswer("parentsReceivePension", ans);
        if (ans === "No") {
          setAnswer("parentMonthlyPension", 0);
          computeParentDependency(0, answers.parentMonthlySupport || 0);
        }
      };

      const hasChildren = (answers.dependents || []).includes("Children");
      const hasParents = (answers.dependents || []).includes("Parents");

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

          <AnimatePresence>
            {hasParents && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                exit={{ opacity: 0, height: 0 }}
                className="p-5 bg-[#121212] rounded-xl border border-[rgba(255,255,255,0.05)] space-y-6 overflow-hidden"
              >
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Parent Financial Dependency</h3>
                  <p className="text-xs text-[#B5B5B5]">Help us understand how financially dependent your parents are on you.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm text-white font-medium block">Do your parents receive a pension? *</label>
                  <div className="grid grid-cols-2 gap-3 w-full sm:w-64">
                    <button
                      type="button"
                      onClick={() => handlePensionReceiveChange("Yes")}
                      className={`py-2 rounded-lg font-bold text-sm border text-center transition-all cursor-pointer ${
                        answers.parentsReceivePension === "Yes"
                          ? "border-[#F7B500] bg-[#F7B500]/10 text-white"
                          : "border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)] bg-[#171717]"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePensionReceiveChange("No")}
                      className={`py-2 rounded-lg font-bold text-sm border text-center transition-all cursor-pointer ${
                        answers.parentsReceivePension === "No"
                          ? "border-[#F7B500] bg-[#F7B500]/10 text-white"
                          : "border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)] bg-[#171717]"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {answers.parentsReceivePension === "Yes" && (
                  <div className="space-y-3">
                    <label className="text-sm text-white font-medium block">What is the total monthly pension amount received by your parents? *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5B5B5]">₹</span>
                      <Input
                        type="number"
                        placeholder="Enter pension amount"
                        className="pl-8"
                        value={answers.parentMonthlyPension || ""}
                        onChange={(e) => handleParentPensionChange(Number(e.target.value))}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "₹10,000", value: 10000 },
                        { label: "₹20,000", value: 20000 },
                        { label: "₹30,000", value: 30000 },
                        { label: "₹50,000", value: 50000 }
                      ].map((pill) => (
                        <button
                          key={pill.value}
                          type="button"
                          onClick={() => handleParentPensionChange(pill.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                            answers.parentMonthlyPension === pill.value
                              ? "bg-[#F7B500] text-black border-[#F7B500] font-bold"
                              : "bg-white/[0.02] text-[#B5B5B5] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                    {answers.parentMonthlyPension !== undefined && answers.parentMonthlyPension <= 0 && (
                      <p className="text-red-500 text-xs">Pension must be greater than ₹0.</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-sm text-white font-medium block">
                    How much financial support do you provide to your parents every month? <span className="text-xs text-[#737373]">(Optional but recommended)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5B5B5]">₹</span>
                    <Input
                      type="number"
                      placeholder="Enter support amount"
                      className="pl-8"
                      value={answers.parentMonthlySupport || ""}
                      onChange={(e) => handleParentSupportChange(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "₹5,000", value: 5000 },
                      { label: "₹10,000", value: 10000 },
                      { label: "₹20,000", value: 20000 },
                      { label: "₹50,000", value: 50000 }
                    ].map((pill) => (
                      <button
                        key={pill.value}
                        type="button"
                        onClick={() => handleParentSupportChange(pill.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                          answers.parentMonthlySupport === pill.value
                            ? "bg-[#F7B500] text-black border-[#F7B500] font-bold"
                            : "bg-white/[0.02] text-[#B5B5B5] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                  {answers.parentMonthlySupport !== undefined && answers.parentMonthlySupport < 0 && (
                    <p className="text-red-500 text-xs">Support amount must be positive.</p>
                  )}
                </div>

                {(answers.parentDependencyPercentage !== undefined && answers.parentDependencyPercentage > 0) ? (
                  <div className="p-4 rounded-lg bg-[#171717] border border-[rgba(255,255,255,0.05)] flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <span className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Dependency Level</span>
                      <h4 className="text-lg font-bold text-white">{answers.parentDependencyLevel}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Dependency Percentage</span>
                      <h4 className="text-lg font-bold text-[#F7B500]">{answers.parentDependencyPercentage}%</h4>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </AnimatePresence>

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

          <div className="space-y-8">
            {/* TERM INSURANCE */}
            <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#121212] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-bold text-base">Do you have Term Life Insurance?</h4>
                  <p className="text-xs text-[#B5B5B5]">Income replacement protection for family</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full sm:w-44">
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer("termInsuranceEnabled", true);
                      setAnswer("hasTermInsurance", true);
                      if (!answers.termInsuranceCoverage) setAnswer("termInsuranceCoverage", 5000000);
                    }}
                    className={`py-2 rounded-lg font-bold text-sm transition-all border text-center ${
                      answers.termInsuranceEnabled === true
                        ? "border-[#F7B500] bg-[#F7B500]/10 text-white"
                        : "border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)] bg-[#171717]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer("termInsuranceEnabled", false);
                      setAnswer("hasTermInsurance", false);
                      setAnswer("termInsuranceCoverage", 0);
                    }}
                    className={`py-2 rounded-lg font-bold text-sm transition-all border text-center ${
                      answers.termInsuranceEnabled === false
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)] bg-[#171717]"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {answers.termInsuranceEnabled === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.05)] overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">What is your current term insurance coverage?</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5B5B5]">₹</span>
                        <Input
                          type="number"
                          className="pl-8 bg-[#171717] border-[rgba(255,255,255,0.1)] text-white focus:border-[#F7B500]"
                          placeholder="Enter coverage amount"
                          value={answers.termInsuranceCoverage || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAnswer("termInsuranceCoverage", val);
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick-select pills */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "₹10 Lakh", value: 1000000 },
                        { label: "₹25 Lakh", value: 2500000 },
                        { label: "₹50 Lakh", value: 5000000 },
                        { label: "₹1 Crore", value: 10000000 },
                      ].map((pill) => (
                        <button
                          key={pill.value}
                          type="button"
                          onClick={() => setAnswer("termInsuranceCoverage", pill.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            answers.termInsuranceCoverage === pill.value
                              ? "bg-[#F7B500] text-black border-[#F7B500] font-bold"
                              : "bg-white/[0.02] text-[#B5B5B5] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setAnswer("termInsuranceCoverage", 0);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          ![1000000, 2500000, 5000000, 10000000].includes(answers.termInsuranceCoverage || 0) && (answers.termInsuranceCoverage || 0) > 0
                            ? "bg-[#F7B500] text-black border-[#F7B500] font-bold"
                            : "bg-white/[0.02] text-[#B5B5B5] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                        }`}
                      >
                        Custom Amount
                      </button>
                    </div>

                    {/* Optional Provider */}
                    <div className="space-y-2 pt-2">
                      <label className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Insurance Provider (Optional)</label>
                      <select
                        className="w-full h-10 bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-md px-3 text-white outline-none focus:border-[#F7B500]"
                        value={answers.termInsuranceProvider || ""}
                        onChange={(e) => setAnswer("termInsuranceProvider", e.target.value)}
                      >
                        <option value="">Select Provider</option>
                        {["LIC", "HDFC Life", "ICICI Prudential", "Max Life", "SBI Life", "Tata AIA", "Bajaj Allianz", "Other"].map((prov) => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* HEALTH INSURANCE */}
            <div className="p-5 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#121212] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-white font-bold text-base">Do you have Health Insurance?</h4>
                  <p className="text-xs text-[#B5B5B5]">Medical emergency protection</p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full sm:w-44">
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer("healthInsuranceEnabled", true);
                      setAnswer("hasHealthInsurance", true);
                      if (!answers.healthInsuranceCoverage) setAnswer("healthInsuranceCoverage", 500000);
                    }}
                    className={`py-2 rounded-lg font-bold text-sm transition-all border text-center ${
                      answers.healthInsuranceEnabled === true
                        ? "border-[#F7B500] bg-[#F7B500]/10 text-white"
                        : "border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)] bg-[#171717]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAnswer("healthInsuranceEnabled", false);
                      setAnswer("hasHealthInsurance", false);
                      setAnswer("healthInsuranceCoverage", 0);
                    }}
                    className={`py-2 rounded-lg font-bold text-sm transition-all border text-center ${
                      answers.healthInsuranceEnabled === false
                        ? "border-red-500 bg-red-500/10 text-white"
                        : "border-[rgba(255,255,255,0.08)] text-[#B5B5B5] hover:border-[rgba(255,255,255,0.2)] bg-[#171717]"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {answers.healthInsuranceEnabled === true && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 pt-4 border-t border-[rgba(255,255,255,0.05)] overflow-hidden"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white">What is your current health insurance coverage?</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5B5B5]">₹</span>
                        <Input
                          type="number"
                          className="pl-8 bg-[#171717] border-[rgba(255,255,255,0.1)] text-white focus:border-[#F7B500]"
                          placeholder="Enter coverage amount"
                          value={answers.healthInsuranceCoverage || ""}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setAnswer("healthInsuranceCoverage", val);
                          }}
                        />
                      </div>
                    </div>

                    {/* Quick-select pills */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: "₹5 Lakh", value: 500000 },
                        { label: "₹10 Lakh", value: 1000000 },
                        { label: "₹20 Lakh", value: 2000000 },
                        { label: "₹50 Lakh", value: 5000000 },
                      ].map((pill) => (
                        <button
                          key={pill.value}
                          type="button"
                          onClick={() => setAnswer("healthInsuranceCoverage", pill.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            answers.healthInsuranceCoverage === pill.value
                              ? "bg-[#F7B500] text-black border-[#F7B500] font-bold"
                              : "bg-white/[0.02] text-[#B5B5B5] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                          }`}
                        >
                          {pill.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setAnswer("healthInsuranceCoverage", 0);
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                          ![500000, 1000000, 2000000, 5000000].includes(answers.healthInsuranceCoverage || 0) && (answers.healthInsuranceCoverage || 0) > 0
                            ? "bg-[#F7B500] text-black border-[#F7B500] font-bold"
                            : "bg-white/[0.02] text-[#B5B5B5] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]"
                        }`}
                      >
                        Custom Amount
                      </button>
                    </div>

                    {/* Optional Policy Type and Covered Members */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <label className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Policy Type (Optional)</label>
                        <select
                          className="w-full h-10 bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-md px-3 text-white outline-none focus:border-[#F7B500]"
                          value={answers.healthInsuranceType || ""}
                          onChange={(e) => setAnswer("healthInsuranceType", e.target.value)}
                        >
                          <option value="">Select Policy Type</option>
                          {["Individual", "Family Floater", "Employer Provided", "Individual + Employer", "Other"].map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Covering (Optional)</label>
                        <select
                          className="w-full h-10 bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-md px-3 text-white outline-none focus:border-[#F7B500]"
                          value={answers.healthInsuranceMembers || ""}
                          onChange={(e) => setAnswer("healthInsuranceMembers", e.target.value)}
                        >
                          <option value="">Select Covered Members</option>
                          {["Self", "Self + Spouse", "Self + Family", "Parents Included"].map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// Currency Input Component
function CurrencyInput({ 
  label, 
  description, 
  value, 
  onChange 
}: { 
  label: string, 
  description?: string, 
  value: any, 
  onChange: (v: number) => void 
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm text-[#B5B5B5]">{label}</label>
        {description && <p className="text-xs text-[#737373] mt-0.5">{description}</p>}
      </div>
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
