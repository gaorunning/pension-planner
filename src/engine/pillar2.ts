import { UserInput } from './types';
import { getPayMonths } from './constants/payMonths';

export function calcPillar2(input: UserInput, yearsToRetirement: number): number {
  if (!input.hasEnterpriseAnnuity) return 0;
  const safeYearsToRetirement = Math.max(0, yearsToRetirement);

  // 企业年金在退休时的总额
  const annuityReturn = 0.055; // 企业年金默认回报率
  const annuityFV = input.annuityMonthly * 12 *
    (Math.pow(1 + annuityReturn, safeYearsToRetirement) - 1) / annuityReturn;

  // 退休后按月领取
  const payMonths = getPayMonths(input.retirementAge);
  return annuityFV / payMonths;
}
