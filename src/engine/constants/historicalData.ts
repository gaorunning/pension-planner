// 历史数据统一入口
// 整合所有历史数据，提供统一访问接口

// 导出所有历史数据模块
export * from './historicalWages';
export * from './historicalInterestRates';
export * from './historicalInflation';
export * from './lifeExpectancy';
export * from './personalPensionReturns';

// 数据库元数据
export const HISTORICAL_DATABASE_INFO = {
  version: '1.0.0',
  lastUpdated: '2025-05-05',
  coverageStartYear: 2000,
  coverageEndYear: 2025,
  sources: [
    '国家统计局',
    '人力资源和社会保障部',
    '财政部',
    '中国人民银行',
    '第七次全国人口普查',
    '各省市统计公报',
    '中国债券信息网',
    '银保监会',
    '证监会',
  ],
};

// 综合参数基准值（用于养老计算器）
export const DEFAULT_PARAMETER_BASELINE = {
  // 通胀假设
  inflationRate: 0.025,

  // 工资增长假设
  wageGrowthRateNational: 0.050,
  wageGrowthRateFirstTier: 0.045,
  wageGrowthRateSecondTier: 0.050,
  wageGrowthRateThirdTier: 0.055,

  // 社保记账利率
  socialInsuranceInterestRate: 0.052,

  // 预期寿命
  lifeExpectancyMale: 76.05,
  lifeExpectancyFemale: 82.65,

  // 个人养老金收益率
  personalPensionReturnConservative: 0.030,
  personalPensionReturnModerate: 0.036,
  personalPensionReturnAggressive: 0.046,

  // 企业年金收益率
  enterpriseAnnuityReturn: 0.040,

  // 商业养老保险
  commercialAnnuityReturn: 0.032,
};
