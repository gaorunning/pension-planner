import { UserInput, RetirementScenario } from './types';
import { precompute } from './precompute';
import { calcPillar1 } from './pillar1';
import { calcPillar2 } from './pillar2';
import { calcRetirementPool, calcCommercialAnnuityMonthly } from './retirementPool';
import { calcTarget, calcTotalFundingNeeded } from './gap';

export function calcScenarios(
  input: UserInput,
  baseNominalReturn: number,
  baseInflation: number,
): RetirementScenario[] {
  const scenarios = [
    { name: '乐观' as const, returnDelta: 0.015, inflationDelta: -0.01 },
    { name: '基准' as const, returnDelta: 0, inflationDelta: 0 },
    { name: '悲观' as const, returnDelta: -0.015, inflationDelta: 0.01 },
  ];

  return scenarios.map(scenario => {
    const nominalReturn = baseNominalReturn + scenario.returnDelta;
    const inflation = baseInflation + scenario.inflationDelta;

    // 创建临时 input 用于计算
    const scenarioInput = { ...input };
    scenarioInput.inflationRate = inflation;

    const pre = precompute(scenarioInput);
    const pillar1 = calcPillar1(scenarioInput, pre.totalContributionYears);
    const pillar2 = calcPillar2(scenarioInput, pre.yearsToRetirement);
    const commercialAnnuity = calcCommercialAnnuityMonthly(scenarioInput);
    const pool = calcRetirementPool(scenarioInput, pre.yearsToRetirement, nominalReturn);

    const { targetMonthlyToday, targetMonthlyAtRetirement } = calcTarget({
      monthlyIncome: scenarioInput.monthlyIncome,
      replacementRate: scenarioInput.replacementRate,
      inflationRate: inflation,
      yearsToRetirement: pre.yearsToRetirement,
    });

    const fixedIncomeMonthly = pillar1.total + pillar2 + commercialAnnuity;
    const totalMonthlyIncome = fixedIncomeMonthly + pool.monthlyWithdrawal;
    const monthlyGap = Math.max(0, targetMonthlyToday - totalMonthlyIncome /
      Math.pow(1 + inflation, pre.yearsToRetirement));

    const totalFundingNeeded = calcTotalFundingNeeded(
      targetMonthlyAtRetirement,
      pre.yearsInRetirement,
      (1 + nominalReturn) / (1 + inflation) - 1,
    );

    const fixedIncomePV = calcTotalFundingNeeded(
      fixedIncomeMonthly,
      pre.yearsInRetirement,
      (1 + nominalReturn) / (1 + inflation) - 1,
    );

    const totalGapPV = Math.max(0, totalFundingNeeded - fixedIncomePV - pool.balanceAtRetirement);

    const adequacyRatio = totalMonthlyIncome / (targetMonthlyAtRetirement);

    return {
      name: scenario.name,
      returnAssumption: nominalReturn,
      inflationAssumption: inflation,
      monthlyGap,
      totalGapPV,
      adequacyRatio: Math.min(2, adequacyRatio),
    };
  });
}
