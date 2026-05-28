import { UserInput } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { formatCurrency } from '@/lib/utils';
import { ALL_WAGE_HISTORIES, INFLATION_HISTORY, SOCIAL_INSURANCE_INTEREST_HISTORY } from '@/engine/constants';
import { EXPENSE_INFLATION_RATES, CAREGIVER_START_AGE, NURSING_HOME_START_AGE } from '@/engine/gap';
import { Info } from 'lucide-react';

interface Step3GoalsProps {
  input: UserInput;
  onChange: (input: UserInput) => void;
}

export function Step3Goals({ input, onChange }: Step3GoalsProps) {
  const update = (updates: Partial<UserInput>) => {
    onChange({ ...input, ...updates });
  };

  const yearsToRetirement = input.retirementAge - input.currentAge;

  // ── 替代率模式：目标月收入预览 ──────────────────────────────────
  const calcReplacementTarget = (rate: number) => {
    const today = input.monthlyIncome * rate;
    const atRetirement = today * Math.pow(1 + input.inflationRate, yearsToRetirement);
    return { today, atRetirement };
  };

  // ── 费用测算模式：各项费用在退休时的预计值 ──────────────────────
  const basicAtRetirement = input.monthlyBasicExpense *
    Math.pow(1 + EXPENSE_INFLATION_RATES.basic, yearsToRetirement);
  const caregiverAtStart = input.monthlyCaregiverCost *
    Math.pow(1 + EXPENSE_INFLATION_RATES.caregiver, CAREGIVER_START_AGE - input.currentAge);
  const nursingAtStart = input.monthlyNursingHomeCost *
    Math.pow(1 + EXPENSE_INFLATION_RATES.nursing, NURSING_HOME_START_AGE - input.currentAge);

  // ── 历史均值参数（参考用）──────────────────────────────────────
  const nationalWageData = ALL_WAGE_HISTORIES['national']?.data ?? [];
  const wage2019 = nationalWageData.find(d => d.year === 2019)?.avgMonthlyWage ?? 7542;
  const wage2024 = nationalWageData.find(d => d.year === 2024)?.avgMonthlyWage ?? 10343;
  const wageCAGR5 = wage2019 > 0 ? (Math.pow(wage2024 / wage2019, 1 / 5) - 1) : 0.065;

  const infData = INFLATION_HISTORY.filter(d => d.year >= 2020 && d.year <= 2024);
  const inflAvg5 = infData.length > 0
    ? infData.reduce((s, d) => s + d.cpi, 0) / infData.length
    : 0.013;

  const siData = SOCIAL_INSURANCE_INTEREST_HISTORY.filter(d => d.year >= 2020 && d.year <= 2024);
  const siRateAvg5 = siData.length > 0
    ? siData.reduce((s, d) => s + d.rate, 0) / siData.length
    : 0.051;

  const RISK_RETURNS = { conservative: 0.035, moderate: 0.045, aggressive: 0.055 };
  const savingsReturn = RISK_RETURNS[input.riskProfile];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">目标与偏好</h2>
        <p className="text-muted-foreground">设定您的退休生活目标和投资偏好</p>
      </div>

      {/* ── 目标设定方式切换 ── */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">选择目标设定方式</p>
          <div className="flex gap-3">
            <button
              onClick={() => update({ targetMode: 'replacement_rate' })}
              className={`flex-1 rounded-lg border-2 py-3 px-4 text-sm font-medium transition-colors ${
                input.targetMode === 'replacement_rate'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/50'
              }`}
            >
              替代率
              <p className={`text-xs mt-0.5 font-normal ${input.targetMode === 'replacement_rate' ? 'text-primary-foreground/80' : 'text-gray-400'}`}>
                按退休前收入比例设目标
              </p>
            </button>
            <button
              onClick={() => update({ targetMode: 'expense_based' })}
              className={`flex-1 rounded-lg border-2 py-3 px-4 text-sm font-medium transition-colors ${
                input.targetMode === 'expense_based'
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary/50'
              }`}
            >
              费用测算
              <p className={`text-xs mt-0.5 font-normal ${input.targetMode === 'expense_based' ? 'text-primary-foreground/80' : 'text-gray-400'}`}>
                按实际生活费用估算需求
              </p>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ══ 替代率模式 ══ */}
      {input.targetMode === 'replacement_rate' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className={input.replacementRate === 0.60 ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">基本保障</CardTitle>
                <RadioGroupItem
                  value="0.6"
                  checked={input.replacementRate === 0.60}
                  onClick={() => update({ replacementRate: 0.60 })}
                />
              </div>
              <CardDescription>60% 替代率</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-1">
                {formatCurrency(calcReplacementTarget(0.60).today)}
              </p>
              <p className="text-sm text-muted-foreground">
                退休时: {formatCurrency(calcReplacementTarget(0.60).atRetirement)}
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                覆盖衣食住行基本开销
              </p>
            </CardContent>
          </Card>

          <Card className={input.replacementRate === 0.75 ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">舒适生活</CardTitle>
                <RadioGroupItem
                  value="0.75"
                  checked={input.replacementRate === 0.75}
                  onClick={() => update({ replacementRate: 0.75 })}
                />
              </div>
              <CardDescription>75% 替代率（推荐）</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-1">
                {formatCurrency(calcReplacementTarget(0.75).today)}
              </p>
              <p className="text-sm text-muted-foreground">
                退休时: {formatCurrency(calcReplacementTarget(0.75).atRetirement)}
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                维持退休前生活品质
              </p>
            </CardContent>
          </Card>

          <Card className={input.replacementRate === 0.90 ? 'ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">富裕生活</CardTitle>
                <RadioGroupItem
                  value="0.9"
                  checked={input.replacementRate === 0.90}
                  onClick={() => update({ replacementRate: 0.90 })}
                />
              </div>
              <CardDescription>90% 替代率</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold mb-1">
                {formatCurrency(calcReplacementTarget(0.90).today)}
              </p>
              <p className="text-sm text-muted-foreground">
                退休时: {formatCurrency(calcReplacementTarget(0.90).atRetirement)}
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                旅行、医疗、兴趣充足
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══ 费用测算模式 ══ */}
      {input.targetMode === 'expense_based' && (
        <div className="space-y-4">
          {/* 输入区 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">退休费用估算（今日价格）</CardTitle>
              <CardDescription>
                系统将按各项目的历史通胀率，自动推算退休时及各阶段的实际费用需求
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* 基本生活费 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label className="text-sm font-semibold">基本生活费</Label>
                  <span className="text-xs text-gray-400">（衣食住行，退休起持续）</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <Input
                      type="number"
                      value={input.monthlyBasicExpense}
                      onChange={e => update({ monthlyBasicExpense: Number(e.target.value) })}
                      className="pl-7"
                      min={0}
                      step={500}
                    />
                  </div>
                  <span className="text-sm text-gray-500 shrink-0">元/月</span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  预计退休时（{yearsToRetirement}年后）：
                  <span className="font-medium text-gray-600">
                    {formatCurrency(basicAtRetirement)}/月
                  </span>
                  <span className="text-gray-400">（通胀率 {(EXPENSE_INFLATION_RATES.basic * 100).toFixed(1)}%）</span>
                </p>
              </div>

              {/* 护工费用 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label className="text-sm font-semibold">护工费用</Label>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-amber-50 text-amber-700 border border-amber-200">
                    {CAREGIVER_START_AGE}岁后开始
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <Input
                      type="number"
                      value={input.monthlyCaregiverCost}
                      onChange={e => update({ monthlyCaregiverCost: Number(e.target.value) })}
                      className="pl-7"
                      min={0}
                      step={500}
                    />
                  </div>
                  <span className="text-sm text-gray-500 shrink-0">元/月</span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {CAREGIVER_START_AGE}岁时预计：
                  <span className="font-medium text-gray-600">
                    {formatCurrency(caregiverAtStart)}/月
                  </span>
                  <span className="text-gray-400">（通胀率 {(EXPENSE_INFLATION_RATES.caregiver * 100).toFixed(1)}%，医疗服务类）</span>
                </p>
              </div>

              {/* 养老院费用 */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Label className="text-sm font-semibold">养老院费用</Label>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-red-50 text-red-700 border border-red-200">
                    {NURSING_HOME_START_AGE}岁后叠加
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">¥</span>
                    <Input
                      type="number"
                      value={input.monthlyNursingHomeCost}
                      onChange={e => update({ monthlyNursingHomeCost: Number(e.target.value) })}
                      className="pl-7"
                      min={0}
                      step={500}
                    />
                  </div>
                  <span className="text-sm text-gray-500 shrink-0">元/月</span>
                </div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {NURSING_HOME_START_AGE}岁时预计：
                  <span className="font-medium text-gray-600">
                    {formatCurrency(nursingAtStart)}/月
                  </span>
                  <span className="text-gray-400">（通胀率 {(EXPENSE_INFLATION_RATES.nursing * 100).toFixed(1)}%，含床位+护理）</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 费用阶段预览 */}
          <Card className="bg-gray-50 border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600">退休后费用分阶段预览（预计名义值）</CardTitle>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2">
                {[
                  {
                    phase: `退休（${input.retirementAge}岁）— ${CAREGIVER_START_AGE}岁`,
                    items: [{ label: '基本生活费', amount: basicAtRetirement, color: 'bg-blue-400' }],
                  },
                  {
                    phase: `${CAREGIVER_START_AGE}岁 — ${NURSING_HOME_START_AGE}岁`,
                    items: [
                      { label: '基本生活费', amount: basicAtRetirement * Math.pow(1 + EXPENSE_INFLATION_RATES.basic, CAREGIVER_START_AGE - input.retirementAge), color: 'bg-blue-400' },
                      { label: '护工费用', amount: caregiverAtStart, color: 'bg-amber-400' },
                    ],
                  },
                  {
                    phase: `${NURSING_HOME_START_AGE}岁 — 预期终止`,
                    items: [
                      { label: '基本生活费', amount: basicAtRetirement * Math.pow(1 + EXPENSE_INFLATION_RATES.basic, NURSING_HOME_START_AGE - input.retirementAge), color: 'bg-blue-400' },
                      { label: '护工费用', amount: nursingAtStart * Math.pow(1 + EXPENSE_INFLATION_RATES.caregiver, 0), color: 'bg-amber-400' },
                      { label: '养老院费用', amount: nursingAtStart, color: 'bg-red-400' },
                    ],
                  },
                ].map((row, i) => {
                  const total = row.items.reduce((s, x) => s + x.amount, 0);
                  return (
                    <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-gray-500">{row.phase}</span>
                        <span className="text-sm font-bold text-gray-800">{formatCurrency(total)}/月</span>
                      </div>
                      <div className="flex rounded overflow-hidden h-2">
                        {row.items.map((item, j) => (
                          <div
                            key={j}
                            className={`${item.color}`}
                            style={{ width: `${(item.amount / total) * 100}%` }}
                            title={`${item.label}: ${formatCurrency(item.amount)}`}
                          />
                        ))}
                      </div>
                      <div className="flex gap-3 mt-1.5">
                        {row.items.map((item, j) => (
                          <span key={j} className="text-xs text-gray-400 flex items-center gap-1">
                            <span className={`inline-block w-2 h-2 rounded-full ${item.color}`} />
                            {item.label} {formatCurrency(item.amount)}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3 border-t pt-2">
                * 三阶段费用叠加计算：基本生活费全程持续，护工费用从{CAREGIVER_START_AGE}岁起累加，养老院费用从{NURSING_HOME_START_AGE}岁起再叠加。
                通胀假设来源：国内历史数据（生活成本 {(EXPENSE_INFLATION_RATES.basic * 100).toFixed(1)}%、护工 {(EXPENSE_INFLATION_RATES.caregiver * 100).toFixed(1)}%、养老院 {(EXPENSE_INFLATION_RATES.nursing * 100).toFixed(1)}%）。
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 投资风险偏好（两种模式共用）── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">投资风险偏好</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
            onClick={() => update({ riskProfile: 'conservative' })}>
            <RadioGroupItem
              value="conservative"
              checked={input.riskProfile === 'conservative'}
            />
            <div>
              <p className="font-medium">保守</p>
              <p className="text-sm text-muted-foreground">股债40/60，预期年化3.5%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
            onClick={() => update({ riskProfile: 'moderate' })}>
            <RadioGroupItem
              value="moderate"
              checked={input.riskProfile === 'moderate'}
            />
            <div>
              <p className="font-medium">稳健（推荐）</p>
              <p className="text-sm text-muted-foreground">股债60/40，预期年化4.5%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted"
            onClick={() => update({ riskProfile: 'aggressive' })}>
            <RadioGroupItem
              value="aggressive"
              checked={input.riskProfile === 'aggressive'}
            />
            <div>
              <p className="font-medium">积极</p>
              <p className="text-sm text-muted-foreground">股债80/20，预期年化5.5%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 历史参数说明 ── */}
      <Card className="border border-gray-200 bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-gray-700">参数设定说明</CardTitle>
          <CardDescription>以下参数基于历史5年数据自动设定，不可手动调整</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: '社平工资增速', value: `${(wageCAGR5 * 100).toFixed(1)}%`, note: '2019–2024 年化复合增速' },
              { label: '通货膨胀率', value: `${(inflAvg5 * 100).toFixed(1)}%`, note: '2020–2024 年均 CPI' },
              { label: '社保记账利率', value: `${(siRateAvg5 * 100).toFixed(1)}%`, note: '2020–2024 年均利率' },
              { label: '个人养老金收益', value: '4.0%', note: '政策账户基准估算' },
              {
                label: `储蓄池收益（${input.riskProfile === 'conservative' ? '保守' : input.riskProfile === 'moderate' ? '稳健' : '积极'}）`,
                value: `${(savingsReturn * 100).toFixed(1)}%`,
                note: '基于风险偏好历史收益',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-gray-100">
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className="text-lg font-bold text-gray-800">{item.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3 border-t pt-2">
            * 以上参数在"规划报告"页可通过敏感性分析滑块进行情景模拟。社平工资增速 = 全国城镇非私营单位在岗职工平均工资5年CAGR；通胀率 = 近5年CPI均值；社保利率 = 社保个人账户近5年平均记账利率。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
