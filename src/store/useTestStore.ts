import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserDetails {
  name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  retireAt: number;
}

export interface ChildDetails {
  age: number;
}

export interface TestAnswers {
  // Step 2: Goals
  goals: string[];
  
  // Step 3: Income & Expenses
  incomeSource: ("Salaried" | "Business" | "Professional")[];
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyEmi: number;
  monthlySip: number;
  emergencyFund: number;
  existingInvestments: number;

  // Step 4: Family
  dependents: string[];
  numberOfChildren: number;
  childrenAges: number[];
  parentsSelected?: boolean;
  parentsReceivePension?: "Yes" | "No" | "";
  parentMonthlyPension?: number;
  parentMonthlySupport?: number;
  parentDependencyLevel?: string;
  parentDependencyPercentage?: number;

  // Step 5: Protection
  hasTermInsurance: boolean;
  hasHealthInsurance: boolean;
  termInsuranceEnabled?: boolean;
  termInsuranceCoverage?: number;
  termInsuranceProvider?: string;
  healthInsuranceEnabled?: boolean;
  healthInsuranceCoverage?: number;
  healthInsuranceType?: string;
  healthInsuranceMembers?: string;
}

interface TestState {
  currentStep: number;
  answers: Partial<TestAnswers>;
  userDetails: Partial<UserDetails>;
  setAnswer: (key: keyof TestAnswers, value: any) => void;
  setUserDetails: (key: keyof UserDetails, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
}

const defaultAnswers: Partial<TestAnswers> = {
  goals: ["Retirement"], // Required
  incomeSource: [],
  dependents: [],
  childrenAges: [],
  parentsSelected: false,
  parentsReceivePension: "",
  parentMonthlyPension: 0,
  parentMonthlySupport: 0,
  parentDependencyLevel: "",
  parentDependencyPercentage: 0,
};

const defaultUserDetails: Partial<UserDetails> = {
  retireAt: 60,
};

export const useTestStore = create<TestState>()(
  persist(
    (set) => ({
      currentStep: 0,
      answers: defaultAnswers,
      userDetails: defaultUserDetails,
      setAnswer: (key, value) => set((state) => ({ answers: { ...state.answers, [key]: value } })),
      setUserDetails: (key, value) => set((state) => ({ userDetails: { ...state.userDetails, [key]: value } })),
      nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
      prevStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
      reset: () => set({ currentStep: 0, answers: defaultAnswers, userDetails: defaultUserDetails }),
    }),
    {
      name: "bharosa-bhai-assessment",
    }
  )
);
