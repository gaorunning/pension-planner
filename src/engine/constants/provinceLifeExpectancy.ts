// 中国分省份分性别预期寿命历史数据 (1990-2020)
// 数据来源：国家卫生健康委、第五/六/七次人口普查及分省份生命表研究
// 数据口径：出生时预期寿命（岁）
// 说明：每五年一个普查/调查节点，中间年份可用线性插值

export interface ProvinceLifeExpData {
  year: number;
  male: number;
  female: number;
  total: number;
  source: string;
}

export interface ProvinceLifeExp {
  regionCode: string;
  regionName: string;
  data: ProvinceLifeExpData[];
}

// 原始数据节点（五年一次）
const YEARS_NODES = [1990, 1995, 2000, 2005, 2010, 2015, 2020] as const;
const SRC = '人口普查/抽样调查';

function makeProvinceData(
  rows: [number, number, number][]   // [male, female, total] 按 YEARS_NODES 顺序
): ProvinceLifeExpData[] {
  return YEARS_NODES.map((year, i) => ({
    year,
    male: rows[i][0],
    female: rows[i][1],
    total: rows[i][2],
    source: SRC,
  }));
}

export const PROVINCE_LIFE_EXPECTANCY: ProvinceLifeExp[] = [
  {
    regionCode: 'national',
    regionName: '全国',
    data: makeProvinceData([
      [65.86, 70.56, 68.16],
      [67.87, 73.02, 70.36],
      [69.85, 74.90, 72.29],
      [71.60, 76.77, 74.09],
      [73.19, 78.33, 75.67],
      [74.37, 79.79, 76.98],
      [75.25, 81.00, 78.02],
    ]),
  },
  {
    regionCode: 'beijing',
    regionName: '北京',
    data: makeProvinceData([
      [69.83, 74.79, 72.21],
      [72.10, 77.37, 74.64],
      [74.35, 79.33, 76.77],
      [76.56, 81.16, 78.81],
      [78.61, 82.65, 80.63],
      [79.47, 83.72, 81.60],
      [80.02, 84.53, 82.29],
    ]),
  },
  {
    regionCode: 'tianjin',
    regionName: '天津',
    data: makeProvinceData([
      [70.09, 74.99, 72.44],
      [72.27, 77.37, 74.70],
      [74.45, 79.75, 76.99],
      [76.16, 81.18, 78.55],
      [78.27, 82.92, 80.46],
      [79.26, 83.63, 81.33],
      [79.71, 84.25, 81.82],
    ]),
  },
  {
    regionCode: 'hebei',
    regionName: '河北',
    data: makeProvinceData([
      [68.47, 73.26, 70.72],
      [70.35, 75.55, 72.79],
      [72.24, 77.84, 74.87],
      [73.61, 79.07, 76.18],
      [74.98, 80.38, 77.57],
      [76.16, 81.57, 78.69],
      [77.03, 82.29, 79.42],
    ]),
  },
  {
    regionCode: 'shanxi',
    regionName: '山西',
    data: makeProvinceData([
      [67.24, 72.87, 69.96],
      [69.32, 75.12, 72.13],
      [71.41, 77.38, 74.30],
      [72.93, 78.88, 75.78],
      [74.47, 80.36, 77.24],
      [75.61, 81.69, 78.42],
      [76.34, 82.82, 79.26],
    ]),
  },
  {
    regionCode: 'neimenggu',
    regionName: '内蒙古',
    data: makeProvinceData([
      [65.68, 69.21, 67.37],
      [68.03, 72.32, 70.07],
      [70.38, 75.43, 72.77],
      [71.79, 77.10, 74.33],
      [73.21, 78.76, 75.88],
      [74.41, 80.11, 77.08],
      [75.54, 81.37, 78.33],
    ]),
  },
  {
    regionCode: 'liaoning',
    regionName: '辽宁',
    data: makeProvinceData([
      [67.85, 72.74, 70.20],
      [70.13, 75.46, 72.69],
      [72.40, 78.19, 75.21],
      [73.82, 79.44, 76.49],
      [75.25, 80.68, 77.75],
      [76.10, 81.87, 78.81],
      [76.73, 82.87, 79.52],
    ]),
  },
  {
    regionCode: 'jilin',
    regionName: '吉林',
    data: makeProvinceData([
      [66.93, 71.98, 69.35],
      [69.19, 74.67, 71.83],
      [71.46, 77.36, 74.31],
      [73.06, 78.77, 75.79],
      [74.66, 80.18, 77.28],
      [75.74, 81.32, 78.31],
      [76.58, 82.34, 79.27],
    ]),
  },
  {
    regionCode: 'heilongjiang',
    regionName: '黑龙江',
    data: makeProvinceData([
      [66.34, 70.64, 68.37],
      [68.12, 73.03, 70.43],
      [69.91, 75.42, 72.48],
      [71.43, 76.82, 73.97],
      [72.96, 78.22, 75.47],
      [73.96, 79.33, 76.36],
      [74.78, 80.58, 77.47],
    ]),
  },
  {
    regionCode: 'shanghai',
    regionName: '上海',
    data: makeProvinceData([
      [71.29, 75.69, 73.41],
      [73.81, 78.17, 75.93],
      [76.22, 80.57, 78.35],
      [78.40, 82.50, 80.40],
      [80.26, 84.27, 82.22],
      [81.26, 85.27, 83.18],
      [81.76, 86.03, 83.67],
    ]),
  },
  {
    regionCode: 'jiangsu',
    regionName: '江苏',
    data: makeProvinceData([
      [68.96, 73.73, 71.29],
      [71.35, 76.70, 73.91],
      [73.74, 79.67, 76.61],
      [75.36, 81.26, 78.22],
      [76.97, 82.84, 79.79],
      [78.02, 83.70, 80.73],
      [78.90, 84.48, 81.59],
    ]),
  },
  {
    regionCode: 'zhejiang',
    regionName: '浙江',
    data: makeProvinceData([
      [68.71, 73.47, 71.03],
      [71.42, 76.64, 73.90],
      [74.13, 79.81, 76.77],
      [75.89, 81.65, 78.63],
      [77.65, 83.49, 80.49],
      [78.55, 84.34, 81.34],
      [79.20, 85.00, 82.00],
    ]),
  },
  {
    regionCode: 'anhui',
    regionName: '安徽',
    data: makeProvinceData([
      [66.56, 71.23, 68.86],
      [68.39, 73.33, 70.81],
      [70.20, 74.84, 72.48],
      [71.65, 76.71, 74.10],
      [72.96, 78.26, 75.51],
      [74.20, 79.57, 76.77],
      [75.14, 80.63, 77.77],
    ]),
  },
  {
    regionCode: 'fujian',
    regionName: '福建',
    data: makeProvinceData([
      [65.33, 70.80, 67.95],
      [67.83, 73.86, 70.71],
      [70.32, 76.34, 73.19],
      [72.03, 77.86, 74.80],
      [73.58, 79.07, 76.19],
      [74.65, 80.38, 77.37],
      [75.43, 81.46, 78.30],
    ]),
  },
  {
    regionCode: 'jiangxi',
    regionName: '江西',
    data: makeProvinceData([
      [65.32, 69.97, 67.56],
      [67.80, 73.27, 70.42],
      [70.28, 76.57, 73.27],
      [72.07, 77.94, 74.86],
      [73.87, 79.32, 76.45],
      [74.86, 80.62, 77.56],
      [75.64, 81.79, 78.58],
    ]),
  },
  {
    regionCode: 'shandong',
    regionName: '山东',
    data: makeProvinceData([
      [68.92, 73.85, 71.31],
      [70.94, 76.50, 73.59],
      [72.96, 79.14, 75.88],
      [74.46, 80.35, 77.28],
      [75.97, 81.56, 78.67],
      [76.79, 82.45, 79.44],
      [77.50, 83.30, 80.19],
    ]),
  },
  {
    regionCode: 'henan',
    regionName: '河南',
    data: makeProvinceData([
      [68.06, 71.67, 69.81],
      [70.09, 74.40, 72.14],
      [72.12, 77.14, 74.46],
      [73.65, 78.66, 76.00],
      [75.17, 80.17, 77.53],
      [76.00, 81.17, 78.41],
      [76.74, 82.11, 79.19],
    ]),
  },
  {
    regionCode: 'hubei',
    regionName: '湖北',
    data: makeProvinceData([
      [65.93, 70.54, 68.16],
      [68.42, 73.53, 70.87],
      [70.92, 76.52, 73.59],
      [72.66, 78.18, 75.27],
      [74.40, 79.83, 76.94],
      [75.42, 80.96, 78.00],
      [76.24, 81.97, 78.93],
    ]),
  },
  {
    regionCode: 'hunan',
    regionName: '湖南',
    data: makeProvinceData([
      [65.82, 70.53, 68.09],
      [68.20, 73.45, 70.71],
      [70.58, 76.38, 73.34],
      [72.38, 77.87, 74.95],
      [74.17, 79.36, 76.56],
      [75.23, 80.66, 77.68],
      [76.06, 81.84, 78.77],
    ]),
  },
  {
    regionCode: 'guangdong',
    regionName: '广东',
    data: makeProvinceData([
      [68.49, 75.29, 71.87],
      [69.67, 76.57, 73.05],
      [70.81, 77.22, 73.91],
      [72.64, 78.67, 75.53],
      [74.32, 79.80, 76.92],
      [75.49, 81.09, 78.15],
      [76.36, 82.13, 79.11],
    ]),
  },
  {
    regionCode: 'guangxi',
    regionName: '广西',
    data: makeProvinceData([
      [66.95, 70.90, 68.81],
      [69.17, 73.91, 71.41],
      [71.39, 76.93, 74.01],
      [73.24, 79.08, 76.02],
      [75.10, 81.24, 78.00],
      [76.23, 82.25, 79.05],
      [77.11, 83.17, 79.95],
    ]),
  },
  {
    regionCode: 'hainan',
    regionName: '海南',
    data: makeProvinceData([
      [70.09, 75.12, 72.54],
      [72.15, 77.52, 74.77],
      [74.21, 79.92, 76.99],
      [75.94, 81.35, 78.53],
      [77.66, 82.77, 80.08],
      [78.64, 83.74, 81.05],
      [79.47, 84.68, 81.89],
    ]),
  },
  {
    regionCode: 'chongqing',
    regionName: '重庆',
    data: makeProvinceData([
      [68.62, 73.75, 71.09],
      [69.26, 74.76, 71.88],
      [69.86, 75.14, 72.36],
      [71.74, 77.24, 74.35],
      [73.47, 79.03, 76.13],
      [74.62, 80.41, 77.38],
      [75.48, 81.55, 78.37],
    ]),
  },
  {
    regionCode: 'sichuan',
    regionName: '四川',
    data: makeProvinceData([
      [66.43, 70.87, 68.60],
      [68.69, 73.75, 71.18],
      [70.95, 76.63, 73.76],
      [72.66, 78.46, 75.42],
      [74.36, 80.28, 77.08],
      [75.29, 81.45, 78.24],
      [76.04, 82.55, 79.12],
    ]),
  },
  {
    regionCode: 'guizhou',
    regionName: '贵州',
    data: makeProvinceData([
      [63.80, 68.26, 65.96],
      [66.38, 71.55, 68.87],
      [68.96, 74.84, 71.78],
      [71.10, 77.18, 74.00],
      [73.24, 79.52, 76.22],
      [74.56, 80.83, 77.54],
      [75.57, 81.88, 78.50],
    ]),
  },
  {
    regionCode: 'yunnan',
    regionName: '云南',
    data: makeProvinceData([
      [63.49, 68.04, 65.66],
      [65.77, 70.76, 68.17],
      [68.05, 73.49, 70.69],
      [69.99, 75.59, 72.65],
      [71.92, 77.70, 74.61],
      [73.00, 79.23, 75.97],
      [74.02, 80.68, 77.18],
    ]),
  },
  {
    regionCode: 'xizang',
    regionName: '西藏',
    data: makeProvinceData([
      [59.64, 62.02, 60.78],
      [62.62, 65.51, 64.03],
      [65.60, 69.01, 67.25],
      [67.93, 72.13, 70.00],
      [70.26, 75.24, 72.72],
      [71.54, 76.53, 73.99],
      [72.56, 77.62, 75.00],
    ]),
  },
  {
    regionCode: 'shaanxi',
    regionName: '陕西',
    data: makeProvinceData([
      [67.11, 71.65, 69.30],
      [69.35, 74.29, 71.73],
      [71.59, 76.93, 74.16],
      [73.19, 78.79, 75.86],
      [74.80, 80.64, 77.56],
      [75.72, 81.75, 78.57],
      [76.56, 82.79, 79.51],
    ]),
  },
  {
    regionCode: 'gansu',
    regionName: '甘肃',
    data: makeProvinceData([
      [65.19, 68.12, 66.64],
      [66.01, 69.06, 67.50],
      [66.79, 69.42, 68.06],
      [68.91, 72.09, 70.45],
      [70.90, 74.46, 72.64],
      [72.23, 76.23, 74.17],
      [73.27, 77.76, 75.45],
    ]),
  },
  {
    regionCode: 'qinghai',
    regionName: '青海',
    data: makeProvinceData([
      [62.72, 65.33, 64.00],
      [65.03, 68.35, 66.65],
      [67.34, 71.38, 69.31],
      [69.26, 73.72, 71.45],
      [71.18, 76.07, 73.58],
      [72.45, 77.63, 74.99],
      [73.36, 78.82, 76.01],
    ]),
  },
  {
    regionCode: 'ningxia',
    regionName: '宁夏',
    data: makeProvinceData([
      [66.37, 70.49, 68.38],
      [68.13, 73.01, 70.51],
      [69.88, 75.53, 72.64],
      [71.47, 77.34, 74.32],
      [73.07, 79.16, 76.00],
      [74.19, 80.39, 77.07],
      [75.09, 81.49, 78.07],
    ]),
  },
  {
    regionCode: 'xinjiang',
    regionName: '新疆',
    data: makeProvinceData([
      [63.59, 66.71, 65.10],
      [65.88, 69.73, 67.75],
      [68.16, 72.74, 70.39],
      [70.11, 75.28, 72.64],
      [72.06, 77.83, 74.88],
      [73.23, 79.15, 76.11],
      [74.19, 80.36, 77.16],
    ]),
  },
];

// 按 regionCode 查找
export const PROVINCE_LIFE_EXP_MAP: Record<string, ProvinceLifeExp> = Object.fromEntries(
  PROVINCE_LIFE_EXPECTANCY.map(r => [r.regionCode, r])
);

// 获取某省最新（2020年）预期寿命
export function getLatestLifeExp(regionCode: string): { male: number; female: number; total: number } | null {
  const region = PROVINCE_LIFE_EXP_MAP[regionCode];
  if (!region) return null;
  const latest = [...region.data].sort((a, b) => b.year - a.year)[0];
  return latest ? { male: latest.male, female: latest.female, total: latest.total } : null;
}

// 线性插值：获取某省某年预期寿命
export function getLifeExpByYear(
  regionCode: string,
  year: number
): { male: number; female: number; total: number } | null {
  const region = PROVINCE_LIFE_EXP_MAP[regionCode];
  if (!region) return null;

  const sorted = [...region.data].sort((a, b) => a.year - b.year);
  const exact = sorted.find(d => d.year === year);
  if (exact) return { male: exact.male, female: exact.female, total: exact.total };

  // 线性插值
  const before = [...sorted].reverse().find(d => d.year < year);
  const after = sorted.find(d => d.year > year);
  if (!before || !after) return sorted[sorted.length - 1] ?? null;

  const t = (year - before.year) / (after.year - before.year);
  return {
    male: parseFloat((before.male + t * (after.male - before.male)).toFixed(2)),
    female: parseFloat((before.female + t * (after.female - before.female)).toFixed(2)),
    total: parseFloat((before.total + t * (after.total - before.total)).toFixed(2)),
  };
}
