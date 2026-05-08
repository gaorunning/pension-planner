// 各省市养老金计发基数历史数据 (2023-2026)
// 数据口径：全口径城镇单位就业人员平均工资（含私营与非私营单位加权）
// 数据来源：各省人力资源和社会保障厅历年公告，基础参数文件夹整理
// 政策依据：国办发〔2019〕13号，2019年起以全口径社平工资核定缴费上下限，
//           各省单独公布"计发基数"并逐步向全口径社平工资靠拢。
//
// 注：湖北省内按城市分三档；广东省内深圳单独公布。

export interface PensionBaseData {
  year: number;
  monthlyBase: number;   // 月度计发基数（元）
  source: string;
  note?: string;
}

export interface RegionPensionBase {
  regionCode: string;
  regionName: string;
  subRegion?: string;    // 适用范围（如"武汉"或"其他地区"）
  data: PensionBaseData[];
}

// 将年均值序列转为标准数据项（按省份 region code 映射）
function makeData(
  years: number[],
  monthlyBases: number[],
  source = '省人社厅公告',
): PensionBaseData[] {
  return years.map((year, i) => ({
    year,
    monthlyBase: Math.round(monthlyBases[i]),
    source,
  }));
}

// ─────────────────────────────────────────────
// 各省市养老金计发基数（月均，元）
// ─────────────────────────────────────────────
export const PENSION_BASE_BY_REGION: RegionPensionBase[] = [
  {
    regionCode: 'beijing',
    regionName: '北京',
    data: makeData([2023, 2024, 2025, 2026], [9782, 10543, 11368, 11937]),
  },
  {
    regionCode: 'tianjin',
    regionName: '天津',
    data: makeData([2023, 2024, 2025, 2026], [7478, 7919, 8355, 8540]),
  },
  {
    regionCode: 'hebei',
    regionName: '河北',
    data: makeData([2023, 2024, 2025, 2026], [5789, 6211, 6534, 6678]),
  },
  {
    regionCode: 'shanxi',
    regionName: '山西',
    data: makeData([2023, 2024, 2025, 2026], [5914, 6438, 6855, 6997]),
  },
  {
    regionCode: 'neimenggu',
    regionName: '内蒙古',
    data: makeData([2023, 2024, 2025, 2026], [6751, 6751, 6751, 8179]),
  },
  {
    regionCode: 'liaoning',
    regionName: '辽宁',
    data: makeData([2023, 2024, 2025, 2026], [6383, 6843, 7121, 7264]),
  },
  {
    regionCode: 'jilin',
    regionName: '吉林',
    data: makeData([2023, 2024, 2025, 2026], [6385, 6655, 7179, 7322]),
  },
  {
    regionCode: 'heilongjiang',
    regionName: '黑龙江',
    data: makeData([2023, 2024, 2025, 2026], [5865, 6430, 7010, 7570]),
  },
  {
    regionCode: 'shanghai',
    regionName: '上海',
    data: makeData([2023, 2024, 2025, 2026], [11396, 12183, 12307, 12434]),
  },
  {
    regionCode: 'jiangsu',
    regionName: '江苏',
    data: makeData([2023, 2024, 2025, 2026], [7083, 7490, 8132, 8254]),
  },
  {
    regionCode: 'zhejiang',
    regionName: '浙江',
    data: makeData([2023, 2024, 2025, 2026], [7437, 8020, 8310, 8433]),
  },
  {
    regionCode: 'anhui',
    regionName: '安徽',
    data: makeData([2023, 2024, 2025, 2026], [6387, 6698, 7044, 7185]),
  },
  {
    regionCode: 'fujian',
    regionName: '福建',
    data: makeData([2023, 2024, 2025, 2026], [6654, 7020, 7388, 7535]),
  },
  {
    regionCode: 'jiangxi',
    regionName: '江西',
    data: makeData([2023, 2024, 2025, 2026], [5880, 6098, 6397, 6525]),
  },
  {
    regionCode: 'shandong',
    regionName: '山东',
    data: makeData([2023, 2024, 2025, 2026], [6633, 7069, 7359, 7506]),
  },
  {
    regionCode: 'henan',
    regionName: '河南',
    data: makeData([2023, 2024, 2025, 2026], [5681, 5965, 6260, 6385]),
  },
  {
    regionCode: 'hubei_wuhan',
    regionName: '湖北',
    subRegion: '武汉',
    data: makeData([2023, 2024, 2025, 2026], [6795, 7040, 7489, 7496]),
  },
  {
    regionCode: 'hubei_tier2',
    regionName: '湖北',
    subRegion: '黄石 十堰 襄阳 宜昌 荆门 随州 恩施',
    data: makeData([2023, 2024, 2025, 2026], [6000, 6500, 6948, 7226]),
  },
  {
    regionCode: 'hubei_tier3',
    regionName: '湖北',
    subRegion: '荆州 鄂州 孝感 黄冈 咸宁 仙桃 天门 潜江 神农架',
    data: makeData([2023, 2024, 2025, 2026], [5750, 6300, 6805, 7154]),
  },
  {
    regionCode: 'hunan',
    regionName: '湖南',
    data: makeData([2023, 2024, 2025, 2026], [5977, 6284, 6711, 6787]),
  },
  {
    regionCode: 'guangdong',
    regionName: '广东',
    subRegion: '（除深圳）',
    data: makeData([2023, 2024, 2025, 2026], [8310, 8807, 9167, 9493]),
  },
  {
    regionCode: 'shenzhen',
    regionName: '广东（深圳）',
    subRegion: '深圳',
    data: makeData([2023, 2024, 2025, 2026], [10795, 11010, 11181, 11293]),
  },
  {
    regionCode: 'guangxi',
    regionName: '广西',
    data: makeData([2023, 2024, 2025, 2026], [6197, 6439, 6756, 6905]),
  },
  {
    regionCode: 'hainan',
    regionName: '海南',
    data: makeData([2023, 2024, 2025, 2026], [7486, 8050, 8131, 8188]),
  },
  {
    regionCode: 'chongqing',
    regionName: '重庆',
    data: makeData([2023, 2024, 2025, 2026], [6594, 6862, 7264, 7339]),
  },
  {
    regionCode: 'sichuan',
    regionName: '四川',
    data: makeData([2023, 2024, 2025, 2026], [6785, 7076, 7518, 7646]),
  },
  {
    regionCode: 'guizhou',
    regionName: '贵州',
    data: makeData([2023, 2024, 2025, 2026], [6798, 6858, 7272, 7325]),
  },
  {
    regionCode: 'yunnan',
    regionName: '云南',
    data: makeData([2023, 2024, 2025, 2026], [6622, 6906, 7177, 7263]),
  },
  {
    regionCode: 'xizang',
    regionName: '西藏',
    data: makeData([2023, 2024, 2025, 2026], [9900, 10791, 11546, 11777]),
  },
  {
    regionCode: 'shaanxi',
    regionName: '陕西',
    data: makeData([2023, 2024, 2025, 2026], [6543, 7029, 7598, 7750]),
  },
  {
    regionCode: 'gansu',
    regionName: '甘肃',
    data: makeData([2023, 2024, 2025, 2026], [6400, 6816, 7194, 7338]),
  },
  {
    regionCode: 'qinghai',
    regionName: '青海',
    data: makeData([2023, 2024, 2025, 2026], [7604, 8029, 8643, 8816]),
  },
  {
    regionCode: 'ningxia',
    regionName: '宁夏',
    data: makeData([2023, 2024, 2025, 2026], [7104, 7666, 8088, 8258]),
  },
  {
    regionCode: 'xinjiang',
    regionName: '新疆',
    data: makeData([2023, 2024, 2025, 2026], [7089, 7625, 8332, 8448]),
  },
];

// 按 regionCode 快速查找
export const PENSION_BASE_MAP: Record<string, RegionPensionBase> = Object.fromEntries(
  PENSION_BASE_BY_REGION.map(r => [r.regionCode, r])
);

// 获取某省最新计发基数（月均）
export function getLatestPensionBase(regionCode: string): number | null {
  const region = PENSION_BASE_MAP[regionCode];
  if (!region) return null;
  const sorted = [...region.data].sort((a, b) => b.year - a.year);
  return sorted[0]?.monthlyBase ?? null;
}

// 获取某省某年计发基数
export function getPensionBase(regionCode: string, year: number): number | null {
  const region = PENSION_BASE_MAP[regionCode];
  if (!region) return null;
  return region.data.find(d => d.year === year)?.monthlyBase ?? null;
}

// 全国平均（简单算术平均，不含深圳、湖北分档）
export function getNationalAvgPensionBase(year: number): number {
  const excluded = new Set(['shenzhen', 'hubei_tier2', 'hubei_tier3']);
  const relevant = PENSION_BASE_BY_REGION.filter(r => !excluded.has(r.regionCode));
  const vals = relevant.map(r => r.data.find(d => d.year === year)?.monthlyBase).filter(Boolean) as number[];
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

// 按2023年计发基数高低排序（返回主条目，不含分档子条目）
export function getPensionBaseRanking(year = 2023): Array<{ regionCode: string; regionName: string; monthlyBase: number }> {
  const excluded = new Set(['hubei_tier2', 'hubei_tier3']);
  return PENSION_BASE_BY_REGION
    .filter(r => !excluded.has(r.regionCode))
    .map(r => ({
      regionCode: r.regionCode,
      regionName: r.subRegion ? `${r.regionName}（${r.subRegion}）` : r.regionName,
      monthlyBase: r.data.find(d => d.year === year)?.monthlyBase ?? 0,
    }))
    .sort((a, b) => b.monthlyBase - a.monthlyBase);
}
