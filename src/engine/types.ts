export interface CommercialAnnuity {
  type: 'annuity_insurance' | 'savings_insurance' | 'participating';
  monthlyPayment: number;
  policyEndAge: number;
  monthlyBenefit?: number;
  estimatedTotalValue?: number;
}

export interface UserInput {
  // Step 1: 基本信息
  currentAge: number;
  retirementAge: number;
  gender: 'male' | 'female';
  lifeExpectancy: number;
  province: string;
  city?: string;
  monthlyIncome: number;

  // Step 2: 收入与养老底座
  contributionYears: number;
  contributionRatio: number;
  avgSocialWage: number;
  hasEnterpriseAnnuity: boolean;
  annuityMonthly: number;

  // 养老专项资金池
  dedicatedRetirementSavings: number;
  monthlyDedicatedSaving: number;
  personalPensionAnnual: number;
  personalPensionCurrentBalance: number;
  personalPensionContribYears: number;
  commercialAnnuities: CommercialAnnuity[];

  // Step 3: 目标与偏好
  replacementRate: 0.60 | 0.75 | 0.90;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  inflationRate: number;
  socialWageGrowthRate: number;
}

export interface RetirementPool {
  currentBalance: number;
  monthlyContrib: number;
  expectedReturnAccum: number;
  balanceAtRetirement: number;
  expectedReturnDecum: number;
  monthlyWithdrawal: number;
  depletionAge: number;
  personalPensionFV: number;
  dedicatedSavingsFV: number;
  monthlyDedicatedFV: number;
  commercialSavingsFV: number;
}

export interface Pillar3Advice {
  annualLimit: 12000;
  currentAnnualContrib: number;
  gap: number;
  taxSaving: number;
  recommendation: string;
}

export interface AssetAllocation {
  equityPct: number;
  bondPct: number;
  expectedReturn: number;
  glidePathNote: string;
}

export interface YearlyDataPoint {
  year: number;
  age: number;
  isRetired: boolean;
  poolBalance: number;
  cumulativeContrib: number;
}

export interface RetirementScenario {
  name: '乐观' | '基准' | '悲观';
  returnAssumption: number;
  inflationAssumption: number;
  monthlyGap: number;
  totalGapPV: number;
  adequacyRatio: number;
}

export interface RetirementPlan {
  // 核心参数
  yearsToRetirement: number;
  yearsInRetirement: number;
  expectedReturn: number;
  realReturnRate: number;
  allocation: AssetAllocation;

  // 退休目标
  targetMonthlyToday: number;
  targetMonthlyAtRetirement: number;
  totalFundingNeeded: number;

  // 收入来源
  pillar1Monthly: number;
  pillar1Basic: number;
  pillar1Account: number;
  pillar2Monthly: number;
  commercialAnnuityMonthly: number;
  fixedIncomeMonthly: number;

  // 资金池
  retirementPool: RetirementPool;
  assetPoolMonthly: number;

  // 缺口
  totalMonthlyIncome: number;
  monthlyGap: number;
  totalGapPV: number;

  // 建议
  requiredMonthlySaving: number;
  pillar3Advice: Pillar3Advice;
  assetAllocation: AssetAllocation;

  // 情景
  scenarios: RetirementScenario[];
  adequacyRatio: number;
  adequacyLevel: 'critical' | 'warning' | 'adequate' | 'comfortable';
  yearlyData: YearlyDataPoint[];
}

export interface RegionData {
  code: string;
  name: string;
  avgMonthlyWage: number;
  dataYear: number;
  contribBaseLower: number;
  contribBaseUpper: number;
  wageGrowthRate: number;
  tier: 1 | 2 | 3;
  note?: string;
}
