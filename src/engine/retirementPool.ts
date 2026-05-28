import { UserInput, RetirementPool } from './types';

export function calcRetirementPool(
  input: UserInput,
  yearsToRetirement: number,
  nominalReturn: number,
): RetirementPool {
  const r_accum = nominalReturn / 12;
  const safeYearsToRetirement = Math.max(0, yearsToRetirement);
  const months_accum = safeYearsToRetirement * 12;

  // 1. 个人养老金账户
  const pensionReturnRate = input.personalPensionReturn ?? 0.04;
  const pensionR = pensionReturnRate / 12;
  const pensionCurrentBalance = input.personalPensionCurrentBalance > 0
    ? input.personalPensionCurrentBalance
    : input.personalPensionAnnual * input.personalPensionContribYears;

  const pensionFV = pensionCurrentBalance * Math.pow(1 + pensionReturnRate, safeYearsToRetirement) +
    (input.personalPensionAnnual / 12) *
    (Math.pow(1 + pensionR, months_accum) - 1) / pensionR;

  // 2. 用户指定的其他养老专项存量
  const dedicatedSavingsFV = input.dedicatedRetirementSavings *
    Math.pow(1 + nominalReturn, safeYearsToRetirement);

  // 3. 用户每月另外定投的养老专项
  let monthlyDedicatedFV = 0;
  if (input.monthlyDedicatedSaving > 0 && r_accum > 0) {
    monthlyDedicatedFV = input.monthlyDedicatedSaving *
      (Math.pow(1 + r_accum, months_accum) - 1) / r_accum;
  }

  // 4. 商业保险：一次性领取类型并入资金池（增长/折现到退休时点）
  const commercialSavingsFV = input.commercialInsurances
    .filter(c => c.benefitType === 'lump_sum')
    .reduce((sum, c) => {
      const yearsFromNow = c.benefitStartAge - input.currentAge;
      if (yearsFromNow <= safeYearsToRetirement) {
        // 领取时点在退休前：一次性金额从领取时增长到退休
        const yearsToGrow = safeYearsToRetirement - yearsFromNow;
        return sum + c.benefitAmount * Math.pow(1 + nominalReturn, yearsToGrow);
      } else {
        // 领取时点在退休后：折现到退休时点
        const yearsAfterRetirement = yearsFromNow - safeYearsToRetirement;
        return sum + c.benefitAmount / Math.pow(1 + nominalReturn, yearsAfterRetirement);
      }
    }, 0);

  const balanceAtRetirement = pensionFV + dedicatedSavingsFV + monthlyDedicatedFV + commercialSavingsFV;

  // 提取期：更保守的回报率
  const yearsInRetirement = Math.max(0, input.lifeExpectancy - input.retirementAge);
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

// 将每年领取型商业保险折算为覆盖整个退休期的等效月收入。
export function calcCommercialAnnuityMonthly(input: UserInput, annualDiscountRate = 0.03): number {
  const retirementMonths = Math.max(0, input.lifeExpectancy - input.retirementAge) * 12;
  if (retirementMonths <= 0) return 0;

  const monthlyDiscountRate = Math.max(0, annualDiscountRate) / 12;
  const discount = (month: number) =>
    monthlyDiscountRate > 0 ? Math.pow(1 + monthlyDiscountRate, month) : 1;

  const benefitPV = input.commercialInsurances
    .filter(c => c.benefitType === 'annual')
    .reduce((sum, c) => {
      const monthlyBenefit = c.benefitAmount / 12;
      const startMonth = Math.max(0, (c.benefitStartAge - input.retirementAge) * 12);
      const endMonth = c.benefitYears > 0
        ? Math.min(retirementMonths, startMonth + c.benefitYears * 12)
        : retirementMonths;

      if (monthlyBenefit <= 0 || startMonth >= retirementMonths || endMonth <= startMonth) {
        return sum;
      }

      let pv = 0;
      for (let month = startMonth; month < endMonth; month++) {
        pv += monthlyBenefit / discount(month);
      }
      return sum + pv;
    }, 0);

  if (benefitPV <= 0) return 0;
  if (monthlyDiscountRate === 0) return benefitPV / retirementMonths;

  const annuityFactor = (1 - Math.pow(1 + monthlyDiscountRate, -retirementMonths)) / monthlyDiscountRate;
  return benefitPV / annuityFactor;
}
