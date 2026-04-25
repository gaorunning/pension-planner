import { UserInput } from './types';
import { getPayMonths } from './constants/payMonths';

export interface Pillar1Result {
  basicPension: number;
  accountPension: number;
  total: number;
}

export function calcPillar1(input: UserInput, totalContributionYears: number): Pillar1Result {
  const yearsToRetirement = input.retirementAge - input.currentAge;

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

  // 历史缴费积累（简化处理：假设从22岁开始工作）
  const pastYears = input.contributionYears;
  // 历史缴费以当前社平工资估算，复利到退休
  const pastAccountBalance = currentMonthlyContrib * 12 *
    (Math.pow(1 + personalAccountRate, pastYears) - 1) / personalAccountRate;
  const pastAccountBalanceAtRetirement = pastAccountBalance *
    Math.pow(1 + personalAccountRate, yearsToRetirement);

  // 未来缴费积累
  const futureAccountBalance = currentMonthlyContrib * 12 *
    (Math.pow(1 + personalAccountRate, yearsToRetirement) - 1) / personalAccountRate;

  const totalAccountBalance = pastAccountBalanceAtRetirement + futureAccountBalance;

  // 计发月数
  const payMonths = getPayMonths(input.retirementAge);
  const accountPension = totalAccountBalance / payMonths;

  return {
    basicPension,
    accountPension,
    total: basicPension + accountPension,
  };
}
