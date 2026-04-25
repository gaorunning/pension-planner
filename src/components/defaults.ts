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
    hasEnterpriseAnnuity: false,
    annuityMonthly: 0,

    dedicatedRetirementSavings: 200000,
    monthlyDedicatedSaving: 0,
    personalPensionAnnual: 0,
    personalPensionCurrentBalance: 0,
    personalPensionContribYears: 0,
    commercialAnnuities: [],

    replacementRate: 0.75,
    riskProfile: 'moderate',
    inflationRate: 0.03,
    socialWageGrowthRate: 0.052,
  };
}
