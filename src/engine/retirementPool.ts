import { UserInput, RetirementPool } from './types';

export function calcRetirementPool(
  input: UserInput,
  yearsToRetirement: number,
  nominalReturn: number,
): RetirementPool {
  const r_accum = nominalReturn / 12;
  const months_accum = yearsToRetirement * 12;

  // 1. 个人养老金账户（年均4%保守）
  const pensionR = 0.04 / 12;
  const pensionCurrentBalance = input.personalPensionCurrentBalance > 0
    ? input.personalPensionCurrentBalance
    : input.personalPensionAnnual * input.personalPensionContribYears;

  const pensionFV = pensionCurrentBalance * Math.pow(1 + 0.04, yearsToRetirement) +
    (input.personalPensionAnnual / 12) *
    (Math.pow(1 + pensionR, months_accum) - 1) / pensionR;

  // 2. 用户指定的其他养老专项存量
  const dedicatedSavingsFV = input.dedicatedRetirementSavings *
    Math.pow(1 + nominalReturn, yearsToRetirement);

  // 3. 用户每月另外定投的养老专项
  let monthlyDedicatedFV = 0;
  if (input.monthlyDedicatedSaving > 0 && r_accum > 0) {
    monthlyDedicatedFV = input.monthlyDedicatedSaving *
      (Math.pow(1 + r_accum, months_accum) - 1) / r_accum;
  }

  // 4. 储蓄型/分红型商业保险预估到期价值
  const commercialSavingsFV = input.commercialAnnuities
    .filter(a => a.type !== 'annuity_insurance')
    .reduce((sum, a) => sum + (a.estimatedTotalValue || 0), 0);

  const balanceAtRetirement = pensionFV + dedicatedSavingsFV + monthlyDedicatedFV + commercialSavingsFV;

  // 提取期：更保守的回报率
  const yearsInRetirement = input.lifeExpectancy - input.retirementAge;
  const months_decum = yearsInRetirement * 12;
  const nominalReturnDecum = nominalReturn * 0.7;
  const r_decum = nominalReturnDecum / 12;

  // 年金等额提取公式
  let monthlyWithdrawal = 0;
  if (r_decum > 0 && months_decum > 0) {
    monthlyWithdrawal = balanceAtRetirement * r_decum /
      (1 - Math.pow(1 + r_decum, -months_decum));
  }

  const currentBalance = input.dedicatedRetirementSavings +
    input.personalPensionCurrentBalance +
    input.personalPensionAnnual;

  return {
    currentBalance,
    monthlyContrib: input.personalPensionAnnual / 12 + input.monthlyDedicatedSaving,
    expectedReturnAccum: nominalReturn,
    balanceAtRetirement,
    expectedReturnDecum: nominalReturnDecum,
    monthlyWithdrawal,
    depletionAge: input.lifeExpectancy,
    personalPensionFV: pensionFV,
    dedicatedSavingsFV,
    monthlyDedicatedFV,
    commercialSavingsFV,
  };
}

// 计算商业年金险（固定月收入）
export function calcCommercialAnnuityMonthly(input: UserInput): number {
  return input.commercialAnnuities
    .filter(a => a.type === 'annuity_insurance' && a.policyEndAge <= input.retirementAge)
    .reduce((sum, a) => sum + (a.monthlyBenefit || 0), 0);
}
