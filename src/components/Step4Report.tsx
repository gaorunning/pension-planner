import { useState, useMemo } from 'react';
import { UserInput, calculatePlan } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { LifetimeCashFlowChart } from './charts/LifetimeCashFlowChart';
import { AlertTriangle, CheckCircle2, Target, Wallet, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { ALL_WAGE_HISTORIES, INFLATION_HISTORY, SOCIAL_INSURANCE_INTEREST_HISTORY } from '@/engine/constants';
import { getPayMonths } from '@/engine/constants/payMonths';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts';

interface Step4ReportProps {
  input: UserInput;
}

// ── Module-level: historical baseline rates (computed once) ────────
const nationalWageData = ALL_WAGE_HISTORIES['national']?.data ?? [];
const wage2019 = nationalWageData.find(d => d.year === 2019)?.avgMonthlyWage ?? 7542;
const wage2024 = nationalWageData.find(d => d.year === 2024)?.avgMonthlyWage ?? 10343;
const wageCAGR5 = wage2019 > 0 ? (Math.pow(wage2024 / wage2019, 1 / 5) - 1) : 0.065;
const infData = INFLATION_HISTORY.filter(d => d.year >= 2020 && d.year <= 2024);
const inflAvg5 = infData.length > 0 ? infData.reduce((s, d) => s + d.cpi, 0) / infData.length : 0.013;
const siData = SOCIAL_INSURANCE_INTEREST_HISTORY.filter(d => d.year >= 2020 && d.year <= 2024);
const siRateAvg5 = siData.length > 0 ? siData.reduce((s, d) => s + d.rate, 0) / siData.length : 0.051;
const RISK_RETURNS: Record<string, number> = { conservative: 0.035, moderate: 0.045, aggressive: 0.055 };

// ── Slider component ──────────────────────────────────────────────
interface SliderRowProps {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; formatValue: (v: number) => string;
}
function SliderRow({ label, value, min, max, step, onChange, formatValue }: SliderRowProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-36 shrink-0">
        <p className="text-xs font-medium text-gray-600">{label}</p>
        <p className="text-base font-bold text-primary">{formatValue(value)}</p>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-primary h-1.5" />
      <div className="w-20 text-right text-xs text-muted-foreground">
        {formatValue(min)}–{formatValue(max)}
      </div>
    </div>
  );
}

// ── Tooltip formatter for recharts ────────────────────────────────
const fmt万 = (v: number) =>
  v >= 10000 ? `${(v / 10000).toFixed(1)}万` : `${Math.round(v).toLocaleString()}`;

// ── Main component ────────────────────────────────────────────────
export function Step4Report({ input }: Step4ReportProps) {

  // ── Slider state (initialised to historical baseline rates) ───
  const baseSliders = useMemo(() => ({
    socialWageGrowthRate: wageCAGR5,
    socialInsuranceRate: siRateAvg5,
    personalPensionReturn: 0.04,
    savingsReturn: RISK_RETURNS[input.riskProfile],
    inflationRate: inflAvg5,
  }), [input.riskProfile]);

  const [sliders, setSliders] = useState(baseSliders);
  const [calcExpanded, setCalcExpanded] = useState(false);

  const updateSlider = (key: keyof typeof sliders) => (v: number) =>
    setSliders(prev => ({ ...prev, [key]: v }));

  // ── Historical baseline plan (matches Step 3 displayed parameters) ──
  // This is the "truth" that all headline numbers are based on.
  const historicalInput = useMemo(() => ({
    ...input,
    socialWageGrowthRate: wageCAGR5,
    socialInsuranceRate: siRateAvg5,
    personalPensionReturn: 0.04,
    savingsReturn: RISK_RETURNS[input.riskProfile],
    inflationRate: inflAvg5,
  }), [input]);

  const basePlan = useMemo(() => calculatePlan(historicalInput), [historicalInput]);

  // ── Slider-adjusted plan (for sensitivity analysis) ───────────
  const interactiveInput = useMemo(() => ({
    ...input,
    socialWageGrowthRate: sliders.socialWageGrowthRate,
    socialInsuranceRate: sliders.socialInsuranceRate,
    personalPensionReturn: sliders.personalPensionReturn,
    savingsReturn: sliders.savingsReturn,
    inflationRate: sliders.inflationRate,
  }), [input, sliders]);

  const interactivePlan = useMemo(() => calculatePlan(interactiveInput), [interactiveInput]);

  // ── Derived values (use basePlan = historical rates) ──────────
  const payMonths = getPayMonths(input.retirementAge);
  const r = basePlan.expectedReturn;
  const n = basePlan.yearsToRetirement;

  // Enterprise annuity future value at retirement (risk-profile return, not rate-slider)
  const annuityFV = r > 0 && n > 0 && input.hasEnterpriseAnnuity && input.annuityMonthly > 0
    ? input.annuityMonthly * 12 * (Math.pow(1 + r, n) - 1) / r
    : 0;

  // Social insurance personal account balance at retirement (= monthly pension × payMonths)
  const pillar1AccountAtRetirement = basePlan.pillar1Account * payMonths;

  // ── Pool bar chart data (by pillar, using basePlan) ───────────
  const poolChartData = [
    {
      name: '今日',
      '第一支柱': Math.round(input.socialInsuranceAccountBalance ?? 0),
      '第二支柱': 0,
      '第三支柱': Math.round(input.personalPensionCurrentBalance),
      '其他储蓄': Math.round(input.dedicatedRetirementSavings),
    },
    {
      name: '退休时',
      '第一支柱': Math.round(pillar1AccountAtRetirement),
      '第二支柱': Math.round(annuityFV),
      '第三支柱': Math.round(basePlan.retirementPool.personalPensionFV),
      '其他储蓄': Math.round(basePlan.retirementPool.dedicatedSavingsFV + basePlan.retirementPool.monthlyDedicatedFV),
    },
  ];
  const poolTotal今 = poolChartData[0]['第一支柱'] + poolChartData[0]['第二支柱'] + poolChartData[0]['第三支柱'] + poolChartData[0]['其他储蓄'];
  const poolTotal退 = poolChartData[1]['第一支柱'] + poolChartData[1]['第二支柱'] + poolChartData[1]['第三支柱'] + poolChartData[1]['其他储蓄'];

  const PILLAR_COLORS = {
    '第一支柱': '#3b82f6',
    '第二支柱': '#0d9488',
    '第三支柱': '#7c3aed',
    '其他储蓄': '#f59e0b',
  };

  // ── Retirement income breakdown (retirement year 1, basePlan) ──
  const retirementIncomeItems = [
    { label: '社保基础养老金', amount: basePlan.pillar1Basic, color: '#2563eb', pillar: '第一支柱' },
    { label: '社保个人账户', amount: basePlan.pillar1Account, color: '#60a5fa', pillar: '第一支柱' },
    { label: '企业年金', amount: basePlan.pillar2Monthly, color: '#0d9488', pillar: '第二支柱' },
    { label: '商业年金', amount: basePlan.commercialAnnuityMonthly, color: '#7c3aed', pillar: '第三支柱' },
    { label: '资金池提取', amount: basePlan.retirementPool.monthlyWithdrawal, color: '#f59e0b', pillar: '其他' },
  ].filter(x => x.amount > 0);

  const totalRetirementIncome = retirementIncomeItems.reduce((s, x) => s + x.amount, 0);
  const incomeMaxAmount = Math.max(totalRetirementIncome, basePlan.targetMonthlyAtRetirement) * 1.1;

  // ── Calculation process values (for expandable section) ──────
  // Use the same rates as basePlan for consistency
  const socialWageAtRetirement = input.avgSocialWage * Math.pow(1 + wageCAGR5, n);
  const indexedWage = socialWageAtRetirement * input.contributionRatio;
  const totalContribYears = input.contributionYears + n;
  const monthlyContrib社保 = input.avgSocialWage * input.contributionRatio * 0.08;

  // ── Annual detail table (basePlan) ─────────────────────────────
  const annualTableData = useMemo(() => {
    return basePlan.yearlyData.map(d => {
      const burden = basePlan.annualCashFlow.yearlyBurden.find(b => b.age === d.age);
      const isRetired = d.age >= input.retirementAge;
      return {
        age: d.age,
        isRetired,
        poolBalance: d.poolBalance,
        annualContrib: isRetired ? 0 : (burden?.total ?? 0) * 12,
        annualIncome: isRetired
          ? (basePlan.pillar1Monthly + basePlan.pillar2Monthly + basePlan.commercialAnnuityMonthly + basePlan.retirementPool.monthlyWithdrawal) * 12
          : 0,
      };
    });
  }, [basePlan, input.retirementAge]);

  // ── Adequacy helpers (basePlan) ──────────────────────────────
  const getAdequacyColor = (ratio: number) =>
    ratio < 0.6 ? 'text-red-600' : ratio < 0.8 ? 'text-yellow-600' : ratio < 1.0 ? 'text-blue-600' : 'text-green-600';
  const getAdequacyBg = (ratio: number) =>
    ratio < 0.6 ? 'bg-red-50' : ratio < 0.8 ? 'bg-yellow-50' : ratio < 1.0 ? 'bg-blue-50' : 'bg-green-50';
  const adequacyLabel = { critical: '严重不足', warning: '需要补充', adequate: '基本充足', comfortable: '准备充分' }[basePlan.adequacyLevel];

  // Discount retirement income to today's purchasing power (using historical inflation)
  const pv = (v: number) => v / Math.pow(1 + inflAvg5, n);
  const totalIncomeToday = pv(basePlan.pillar1Monthly) + pv(basePlan.pillar2Monthly) + pv(basePlan.commercialAnnuityMonthly) + pv(basePlan.assetPoolMonthly);
  const pctFmt = (v: number) => `${(v * 100).toFixed(1)}%`;

  return (
    <div className="space-y-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">您的养老规划报告</h2>
        <p className="text-muted-foreground">以下是基于您输入的详细分析</p>
      </div>

      {/* ── Section 1: 结论摘要 ── */}
      <Card className={getAdequacyBg(basePlan.adequacyRatio)}>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">目标月收入（今日购买力）</p>
              <p className="text-3xl font-bold">{formatCurrency(basePlan.targetMonthlyToday)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">充足率</p>
              <p className={`text-3xl font-bold ${getAdequacyColor(basePlan.adequacyRatio)}`}>
                {(basePlan.adequacyRatio * 100).toFixed(0)}%
              </p>
              <p className="text-sm">{adequacyLabel}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span>固定保障（社保 + 年金）</span>
              <span className="font-medium">{formatCurrency(pv(basePlan.fixedIncomeMonthly))}/月</span>
            </div>
            <div className="flex justify-between items-center">
              <span>资金池提取</span>
              <span className="font-medium">{formatCurrency(pv(basePlan.assetPoolMonthly))}/月</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="font-semibold">合计可支配</span>
              <span className="font-semibold">{formatCurrency(totalIncomeToday)}/月</span>
            </div>
            {basePlan.monthlyGap > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span>每月缺口</span>
                <span className="font-semibold">{formatCurrency(basePlan.monthlyGap)}/月</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: 养老资金池柱状图（按支柱分类）── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            养老资金池 · 四支柱分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 图例说明 */}
          <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
            {Object.entries(PILLAR_COLORS).map(([label, color]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={poolChartData} margin={{ top: 20, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis tickFormatter={fmt万} tick={{ fontSize: 11 }} unit="" />
              <Tooltip
                formatter={(value, name) => [
                  `¥${Math.round(Number(value)).toLocaleString()}`,
                  name as string,
                ]}
                labelFormatter={label => `${label}${label === '今日' ? `（合计 ¥${Math.round(poolTotal今).toLocaleString()}）` : `（合计 ¥${Math.round(poolTotal退).toLocaleString()}）`}`}
              />
              <Bar dataKey="第一支柱" stackId="a" fill={PILLAR_COLORS['第一支柱']} radius={[0,0,0,0]} />
              <Bar dataKey="第二支柱" stackId="a" fill={PILLAR_COLORS['第二支柱']} />
              <Bar dataKey="第三支柱" stackId="a" fill={PILLAR_COLORS['第三支柱']} />
              <Bar dataKey="其他储蓄" stackId="a" fill={PILLAR_COLORS['其他储蓄']} radius={[4,4,0,0]}>
                {poolChartData.map((_, i) => <Cell key={i} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* 数字汇总 */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t text-sm">
            {[
              { label: '社保个人账户（退休时）', value: pillar1AccountAtRetirement, color: PILLAR_COLORS['第一支柱'] },
              { label: '企业年金终值（退休时）', value: annuityFV, color: PILLAR_COLORS['第二支柱'] },
              { label: '个人养老金终值（退休时）', value: basePlan.retirementPool.personalPensionFV, color: PILLAR_COLORS['第三支柱'] },
              { label: '养老储蓄终值（退休时）', value: basePlan.retirementPool.dedicatedSavingsFV + basePlan.retirementPool.monthlyDedicatedFV, color: PILLAR_COLORS['其他储蓄'] },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
                <span className="text-gray-500 text-xs">{label}</span>
                <span className="ml-auto font-medium tabular-nums">{formatCurrency(value)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * 社保个人账户余额 = 个人账户月养老金 × 计发月数（{payMonths}月）；企业年金以风险偏好对应回报率（{formatPercent(basePlan.expectedReturn)}）复利估算。
          </p>
        </CardContent>
      </Card>

      {/* ── Section 3: 敏感性分析 ── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              敏感性分析
            </CardTitle>
            <button onClick={() => setSliders(baseSliders)}
              className="text-xs text-muted-foreground hover:text-primary border rounded px-3 py-1">
              重置为历史基准
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <SliderRow label="社平工资增速" value={sliders.socialWageGrowthRate} min={0.02} max={0.12} step={0.005} onChange={updateSlider('socialWageGrowthRate')} formatValue={pctFmt} />
          <SliderRow label="社保记账利率" value={sliders.socialInsuranceRate} min={0.01} max={0.10} step={0.005} onChange={updateSlider('socialInsuranceRate')} formatValue={pctFmt} />
          <SliderRow label="个人养老金收益" value={sliders.personalPensionReturn} min={0.01} max={0.08} step={0.005} onChange={updateSlider('personalPensionReturn')} formatValue={pctFmt} />
          <SliderRow label="储蓄池收益率" value={sliders.savingsReturn} min={0.01} max={0.10} step={0.005} onChange={updateSlider('savingsReturn')} formatValue={pctFmt} />
          <SliderRow label="通货膨胀率" value={sliders.inflationRate} min={0.005} max={0.06} step={0.005} onChange={updateSlider('inflationRate')} formatValue={pctFmt} />

          <div className="flex flex-wrap items-center gap-4 text-sm p-3 bg-muted rounded-lg mt-2">
            <span>历史基准充足率 <strong>{(basePlan.adequacyRatio * 100).toFixed(0)}%</strong></span>
            <span className="text-gray-400">→</span>
            <span className={interactivePlan.adequacyRatio >= basePlan.adequacyRatio ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              调整后 {(interactivePlan.adequacyRatio * 100).toFixed(0)}%
              {interactivePlan.adequacyRatio > basePlan.adequacyRatio ? ' ↑' : interactivePlan.adequacyRatio < basePlan.adequacyRatio ? ' ↓' : ''}
            </span>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-3">养老现金流时序（积累期投入 / 退休后收入）</p>
            <LifetimeCashFlowChart plan={interactivePlan} input={interactiveInput} />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: 养老投入现金流 ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            养老投入现金流
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <p className="text-sm font-medium text-muted-foreground mb-2">当前年度月均支出</p>
              {[
                { label: '个人养老金', color: '#3b82f6', amount: basePlan.annualCashFlow.personalPensionMonthly },
                { label: '商业险保费（在缴）', color: '#a855f7', amount: basePlan.annualCashFlow.activeInsurancePremiumMonthly },
                { label: '养老定投', color: '#f97316', amount: basePlan.annualCashFlow.dedicatedSavingMonthly },
              ].map(({ label, color, amount }) => (
                <div key={label} className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                    {label}
                  </span>
                  <span>{formatCurrency(amount)}/月</span>
                </div>
              ))}
              <div className="flex justify-between font-medium border-t pt-2">
                <span>已承诺合计</span>
                <span>{formatCurrency(basePlan.annualCashFlow.totalCommittedMonthly)}/月
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({(basePlan.annualCashFlow.committedRatioOfIncome * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-red-600">
                <span className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-400" />
                  建议补充储蓄
                </span>
                <span>{formatCurrency(basePlan.annualCashFlow.requiredAdditionalMonthly)}/月</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>全部合计</span>
                <span>{formatCurrency(basePlan.annualCashFlow.totalRequiredMonthly)}/月
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({(basePlan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(1)}%)
                  </span>
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground border-t pt-1">
                <span>社保个人缴费（参考，已代扣）</span>
                <span>{formatCurrency(basePlan.annualCashFlow.socialSecurityPersonalMonthly)}/月</span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              {basePlan.annualCashFlow.totalRequiredRatioOfIncome > 0.5 ? (
                <div className="p-4 bg-red-50 rounded-lg text-sm text-red-700 space-y-1">
                  <p className="font-semibold">负担较重</p>
                  <p>养老投入将占月收入的 {(basePlan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(0)}%，建议重新评估目标替代率或延长退休年龄。</p>
                </div>
              ) : basePlan.annualCashFlow.totalRequiredRatioOfIncome > 0.3 ? (
                <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700 space-y-1">
                  <p className="font-semibold">负担适中</p>
                  <p>养老投入占月收入的 {(basePlan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(0)}%，处于合理区间。</p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg text-sm text-green-700 space-y-1">
                  <p className="font-semibold">负担可控</p>
                  <p>养老投入占月收入的 {(basePlan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(0)}%，在可承受范围内。</p>
                </div>
              )}
            </div>
          </div>

          {/* ── 退休后收入来源 ── */}
          <div className="border-t pt-6">
            <p className="text-sm font-medium text-gray-700 mb-4">退休首年月收入来源</p>

            {/* 条形可视化 */}
            <div className="space-y-2 mb-4">
              {retirementIncomeItems.map(({ label, amount, color, pillar }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-gray-500 shrink-0 text-right">{label}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                    <div
                      className="h-5 rounded-full transition-all"
                      style={{ width: `${(amount / incomeMaxAmount) * 100}%`, background: color }}
                    />
                  </div>
                  <div className="w-24 text-xs font-semibold tabular-nums text-right">{formatCurrency(amount)}/月</div>
                  <div className="w-16 text-xs text-gray-400 text-right">{pillar}</div>
                </div>
              ))}
              {/* 目标线 */}
              <div className="flex items-center gap-3">
                <div className="w-28 text-xs text-orange-500 shrink-0 text-right font-medium">目标月收入</div>
                <div className="flex-1 bg-gray-100 rounded-full h-5 relative">
                  <div className="h-5 rounded-full border-2 border-dashed border-orange-400 bg-transparent transition-all"
                    style={{ width: `${(basePlan.targetMonthlyAtRetirement / incomeMaxAmount) * 100}%` }} />
                </div>
                <div className="w-24 text-xs font-semibold text-orange-500 tabular-nums text-right">{formatCurrency(basePlan.targetMonthlyAtRetirement)}/月</div>
                <div className="w-16" />
              </div>
            </div>

            {/* 合计 */}
            <div className="flex justify-between text-sm font-semibold border-t pt-2 mb-4">
              <span>合计月收入</span>
              <span className={totalRetirementIncome >= basePlan.targetMonthlyAtRetirement ? 'text-green-600' : 'text-red-600'}>
                {formatCurrency(totalRetirementIncome)}/月
              </span>
            </div>

            {/* 折叠的计算说明 */}
            <button
              onClick={() => setCalcExpanded(v => !v)}
              className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-100 transition-colors"
            >
              <span className="font-medium">查看计算过程</span>
              {calcExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {calcExpanded && (
              <div className="mt-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm space-y-4">
                {/* 基础养老金 */}
                <div>
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-4 rounded-sm inline-block" style={{ background: '#2563eb' }} />
                    第一支柱：基础养老金
                  </p>
                  <div className="pl-4 space-y-1 text-gray-600 text-xs font-mono">
                    <p>退休时社平工资 = {formatCurrency(input.avgSocialWage)} × (1+{pctFmt(wageCAGR5)})^{n}年 = <strong>{formatCurrency(socialWageAtRetirement)}/月</strong></p>
                    <p>本人月均缴费工资 = 社平工资 × 缴费比例{pctFmt(input.contributionRatio)} = <strong>{formatCurrency(indexedWage)}/月</strong></p>
                    <p>基础养老金 = (社平工资 + 本人指数工资) ÷ 2 × 缴费年数{totalContribYears}年 × 1%</p>
                    <p className="pl-4">= ({formatCurrency(socialWageAtRetirement)} + {formatCurrency(indexedWage)}) ÷ 2 × {totalContribYears} × 1% = <strong className="text-blue-700">{formatCurrency(basePlan.pillar1Basic)}/月</strong></p>
                  </div>
                </div>

                {/* 个人账户养老金 */}
                <div>
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-4 rounded-sm inline-block" style={{ background: '#60a5fa' }} />
                    第一支柱：个人账户养老金
                  </p>
                  <div className="pl-4 space-y-1 text-gray-600 text-xs font-mono">
                    <p>月缴8% = 计发基数{formatCurrency(input.avgSocialWage)} × {pctFmt(input.contributionRatio)} × 8% = {formatCurrency(monthlyContrib社保)}/月</p>
                    <p>账户记账利率 = {pctFmt(siRateAvg5)}（5年历史均值）</p>
                    <p>退休时账户余额 = <strong>{formatCurrency(pillar1AccountAtRetirement)}</strong></p>
                    <p>个人账户月养老金 = 余额 ÷ 计发月数{payMonths}月 = <strong className="text-blue-500">{formatCurrency(basePlan.pillar1Account)}/月</strong></p>
                  </div>
                </div>

                {/* 企业年金 */}
                {basePlan.pillar2Monthly > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="w-2 h-4 rounded-sm inline-block" style={{ background: '#0d9488' }} />
                      第二支柱：企业年金
                    </p>
                    <div className="pl-4 space-y-1 text-gray-600 text-xs font-mono">
                      <p>月缴 {formatCurrency(input.annuityMonthly)}（个人+单位），按 {pctFmt(basePlan.expectedReturn)} 复利积累 {n} 年</p>
                      <p>退休时终值 = <strong>{formatCurrency(annuityFV)}</strong></p>
                      <p>月领（等额 {basePlan.yearsInRetirement} 年提取）= <strong className="text-teal-600">{formatCurrency(basePlan.pillar2Monthly)}/月</strong></p>
                    </div>
                  </div>
                )}

                {/* 资金池 */}
                <div>
                  <p className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-2 h-4 rounded-sm inline-block" style={{ background: '#f59e0b' }} />
                    个人养老金 + 专项储蓄（资金池）
                  </p>
                  <div className="pl-4 space-y-1 text-gray-600 text-xs font-mono">
                    <p>个人养老金账户 FV = <strong>{formatCurrency(basePlan.retirementPool.personalPensionFV)}</strong>（年化 {pctFmt(0.04)}）</p>
                    <p>养老储蓄 FV = <strong>{formatCurrency(basePlan.retirementPool.dedicatedSavingsFV + basePlan.retirementPool.monthlyDedicatedFV)}</strong>（年化 {pctFmt(RISK_RETURNS[input.riskProfile])}）</p>
                    <p>退休时资金池合计 = <strong>{formatCurrency(basePlan.retirementPool.balanceAtRetirement)}</strong></p>
                    <p>提取期 {basePlan.yearsInRetirement} 年，保守回报 {pctFmt(basePlan.retirementPool.expectedReturnDecum)}</p>
                    <p>月均提取 = <strong className="text-amber-600">{formatCurrency(basePlan.retirementPool.monthlyWithdrawal)}/月</strong></p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Section 5: 年度明细表 ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">全生命周期 · 年度现金流与资金池明细</CardTitle>
          <p className="text-xs text-muted-foreground mt-1">从当前至预期寿命（{input.lifeExpectancy}岁）每年投入与资金池规模</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-96 rounded-lg border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 font-semibold">年龄</th>
                  <th className="text-left py-2 px-3 font-semibold">阶段</th>
                  <th className="text-right py-2 px-3 font-semibold">年度投入</th>
                  <th className="text-right py-2 px-3 font-semibold">年度收入</th>
                  <th className="text-right py-2 px-3 font-semibold">资金池余额</th>
                </tr>
              </thead>
              <tbody>
                {annualTableData.map((row, i) => (
                  <tr
                    key={row.age}
                    className={`border-b border-gray-100 hover:bg-gray-50 ${row.age === input.retirementAge ? 'bg-amber-50 font-medium' : ''} ${i % 2 === 0 && row.age !== input.retirementAge ? 'bg-white' : ''}`}
                  >
                    <td className="py-1.5 px-3 font-medium">
                      {row.age}
                      {row.age === input.retirementAge && (
                        <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full">退休</span>
                      )}
                    </td>
                    <td className="py-1.5 px-3">
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${row.isRetired ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                        {row.isRetired ? '退休' : '积累'}
                      </span>
                    </td>
                    <td className="text-right py-1.5 px-3 tabular-nums">
                      {row.annualContrib > 0 ? (
                        <span className="text-red-600">−{formatCurrency(row.annualContrib)}</span>
                      ) : '—'}
                    </td>
                    <td className="text-right py-1.5 px-3 tabular-nums">
                      {row.annualIncome > 0 ? (
                        <span className="text-green-600">+{formatCurrency(row.annualIncome)}</span>
                      ) : '—'}
                    </td>
                    <td className="text-right py-1.5 px-3 tabular-nums font-medium">
                      {row.poolBalance > 0 ? formatCurrency(row.poolBalance) : (
                        <span className="text-gray-400">耗尽</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            * 资金池 = 个人养老金账户 + 养老专项储蓄（不含社保和企业年金）。年度投入含个人养老金、储蓄定投、商业险保费。年度收入含社保、企业年金、商业年金、资金池提取，以退休首年金额计。
          </p>
        </CardContent>
      </Card>

      {/* ── Section 6: 行动建议 ── */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">每月储蓄建议</CardTitle></CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{formatCurrency(basePlan.requiredMonthlySaving)}</p>
            <p className="text-sm text-muted-foreground">
              每月额外储蓄这么多，以{formatPercent(basePlan.expectedReturn)}年化回报，
              {basePlan.yearsToRetirement}年后可补足{formatCurrency(basePlan.totalGapPV)}总缺口
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">个人养老金账户</CardTitle></CardHeader>
          <CardContent>
            {basePlan.pillar3Advice.gap > 0 ? (
              <>
                <p className="text-lg font-semibold mb-2">还可存入 {formatCurrency(basePlan.pillar3Advice.gap)}/年</p>
                <p className="text-sm text-muted-foreground">预计节税 {formatCurrency(basePlan.pillar3Advice.taxSaving)}</p>
                <p className="text-sm mt-2">{basePlan.pillar3Advice.recommendation}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold mb-2 text-green-600">已充分利用</p>
                <p className="text-sm text-muted-foreground">{basePlan.pillar3Advice.recommendation}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">推荐资产配置</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between"><span>股权类</span><span className="font-medium">{formatPercent(basePlan.assetAllocation.equityPct)}</span></div>
              <div className="flex justify-between"><span>固收类</span><span className="font-medium">{formatPercent(basePlan.assetAllocation.bondPct)}</span></div>
              <div className="flex justify-between"><span>预期年化回报</span><span className="font-medium">{formatPercent(basePlan.assetAllocation.expectedReturn)}</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{basePlan.assetAllocation.glidePathNote}</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Section 7: 政策风险 + 行动清单 ── */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">政策风险提示</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>以下政策变化可能影响您的规划，建议每 1-2 年重新测算：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>退休年龄进一步延迟：2025年改革将法定退休年龄逐步延至男63岁、女55/58岁，未来可能再次上调</li>
            <li>计发月数上调：个人账户月领金额 = 余额 ÷ 计发月数，政府可能依据寿命数据更新，导致月领金额下降</li>
            <li>个人账户利率下行：2024年记账利率仅 2.62%，为历史最低；本规划使用历史均值估算</li>
            <li>养老金待遇计算调整：历次改革均按老人老办法过渡，过渡期计算规则存在不确定性</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">行动清单</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {[
              '登录 12333 APP / 电子社保卡查询社保缴费明细，确认已缴年限',
              '开通个人养老金账户（银行 / 证券 App），充分利用年度 12000 元限额',
              '检查是否已有商业年金险，核对合同约定的月领金额和起领年龄',
              '将现有闲置资金按年龄滑行路径配置到指数基金 + 债券基金',
              `从工资中额外每月储蓄 ${formatCurrency(basePlan.requiredMonthlySaving)} 投入养老账户`,
              '每年重新测算一次，根据收入变化和政策调整更新方案',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
