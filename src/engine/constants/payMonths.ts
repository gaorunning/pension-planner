// 计发月数表
export const PAY_MONTHS: Record<number, number> = {
  50: 195,
  51: 190,
  52: 185,
  53: 180,
  54: 175,
  55: 170,
  56: 164,
  57: 158,
  58: 152,
  59: 145,
  60: 139,
  61: 132,
  62: 125,
  63: 117,
  64: 109,
  65: 101,
  66: 93,
  67: 84,
  68: 75,
  69: 65,
  70: 56,
};

// 根据退休年龄获取计发月数
export function getPayMonths(retirementAge: number): number {
  if (PAY_MONTHS[retirementAge]) {
    return PAY_MONTHS[retirementAge];
  }
  // 线性插值
  if (retirementAge < 50) return 195;
  if (retirementAge > 70) return 56;
  // 简单的线性插值
  const ages = Object.keys(PAY_MONTHS).map(Number).sort((a, b) => a - b);
  let lower = 50;
  let upper = 70;
  for (const age of ages) {
    if (age <= retirementAge) lower = age;
    if (age >= retirementAge && upper === 70) upper = age;
  }
  if (lower === upper) return PAY_MONTHS[lower];
  const ratio = (retirementAge - lower) / (upper - lower);
  return Math.round(PAY_MONTHS[lower] - ratio * (PAY_MONTHS[lower] - PAY_MONTHS[upper]));
}

// 默认预期寿命
export const DEFAULT_LIFE_EXPECTANCY: Record<'male' | 'female', number> = {
  male: 80,
  female: 85,
};

// 风险偏好对应的资产配置
export const RISK_ALLOCATION = {
  conservative: { equityPct: 0.40, bondPct: 0.60, expectedReturn: 0.035 },
  moderate: { equityPct: 0.60, bondPct: 0.40, expectedReturn: 0.045 },
  aggressive: { equityPct: 0.80, bondPct: 0.20, expectedReturn: 0.055 },
} as const;
