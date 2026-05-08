import { UserInput, MCConfig } from './types';
import { calcPillar1 } from './pillar1';
import { calcPillar2 } from './pillar2';
import { calcCommercialAnnuityMonthly } from './retirementPool';

// 各风险偏好对应的年化回报均值和标准差
// σ 基于组合波动率：保守(40/60)≈5%，稳健(60/40)≈9%，积极(80/20)≈14%
export const RETURN_PARAMS: Record<string, { mean: number; sd: number }> = {
  conservative: { mean: 0.035, sd: 0.05 },
  moderate:     { mean: 0.045, sd: 0.09 },
  aggressive:   { mean: 0.055, sd: 0.14 },
};

export function defaultMCConfig(input: UserInput): MCConfig {
  const rp = RETURN_PARAMS[input.riskProfile];
  return {
    pensionReturnMean: 0.04,
    pensionReturnSd:   0.015,
    savingsReturnMean: rp.mean,
    savingsReturnSd:   rp.sd,
    wageGrowthMean:    input.socialWageGrowthRate,
    wageGrowthSd:      0.015,
    lifeExpMean:       input.lifeExpectancy,
    lifeExpSd:         5,
  };
}

// Box-Muller 正态随机数
function normalRandom(mean: number, sd: number): number {
  const u1 = Math.max(Math.random(), 1e-10);
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + sd * z;
}

function pctOf(sorted: number[], p: number): number {
  const idx = Math.min(Math.floor(p * sorted.length), sorted.length - 1);
  return sorted[idx];
}

function computePcts(arr: Float64Array) {
  const sorted = Array.from(arr).sort((a, b) => a - b);
  return {
    p10: pctOf(sorted, 0.10),
    p25: pctOf(sorted, 0.25),
    p50: pctOf(sorted, 0.50),
    p75: pctOf(sorted, 0.75),
    p90: pctOf(sorted, 0.90),
  };
}

export interface Percentiles {
  p10: number; p25: number; p50: number; p75: number; p90: number;
}

export interface MonteCarloYearBand extends Percentiles {
  age: number;
}

export interface MonteCarloResult {
  successRate: number;
  simulationCount: number;
  poolAtRetirement: Percentiles;
  monthlyIncomeAtRetirement: Percentiles;
  adequacyAtRetirement: Percentiles;
  yearlyBands: MonteCarloYearBand[];
}

export function runMonteCarlo(
  input: UserInput,
  config: MCConfig,
  N = 5000,
  extraMonthlyContrib = 0,
): MonteCarloResult {
  const yearsToRetirement = Math.max(0, input.retirementAge - input.currentAge);
  const totalContribYears = input.contributionYears + yearsToRetirement;
  const monthlyIncome = Math.max(1, input.monthlyIncome);

  // 确定性收入（不受市场波动影响）
  const pillar2Monthly    = calcPillar2(input, yearsToRetirement);
  const commercialMonthly = calcCommercialAnnuityMonthly(input, config.savingsReturnMean * 0.7);

  // 个人账户养老金：预计算固定值，避免用退休时高工资虚算缴费
  const baseP1 = calcPillar1(input, totalContribYears);
  const accountPensionBase = baseP1.accountPension;

  // 退休目标
  const targetAtRetirement = monthlyIncome * input.replacementRate *
    Math.pow(1 + input.inflationRate, yearsToRetirement);

  // 提取期回报（保守）
  const decumMean = config.savingsReturnMean * 0.7;

  const finalPools     = new Float64Array(N);
  const monthlyIncomes = new Float64Array(N);
  const adequacies     = new Float64Array(N);

  // 逐年资金池合并余额，用于扇形图
  const yearlyBals: Float64Array[] = Array.from(
    { length: yearsToRetirement + 1 },
    () => new Float64Array(N),
  );

  for (let sim = 0; sim < N; sim++) {
    // 寿命抽样（截断正态）
    const lifeExp = Math.max(
      input.retirementAge + 1,
      Math.min(105, Math.round(normalRandom(config.lifeExpMean, config.lifeExpSd))),
    );
    const yearsInRetirement = lifeExp - input.retirementAge;

    // 积累期：个人养老金和专项储蓄分开池，各自独立收益率
    let poolPension = input.personalPensionCurrentBalance;
    let poolSavings = input.dedicatedRetirementSavings;
    let socialWage  = input.avgSocialWage;
    yearlyBals[0][sim] = poolPension + poolSavings;

    const pensionAnnualContrib  = input.personalPensionAnnual;
    const savingsAnnualContrib  = (input.monthlyDedicatedSaving + extraMonthlyContrib) * 12;

    for (let y = 0; y < yearsToRetirement; y++) {
      const retP = normalRandom(config.pensionReturnMean, config.pensionReturnSd);
      const retS = normalRandom(config.savingsReturnMean, config.savingsReturnSd);

      poolPension = Math.max(0, poolPension * (1 + retP) + pensionAnnualContrib);
      poolSavings = Math.max(0, poolSavings * (1 + retS) + savingsAnnualContrib);

      const wg = Math.max(-0.10, normalRandom(config.wageGrowthMean, config.wageGrowthSd));
      socialWage *= (1 + wg);

      yearlyBals[y + 1][sim] = poolPension + poolSavings;
    }

    const pool = poolPension + poolSavings;

    // 基础养老金：用模拟的退休时社平工资
    const indexedWage  = socialWage * input.contributionRatio;
    const basicPension = (socialWage + indexedWage) / 2 * totalContribYears * 0.01;
    const p1Total      = basicPension + accountPensionBase;

    // 提取期：等额年金公式
    const r12    = decumMean / 12;
    const months = yearsInRetirement * 12;
    const withdrawal = (r12 > 0 && months > 0)
      ? pool * r12 / (1 - Math.pow(1 + r12, -months))
      : (months > 0 ? pool / months : 0);

    const totalMonthly = p1Total + pillar2Monthly + commercialMonthly + withdrawal;
    const adequacy     = totalMonthly / targetAtRetirement;

    finalPools[sim]     = pool;
    monthlyIncomes[sim] = totalMonthly;
    adequacies[sim]     = adequacy;
  }

  let ok = 0;
  for (let i = 0; i < N; i++) if (adequacies[i] >= 1.0) ok++;

  const yearlyBands: MonteCarloYearBand[] = yearlyBals.map((arr, y) => ({
    age: input.currentAge + y,
    ...computePcts(arr),
  }));

  return {
    successRate: ok / N,
    simulationCount: N,
    poolAtRetirement:          computePcts(finalPools),
    monthlyIncomeAtRetirement: computePcts(monthlyIncomes),
    adequacyAtRetirement:      computePcts(adequacies),
    yearlyBands,
  };
}
