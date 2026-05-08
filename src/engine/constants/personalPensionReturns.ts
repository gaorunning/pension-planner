// 个人养老金产品收益率历史数据及预测 (2022-2025)
// 数据来源：人社部、各养老理财/储蓄/基金产品公开披露信息

export interface PensionProductReturn {
  year: number;
  productType: 'savings' | 'wealthManagement' | 'fund' | 'insurance';
  averageReturn: number;       // 平均收益率（年化，小数）
  medianReturn: number;        // 中位数收益率
  top25Return: number;         // 前25%分位数收益率
  bottom25Return: number;      // 后25%分位数收益率
  sampleSize: number;          // 样本产品数量
  source: string;
  note?: string;
}

// 个人养老金产品年度收益率
export const PERSONAL_PENSION_RETURNS: PensionProductReturn[] = [
  {
    year: 2022,
    productType: 'savings',
    averageReturn: 0.0400,
    medianReturn: 0.0400,
    top25Return: 0.0415,
    bottom25Return: 0.0385,
    sampleSize: 21,
    source: '人社部、银保监会',
    note: '个人养老金制度启动首年'
  },
  {
    year: 2022,
    productType: 'wealthManagement',
    averageReturn: 0.0380,
    medianReturn: 0.0395,
    top25Return: 0.0450,
    bottom25Return: 0.0280,
    sampleSize: 49,
    source: '人社部、银保监会',
  },
  {
    year: 2022,
    productType: 'fund',
    averageReturn: -0.0850,
    medianReturn: -0.0720,
    top25Return: -0.0210,
    bottom25Return: -0.1530,
    sampleSize: 133,
    source: '人社部、证监会',
    note: '2022年A股市场波动较大'
  },
  {
    year: 2022,
    productType: 'insurance',
    averageReturn: 0.0350,
    medianReturn: 0.0350,
    top25Return: 0.0375,
    bottom25Return: 0.0325,
    sampleSize: 19,
    source: '人社部、银保监会',
  },
  {
    year: 2023,
    productType: 'savings',
    averageReturn: 0.0360,
    medianReturn: 0.0355,
    top25Return: 0.0380,
    bottom25Return: 0.0340,
    sampleSize: 32,
    source: '人社部、银保监会',
  },
  {
    year: 2023,
    productType: 'wealthManagement',
    averageReturn: 0.0325,
    medianReturn: 0.0330,
    top25Return: 0.0385,
    bottom25Return: 0.0260,
    sampleSize: 78,
    source: '人社部、银保监会',
  },
  {
    year: 2023,
    productType: 'fund',
    averageReturn: 0.0480,
    medianReturn: 0.0520,
    top25Return: 0.0950,
    bottom25Return: -0.0050,
    sampleSize: 162,
    source: '人社部、证监会',
    note: '2023年市场震荡回升'
  },
  {
    year: 2023,
    productType: 'insurance',
    averageReturn: 0.0335,
    medianReturn: 0.0330,
    top25Return: 0.0355,
    bottom25Return: 0.0315,
    sampleSize: 25,
    source: '人社部、银保监会',
  },
  {
    year: 2024,
    productType: 'savings',
    averageReturn: 0.0315,
    medianReturn: 0.0315,
    top25Return: 0.0330,
    bottom25Return: 0.0300,
    sampleSize: 40,
    source: '人社部、银保监会',
  },
  {
    year: 2024,
    productType: 'wealthManagement',
    averageReturn: 0.0295,
    medianReturn: 0.0300,
    top25Return: 0.0345,
    bottom25Return: 0.0245,
    sampleSize: 95,
    source: '人社部、银保监会',
  },
  {
    year: 2024,
    productType: 'fund',
    averageReturn: -0.0120,
    medianReturn: -0.0050,
    top25Return: 0.0420,
    bottom25Return: -0.0680,
    sampleSize: 187,
    source: '人社部、证监会',
  },
  {
    year: 2024,
    productType: 'insurance',
    averageReturn: 0.0315,
    medianReturn: 0.0310,
    top25Return: 0.0330,
    bottom25Return: 0.0300,
    sampleSize: 32,
    source: '人社部、银保监会',
  },
  {
    year: 2025,
    productType: 'savings',
    averageReturn: 0.0300,
    medianReturn: 0.0300,
    top25Return: 0.0315,
    bottom25Return: 0.0285,
    sampleSize: 0,
    source: '预测值',
  },
  {
    year: 2025,
    productType: 'wealthManagement',
    averageReturn: 0.0280,
    medianReturn: 0.0285,
    top25Return: 0.0330,
    bottom25Return: 0.0235,
    sampleSize: 0,
    source: '预测值',
  },
  {
    year: 2025,
    productType: 'fund',
    averageReturn: 0.0350,
    medianReturn: 0.0400,
    top25Return: 0.0800,
    bottom25Return: -0.0150,
    sampleSize: 0,
    source: '预测值',
  },
  {
    year: 2025,
    productType: 'insurance',
    averageReturn: 0.0300,
    medianReturn: 0.0300,
    top25Return: 0.0315,
    bottom25Return: 0.0285,
    sampleSize: 0,
    source: '预测值',
  },
];

// 各类产品的长期收益率假设（基于历史和市场预期）
export const PENSION_PRODUCT_RETURN_ASSUMPTIONS = {
  savings: {
    // 养老储蓄
    expectedReturn: 0.028,      // 预期年化收益率
    volatility: 0.002,          // 年化波动率（很低）
    realReturn: 0.010,          // 预期实际收益率（扣除通胀）
    maxDrawdown: 0.0,           // 最大回撤（保本）
  },
  wealthManagement: {
    // 养老理财
    expectedReturn: 0.032,
    volatility: 0.015,
    realReturn: 0.014,
    maxDrawdown: -0.02,
  },
  insurance: {
    // 养老保险
    expectedReturn: 0.030,
    volatility: 0.008,
    realReturn: 0.012,
    maxDrawdown: -0.01,
  },
  fund: {
    // 养老目标基金
    expectedReturn: 0.045,
    volatility: 0.120,
    realReturn: 0.027,
    maxDrawdown: -0.15,
  },
};

// 典型资产配置组合的收益率假设
export interface PensionPortfolioReturn {
  portfolioName: string;
  description: string;
  allocation: {
    savings: number;
    wealthManagement: number;
    insurance: number;
    fund: number;
  };
  expectedReturn: number;
  volatility: number;
  maxDrawdown: number;
}

export const PENSION_PORTFOLIOS: PensionPortfolioReturn[] = [
  {
    portfolioName: 'conservative',
    description: '保守型：以储蓄和保险为主',
    allocation: { savings: 0.40, wealthManagement: 0.25, insurance: 0.25, fund: 0.10 },
    expectedReturn: 0.030,
    volatility: 0.015,
    maxDrawdown: -0.02,
  },
  {
    portfolioName: 'moderate',
    description: '稳健型：均衡配置各类产品',
    allocation: { savings: 0.25, wealthManagement: 0.25, insurance: 0.20, fund: 0.30 },
    expectedReturn: 0.036,
    volatility: 0.040,
    maxDrawdown: -0.05,
  },
  {
    portfolioName: 'balanced',
    description: '平衡型：适度增配权益类',
    allocation: { savings: 0.20, wealthManagement: 0.20, insurance: 0.15, fund: 0.45 },
    expectedReturn: 0.040,
    volatility: 0.060,
    maxDrawdown: -0.08,
  },
  {
    portfolioName: 'growth',
    description: '成长型：偏重养老目标基金',
    allocation: { savings: 0.15, wealthManagement: 0.15, insurance: 0.10, fund: 0.60 },
    expectedReturn: 0.043,
    volatility: 0.080,
    maxDrawdown: -0.12,
  },
  {
    portfolioName: 'aggressive',
    description: '进取型：以基金为主',
    allocation: { savings: 0.10, wealthManagement: 0.10, insurance: 0.05, fund: 0.75 },
    expectedReturn: 0.046,
    volatility: 0.100,
    maxDrawdown: -0.15,
  },
];

// 个人养老金账户税收优惠数据
export const PERSONAL_PENSION_TAX_BENEFITS = {
  // 税前扣除限额（2023年起）
  annualDeductionLimit: 12000,

  // 投资收益暂不征税
  investmentReturnTaxDeferred: true,

  // 领取时税率（3%）
  withdrawalTaxRate: 0.03,

  // 适用税率档次（个人所得税）
  taxBrackets: [
    { min: 0, max: 36000, rate: 0.03 },
    { min: 36000, max: 144000, rate: 0.10 },
    { min: 144000, max: 300000, rate: 0.20 },
    { min: 300000, max: 420000, rate: 0.25 },
    { min: 420000, max: 660000, rate: 0.30 },
    { min: 660000, max: 960000, rate: 0.35 },
    { min: 960000, max: Infinity, rate: 0.45 },
  ],
};

// 获取特定产品类型的历史平均收益率
export function getProductAverageReturn(
  productType: 'savings' | 'wealthManagement' | 'fund' | 'insurance',
  startYear: number = 2022,
  endYear: number = 2024
): number {
  const data = PERSONAL_PENSION_RETURNS.filter(
    d => d.productType === productType && d.year >= startYear && d.year <= endYear
  );
  if (data.length === 0) return PENSION_PRODUCT_RETURN_ASSUMPTIONS[productType].expectedReturn;
  return data.reduce((sum, d) => sum + d.averageReturn, 0) / data.length;
}

// 获取推荐的资产配置（根据年龄）
export function getRecommendedPortfolio(currentAge: number, retirementAge: number): PensionPortfolioReturn {
  const yearsToRetirement = retirementAge - currentAge;

  if (yearsToRetirement > 25) {
    return PENSION_PORTFOLIOS.find(p => p.portfolioName === 'growth')!;
  } else if (yearsToRetirement > 15) {
    return PENSION_PORTFOLIOS.find(p => p.portfolioName === 'balanced')!;
  } else if (yearsToRetirement > 5) {
    return PENSION_PORTFOLIOS.find(p => p.portfolioName === 'moderate')!;
  } else {
    return PENSION_PORTFOLIOS.find(p => p.portfolioName === 'conservative')!;
  }
}

// 计算税收优惠
export function calculateTaxBenefit(
  annualContribution: number,
  marginalTaxRate: number
): {
  annualTaxSaving: number;
  totalTaxSavingAtRetirement: number;
} {
  const actualContribution = Math.min(annualContribution, PERSONAL_PENSION_TAX_BENEFITS.annualDeductionLimit);
  const annualTaxSaving = actualContribution * marginalTaxRate;

  return {
    annualTaxSaving,
    totalTaxSavingAtRetirement: annualTaxSaving, // 简化处理
  };
}

// 个人养老金收益率情景分析
export const PENSION_RETURN_SCENARIOS = {
  pessimistic: {
    name: '悲观情景',
    savings: 0.020,
    wealthManagement: 0.022,
    insurance: 0.021,
    fund: 0.015,
    portfolioReturn: 0.020,
  },
  base: {
    name: '基准情景',
    savings: PENSION_PRODUCT_RETURN_ASSUMPTIONS.savings.expectedReturn,
    wealthManagement: PENSION_PRODUCT_RETURN_ASSUMPTIONS.wealthManagement.expectedReturn,
    insurance: PENSION_PRODUCT_RETURN_ASSUMPTIONS.insurance.expectedReturn,
    fund: PENSION_PRODUCT_RETURN_ASSUMPTIONS.fund.expectedReturn,
    portfolioReturn: 0.036,
  },
  optimistic: {
    name: '乐观情景',
    savings: 0.032,
    wealthManagement: 0.038,
    insurance: 0.035,
    fund: 0.065,
    portfolioReturn: 0.050,
  },
};
