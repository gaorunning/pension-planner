// 中国个人所得税税率表（综合所得，年度）
export const TAX_BRACKETS = [
  { min: 0, max: 36000, rate: 0.03, quickDeduction: 0 },
  { min: 36000, max: 144000, rate: 0.10, quickDeduction: 2520 },
  { min: 144000, max: 300000, rate: 0.20, quickDeduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, quickDeduction: 31920 },
  { min: 420000, max: 660000, rate: 0.30, quickDeduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, quickDeduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, quickDeduction: 181920 },
];

// 计算个人养老金节税额
// 原理：个人养老金缴费可税前扣除，相当于这部分钱按当前边际税率节税
export function calculateTaxSaving(annualContrib: number, currentAnnualIncome: number): number {
  // 简单估算：扣除6万免征额后，找到对应的边际税率
  const taxableIncome = Math.max(0, currentAnnualIncome - 60000);

  let marginalRate = 0.03; // 默认最低档
  for (const bracket of TAX_BRACKETS) {
    if (taxableIncome >= bracket.min && taxableIncome < bracket.max) {
      marginalRate = bracket.rate;
      break;
    }
    if (taxableIncome >= bracket.max) {
      marginalRate = bracket.rate;
    }
  }

  return annualContrib * marginalRate;
}

export default {
  TAX_BRACKETS,
  calculateTaxSaving,
};
