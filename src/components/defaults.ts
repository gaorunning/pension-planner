import { UserInput } from '@/engine';

export function createDefaultInput(): UserInput {
  return {
    currentAge: 36,
    retirementAge: 60,
    gender: 'male',
    lifeExpectancy: 80,
    province: 'beijing',
    monthlyIncome: 20000,

    contributionYears: 10,
    contributionRatio: 1.0,
    avgSocialWage: 12049,
    socialInsuranceAccountBalance: 0,
    hasEnterpriseAnnuity: false,
    annuityMonthly: 0,

    dedicatedRetirementSavings: 200000,
    monthlyDedicatedSaving: 0,
    personalPensionAnnual: 0,
    personalPensionCurrentBalance: 0,
    personalPensionContribYears: 0,
    commercialInsurances: [],

    targetMode: 'replacement_rate',
    replacementRate: 0.75,
    monthlyBasicExpense: 10000,
    monthlyCaregiverCost: 8000,
    monthlyNursingHomeCost: 16000,
    riskProfile: 'moderate',
    inflationRate: 0.03,
    socialWageGrowthRate: 0.052,

    socialInsuranceRate: 0.04,
    personalPensionReturn: 0.04,
    savingsReturn: undefined,  // will use riskProfile
  };
}
