import { TestAnswers, UserDetails } from "@/store/useTestStore";

export interface DashboardMetrics {
  overallScore: number;
  protectionScore: number;
  retirementScore: number;
  goalsScore: number;
  healthStatus: "Excellent" | "Good" | "Average" | "Needs Attention" | "Critical";
  emergencyFundGap: number;
  emergencyFundRequired: number;
  termInsuranceGap: number;
  termInsuranceRequired: number;
  healthInsuranceGap: number;
  healthInsuranceRequired: number;
  retirementCorpusRequired: number;
  retirementCorpusGap: number;
  requiredRetirementSip: number;
  monthlySavings: number;
  savingsPercentage: number;
  activeGoalsCount: number;
}

export function calculateDashboardMetrics(answers: Partial<TestAnswers>, user: Partial<UserDetails>): DashboardMetrics {
  const age = user.age || 30;
  const retireAt = user.retireAt || 60;
  const yearsToRetire = Math.max(0, retireAt - age);
  const monthlyIncome = answers.monthlyIncome || 0;
  const monthlyExpenses = answers.monthlyExpenses || 0;
  const monthlyEmi = answers.monthlyEmi || 0;
  const monthlySip = answers.monthlySip || 0;
  const emergencyFund = answers.emergencyFund || 0;
  const totalOutflow = monthlyExpenses + monthlyEmi;
  const monthlySavings = monthlyIncome - totalOutflow;
  const savingsPercentage = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // 1. Calculations
  const emergencyFundRequired = totalOutflow * 6;
  const emergencyFundGap = Math.max(0, emergencyFundRequired - emergencyFund);

  const termInsuranceRequired = monthlyIncome * 12 * 20; // 20x annual income
  // Assume user has 0 if not specified, or some logic if they checked "yes"
  const currentTermCover = answers.hasTermInsurance ? (termInsuranceRequired * 0.5) : 0; // Simplified assumption
  const termInsuranceGap = Math.max(0, termInsuranceRequired - currentTermCover);

  let healthInsuranceRequired = 1000000; // Base 10L
  if ((answers.dependents || []).includes("Spouse")) healthInsuranceRequired += 500000;
  if ((answers.dependents || []).includes("Parents")) healthInsuranceRequired += 1000000;
  const numChildren = answers.numberOfChildren || 0;
  healthInsuranceRequired += (numChildren * 500000);
  const currentHealthCover = answers.hasHealthInsurance ? (healthInsuranceRequired * 0.8) : 0; // Simplified
  const healthInsuranceGap = Math.max(0, healthInsuranceRequired - currentHealthCover);

  // Retirement Math (Simplified FV)
  const inflation = 0.06;
  const returnRate = 0.14;
  const swpRate = 0.10;
  // Expense at retirement = Current expense * (1 + inflation)^yearsToRetire
  const expenseAtRetirement = totalOutflow * Math.pow(1 + inflation, yearsToRetire);
  // Corpus required = FutureAnnualExpense * 30 (Based on rule of 30)
  const retirementCorpusRequired = yearsToRetire > 0 ? (expenseAtRetirement * 12) * 30 : 0;
  
  // Future value of current investments
  const currentInvestments = answers.existingInvestments || 0;
  const fvInvestments = currentInvestments * Math.pow(1 + returnRate, yearsToRetire);
  const retirementCorpusGap = Math.max(0, retirementCorpusRequired - fvInvestments);

  // Required SIP for retirement gap
  const monthlyReturnRate = returnRate / 12;
  const monthsToRetire = yearsToRetire * 12;
  let requiredRetirementSip = 0;
  if (retirementCorpusGap > 0 && monthsToRetire > 0) {
    requiredRetirementSip = (retirementCorpusGap * monthlyReturnRate) / (Math.pow(1 + monthlyReturnRate, monthsToRetire) - 1);
  }

  // 2. Scoring (0-100 scales)
  let protectionScore = 0;
  if (answers.hasTermInsurance && answers.hasHealthInsurance) protectionScore = 90;
  else if (answers.hasTermInsurance || answers.hasHealthInsurance) protectionScore = 50;
  else protectionScore = 10;
  if (emergencyFund >= emergencyFundRequired) protectionScore += 10;

  let retirementScore = 0;
  if (monthlySip >= requiredRetirementSip && requiredRetirementSip > 0) retirementScore = 95;
  else if (requiredRetirementSip > 0) retirementScore = Math.min(90, (monthlySip / requiredRetirementSip) * 100);
  else if (yearsToRetire <= 0) retirementScore = 100;

  let goalsScore = 0;
  if (savingsPercentage >= 30) goalsScore = 90;
  else if (savingsPercentage >= 20) goalsScore = 70;
  else if (savingsPercentage >= 10) goalsScore = 40;
  else goalsScore = 10;

  const overallScore = Math.round((protectionScore * 0.4) + (retirementScore * 0.4) + (goalsScore * 0.2));

  let healthStatus: "Excellent" | "Good" | "Average" | "Needs Attention" | "Critical" = "Critical";
  if (overallScore >= 80) healthStatus = "Excellent";
  else if (overallScore >= 60) healthStatus = "Good";
  else if (overallScore >= 40) healthStatus = "Average";
  else if (overallScore >= 20) healthStatus = "Needs Attention";

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    protectionScore: Math.min(100, Math.max(0, Math.round(protectionScore))),
    retirementScore: Math.min(100, Math.max(0, Math.round(retirementScore))),
    goalsScore: Math.min(100, Math.max(0, Math.round(goalsScore))),
    healthStatus,
    emergencyFundGap,
    emergencyFundRequired,
    termInsuranceGap,
    termInsuranceRequired,
    healthInsuranceGap,
    healthInsuranceRequired,
    retirementCorpusRequired,
    retirementCorpusGap,
    requiredRetirementSip,
    monthlySavings,
    savingsPercentage,
    activeGoalsCount: (answers.goals || []).length
  };
}
