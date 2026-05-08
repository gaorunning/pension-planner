// 中国人口预期寿命历史数据及预测 (2000-2050)
//
// 数据来源说明：
//   2000：第五次全国人口普查（2000年11月）  → 官方普查值
//   2005：全国1%人口抽样调查                → 官方抽样值
//   2010：第六次全国人口普查（2010年11月）  → 官方普查值
//   2015：全国1%人口抽样调查                → 官方抽样值
//   2020：第七次全国人口普查（2020年11月）  → 官方普查值（男75.07，女81.68，合计78.21）
//   2021：《2021年我国卫生健康事业发展统计公报》（国家卫生健康委）→ 官方年报值
//   2022：《2022年我国卫生健康事业发展统计公报》（国家卫生健康委）→ 官方年报值
//   2023：《2023年我国卫生健康事业发展统计公报》（国家卫生健康委）→ 官方年报值
//   2024+：推算/预测（未发布官方数据）
//
// 注意：分省份数据见 provinceLifeExpectancy.ts，采用学术研究的细化数值，
//       与本文件全国合计数值略有出入（方法论差异约0.2-1岁）。

export interface LifeExpectancyData {
  year: number;
  male: number;              // 男性出生时预期寿命（岁）
  female: number;            // 女性出生时预期寿命（岁）
  total: number;             // 合计出生时预期寿命（岁）
  source: string;
  note?: string;
}

export interface LifeExpectancyAtAge {
  age: number;
  male: number;              // 男性x岁时的预期剩余寿命（岁）
  female: number;            // 女性x岁时的预期剩余寿命（岁）
  maleTotal: number;         // 男性x岁时的预期总寿命（岁）
  femaleTotal: number;       // 女性x岁时的预期总寿命（岁）
}

// 出生时预期寿命历史数据
export const LIFE_EXPECTANCY_HISTORY: LifeExpectancyData[] = [
  { year: 2000, male: 69.63, female: 73.33, total: 71.40, source: '第五次全国人口普查' },
  { year: 2005, male: 70.56, female: 74.67, total: 72.53, source: '1%人口抽样调查' },
  { year: 2010, male: 72.38, female: 77.37, total: 74.83, source: '第六次全国人口普查' },
  { year: 2015, male: 73.64, female: 79.43, total: 76.34, source: '1%人口抽样调查' },
  { year: 2020, male: 75.07, female: 81.68, total: 78.21, source: '第七次全国人口普查' },
  { year: 2021, male: 75.40, female: 81.57, total: 78.40, source: '国家卫生健康委·卫生健康统计公报', note: '官方年报值' },
  { year: 2022, male: 75.56, female: 81.97, total: 78.63, source: '国家卫生健康委·卫生健康统计公报', note: '官方年报值' },
  { year: 2023, male: 75.73, female: 82.29, total: 78.83, source: '国家卫生健康委·卫生健康统计公报', note: '官方年报值' },
  { year: 2024, male: 75.90, female: 82.50, total: 79.00, source: '推算值', note: '基于近期年均增幅约0.2岁推算' },
  { year: 2025, male: 76.05, female: 82.70, total: 79.18, source: '预测值', note: '参考联合国人口署中等变量' },
];

// 未来预期寿命模型估算（2030–2050）
// ─────────────────────────────────────────────────────────────────
// 方法论：以 2010–2023 年的实际年均增量为初始斜率，叠加"增速递减"假设
//   - 男性初始斜率 ~0.26 岁/年，每10年衰减约15%
//   - 女性初始斜率 ~0.19 岁/年（近年女性增速已趋缓）
//   - 合计初始斜率 ~0.22 岁/年
// 参考依据：联合国人口署 WPP 2024 中等变量（China）趋势走向，
//   但具体数值为本项目模型推算，与 WPP 官方值存在误差（±0.5 岁以内），
//   不应引用为官方预测数据。
// ─────────────────────────────────────────────────────────────────
export const LIFE_EXPECTANCY_PROJECTION: LifeExpectancyData[] = [
  { year: 2030, male: 77.2, female: 83.4, total: 80.1, source: '模型估算（参考UN WPP 2024趋势）' },
  { year: 2035, male: 78.1, female: 84.3, total: 81.0, source: '模型估算（参考UN WPP 2024趋势）' },
  { year: 2040, male: 78.9, female: 85.1, total: 81.8, source: '模型估算（参考UN WPP 2024趋势）' },
  { year: 2045, male: 79.6, female: 85.8, total: 82.5, source: '模型估算（参考UN WPP 2024趋势）' },
  { year: 2050, male: 80.2, female: 86.4, total: 83.1, source: '模型估算（参考UN WPP 2024趋势）' },
];

// 分年龄预期剩余寿命（基于2020年七普生命表）
// 数据来源：第七次全国人口普查生命表
export const LIFE_TABLE_2020: LifeExpectancyAtAge[] = [
  { age: 0, male: 75.07, female: 81.68, maleTotal: 75.07, femaleTotal: 81.68 },
  { age: 25, male: 51.12, female: 56.95, maleTotal: 76.12, femaleTotal: 81.95 },
  { age: 30, male: 46.35, female: 52.08, maleTotal: 76.35, femaleTotal: 82.08 },
  { age: 35, male: 41.61, female: 47.23, maleTotal: 76.61, femaleTotal: 82.23 },
  { age: 40, male: 36.93, female: 42.42, maleTotal: 76.93, femaleTotal: 82.42 },
  { age: 45, male: 32.35, female: 37.67, maleTotal: 77.35, femaleTotal: 82.67 },
  { age: 50, male: 27.91, female: 33.01, maleTotal: 77.91, femaleTotal: 83.01 },
  { age: 55, male: 23.65, female: 28.48, maleTotal: 78.65, femaleTotal: 83.48 },
  { age: 60, male: 19.63, female: 24.13, maleTotal: 79.63, femaleTotal: 84.13 },
  { age: 65, male: 15.92, female: 19.99, maleTotal: 80.92, femaleTotal: 84.99 },
  { age: 70, male: 12.58, female: 16.15, maleTotal: 82.58, femaleTotal: 86.15 },
  { age: 75, male: 9.69, female: 12.71, maleTotal: 84.69, femaleTotal: 87.71 },
  { age: 80, male: 7.31, female: 9.72, maleTotal: 87.31, femaleTotal: 89.72 },
  { age: 85, male: 5.45, female: 7.23, maleTotal: 90.45, femaleTotal: 92.23 },
  { age: 90, male: 4.05, female: 5.29, maleTotal: 94.05, femaleTotal: 95.29 },
  { age: 95, male: 3.01, female: 3.88, maleTotal: 98.01, femaleTotal: 98.88 },
  { age: 100, male: 2.27, female: 2.90, maleTotal: 102.27, femaleTotal: 102.90 },
];

// 主要城市预期寿命（2020年）
export interface CityLifeExpectancy {
  cityCode: string;
  cityName: string;
  male: number;
  female: number;
  total: number;
  source: string;
}

export const CITY_LIFE_EXPECTANCY: CityLifeExpectancy[] = [
  { cityCode: 'beijing', cityName: '北京', male: 78.28, female: 82.23, total: 80.18, source: '北京市统计局' },
  { cityCode: 'shanghai', cityName: '上海', male: 79.47, female: 84.11, total: 81.67, source: '上海市统计局' },
  { cityCode: 'guangzhou', cityName: '广州', male: 78.05, female: 82.66, total: 80.26, source: '广州市统计局' },
  { cityCode: 'shenzhen', cityName: '深圳', male: 78.42, female: 83.00, total: 80.61, source: '深圳市统计局' },
  { cityCode: 'hangzhou', cityName: '杭州', male: 77.98, female: 82.76, total: 80.24, source: '杭州市统计局' },
  { cityCode: 'tianjin', cityName: '天津', male: 77.71, female: 82.02, total: 79.75, source: '天津市统计局' },
  { cityCode: 'nanjing', cityName: '南京', male: 77.83, female: 82.57, total: 80.09, source: '南京市统计局' },
  { cityCode: 'national', cityName: '全国', male: 75.07, female: 81.68, total: 78.21, source: '第七次人口普查' },
];

// 获取特定年份的预期寿命
export function getLifeExpectancy(year: number, gender: 'male' | 'female' | 'total' = 'total'): number {
  let data = LIFE_EXPECTANCY_HISTORY.find(d => d.year === year);

  if (!data && year > 2025) {
    data = LIFE_EXPECTANCY_PROJECTION.find(d => d.year === year);
  }

  if (data) {
    return gender === 'male' ? data.male : gender === 'female' ? data.female : data.total;
  }

  // 插值或外推
  if (year < 2000) {
    return gender === 'male' ? 68.5 : gender === 'female' ? 72.0 : 70.0;
  }

  // 年份在2025-2030之间，使用线性插值
  if (year > 2025 && year < 2030) {
    const y2025 = LIFE_EXPECTANCY_HISTORY[LIFE_EXPECTANCY_HISTORY.length - 1];
    const y2030 = LIFE_EXPECTANCY_PROJECTION[0];
    const t = (year - 2025) / 5;

    return gender === 'male'
      ? y2025.male + t * (y2030.male - y2025.male)
      : gender === 'female'
        ? y2025.female + t * (y2030.female - y2025.female)
        : y2025.total + t * (y2030.total - y2025.total);
  }

  // 超过2050，使用2050数据
  const lastData = LIFE_EXPECTANCY_PROJECTION[LIFE_EXPECTANCY_PROJECTION.length - 1];
  return gender === 'male' ? lastData.male : gender === 'female' ? lastData.female : lastData.total;
}

// 获取特定年龄的预期剩余寿命
export function getLifeExpectancyAtAge(targetAge: number, _gender: 'male' | 'female'): LifeExpectancyAtAge {
  // 找到不大于targetAge的最近年龄
  let lowerIdx = 0;
  for (let i = 0; i < LIFE_TABLE_2020.length; i++) {
    if (LIFE_TABLE_2020[i].age <= targetAge) {
      lowerIdx = i;
    }
  }

  const lower = LIFE_TABLE_2020[lowerIdx];
  const upper = LIFE_TABLE_2020[Math.min(lowerIdx + 1, LIFE_TABLE_2020.length - 1)];

  if (lower.age === targetAge) {
    return lower;
  }

  // 线性插值
  const t = (targetAge - lower.age) / (upper.age - lower.age);

  return {
    age: targetAge,
    male: lower.male + t * (upper.male - lower.male),
    female: lower.female + t * (upper.female - lower.female),
    maleTotal: lower.maleTotal + t * (upper.maleTotal - lower.maleTotal),
    femaleTotal: lower.femaleTotal + t * (upper.femaleTotal - lower.femaleTotal),
  };
}

// 获取退休时的预期寿命（用于养老金计算）
export function getRetirementLifeExpectancy(
  _currentAge: number,
  retirementAge: number,
  gender: 'male' | 'female'
): number {
  const leAtRetirement = getLifeExpectancyAtAge(retirementAge, gender);
  return gender === 'male' ? leAtRetirement.male : leAtRetirement.female;
}

// 预期寿命年增长率（历史平均）
export const LIFE_EXPECTANCY_GROWTH = {
  male: (LIFE_EXPECTANCY_HISTORY[LIFE_EXPECTANCY_HISTORY.length - 1].male - LIFE_EXPECTANCY_HISTORY[0].male) / 25,
  female: (LIFE_EXPECTANCY_HISTORY[LIFE_EXPECTANCY_HISTORY.length - 1].female - LIFE_EXPECTANCY_HISTORY[0].female) / 25,
  perDecade: {
    male: (LIFE_EXPECTANCY_HISTORY[LIFE_EXPECTANCY_HISTORY.length - 1].male - LIFE_EXPECTANCY_HISTORY[0].male) / 2.5,
    female: (LIFE_EXPECTANCY_HISTORY[LIFE_EXPECTANCY_HISTORY.length - 1].female - LIFE_EXPECTANCY_HISTORY[0].female) / 2.5,
  },
};

// 预期寿命情景分析
export const LIFE_EXPECTANCY_SCENARIOS = {
  base: {
    name: '基准情景',
    description: '基于历史趋势的中等预期',
    maleAdjustment: 0,
    femaleAdjustment: 0,
  },
  optimistic: {
    name: '乐观情景',
    description: '医学进步更快，预期寿命增加2岁',
    maleAdjustment: 2,
    femaleAdjustment: 2,
  },
  conservative: {
    name: '保守情景',
    description: '谨慎假设，预期寿命减少1岁',
    maleAdjustment: -1,
    femaleAdjustment: -1,
  },
};

// 获取预期的总寿命（用于个人养老规划）
export function getExpectedTotalLifespan(
  currentAge: number,
  gender: 'male' | 'female',
  scenario: 'base' | 'optimistic' | 'conservative' = 'base'
): number {
  const leData = getLifeExpectancyAtAge(currentAge, gender);
  const total = gender === 'male' ? leData.maleTotal : leData.femaleTotal;
  const adjustment = LIFE_EXPECTANCY_SCENARIOS[scenario][`${gender}Adjustment`];

  return total + adjustment;
}
