import { UserInput, RetirementScenario } from './types';
import { precompute } from './precompute';
import { calcPillar1 } from './pillar1';
import { calcPillar2 } from './pillar2';
import { calcRetirementPool, calcCommercialAnnuityMonthly } from './retirementPool';
import { calcTarget, calcTotalFundingNeeded, calcExpenseBasedTarget } from './gap';

export function calcScenarios(
  input: UserInput,
  baseNominalReturn: number,
  baseInflation: number,
): RetirementScenario[] {
  const scenarios = [
    { name: '乐观' as const, returnDelta: 0.015, inflationDelta: -0.01, wageDelta: 0.01,  payMonthsAdjust: -12 },
    { name: '基准' as const, returnDelta: 0,      inflationDelta: 0,     wageDelta: 0,     payMonthsAdjust: 0 },
    { name: '悲观' as const, returnDelta: -0.015, inflationDelta: 0.01,  wageDelta: -0.01, payMonthsAdjust: 24 },
  ];

  return scenarios.map(scenario => {
    const nominalReturn = baseNominalReturn + scenario.returnDelta;
    const inflation = baseInflation + scenario.inflationDelta;

    // 创建临时 input 用于计算
    const scenarioInput = { ...input };
    scenarioInput.inflationRate = inflation;
    scenarioInput.socialWageGrowthRate = input.socialWageGrowthRate + scenario.wageDelta;

    const pre = precompute(scenarioInput);
    const pillar1 = calcPillar1(scenarioInput, pre.totalContributionYears,
      { payMonthsAdjust: scenario.payMonthsAdjust });
    const pillar2 = calcPillar2(scenarioInput, pre.yearsToRetirement);
    const pool = calcRetirementPool(scenarioInput, pre.yearsToRetirement, nominalReturn);
    const commercialAnnuity = calcCommercialAnnuityMonthly(scenarioInput, pool.expectedReturnDecum);

    let targetMonthlyToday: number;
    let targetMonthlyAtRetirement: number;
    let totalFundingNeeded: number;
    let fixedIncomePV: number;

    const realReturn = (1 + nominalReturn) / (1 + inflation) - 1;
    const fixedIncomeMonthly = pillar1.total + pillar2 + commercialAnnuity;
    const totalMonthlyIncome = fixedIncomeMonthly + pool.monthlyWithdrawal;

    if (input.targetMode === 'expense_based') {
      const expResult = calcExpenseBasedTarget(
        {
          monthlyBasicExpense: scenarioInput.monthlyBasicExpense,
          monthlyCaregiverCost: scenarioInput.monthlyCaregiverCost,
          monthlyNursingHomeCost: scenarioInput.monthlyNursingHomeCost,
          currentAge: scenarioInput.currentAge,
          retirementAge: scenarioInput.retirementAge,
          lifeExpectancy: scenarioInput.lifeExpectancy,
        },
        nominalReturn,
      );
      targetMonthlyToday = expResult.targetMonthlyToday;
      targetMonthlyAtRetirement = expResult.targetMonthlyAtRetirement;
      totalFundingNeeded = expResult.totalFundingNeeded;
      fixedIncomePV = calcTotalFundingNeeded(fixedIncomeMonthly, pre.yearsInRetirement, nominalReturn);
    } else {
      const target = calcTarget({
        monthlyIncome: scenarioInput.monthlyIncome,
        replacementRate: scenarioInput.replacementRate,
        inflationRate: inflation,
        wageGrowthRate: scenarioInput.socialWageGrowthRate,
        yearsToRetirement: pre.yearsToRetirement,
      });
      targetMonthlyToday = target.targetMonthlyToday;
      targetMonthlyAtRetirement = target.targetMonthlyAtRetirement;
      totalFundingNeeded = calcTotalFundingNeeded(targetMonthlyAtRetirement, pre.yearsInRetirement, realReturn);
      fixedIncomePV = calcTotalFundingNeeded(fixedIncomeMonthly, pre.yearsInRetirement, realReturn);
    }

    const monthlyGap = Math.max(0, targetMonthlyToday - totalMonthlyIncome /
      Math.pow(1 + inflation, pre.yearsToRetirement));

    const totalGapPV = Math.max(0, totalFundingNeeded - fixedIncomePV - pool.balanceAtRetirement);

    const adequacyRatio = totalMonthlyIncome / targetMonthlyAtRetirement;

    return {
      name: scenario.name,
      returnAssumption: nominalReturn,
      inflationAssumption: inflation,
      wageGrowthAssumption: scenarioInput.socialWageGrowthRate,
      payMonthsAdjust: scenario.payMonthsAdjust,
      monthlyGap,
      totalGapPV,
      adequacyRatio: Math.min(2, adequacyRatio),
    };
  });
}
