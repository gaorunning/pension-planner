import { UserInput, AssetAllocation } from './types';
import { RISK_ALLOCATION } from './constants/payMonths';

export interface PrecomputeResult {
  yearsToRetirement: number;
  yearsInRetirement: number;
  totalContributionYears: number;
  nominalReturn: number;
  realReturn: number;
  allocation: AssetAllocation;
}

export function precompute(input: UserInput): PrecomputeResult {
  const yearsToRetirement = Math.max(0, input.retirementAge - input.currentAge);
  const yearsInRetirement = Math.max(0, input.lifeExpectancy - input.retirementAge);
  const totalContributionYears = input.contributionYears + yearsToRetirement;

  const allocationMap = RISK_ALLOCATION;
  const risk = allocationMap[input.riskProfile];
  const nominalReturn = risk.expectedReturn;
  const realReturn = (1 + nominalReturn) / (1 + input.inflationRate) - 1;

  const allocation: AssetAllocation = {
    equityPct: risk.equityPct,
    bondPct: risk.bondPct,
    expectedReturn: risk.expectedReturn,
    glidePathNote: getGlidePathNote(input.currentAge, input.riskProfile),
  };

  return {
    yearsToRetirement,
    yearsInRetirement,
    totalContributionYears,
    nominalReturn,
    realReturn,
    allocation,
  };
}

function getGlidePathNote(currentAge: number, riskProfile: string): string {
  if (riskProfile === 'conservative') {
    return `当前${currentAge}岁，建议股债配置40/60。每5年向固收增配5%，退休时目标股债30/70。`;
  } else if (riskProfile === 'moderate') {
    return `当前${currentAge}岁，建议股债配置60/40。每5年向固收增配5%，退休时目标股债50/50。`;
  } else {
    return `当前${currentAge}岁，建议股债配置80/20。每5年向固收增配5%，退休时目标股债60/40。`;
  }
}
