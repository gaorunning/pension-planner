export interface CommercialInsurance {
  premiumStartAge: number;  // 缴费开始年龄
  premiumYears: number;     // 缴费年数
  annualPremium: number;    // 年缴保费（元）
  benefitStartAge: number;  // 领取开始年龄
  benefitType: 'lump_sum' | 'annual'; // 一次性领取 或 每年领取
  benefitAmount: number;    // 一次性领取总额 或 年领取金额（元）
  benefitYears: number;     // 可领取年数（0 = 终身）
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
  socialInsuranceAccountBalance?: number; // 社保个人账户当前余额（从社保App查询，可选）
  hasEnterpriseAnnuity: boolean;
  annuityMonthly: number;

  // 养老专项资金池
  dedicatedRetirementSavings: number;
  monthlyDedicatedSaving: number;
  personalPensionAnnual: number;
  personalPensionCurrentBalance: number;
  personalPensionContribYears: number;
  commercialInsurances: CommercialInsurance[];

  // Step 3: 目标与偏好
  targetMode: 'replacement_rate' | 'expense_based';
  replacementRate: 0.60 | 0.75 | 0.90;
  // 费用测算模式（targetMode === 'expense_based'）
  monthlyBasicExpense: number;        // 基本生活费/月（今日价格），默认 10000
  monthlyCaregiverCost: number;       // 护工费用/月（今日价格），75岁后开始，默认 8000
  monthlyNursingHomeCost: number;     // 养老院费用/月（今日价格），80岁后开始，默认 16000
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  inflationRate: number;
  socialWageGrowthRate: number;

  // Override fields for sensitivity analysis in Step4
  socialInsuranceRate?: number;    // 社保个人账户记账利率，default 0.04 in pillar1
  personalPensionReturn?: number;  // 个人养老金账户收益率，default 0.04 in retirementPool
  savingsReturn?: number;          // 个人储蓄资金池收益率，default from riskProfile
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
  wageGrowthAssumption: number;
  payMonthsAdjust: number;
  monthlyGap: number;
  totalGapPV: number;
  adequacyRatio: number;
}

export type { MonteCarloResult, MonteCarloYearBand, Percentiles } from './monteCarlo';

export interface MCConfig {
  pensionReturnMean: number;   // 个人养老金账户年化均值
  pensionReturnSd: number;     // 个人养老金账户σ
  savingsReturnMean: number;   // 专项储蓄年化均值
  savingsReturnSd: number;     // 专项储蓄σ
  wageGrowthMean: number;      // 社平工资增速均值
  wageGrowthSd: number;        // 社平工资增速σ
  lifeExpMean: number;         // 预期寿命均值
  lifeExpSd: number;           // 预期寿命σ
}

export interface AnnualCashFlowYear {
  age: number;
  insurancePremium: number; // 当年活跃商业险保费
  personalPension: number;  // 个人养老金（退休后归零）
  dedicatedSaving: number;  // 养老定投（退休后归零）
  total: number;
}

export interface AnnualCashFlow {
  // 当前年度各项
  personalPensionMonthly: number;
  activeInsurancePremiumMonthly: number;
  dedicatedSavingMonthly: number;
  socialSecurityPersonalMonthly: number; // 参考项（代扣）

  // 汇总（不含社保，因为无法选择）
  totalCommittedMonthly: number;
  committedRatioOfIncome: number;

  // 补足缺口
  requiredAdditionalMonthly: number;
  totalRequiredMonthly: number;
  totalRequiredRatioOfIncome: number;

  // 逐年时序（从当前年龄到退休）
  yearlyBurden: AnnualCashFlowYear[];
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

  // 养老投入现金流
  annualCashFlow: AnnualCashFlow;

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
