import { UserInput, RetirementPlan, Pillar3Advice, AssetAllocation, YearlyDataPoint } from './types';
import { precompute } from './precompute';
import { calcPillar1 } from './pillar1';
import { calcPillar2 } from './pillar2';
import { calcRetirementPool, calcCommercialAnnuityMonthly } from './retirementPool';
import { calcTarget, calcTotalFundingNeeded, calcRequiredMonthlySaving } from './gap';
import { calcScenarios } from './scenarios';
import { RISK_ALLOCATION } from './constants/payMonths';

function calcYearlyData(
  input: UserInput,
  pre: ReturnType<typeof precompute>,
  retirementPool: ReturnType<typeof calcRetirementPool>
): YearlyDataPoint[] {
  const yearlyData: YearlyDataPoint[] = [];
  const yearsToRetirement = pre.yearsToRetirement;
  const yearsInRetirement = pre.yearsInRetirement;
  const totalYears = yearsToRetirement + yearsInRetirement;

  let poolBalance = input.dedicatedRetirementSavings + input.personalPensionCurrentBalance;
  let cumulativeContrib = input.dedicatedRetirementSavings + input.personalPensionCurrentBalance;

  const monthlyDedicated = input.monthlyDedicatedSaving;
  const personalPensionMonthly = input.personalPensionAnnual / 12;
  const accumReturn = pre.nominalReturn / 12;
  const decumReturn = pre.nominalReturn * 0.7 / 12;

  for (let i = 0; i <= totalYears; i++) {
    const age = input.currentAge + i;
    const isRetired = age >= input.retirementAge;

    if (i > 0) {
      if (!isRetired) {
        // 积累期：每月定投 + 复利
        for (let m = 0; m < 12; m++) {
          poolBalance = poolBalance * (1 + accumReturn) + monthlyDedicated + personalPensionMonthly;
          cumulativeContrib = cumulativeContrib + monthlyDedicated + personalPensionMonthly;
        }
      } else {
        // 提取期：每月提取 + 余额继续增值
        const monthlyWithdrawal = retirementPool.monthlyWithdrawal;
        for (let m = 0; m < 12; m++) {
          poolBalance = poolBalance * (1 + decumReturn) - monthlyWithdrawal;
          if (poolBalance < 0) poolBalance = 0;
        }
      }
    }

    yearlyData.push({
      year: i,
      age,
      isRetired,
      poolBalance,
      cumulativeContrib,
    });
  }

  return yearlyData;
}

export function calculatePlan(input: UserInput): RetirementPlan {
  const pre = precompute(input);
  const pillar1 = calcPillar1(input, pre.totalContributionYears);
  const pillar2 = calcPillar2(input, pre.yearsToRetirement);
  const commercialAnnuity = calcCommercialAnnuityMonthly(input);
  const retirementPool = calcRetirementPool(input, pre.yearsToRetirement, pre.nominalReturn);

  const { targetMonthlyToday, targetMonthlyAtRetirement } = calcTarget({
    monthlyIncome: input.monthlyIncome,
    replacementRate: input.replacementRate,
    inflationRate: input.inflationRate,
    yearsToRetirement: pre.yearsToRetirement,
  });

  const totalFundingNeeded = calcTotalFundingNeeded(
    targetMonthlyAtRetirement,
    pre.yearsInRetirement,
    pre.realReturn,
  );

  const fixedIncomeMonthly = pillar1.total + pillar2 + commercialAnnuity;
  const assetPoolMonthly = retirementPool.monthlyWithdrawal;
  const totalMonthlyIncome = fixedIncomeMonthly + assetPoolMonthly;

  // 将收入折现到今天以计算缺口
  const totalMonthlyIncomeToday = totalMonthlyIncome /
    Math.pow(1 + input.inflationRate, pre.yearsToRetirement);
  const monthlyGap = Math.max(0, targetMonthlyToday - totalMonthlyIncomeToday);

  // 计算总缺口现值
  const fixedIncomePV = calcTotalFundingNeeded(
    fixedIncomeMonthly,
    pre.yearsInRetirement,
    pre.realReturn,
  );
  const totalGapPV = Math.max(0, totalFundingNeeded - fixedIncomePV - retirementPool.balanceAtRetirement);
  const requiredMonthlySaving = calcRequiredMonthlySaving(totalGapPV, pre.yearsToRetirement, pre.nominalReturn);

  // 个人养老金账户建议
  const pillar3Advice: Pillar3Advice = {
    annualLimit: 12000,
    currentAnnualContrib: input.personalPensionAnnual,
    gap: Math.max(0, 12000 - input.personalPensionAnnual),
    taxSaving: Math.max(0, 12000 - input.personalPensionAnnual) * 0.20, // 假设边际税率20%
    recommendation: input.personalPensionAnnual < 12000
      ? '建议充分利用个人养老金账户每年12000元的税前扣除额度'
      : '已充分利用个人养老金账户额度',
  };

  // 资产配置建议
  const assetAllocation: AssetAllocation = {
    ...RISK_ALLOCATION[input.riskProfile],
    glidePathNote: pre.allocation.glidePathNote,
  };

  // 情景分析
  const scenarios = calcScenarios(input, pre.nominalReturn, input.inflationRate);

  // 充足率计算
  const adequacyRatio = totalMonthlyIncome / targetMonthlyAtRetirement;
  let adequacyLevel: 'critical' | 'warning' | 'adequate' | 'comfortable';
  if (adequacyRatio < 0.6) adequacyLevel = 'critical';
  else if (adequacyRatio < 0.8) adequacyLevel = 'warning';
  else if (adequacyRatio < 1.0) adequacyLevel = 'adequate';
  else adequacyLevel = 'comfortable';

  // 年度数据（用于图表）
  const yearlyData = calcYearlyData(input, pre, retirementPool);

  return {
    yearsToRetirement: pre.yearsToRetirement,
    yearsInRetirement: pre.yearsInRetirement,
    expectedReturn: pre.nominalReturn,
    realReturnRate: pre.realReturn,
    allocation: pre.allocation,

    targetMonthlyToday,
    targetMonthlyAtRetirement,
    totalFundingNeeded,

    pillar1Monthly: pillar1.total,
    pillar1Basic: pillar1.basicPension,
    pillar1Account: pillar1.accountPension,
    pillar2Monthly: pillar2,
    commercialAnnuityMonthly: commercialAnnuity,
    fixedIncomeMonthly,

    retirementPool,
    assetPoolMonthly,

    totalMonthlyIncome,
    monthlyGap,
    totalGapPV,

    requiredMonthlySaving,
    pillar3Advice,
    assetAllocation,

    scenarios,
    adequacyRatio,
    adequacyLevel,
    yearlyData,
  };
}

export * from './types';
export * from './constants/regions';
export * from './constants/payMonths';
