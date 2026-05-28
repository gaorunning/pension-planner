import { UserInput, RetirementPlan, Pillar3Advice, AssetAllocation, YearlyDataPoint, AnnualCashFlow, AnnualCashFlowYear } from './types';
import { precompute } from './precompute';
import { calcPillar1 } from './pillar1';
import { calcPillar2 } from './pillar2';
import { calcRetirementPool, calcCommercialAnnuityMonthly } from './retirementPool';
import { calcTarget, calcTotalFundingNeeded, calcRequiredMonthlySaving, calcExpenseBasedTarget } from './gap';
import { calcScenarios } from './scenarios';
import { RISK_ALLOCATION } from './constants/payMonths';

function calcAnnualCashFlow(input: UserInput, requiredMonthlySaving: number): AnnualCashFlow {
  // 当前年度各项月均支出
  const personalPensionMonthly = input.personalPensionAnnual / 12;
  const dedicatedSavingMonthly = input.monthlyDedicatedSaving;

  // 当前活跃的商业险保单（当前年龄在缴费期内）
  const activeInsurancePremiumMonthly = input.commercialInsurances
    .filter(c =>
      input.currentAge >= c.premiumStartAge &&
      input.currentAge < c.premiumStartAge + c.premiumYears,
    )
    .reduce((sum, c) => sum + c.annualPremium / 12, 0);

  // 社保个人缴费（参考项，已从工资代扣，8% × 缴费基数）
  const socialSecurityPersonalMonthly = input.avgSocialWage * input.contributionRatio * 0.08;
  const monthlyIncome = Math.max(1, input.monthlyIncome);

  const totalCommittedMonthly = personalPensionMonthly + activeInsurancePremiumMonthly + dedicatedSavingMonthly;
  const committedRatioOfIncome = totalCommittedMonthly / monthlyIncome;

  const totalRequiredMonthly = totalCommittedMonthly + requiredMonthlySaving;
  const totalRequiredRatioOfIncome = totalRequiredMonthly / monthlyIncome;

  // 逐年负担（从当前年龄到退休）
  const yearsToRetirement = Math.max(0, input.retirementAge - input.currentAge);
  const yearlyBurden: AnnualCashFlowYear[] = [];

  for (let i = 0; i <= yearsToRetirement; i++) {
    const age = input.currentAge + i;
    const isRetired = age >= input.retirementAge;

    const insurancePremium = isRetired ? 0 : input.commercialInsurances
      .filter(c => age >= c.premiumStartAge && age < c.premiumStartAge + c.premiumYears)
      .reduce((sum, c) => sum + c.annualPremium / 12, 0);

    const pp = isRetired ? 0 : personalPensionMonthly;
    const ds = isRetired ? 0 : dedicatedSavingMonthly;

    yearlyBurden.push({
      age,
      insurancePremium,
      personalPension: pp,
      dedicatedSaving: ds,
      total: insurancePremium + pp + ds,
    });
  }

  return {
    personalPensionMonthly,
    activeInsurancePremiumMonthly,
    dedicatedSavingMonthly,
    socialSecurityPersonalMonthly,
    totalCommittedMonthly,
    committedRatioOfIncome,
    requiredAdditionalMonthly: requiredMonthlySaving,
    totalRequiredMonthly,
    totalRequiredRatioOfIncome,
    yearlyBurden,
  };
}

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
  const monthlyIncome = Math.max(1, input.monthlyIncome);
  const pre = precompute(input);
  const pillar1 = calcPillar1(input, pre.totalContributionYears);
  const pillar2 = calcPillar2(input, pre.yearsToRetirement);
  const retirementPool = calcRetirementPool(input, pre.yearsToRetirement, pre.nominalReturn);
  const commercialAnnuity = calcCommercialAnnuityMonthly(input, retirementPool.expectedReturnDecum);

  const fixedIncomeMonthly = pillar1.total + pillar2 + commercialAnnuity;
  const assetPoolMonthly = retirementPool.monthlyWithdrawal;
  const totalMonthlyIncome = fixedIncomeMonthly + assetPoolMonthly;

  let targetMonthlyToday: number;
  let targetMonthlyAtRetirement: number;
  let totalFundingNeeded: number;
  let fixedIncomePV: number;

  if (input.targetMode === 'expense_based') {
    // 费用测算模式：分三段计算（基本生活费 + 护工 + 养老院）
    const expResult = calcExpenseBasedTarget(
      {
        monthlyBasicExpense: input.monthlyBasicExpense,
        monthlyCaregiverCost: input.monthlyCaregiverCost,
        monthlyNursingHomeCost: input.monthlyNursingHomeCost,
        currentAge: input.currentAge,
        retirementAge: input.retirementAge,
        lifeExpectancy: input.lifeExpectancy,
      },
      pre.nominalReturn,
    );
    targetMonthlyToday = expResult.targetMonthlyToday;
    targetMonthlyAtRetirement = expResult.targetMonthlyAtRetirement;
    totalFundingNeeded = expResult.totalFundingNeeded;
    // 名义收益率下固定收入的现值（与 totalFundingNeeded 同口径）
    fixedIncomePV = calcTotalFundingNeeded(fixedIncomeMonthly, pre.yearsInRetirement, pre.nominalReturn);
  } else {
    // 替代率模式（默认）
    const target = calcTarget({
      monthlyIncome,
      replacementRate: input.replacementRate,
      inflationRate: input.inflationRate,
      wageGrowthRate: input.socialWageGrowthRate,
      yearsToRetirement: pre.yearsToRetirement,
    });
    targetMonthlyToday = target.targetMonthlyToday;
    targetMonthlyAtRetirement = target.targetMonthlyAtRetirement;
    totalFundingNeeded = calcTotalFundingNeeded(
      targetMonthlyAtRetirement,
      pre.yearsInRetirement,
      pre.realReturn,
    );
    fixedIncomePV = calcTotalFundingNeeded(fixedIncomeMonthly, pre.yearsInRetirement, pre.realReturn);
  }

  // 将收入折现到今天以计算缺口（以通胀率折现）
  const totalMonthlyIncomeToday = totalMonthlyIncome /
    Math.pow(1 + input.inflationRate, pre.yearsToRetirement);
  const monthlyGap = Math.max(0, targetMonthlyToday - totalMonthlyIncomeToday);

  // 计算总缺口现值
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

  // 养老投入现金流
  const annualCashFlow = calcAnnualCashFlow(input, requiredMonthlySaving);

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
    annualCashFlow,
  };
}

export * from './types';
export * from './constants/regions';
export * from './constants/payMonths';
export { runMonteCarlo, defaultMCConfig, RETURN_PARAMS } from './monteCarlo';
