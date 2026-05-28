// ── 费用测算模式常量 ────────────────────────────────────────────────
// 来源：基础参数/未来费用预估.PNG
export const EXPENSE_INFLATION_RATES = {
  basic: 0.025,      // 生活成本：2%–3%，取中间值 2.5%
  caregiver: 0.05,   // 护工费用：4%–6%，取中间值 5%
  nursing: 0.055,    // 养老院费用：4.5%–6.5%，取中间值 5.5%
};

export const CAREGIVER_START_AGE = 75;
export const NURSING_HOME_START_AGE = 80;

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
// 替代率的标准定义是"退休收入 / 退休前最终工资"，因此目标应基于退休时的工资，
// 而非今日工资。个人工资增速与社平工资增速一致（wageGrowthRate）。
export function calcTarget(input: {
  monthlyIncome: number;
  replacementRate: number;
  inflationRate: number;
  wageGrowthRate: number;  // 社平工资增速（用作个人工资增速代理）
  yearsToRetirement: number;
}): { targetMonthlyToday: number; targetMonthlyAtRetirement: number } {
  const n = input.yearsToRetirement;
  // 退休时名义工资（含工资增长）
  const finalMonthlyIncome = input.monthlyIncome * Math.pow(1 + input.wageGrowthRate, n);
  // 退休时目标收入（名义值）= 最终工资 × 替代率
  const targetMonthlyAtRetirement = finalMonthlyIncome * input.replacementRate;
  // 折算为今日购买力（便于与当前收入比较）
  const targetMonthlyToday = targetMonthlyAtRetirement / Math.pow(1 + input.inflationRate, n);
  return { targetMonthlyToday, targetMonthlyAtRetirement };
}

// 费用测算模式：分三段计算退休总资金需求
// 第一段：退休到75岁（仅基本生活费）
// 第二段：75–80岁（基本生活费 + 护工费用）
// 第三段：80岁到预期寿命（基本生活费 + 护工费用 + 养老院费用）
export function calcExpenseBasedTarget(input: {
  monthlyBasicExpense: number;
  monthlyCaregiverCost: number;
  monthlyNursingHomeCost: number;
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
}, nominalReturn: number): {
  targetMonthlyToday: number;
  targetMonthlyAtRetirement: number;
  totalFundingNeeded: number;
  basicAtRetirement: number;
  caregiverAtStart: number;
  nursingAtStart: number;
} {
  const { basic: bifl, caregiver: cifl, nursing: nifl } = EXPENSE_INFLATION_RATES;
  const {
    currentAge, retirementAge, lifeExpectancy,
    monthlyBasicExpense, monthlyCaregiverCost, monthlyNursingHomeCost,
  } = input;

  const yearsToRetirement = retirementAge - currentAge;

  // 各阶段的实际起始年龄（考虑已退休超过阶段起始年龄的情况）
  const p1Start = retirementAge;
  const p1End   = Math.min(CAREGIVER_START_AGE, lifeExpectancy);
  const p2Start = Math.max(retirementAge, CAREGIVER_START_AGE);
  const p2End   = Math.min(NURSING_HOME_START_AGE, lifeExpectancy);
  const p3Start = Math.max(retirementAge, NURSING_HOME_START_AGE);
  const p3End   = lifeExpectancy;

  const phase1Years = Math.max(0, p1End - p1Start);
  const phase2Years = Math.max(0, p2End - p2Start);
  const phase3Years = Math.max(0, p3End - p3Start);

  // 各阶段起点对应的各项费用（名义值，按各自通胀率推算）
  const yearsToP1 = yearsToRetirement;
  const basicAtP1 = monthlyBasicExpense * Math.pow(1 + bifl, yearsToP1);

  const yearsToP2 = p2Start - currentAge;
  const basicAtP2      = monthlyBasicExpense   * Math.pow(1 + bifl, yearsToP2);
  const caregiverAtP2  = monthlyCaregiverCost  * Math.pow(1 + cifl, yearsToP2);

  const yearsToP3 = p3Start - currentAge;
  const basicAtP3      = monthlyBasicExpense      * Math.pow(1 + bifl, yearsToP3);
  const caregiverAtP3  = monthlyCaregiverCost     * Math.pow(1 + cifl, yearsToP3);
  const nursingAtP3    = monthlyNursingHomeCost   * Math.pow(1 + nifl, yearsToP3);

  // 各阶段年金现值（在各阶段起始点的 PV，使用名义收益率）
  const monthlyR = nominalReturn / 12;
  const annuityPV = (monthly: number, years: number) => {
    if (years <= 0 || monthly <= 0) return 0;
    const n = years * 12;
    if (monthlyR === 0) return monthly * n;
    return monthly * (1 - Math.pow(1 + monthlyR, -n)) / monthlyR;
  };

  const pv1AtStart = annuityPV(basicAtP1, phase1Years);
  const pv2AtStart = annuityPV(basicAtP2 + caregiverAtP2, phase2Years);
  const pv3AtStart = annuityPV(basicAtP3 + caregiverAtP3 + nursingAtP3, phase3Years);

  // 折现到退休日（月复利）
  const discountToRetirement = (pv: number, deferYears: number) =>
    deferYears <= 0 ? pv : pv / Math.pow(1 + monthlyR, deferYears * 12);

  const pv1 = discountToRetirement(pv1AtStart, 0);
  const pv2 = discountToRetirement(pv2AtStart, p2Start - retirementAge);
  const pv3 = discountToRetirement(pv3AtStart, p3Start - retirementAge);

  const totalFundingNeeded = pv1 + pv2 + pv3;

  return {
    targetMonthlyToday: monthlyBasicExpense,        // 今日基本生活费（显示用）
    targetMonthlyAtRetirement: basicAtP1,            // 退休时基本生活费名义值（第一段基准）
    totalFundingNeeded,
    basicAtRetirement: basicAtP1,
    caregiverAtStart: caregiverAtP2,
    nursingAtStart: nursingAtP3,
  };
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
