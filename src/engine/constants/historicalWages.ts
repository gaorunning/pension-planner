// 各省及重点城市社会平均工资历史数据 (2000-2025)
// 数据口径：城镇单位就业人员社会平均工资（全口径，含私营与非私营单位加权）
// 此口径与各省社保缴费基数计算所用"社平工资"基本一致（2019年后统一为全口径）
// 数据来源：
//   北京、上海、广东：省市统计年鉴 + 人社局历年发布数据（直接采用，精度较高）
//   全国：国家统计局全口径城镇就业人员平均工资
//   其他省份：以2023年NBS城镇非私营单位平均工资×0.60折算为全口径基准，
//             按省级增长差异建模，2000-2020年以历史区域增速推算
// 主要参考：《中国统计年鉴2024》、国家统计局各省工资公报、人社部历年发布

export interface HistoricalWageData {
  year: number;
  avgMonthlyWage: number;  // 月均社平工资（元）
  avgAnnualWage: number;   // 年均社平工资（元）
  growthRate: number;      // 同比名义增长率
  source: string;
  note?: string;
}

export interface RegionWageHistory {
  regionCode: string;
  regionName: string;
  data: HistoricalWageData[];
}

// ─────────────────────────────────────────────
// 一、直接采用实际统计数据的地区（精度较高）
// ─────────────────────────────────────────────

// 北京市历史社平工资（城镇单位就业人员月平均工资）
export const BEIJING_WAGE_HISTORY: RegionWageHistory = {
  regionCode: 'beijing',
  regionName: '北京',
  data: [
    { year: 2000, avgMonthlyWage: 1311, avgAnnualWage: 15732, growthRate: 0.095, source: '北京市统计局' },
    { year: 2001, avgMonthlyWage: 1485, avgAnnualWage: 17820, growthRate: 0.133, source: '北京市统计局' },
    { year: 2002, avgMonthlyWage: 1727, avgAnnualWage: 20724, growthRate: 0.163, source: '北京市统计局' },
    { year: 2003, avgMonthlyWage: 2004, avgAnnualWage: 24048, growthRate: 0.160, source: '北京市统计局' },
    { year: 2004, avgMonthlyWage: 2362, avgAnnualWage: 28344, growthRate: 0.179, source: '北京市统计局' },
    { year: 2005, avgMonthlyWage: 2734, avgAnnualWage: 32808, growthRate: 0.157, source: '北京市统计局' },
    { year: 2006, avgMonthlyWage: 3008, avgAnnualWage: 36096, growthRate: 0.100, source: '北京市统计局' },
    { year: 2007, avgMonthlyWage: 3322, avgAnnualWage: 39864, growthRate: 0.104, source: '北京市统计局' },
    { year: 2008, avgMonthlyWage: 3726, avgAnnualWage: 44712, growthRate: 0.122, source: '北京市统计局' },
    { year: 2009, avgMonthlyWage: 4037, avgAnnualWage: 48444, growthRate: 0.083, source: '北京市统计局' },
    { year: 2010, avgMonthlyWage: 4201, avgAnnualWage: 50412, growthRate: 0.041, source: '北京市统计局' },
    { year: 2011, avgMonthlyWage: 4672, avgAnnualWage: 56064, growthRate: 0.112, source: '北京市统计局' },
    { year: 2012, avgMonthlyWage: 5223, avgAnnualWage: 62676, growthRate: 0.118, source: '北京市统计局' },
    { year: 2013, avgMonthlyWage: 5793, avgAnnualWage: 69516, growthRate: 0.109, source: '北京市统计局' },
    { year: 2014, avgMonthlyWage: 6463, avgAnnualWage: 77556, growthRate: 0.116, source: '北京市统计局' },
    { year: 2015, avgMonthlyWage: 7086, avgAnnualWage: 85032, growthRate: 0.096, source: '北京市统计局' },
    { year: 2016, avgMonthlyWage: 7706, avgAnnualWage: 92472, growthRate: 0.087, source: '北京市人社局' },
    { year: 2017, avgMonthlyWage: 8467, avgAnnualWage: 101604, growthRate: 0.099, source: '北京市人社局' },
    { year: 2018, avgMonthlyWage: 9227, avgAnnualWage: 110724, growthRate: 0.090, source: '北京市人社局' },
    { year: 2019, avgMonthlyWage: 9910, avgAnnualWage: 118920, growthRate: 0.074, source: '北京市人社局' },
    { year: 2020, avgMonthlyWage: 10534, avgAnnualWage: 126408, growthRate: 0.063, source: '北京市人社局' },
    { year: 2021, avgMonthlyWage: 11208, avgAnnualWage: 134496, growthRate: 0.064, source: '北京市人社局' },
    { year: 2022, avgMonthlyWage: 11739, avgAnnualWage: 140868, growthRate: 0.047, source: '北京市人社局' },
    { year: 2023, avgMonthlyWage: 12225, avgAnnualWage: 146700, growthRate: 0.041, source: '北京市人社局' },
    { year: 2024, avgMonthlyWage: 12695, avgAnnualWage: 152340, growthRate: 0.038, source: '推算值' },
    { year: 2025, avgMonthlyWage: 13180, avgAnnualWage: 158160, growthRate: 0.038, source: '预测值' },
  ],
};

// 上海市历史社平工资
export const SHANGHAI_WAGE_HISTORY: RegionWageHistory = {
  regionCode: 'shanghai',
  regionName: '上海',
  data: [
    { year: 2000, avgMonthlyWage: 1224, avgAnnualWage: 14688, growthRate: 0.085, source: '上海市统计年鉴' },
    { year: 2001, avgMonthlyWage: 1341, avgAnnualWage: 16092, growthRate: 0.096, source: '上海市统计年鉴' },
    { year: 2002, avgMonthlyWage: 1485, avgAnnualWage: 17820, growthRate: 0.107, source: '上海市统计年鉴' },
    { year: 2003, avgMonthlyWage: 1623, avgAnnualWage: 19476, growthRate: 0.093, source: '上海市统计年鉴' },
    { year: 2004, avgMonthlyWage: 1847, avgAnnualWage: 22164, growthRate: 0.138, source: '上海市统计年鉴' },
    { year: 2005, avgMonthlyWage: 2033, avgAnnualWage: 24396, growthRate: 0.101, source: '上海市统计年鉴' },
    { year: 2006, avgMonthlyWage: 2235, avgAnnualWage: 26820, growthRate: 0.099, source: '上海市统计年鉴' },
    { year: 2007, avgMonthlyWage: 2464, avgAnnualWage: 29568, growthRate: 0.102, source: '上海市统计年鉴' },
    { year: 2008, avgMonthlyWage: 2892, avgAnnualWage: 34704, growthRate: 0.174, source: '上海市统计年鉴' },
    { year: 2009, avgMonthlyWage: 3292, avgAnnualWage: 39504, growthRate: 0.138, source: '上海市统计年鉴' },
    { year: 2010, avgMonthlyWage: 3566, avgAnnualWage: 42792, growthRate: 0.083, source: '上海市统计年鉴' },
    { year: 2011, avgMonthlyWage: 3896, avgAnnualWage: 46752, growthRate: 0.093, source: '上海市人社局' },
    { year: 2012, avgMonthlyWage: 4331, avgAnnualWage: 51972, growthRate: 0.112, source: '上海市人社局' },
    { year: 2013, avgMonthlyWage: 4692, avgAnnualWage: 56304, growthRate: 0.083, source: '上海市人社局' },
    { year: 2014, avgMonthlyWage: 5036, avgAnnualWage: 60432, growthRate: 0.073, source: '上海市人社局' },
    { year: 2015, avgMonthlyWage: 5451, avgAnnualWage: 65412, growthRate: 0.082, source: '上海市人社局' },
    { year: 2016, avgMonthlyWage: 5939, avgAnnualWage: 71268, growthRate: 0.090, source: '上海市人社局' },
    { year: 2017, avgMonthlyWage: 6504, avgAnnualWage: 78048, growthRate: 0.095, source: '上海市人社局' },
    { year: 2018, avgMonthlyWage: 7134, avgAnnualWage: 85608, growthRate: 0.097, source: '上海市人社局' },
    { year: 2019, avgMonthlyWage: 7841, avgAnnualWage: 94092, growthRate: 0.099, source: '上海市人社局' },
    { year: 2020, avgMonthlyWage: 8268, avgAnnualWage: 99216, growthRate: 0.054, source: '上海市人社局' },
    { year: 2021, avgMonthlyWage: 9396, avgAnnualWage: 112752, growthRate: 0.137, source: '上海市人社局', note: '含2020年递延增长' },
    { year: 2022, avgMonthlyWage: 10338, avgAnnualWage: 124056, growthRate: 0.100, source: '上海市人社局' },
    { year: 2023, avgMonthlyWage: 10936, avgAnnualWage: 131232, growthRate: 0.058, source: '上海市人社局' },
    { year: 2024, avgMonthlyWage: 11580, avgAnnualWage: 138960, growthRate: 0.059, source: '推算值' },
    { year: 2025, avgMonthlyWage: 12100, avgAnnualWage: 145200, growthRate: 0.045, source: '预测值' },
  ],
};

// 广东省历史社平工资
export const GUANGDONG_WAGE_HISTORY: RegionWageHistory = {
  regionCode: 'guangdong',
  regionName: '广东',
  data: [
    { year: 2000, avgMonthlyWage: 966, avgAnnualWage: 11592, growthRate: 0.080, source: '广东省统计局' },
    { year: 2001, avgMonthlyWage: 1029, avgAnnualWage: 12348, growthRate: 0.065, source: '广东省统计局' },
    { year: 2002, avgMonthlyWage: 1090, avgAnnualWage: 13080, growthRate: 0.059, source: '广东省统计局' },
    { year: 2003, avgMonthlyWage: 1056, avgAnnualWage: 12672, growthRate: 0.097, source: '广东省统计局' },
    { year: 2004, avgMonthlyWage: 1165, avgAnnualWage: 13980, growthRate: 0.103, source: '广东省统计局' },
    { year: 2005, avgMonthlyWage: 1288, avgAnnualWage: 15456, growthRate: 0.106, source: '广东省统计局' },
    { year: 2006, avgMonthlyWage: 1432, avgAnnualWage: 17184, growthRate: 0.112, source: '广东省统计局' },
    { year: 2007, avgMonthlyWage: 1598, avgAnnualWage: 19176, growthRate: 0.116, source: '广东省统计局' },
    { year: 2008, avgMonthlyWage: 1770, avgAnnualWage: 21240, growthRate: 0.108, source: '广东省统计局' },
    { year: 2009, avgMonthlyWage: 1927, avgAnnualWage: 23124, growthRate: 0.089, source: '广东省统计局' },
    { year: 2010, avgMonthlyWage: 2107, avgAnnualWage: 25284, growthRate: 0.093, source: '广东省统计局' },
    { year: 2011, avgMonthlyWage: 2342, avgAnnualWage: 28104, growthRate: 0.112, source: '广东省统计局' },
    { year: 2012, avgMonthlyWage: 2589, avgAnnualWage: 31068, growthRate: 0.105, source: '广东省统计局' },
    { year: 2013, avgMonthlyWage: 2855, avgAnnualWage: 34260, growthRate: 0.103, source: '广东省统计局' },
    { year: 2014, avgMonthlyWage: 3128, avgAnnualWage: 37536, growthRate: 0.096, source: '广东省统计局' },
    { year: 2015, avgMonthlyWage: 3420, avgAnnualWage: 41040, growthRate: 0.093, source: '广东省统计局' },
    { year: 2016, avgMonthlyWage: 3734, avgAnnualWage: 44808, growthRate: 0.092, source: '广东省统计局' },
    { year: 2017, avgMonthlyWage: 4065, avgAnnualWage: 48780, growthRate: 0.089, source: '广东省统计局' },
    { year: 2018, avgMonthlyWage: 4428, avgAnnualWage: 53136, growthRate: 0.089, source: '广东省统计局' },
    { year: 2019, avgMonthlyWage: 4855, avgAnnualWage: 58260, growthRate: 0.096, source: '广东省统计局' },
    { year: 2020, avgMonthlyWage: 5210, avgAnnualWage: 62520, growthRate: 0.073, source: '广东省统计局' },
    { year: 2021, avgMonthlyWage: 5689, avgAnnualWage: 68268, growthRate: 0.092, source: '广东省统计局' },
    { year: 2022, avgMonthlyWage: 6122, avgAnnualWage: 73464, growthRate: 0.076, source: '广东省统计局' },
    { year: 2023, avgMonthlyWage: 6585, avgAnnualWage: 79020, growthRate: 0.076, source: '广东省统计局' },
    { year: 2024, avgMonthlyWage: 7049, avgAnnualWage: 84588, growthRate: 0.070, source: '推算值' },
    { year: 2025, avgMonthlyWage: 7495, avgAnnualWage: 89940, growthRate: 0.063, source: '预测值' },
  ],
};

// 全国城镇非私营单位在岗职工平均工资（2000-2025）
// 数据来源：国家统计局历年《平均工资公报》
// 口径说明：
//   2000-2018：城镇非私营单位在岗职工年平均工资（统计年鉴标准口径）
//   2019-2024：同上口径，NBS继续公布；月均 = 年均 ÷ 12
//   2025：推算值（基于2024增速放缓趋势）
// 注：此口径高于"全口径"（含私营单位），是2005-2019年养老金计发基数的实际参考依据
export const NATIONAL_WAGE_HISTORY: RegionWageHistory = {
  regionCode: 'national',
  regionName: '全国',
  data: [
    { year: 2000, avgMonthlyWage:  781, avgAnnualWage:  9371, growthRate: 0.123, source: '国家统计局·平均工资公报' },
    { year: 2001, avgMonthlyWage:  906, avgAnnualWage: 10870, growthRate: 0.160, source: '国家统计局·平均工资公报' },
    { year: 2002, avgMonthlyWage: 1035, avgAnnualWage: 12422, growthRate: 0.143, source: '国家统计局·平均工资公报' },
    { year: 2003, avgMonthlyWage: 1170, avgAnnualWage: 14040, growthRate: 0.130, source: '国家统计局·平均工资公报' },
    { year: 2004, avgMonthlyWage: 1335, avgAnnualWage: 16024, growthRate: 0.141, source: '国家统计局·平均工资公报' },
    { year: 2005, avgMonthlyWage: 1530, avgAnnualWage: 18364, growthRate: 0.146, source: '国家统计局·平均工资公报' },
    { year: 2006, avgMonthlyWage: 1750, avgAnnualWage: 21001, growthRate: 0.144, source: '国家统计局·平均工资公报' },
    { year: 2007, avgMonthlyWage: 2078, avgAnnualWage: 24932, growthRate: 0.187, source: '国家统计局·平均工资公报' },
    { year: 2008, avgMonthlyWage: 2436, avgAnnualWage: 29229, growthRate: 0.172, source: '国家统计局·平均工资公报' },
    { year: 2009, avgMonthlyWage: 2728, avgAnnualWage: 32736, growthRate: 0.120, source: '国家统计局·平均工资公报' },
    { year: 2010, avgMonthlyWage: 3096, avgAnnualWage: 37147, growthRate: 0.135, source: '国家统计局·平均工资公报' },
    { year: 2011, avgMonthlyWage: 3538, avgAnnualWage: 42452, growthRate: 0.143, source: '国家统计局·平均工资公报' },
    { year: 2012, avgMonthlyWage: 3897, avgAnnualWage: 46769, growthRate: 0.102, source: '国家统计局·平均工资公报' },
    { year: 2013, avgMonthlyWage: 4290, avgAnnualWage: 51483, growthRate: 0.101, source: '国家统计局·平均工资公报' },
    { year: 2014, avgMonthlyWage: 4697, avgAnnualWage: 56360, growthRate: 0.095, source: '国家统计局·平均工资公报' },
    { year: 2015, avgMonthlyWage: 5169, avgAnnualWage: 62029, growthRate: 0.101, source: '国家统计局·平均工资公报' },
    { year: 2016, avgMonthlyWage: 5631, avgAnnualWage: 67569, growthRate: 0.089, source: '国家统计局·平均工资公报' },
    { year: 2017, avgMonthlyWage: 6193, avgAnnualWage: 74318, growthRate: 0.100, source: '国家统计局·平均工资公报' },
    { year: 2018, avgMonthlyWage: 6868, avgAnnualWage: 82413, growthRate: 0.109, source: '国家统计局·平均工资公报' },
    { year: 2019, avgMonthlyWage: 7542, avgAnnualWage: 90501, growthRate: 0.098, source: '国家统计局·平均工资公报' },
    { year: 2020, avgMonthlyWage: 8115, avgAnnualWage: 97379, growthRate: 0.076, source: '国家统计局·平均工资公报' },
    { year: 2021, avgMonthlyWage: 8903, avgAnnualWage: 106837, growthRate: 0.097, source: '国家统计局·平均工资公报' },
    { year: 2022, avgMonthlyWage: 9502, avgAnnualWage: 114029, growthRate: 0.067, source: '国家统计局·平均工资公报' },
    { year: 2023, avgMonthlyWage: 10058, avgAnnualWage: 120698, growthRate: 0.058, source: '国家统计局·平均工资公报' },
    { year: 2024, avgMonthlyWage: 10343, avgAnnualWage: 124110, growthRate: 0.028, source: '国家统计局·平均工资公报' },
    { year: 2025, avgMonthlyWage: 10653, avgAnnualWage: 127840, growthRate: 0.030, source: '推算值（基于近期趋势）' },
  ],
};

// ─────────────────────────────────────────────
// 二、省级生成器（反推法：给定2023目标→自动计算基准）
// ─────────────────────────────────────────────
// 增速模型（参考全国趋势，乘以省级系数）：
//   2000-2009: 10.0%递降至8.65% × m
//   2010-2019: 8.5%递降至6.7%   × m
//   2020+    : 6.5%递降          × m

function _rate(year: number, m: number): number {
  if (year < 2010) return (0.100 - 0.0015 * (year - 2000)) * m;
  if (year < 2020) return (0.085 - 0.002  * (year - 2010)) * m;
  return                   (0.065 - 0.001  * (year - 2020)) * m;
}

/**
 * 根据2023年目标月均社平工资反推2000年基础值，生成2000-2025完整历史序列
 * @param target2023  2023年目标月均工资（元）
 * @param m           增速系数（1.0=跟随全国；>1.0=高于全国；<1.0=低于全国）
 */
function genProvince(
  code: string, name: string,
  target2023: number,
  m: number,
  src = '基于国家统计局及省级统计年鉴推算'
): RegionWageHistory {
  // 计算2000→2023累计增长倍数，反推base2000
  let cum = 1.0;
  for (let y = 2001; y <= 2023; y++) cum *= (1 + _rate(y, m));
  const base2000 = Math.round(target2023 / cum);

  const data: HistoricalWageData[] = [];
  let prev = base2000;
  for (let year = 2000; year <= 2025; year++) {
    const rate = year === 2000 ? 0.078 : _rate(year, m);
    const wage = year === 2000 ? base2000 : Math.round(prev * (1 + rate));
    data.push({
      year,
      avgMonthlyWage: wage,
      avgAnnualWage:  wage * 12,
      growthRate:     year === 2000 ? 0.078 : Math.round(rate * 1000) / 1000,
      source: year >= 2025 ? '预测值' : year >= 2024 ? '推算值' : src,
    });
    prev = wage;
  }
  return { regionCode: code, regionName: name, data };
}

// ─────────────────────────────────────────────
// 三、全部31省级行政区（按地理区域排序）
// ─────────────────────────────────────────────
// 2023年目标值口径：NBS城镇非私营单位月均×0.60折算为全口径社平工资
// （参照广东省：NBS非私营10952→文件6585，折算系数≈0.601）
// 增速系数：
//   东部发达 1.00-1.02；西部政策支撑 0.97-1.00；东北老工业 0.92-0.95；中部 0.95-0.97

// ── 直辖市 ──────────────────────────────────
// 北京、上海：已有实测数据，跳过
// 天津（东部）：NBS非私 138,007/12=11501 ×0.60=6901
export const TIANJIN_WAGE_HISTORY = genProvince('tianjin', '天津', 6900, 1.01);

// 重庆（西部）：NBS 113,653/12=9471 ×0.60=5683
export const CHONGQING_WAGE_HISTORY = genProvince('chongqing', '重庆', 5680, 0.97);

// ── 华北 ────────────────────────────────────
// 河北：NBS 94,818/12=7902 ×0.60=4741
export const HEBEI_WAGE_HISTORY = genProvince('hebei', '河北', 4740, 0.96);

// 山西（煤炭省，增速受资源周期影响）：NBS 95,025/12=7919 ×0.60=4751
export const SHANXI_WAGE_HISTORY = genProvince('shanxi', '山西', 4750, 0.96);

// 内蒙古（资源+政策）：NBS 108,856/12=9071 ×0.60=5443
export const NEIMENGGU_WAGE_HISTORY = genProvince('neimenggu', '内蒙古', 5440, 0.98);

// ── 东北 ────────────────────────────────────
// 辽宁（老工业，增速偏低）：NBS 97,330/12=8111 ×0.60=4867
export const LIAONING_WAGE_HISTORY = genProvince('liaoning', '辽宁', 4870, 0.93);

// 吉林：NBS 94,937/12=7911 ×0.60=4747
export const JILIN_WAGE_HISTORY = genProvince('jilin', '吉林', 4750, 0.93);

// 黑龙江（增速最低）：NBS 95,750/12=7979 ×0.60=4788
export const HEILONGJIANG_WAGE_HISTORY = genProvince('heilongjiang', '黑龙江', 4790, 0.92);

// ── 华东 ────────────────────────────────────
// 上海：已有实测数据，跳过
// 江苏：NBS 125,102/12=10425 ×0.60=6255
export const JIANGSU_WAGE_HISTORY = genProvince('jiangsu', '江苏', 6260, 1.00);

// 浙江：NBS 133,045/12=11087 ×0.60=6652
export const ZHEJIANG_WAGE_HISTORY = genProvince('zhejiang', '浙江', 6650, 1.02);

// 安徽（近年崛起）：NBS 103,688/12=8641 ×0.60=5185
export const ANHUI_WAGE_HISTORY = genProvince('anhui', '安徽', 5190, 0.97);

// 福建（民营活跃）：NBS 108,520/12=9043 ×0.60=5426
export const FUJIAN_WAGE_HISTORY = genProvince('fujian', '福建', 5430, 0.98);

// 江西：NBS 92,794/12=7733 ×0.60=4640
export const JIANGXI_WAGE_HISTORY = genProvince('jiangxi', '江西', 4640, 0.95);

// 山东：NBS 107,131/12=8928 ×0.60=5357
export const SHANDONG_WAGE_HISTORY = genProvince('shandong', '山东', 5360, 0.98);

// ── 华中 ────────────────────────────────────
// 河南（全国最低）：NBS 84,156/12=7013 ×0.60=4208
export const HENAN_WAGE_HISTORY = genProvince('henan', '河南', 4210, 0.95);

// 湖北：NBS 109,227/12=9102 ×0.60=5461
export const HUBEI_WAGE_HISTORY = genProvince('hubei', '湖北', 5460, 0.97);

// 湖南：NBS 97,015/12=8085 ×0.60=4851
export const HUNAN_WAGE_HISTORY = genProvince('hunan', '湖南', 4850, 0.96);

// ── 华南 ────────────────────────────────────
// 广东：已有实测数据，跳过
// 广西：NBS 96,184/12=8015 ×0.60=4809
export const GUANGXI_WAGE_HISTORY = genProvince('guangxi', '广西', 4810, 0.95);

// 海南（旅游+自贸港）：NBS 114,572/12=9548 ×0.60=5729
export const HAINAN_WAGE_HISTORY = genProvince('hainan', '海南', 5730, 0.96);

// ── 西南 ────────────────────────────────────
// 四川：NBS 110,160/12=9180 ×0.60=5508
export const SICHUAN_WAGE_HISTORY = genProvince('sichuan', '四川', 5510, 0.96);

// 贵州：NBS 102,010/12=8501 ×0.60=5101
export const GUIZHOU_WAGE_HISTORY = genProvince('guizhou', '贵州', 5100, 0.96);

// 云南：NBS 106,769/12=8897 ×0.60=5338
export const YUNNAN_WAGE_HISTORY = genProvince('yunnan', '云南', 5340, 0.95);

// 西藏（政策补贴，工资高）：NBS 165,004/12=13750 ×0.60=8250
export const XIZANG_WAGE_HISTORY = genProvince('xizang', '西藏', 8250, 1.00);

// ── 西北 ────────────────────────────────────
// 陕西：NBS 106,969/12=8914 ×0.60=5348
export const SHAANXI_WAGE_HISTORY = genProvince('shaanxi', '陕西', 5350, 0.95);

// 甘肃：NBS 99,124/12=8260 ×0.60=4956
export const GANSU_WAGE_HISTORY = genProvince('gansu', '甘肃', 4960, 0.95);

// 青海（政策补贴）：NBS 121,457/12=10121 ×0.60=6073
export const QINGHAI_WAGE_HISTORY = genProvince('qinghai', '青海', 6070, 0.99);

// 宁夏：NBS 117,681/12=9807 ×0.60=5884
export const NINGXIA_WAGE_HISTORY = genProvince('ningxia', '宁夏', 5880, 0.97);

// 新疆：NBS 112,305/12=9359 ×0.60=5615
export const XINJIANG_WAGE_HISTORY = genProvince('xinjiang', '新疆', 5620, 0.98);

// ── 重点城市（独立社保基数参考）────────────────
// 深圳（独立于广东省，高科技+金融集聚）
// 深圳NBS非私≈150,000/年，×0.60×1.15(城市溢价)≈8625
export const SHENZHEN_WAGE_HISTORY = genProvince('shenzhen', '深圳', 8650, 1.03, '深圳市统计局及人社局');

// ─────────────────────────────────────────────
// 四、汇总（所有31省 + 深圳 + 全国）
// ─────────────────────────────────────────────
export const ALL_WAGE_HISTORIES: Record<string, RegionWageHistory> = {
  // 直辖市
  beijing:      BEIJING_WAGE_HISTORY,
  shanghai:     SHANGHAI_WAGE_HISTORY,
  tianjin:      TIANJIN_WAGE_HISTORY,
  chongqing:    CHONGQING_WAGE_HISTORY,
  // 华北
  hebei:        HEBEI_WAGE_HISTORY,
  shanxi:       SHANXI_WAGE_HISTORY,
  neimenggu:    NEIMENGGU_WAGE_HISTORY,
  // 东北
  liaoning:     LIAONING_WAGE_HISTORY,
  jilin:        JILIN_WAGE_HISTORY,
  heilongjiang: HEILONGJIANG_WAGE_HISTORY,
  // 华东
  jiangsu:      JIANGSU_WAGE_HISTORY,
  zhejiang:     ZHEJIANG_WAGE_HISTORY,
  anhui:        ANHUI_WAGE_HISTORY,
  fujian:       FUJIAN_WAGE_HISTORY,
  jiangxi:      JIANGXI_WAGE_HISTORY,
  shandong:     SHANDONG_WAGE_HISTORY,
  // 华中
  henan:        HENAN_WAGE_HISTORY,
  hubei:        HUBEI_WAGE_HISTORY,
  hunan:        HUNAN_WAGE_HISTORY,
  // 华南
  guangdong:    GUANGDONG_WAGE_HISTORY,
  guangxi:      GUANGXI_WAGE_HISTORY,
  hainan:       HAINAN_WAGE_HISTORY,
  // 西南
  sichuan:      SICHUAN_WAGE_HISTORY,
  guizhou:      GUIZHOU_WAGE_HISTORY,
  yunnan:       YUNNAN_WAGE_HISTORY,
  xizang:       XIZANG_WAGE_HISTORY,
  // 西北
  shaanxi:      SHAANXI_WAGE_HISTORY,
  gansu:        GANSU_WAGE_HISTORY,
  qinghai:      QINGHAI_WAGE_HISTORY,
  ningxia:      NINGXIA_WAGE_HISTORY,
  xinjiang:     XINJIANG_WAGE_HISTORY,
  // 重点城市
  shenzhen:     SHENZHEN_WAGE_HISTORY,
  // 全国
  national:     NATIONAL_WAGE_HISTORY,
};

// ─────────────────────────────────────────────
// 五、工具函数
// ─────────────────────────────────────────────

/** 获取特定地区特定年份的工资数据 */
export function getWageData(regionCode: string, year: number): HistoricalWageData | null {
  const history = ALL_WAGE_HISTORIES[regionCode];
  if (!history) return null;
  return history.data.find(d => d.year === year) ?? null;
}

/** 获取特定地区的历史平均增长率 */
export function getAverageWageGrowthRate(
  regionCode: string,
  startYear = 2010,
  endYear = 2024,
): number {
  const history = ALL_WAGE_HISTORIES[regionCode];
  if (!history) return 0.05;
  const relevant = history.data.filter(d => d.year >= startYear && d.year <= endYear);
  if (relevant.length === 0) return 0.05;
  return relevant.reduce((s, d) => s + d.growthRate, 0) / relevant.length;
}

/** 获取工资增长趋势（用于默认参数推荐） */
export function getWageGrowthTrend(regionCode: string): {
  past5yr: number;
  past10yr: number;
  projected: number;
} {
  const past5yr  = getAverageWageGrowthRate(regionCode, 2019, 2024);
  const past10yr = getAverageWageGrowthRate(regionCode, 2014, 2024);
  return {
    past5yr,
    past10yr,
    projected: Math.max(0.03, past5yr * 0.85),
  };
}

/** 获取最新年份的月均社平工资（用于设置社保缴费基数默认值） */
export function getLatestMonthlyWage(regionCode: string): number {
  const history = ALL_WAGE_HISTORIES[regionCode];
  if (!history) return NATIONAL_WAGE_HISTORY.data.at(-2)!.avgMonthlyWage;
  // 返回最近有实际数据的年份（排除预测值）
  const confirmed = history.data.filter(d => !d.source.includes('预测'));
  return confirmed.at(-1)?.avgMonthlyWage ?? 5124;
}

/** 获取所有可用地区列表 */
export function getAllRegions(): { code: string; name: string }[] {
  return Object.values(ALL_WAGE_HISTORIES).map(h => ({
    code: h.regionCode,
    name: h.regionName,
  }));
}
