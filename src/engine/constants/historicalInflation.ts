// 中国通货膨胀率(CPI)历史数据 (2000-2025)
// 数据来源：国家统计局

export interface InflationData {
  year: number;
  cpi: number;                  // 年度CPI同比增长率（小数）
  cpiCumulative: number;        // 相对于2000年的累计涨幅
  monthlyData?: number[];       // 月度数据（可选）
  source: string;
  note?: string;
}

export const INFLATION_HISTORY: InflationData[] = [
  { year: 2000, cpi: 0.004, cpiCumulative: 1.000, source: '国家统计局' },
  { year: 2001, cpi: 0.007, cpiCumulative: 1.011, source: '国家统计局' },
  { year: 2002, cpi: -0.008, cpiCumulative: 1.003, source: '国家统计局' },
  { year: 2003, cpi: 0.012, cpiCumulative: 1.015, source: '国家统计局' },
  { year: 2004, cpi: 0.039, cpiCumulative: 1.055, source: '国家统计局' },
  { year: 2005, cpi: 0.018, cpiCumulative: 1.074, source: '国家统计局' },
  { year: 2006, cpi: 0.015, cpiCumulative: 1.090, source: '国家统计局' },
  { year: 2007, cpi: 0.048, cpiCumulative: 1.142, source: '国家统计局' },
  { year: 2008, cpi: 0.059, cpiCumulative: 1.209, source: '国家统计局' },
  { year: 2009, cpi: -0.007, cpiCumulative: 1.201, source: '国家统计局' },
  { year: 2010, cpi: 0.033, cpiCumulative: 1.241, source: '国家统计局' },
  { year: 2011, cpi: 0.054, cpiCumulative: 1.308, source: '国家统计局' },
  { year: 2012, cpi: 0.026, cpiCumulative: 1.342, source: '国家统计局' },
  { year: 2013, cpi: 0.026, cpiCumulative: 1.377, source: '国家统计局' },
  { year: 2014, cpi: 0.020, cpiCumulative: 1.405, source: '国家统计局' },
  { year: 2015, cpi: 0.014, cpiCumulative: 1.425, source: '国家统计局' },
  { year: 2016, cpi: 0.020, cpiCumulative: 1.454, source: '国家统计局' },
  { year: 2017, cpi: 0.016, cpiCumulative: 1.477, source: '国家统计局' },
  { year: 2018, cpi: 0.021, cpiCumulative: 1.508, source: '国家统计局' },
  { year: 2019, cpi: 0.029, cpiCumulative: 1.552, source: '国家统计局' },
  { year: 2020, cpi: 0.025, cpiCumulative: 1.591, source: '国家统计局' },
  { year: 2021, cpi: 0.009, cpiCumulative: 1.605, source: '国家统计局' },
  { year: 2022, cpi: 0.020, cpiCumulative: 1.637, source: '国家统计局' },
  { year: 2023, cpi: 0.002, cpiCumulative: 1.640, source: '国家统计局' },
  { year: 2024, cpi: 0.007, cpiCumulative: 1.651, source: '国家统计局' },
  { year: 2025, cpi: 0.018, cpiCumulative: 1.681, source: '预测值' },
];

// 分阶段通胀统计
export const INFLATION_STATISTICS = {
  // 长期平均（2000-2024）
  avg2000_2024: INFLATION_HISTORY.filter(d => d.year >= 2000 && d.year <= 2024)
    .reduce((sum, d) => sum + d.cpi, 0) / 25,

  // 近10年平均（2015-2024）
  avg2015_2024: INFLATION_HISTORY.filter(d => d.year >= 2015 && d.year <= 2024)
    .reduce((sum, d) => sum + d.cpi, 0) / 10,

  // 近5年平均（2020-2024）
  avg2020_2024: INFLATION_HISTORY.filter(d => d.year >= 2020 && d.year <= 2024)
    .reduce((sum, d) => sum + d.cpi, 0) / 5,

  // 统计极值
  max: 0.059,  // 2008年
  min: -0.008, // 2002年

  // 中位数
  median: 0.020,
};

// 各类物价指数历史（可选扩展）
export interface PriceIndexData {
  year: number;
  foodCpi: number;           // 食品烟酒CPI
  housingCpi: number;        // 居住CPI
  medicalCpi: number;        // 医疗保健CPI
  educationCpi: number;      // 教育文化娱乐CPI
  source: string;
}

export const DETAILED_PRICE_INDEX: PriceIndexData[] = [
  { year: 2018, foodCpi: 0.018, housingCpi: 0.024, medicalCpi: 0.043, educationCpi: 0.022, source: '国家统计局' },
  { year: 2019, foodCpi: 0.070, housingCpi: 0.021, medicalCpi: 0.024, educationCpi: 0.023, source: '国家统计局' },
  { year: 2020, foodCpi: 0.088, housingCpi: -0.004, medicalCpi: 0.018, educationCpi: 0.013, source: '国家统计局' },
  { year: 2021, foodCpi: -0.014, housingCpi: 0.008, medicalCpi: 0.006, educationCpi: 0.019, source: '国家统计局' },
  { year: 2022, foodCpi: 0.028, housingCpi: -0.002, medicalCpi: 0.011, educationCpi: 0.013, source: '国家统计局' },
  { year: 2023, foodCpi: 0.005, housingCpi: -0.023, medicalCpi: 0.012, educationCpi: 0.018, source: '国家统计局' },
  { year: 2024, foodCpi: 0.015, housingCpi: -0.005, medicalCpi: 0.015, educationCpi: 0.020, source: '国家统计局' },
];

// 获取特定年份的通胀率
export function getInflationRate(year: number): number {
  const data = INFLATION_HISTORY.find(d => d.year === year);
  if (data) return data.cpi;

  // 超出范围时返回合理默认值
  if (year < 2000) return 0.02;
  return 0.02;
}

// 获取累计通胀因子（从baseYear到targetYear）
export function getCumulativeInflationFactor(baseYear: number, targetYear: number): number {
  const baseIdx = INFLATION_HISTORY.findIndex(d => d.year === baseYear);
  const targetIdx = INFLATION_HISTORY.findIndex(d => d.year === targetYear);

  if (baseIdx >= 0 && targetIdx >= 0) {
    return INFLATION_HISTORY[targetIdx].cpiCumulative / INFLATION_HISTORY[baseIdx].cpiCumulative;
  }

  // 如果找不到，使用几何平均估算
  const avgRate = INFLATION_STATISTICS.avg2015_2024;
  const yearsDiff = targetYear - baseYear;
  return Math.pow(1 + avgRate, yearsDiff);
}

// 计算实际利率（名义利率 - 通胀率）
export function getRealReturnRate(nominalRate: number, year: number): number {
  return nominalRate - getInflationRate(year);
}

// 获取预测的未来通胀率（用于养老规划）
export function getProjectedInflationRate(): number {
  // 综合考虑近年平均和历史中位数
  return (INFLATION_STATISTICS.avg2020_2024 * 0.5 +
          INFLATION_STATISTICS.avg2015_2024 * 0.3 +
          INFLATION_STATISTICS.median * 0.2);
}

// 通胀情景分析
export const INFLATION_SCENARIOS = {
  low: {
    name: '低通胀',
    description: '物价温和上涨，类似2015-2020年',
    rate: 0.015,
  },
  base: {
    name: '基准通胀',
    description: '基于历史平均的预期',
    rate: getProjectedInflationRate(),
  },
  high: {
    name: '高通胀',
    description: '物价上涨压力较大，类似2007-2011年平均',
    rate: 0.040,
  },
};
