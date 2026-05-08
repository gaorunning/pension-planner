import { UserInput } from './types';
import { getPayMonths } from './constants/payMonths';

export interface Pillar1Result {
  basicPension: number;
  accountPension: number;
  total: number;
}

export function calcPillar1(
  input: UserInput,
  totalContributionYears: number,
  options?: { payMonthsAdjust?: number },
): Pillar1Result {
  const yearsToRetirement = Math.max(0, input.retirementAge - input.currentAge);

  // 退休时社平工资
  const socialWageAtRetirement = input.avgSocialWage *
    Math.pow(1 + input.socialWageGrowthRate, yearsToRetirement);

  // 本人指数化月均缴费工资
  const indexedWage = socialWageAtRetirement * input.contributionRatio;

  // 基础养老金
  const basicPension = (socialWageAtRetirement + indexedWage) / 2 *
    totalContributionYears * 0.01;

  // 个人账户余额计算
  const personalAccountRate = 0.04; // 保守估计记账利率
  const currentMonthlyContrib = input.avgSocialWage * input.contributionRatio * 0.08;

  // 历史余额：优先使用用户填入的实际余额，否则按缴费年限估算
  let pastAccountBalanceAtRetirement: number;
  if (input.socialInsuranceAccountBalance && input.socialInsuranceAccountBalance > 0) {
    pastAccountBalanceAtRetirement = input.socialInsuranceAccountBalance *
      Math.pow(1 + personalAccountRate, yearsToRetirement);
  } else {
    const pastYears = input.contributionYears;
    const pastAccountBalance = currentMonthlyContrib * 12 *
      (Math.pow(1 + personalAccountRate, pastYears) - 1) / personalAccountRate;
    pastAccountBalanceAtRetirement = pastAccountBalance *
      Math.pow(1 + personalAccountRate, yearsToRetirement);
  }

  // 未来缴费积累
  const futureAccountBalance = currentMonthlyContrib * 12 *
    (Math.pow(1 + personalAccountRate, yearsToRetirement) - 1) / personalAccountRate;

  const totalAccountBalance = pastAccountBalanceAtRetirement + futureAccountBalance;

  // 计发月数（支持情景分析中的政策风险调整）
  const payMonths = getPayMonths(input.retirementAge) + (options?.payMonthsAdjust ?? 0);
  const accountPension = totalAccountBalance / payMonths;

  return {
    basicPension,
    accountPension,
    total: basicPension + accountPension,
  };
}
