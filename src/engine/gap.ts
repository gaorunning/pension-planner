// 计算所需总资金（退休期年金现值）
export function calcTotalFundingNeeded(
  targetMonthly: number,
  yearsInRetirement: number,
  realReturn: number,
): number {
  const r = realReturn / 12;
  const n = yearsInRetirement * 12;
  if (r === 0) return targetMonthly * n;
  return targetMonthly * (1 - Math.pow(1 + r, -n)) / r;
}

// 计算目标月收入（退休时）
export function calcTarget(input: {
  monthlyIncome: number;
  replacementRate: number;
  inflationRate: number;
  yearsToRetirement: number;
}): { targetMonthlyToday: number; targetMonthlyAtRetirement: number } {
  const targetMonthlyToday = input.monthlyIncome * input.replacementRate;
  const targetMonthlyAtRetirement = targetMonthlyToday *
    Math.pow(1 + input.inflationRate, input.yearsToRetirement);
  return { targetMonthlyToday, targetMonthlyAtRetirement };
}

// 计算关闭缺口所需每月额外储蓄
export function calcRequiredMonthlySaving(
  gapPV: number,
  yearsToRetirement: number,
  nominalReturn: number,
): number {
  if (yearsToRetirement <= 0) return 0;
  const r = nominalReturn / 12;
  const n = yearsToRetirement * 12;
  if (r === 0) return gapPV / n;
  return gapPV * r / (Math.pow(1 + r, n) - 1);
}
