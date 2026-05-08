// 社保个人账户记账利率历史数据 (2000-2025)
// 数据来源：人社部、财政部历年公布数据

export interface InterestRateData {
  year: number;
  rate: number;           // 记账利率（年化，小数）
  type: 'bank' | 'govt';  // 参考基准类型
  source: string;
  note?: string;
}

// 社保个人账户记账利率历史数据
export const SOCIAL_INSURANCE_INTEREST_HISTORY: InterestRateData[] = [
  { year: 2000, rate: 0.0225, type: 'bank', source: '人社部', note: '参考一年期基准利率（年平均）' },
  { year: 2001, rate: 0.0225, type: 'bank', source: '人社部', note: '参考一年期基准利率（年平均）' },
  { year: 2002, rate: 0.0202, type: 'bank', source: '人社部', note: '2月21日降至1.98%' },
  { year: 2003, rate: 0.0198, type: 'bank', source: '人社部', note: '全年未调整' },
  { year: 2004, rate: 0.0203, type: 'bank', source: '人社部', note: '10月29日升至2.25%' },
  { year: 2005, rate: 0.0225, type: 'bank', source: '人社部', note: '全年未调整' },
  { year: 2006, rate: 0.0235, type: 'bank', source: '人社部', note: '8月19日升至2.52%' },
  { year: 2007, rate: 0.0320, type: 'bank', source: '人社部', note: '年内6次加息' },
  { year: 2008, rate: 0.0392, type: 'bank', source: '人社部', note: '上半年高位，下半年4次降息' },
  { year: 2009, rate: 0.0225, type: 'bank', source: '人社部', note: '全年未调整' },
  { year: 2010, rate: 0.0230, type: 'bank', source: '人社部', note: '10月、12月两次加息' },
  { year: 2011, rate: 0.0328, type: 'bank', source: '人社部', note: '年内3次加息至3.50%' },
  { year: 2012, rate: 0.0324, type: 'bank', source: '人社部', note: '6月、7月两次降息' },
  { year: 2013, rate: 0.0300, type: 'bank', source: '人社部', note: '全年未调整' },
  { year: 2014, rate: 0.0297, type: 'bank', source: '人社部', note: '11月22日降至2.75%' },
  { year: 2015, rate: 0.0206, type: 'bank', source: '人社部', note: '年内5次降息，年末降至1.50%' },
  { year: 2016, rate: 0.0831, type: 'govt', source: '人社部、财政部', note: '统一公布记账利率首年，历史最高' },
  { year: 2017, rate: 0.0712, type: 'govt', source: '人社部、财政部', note: '维持较高水平' },
  { year: 2018, rate: 0.0829, type: 'govt', source: '人社部、财政部', note: '再次大幅回升' },
  { year: 2019, rate: 0.0761, type: 'govt', source: '人社部、财政部', note: '仍处高位' },
  { year: 2020, rate: 0.0604, type: 'govt', source: '人社部、财政部', note: '受疫情影响明显回调' },
  { year: 2021, rate: 0.0669, type: 'govt', source: '人社部、财政部', note: '有所反弹' },
  { year: 2022, rate: 0.0612, type: 'govt', source: '人社部、财政部', note: '经济放缓影响' },
  { year: 2023, rate: 0.0397, type: 'govt', source: '人社部、财政部', note: '首次跌破4%，关键转折点' },
  { year: 2024, rate: 0.0262, type: 'govt', source: '人社部、财政部', note: '继续下行' },
  { year: 2025, rate: 0.0150, type: 'govt', source: '人社部、财政部（预计）', note: '延续下行趋势' },
];

// 银行存款基准利率历史数据（1年期定期存款）
export const BANK_DEPOSIT_RATE_HISTORY: InterestRateData[] = [
  { year: 2000, rate: 0.0225, type: 'bank', source: '中国人民银行' },
  { year: 2001, rate: 0.0225, type: 'bank', source: '中国人民银行' },
  { year: 2002, rate: 0.0198, type: 'bank', source: '中国人民银行' },
  { year: 2003, rate: 0.0198, type: 'bank', source: '中国人民银行' },
  { year: 2004, rate: 0.0225, type: 'bank', source: '中国人民银行' },
  { year: 2005, rate: 0.0225, type: 'bank', source: '中国人民银行' },
  { year: 2006, rate: 0.0252, type: 'bank', source: '中国人民银行' },
  { year: 2007, rate: 0.0414, type: 'bank', source: '中国人民银行' },
  { year: 2008, rate: 0.0225, type: 'bank', source: '中国人民银行' },
  { year: 2009, rate: 0.0225, type: 'bank', source: '中国人民银行' },
  { year: 2010, rate: 0.0275, type: 'bank', source: '中国人民银行' },
  { year: 2011, rate: 0.0350, type: 'bank', source: '中国人民银行' },
  { year: 2012, rate: 0.0300, type: 'bank', source: '中国人民银行' },
  { year: 2013, rate: 0.0300, type: 'bank', source: '中国人民银行' },
  { year: 2014, rate: 0.0275, type: 'bank', source: '中国人民银行' },
  { year: 2015, rate: 0.0150, type: 'bank', source: '中国人民银行' },
  { year: 2016, rate: 0.0150, type: 'bank', source: '中国人民银行' },
  { year: 2017, rate: 0.0150, type: 'bank', source: '中国人民银行' },
  { year: 2018, rate: 0.0150, type: 'bank', source: '中国人民银行' },
  { year: 2019, rate: 0.0150, type: 'bank', source: '中国人民银行' },
  { year: 2020, rate: 0.0150, type: 'bank', source: '中国人民银行' },
  { year: 2021, rate: 0.0150, type: 'bank', source: '中国人民银行' },
  { year: 2022, rate: 0.0165, type: 'bank', source: '中国人民银行' },
  { year: 2023, rate: 0.0155, type: 'bank', source: '中国人民银行' },
  { year: 2024, rate: 0.0145, type: 'bank', source: '中国人民银行' },
  { year: 2025, rate: 0.0150, type: 'bank', source: '预测值' },
];

// 国债收益率历史数据（10年期）
export const TREASURY_BOND_YIELD_HISTORY: InterestRateData[] = [
  { year: 2000, rate: 0.0330, type: 'govt', source: '中国债券信息网' },
  { year: 2001, rate: 0.0310, type: 'govt', source: '中国债券信息网' },
  { year: 2002, rate: 0.0280, type: 'govt', source: '中国债券信息网' },
  { year: 2003, rate: 0.0320, type: 'govt', source: '中国债券信息网' },
  { year: 2004, rate: 0.0460, type: 'govt', source: '中国债券信息网' },
  { year: 2005, rate: 0.0360, type: 'govt', source: '中国债券信息网' },
  { year: 2006, rate: 0.0300, type: 'govt', source: '中国债券信息网' },
  { year: 2007, rate: 0.0440, type: 'govt', source: '中国债券信息网' },
  { year: 2008, rate: 0.0360, type: 'govt', source: '中国债券信息网' },
  { year: 2009, rate: 0.0370, type: 'govt', source: '中国债券信息网' },
  { year: 2010, rate: 0.0380, type: 'govt', source: '中国债券信息网' },
  { year: 2011, rate: 0.0400, type: 'govt', source: '中国债券信息网' },
  { year: 2012, rate: 0.0350, type: 'govt', source: '中国债券信息网' },
  { year: 2013, rate: 0.0430, type: 'govt', source: '中国债券信息网' },
  { year: 2014, rate: 0.0370, type: 'govt', source: '中国债券信息网' },
  { year: 2015, rate: 0.0300, type: 'govt', source: '中国债券信息网' },
  { year: 2016, rate: 0.0280, type: 'govt', source: '中国债券信息网' },
  { year: 2017, rate: 0.0390, type: 'govt', source: '中国债券信息网' },
  { year: 2018, rate: 0.0360, type: 'govt', source: '中国债券信息网' },
  { year: 2019, rate: 0.0320, type: 'govt', source: '中国债券信息网' },
  { year: 2020, rate: 0.0310, type: 'govt', source: '中国债券信息网' },
  { year: 2021, rate: 0.0280, type: 'govt', source: '中国债券信息网' },
  { year: 2022, rate: 0.0270, type: 'govt', source: '中国债券信息网' },
  { year: 2023, rate: 0.0260, type: 'govt', source: '中国债券信息网' },
  { year: 2024, rate: 0.0250, type: 'govt', source: '中国债券信息网' },
  { year: 2025, rate: 0.0260, type: 'govt', source: '预测值' },
];

// 获取特定年份社保记账利率
export function getSocialInsuranceRate(year: number): number {
  const data = SOCIAL_INSURANCE_INTEREST_HISTORY.find(d => d.year === year);
  if (data) return data.rate;

  // 如果年份超出范围，返回最近年份的数据
  if (year < 2000) return SOCIAL_INSURANCE_INTEREST_HISTORY[0].rate;
  return SOCIAL_INSURANCE_INTEREST_HISTORY[SOCIAL_INSURANCE_INTEREST_HISTORY.length - 1].rate;
}

// 获取历史平均社保记账利率
export function getAverageSocialInsuranceRate(startYear: number = 2016, endYear: number = 2024): number {
  const relevant = SOCIAL_INSURANCE_INTEREST_HISTORY.filter(d => d.year >= startYear && d.year <= endYear);
  if (relevant.length === 0) return 0.05;
  return relevant.reduce((sum, d) => sum + d.rate, 0) / relevant.length;
}

// 获取预测的未来社保记账利率（基于历史平均和趋势）
export function getProjectedSocialInsuranceRate(): number {
  const avg2016_2024 = getAverageSocialInsuranceRate(2016, 2024);
  const avg2020_2024 = getAverageSocialInsuranceRate(2020, 2024);

  // 取近年平均，向下调整以反映经济新常态
  return (avg2016_2024 * 0.4 + avg2020_2024 * 0.6) * 0.95;
}

// 利率统计摘要
export const INTEREST_RATE_SUMMARY = {
  // 社保记账利率统计
  socialInsurance: {
    min: 0.0225,     // 2000-2009年低点
    max: 0.0831,     // 2016年高点
    avg2016_2024: getAverageSocialInsuranceRate(2016, 2024),
    avg2000_2024: getAverageSocialInsuranceRate(2000, 2024),
  },
  // 银行存款利率统计
  bankDeposit: {
    min: 0.0145,
    max: 0.0414,
    avg: BANK_DEPOSIT_RATE_HISTORY.reduce((sum, d) => sum + d.rate, 0) / BANK_DEPOSIT_RATE_HISTORY.length,
  },
  // 国债收益率统计
  treasuryBond: {
    min: 0.0250,
    max: 0.0460,
    avg: TREASURY_BOND_YIELD_HISTORY.reduce((sum, d) => sum + d.rate, 0) / TREASURY_BOND_YIELD_HISTORY.length,
  },
};
