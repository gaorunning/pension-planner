import { useState } from 'react';
import { UserInput, MCConfig, MonteCarloResult, runMonteCarlo, defaultMCConfig } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MonteCarloFanChart } from './charts/MonteCarloFanChart';
import { formatCurrency } from '@/lib/utils';
import { Dices, Play, RefreshCw } from 'lucide-react';

interface MCResult {
  current: MonteCarloResult;
  withSavings?: MonteCarloResult;
}

interface Step5MonteCarloProps {
  input: UserInput;
  requiredMonthlySaving: number;
  mcConfig: MCConfig;
  onMCConfigChange: (config: MCConfig) => void;
}

function SuccessRateBox({
  rate,
  label,
  sub,
}: {
  rate: number;
  label: string;
  sub?: string;
}) {
  const color =
    rate >= 0.8 ? 'text-green-600' : rate >= 0.5 ? 'text-yellow-600' : 'text-red-600';
  const bg =
    rate >= 0.8 ? 'bg-green-50' : rate >= 0.5 ? 'bg-yellow-50' : 'bg-red-50';
  return (
    <div className={`rounded-xl p-4 text-center ${bg}`}>
      {sub && <p className="text-xs text-muted-foreground mb-1">{sub}</p>}
      <p className={`text-4xl font-bold mb-1 ${color}`}>
        {(rate * 100).toFixed(0)}%
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function PctInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          step={0.1}
          min={0}
          max={50}
          value={(value * 100).toFixed(1)}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="h-8 text-sm text-center w-20"
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>
    </div>
  );
}

export function Step5MonteCarlo({
  input,
  requiredMonthlySaving,
  mcConfig,
  onMCConfigChange,
}: Step5MonteCarloProps) {
  const [result, setResult] = useState<MCResult | null>(null);
  const [running, setRunning] = useState(false);

  const updateConfig = (patch: Partial<MCConfig>) => {
    onMCConfigChange({ ...mcConfig, ...patch });
    setResult(null); // 参数变更后重置结果
  };

  const runSim = () => {
    setRunning(true);
    // 用 setTimeout 让 UI 先更新再跑计算（避免卡顿感）
    setTimeout(() => {
      const current = runMonteCarlo(input, mcConfig, 5000);
      const withSavings =
        requiredMonthlySaving > 0
          ? runMonteCarlo(input, mcConfig, 5000, requiredMonthlySaving)
          : undefined;
      setResult({ current, withSavings });
      setRunning(false);
    }, 50);
  };

  const reset = () => {
    onMCConfigChange(defaultMCConfig(input));
    setResult(null);
  };

  const variables = [
    {
      key: 'pension' as const,
      title: '个人养老金账户收益',
      desc: '投资于政策性养老产品（A/B/C类养老FOF），记账利率约3.5–4.5%，波动较小',
      meanKey: 'pensionReturnMean' as keyof MCConfig,
      sdKey: 'pensionReturnSd' as keyof MCConfig,
    },
    {
      key: 'savings' as const,
      title: '个人专项储蓄收益',
      desc: '按您的风险偏好投资于市场，受宏观经济和市场波动影响较大',
      meanKey: 'savingsReturnMean' as keyof MCConfig,
      sdKey: 'savingsReturnSd' as keyof MCConfig,
    },
    {
      key: 'wage' as const,
      title: '社平工资年增速',
      desc: '影响基础养老金（统筹部分）水平，与经济增长相关',
      meanKey: 'wageGrowthMean' as keyof MCConfig,
      sdKey: 'wageGrowthSd' as keyof MCConfig,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">概率分析</h2>
        <p className="text-muted-foreground">设定不确定性参数，模拟5000种市场路径</p>
      </div>

      {/* 说明卡片 */}
      <Card className="border-blue-100 bg-blue-50/50">
        <CardContent className="pt-5 text-sm text-blue-800 space-y-1.5">
          <p>
            初阶报告基于确定性假设——固定的收益率、工资增速和寿命。
            真实世界中，这些因素都存在随机波动，可能让您的退休收入大幅高于或低于基准预测。
          </p>
          <p>
            下方模拟将同时随机抽样多个变量，运行5000次，输出结果的概率分布。
            <strong>成功率</strong>代表：在多少比例的模拟路径中，退休收入能达到您设定的目标替代率。
          </p>
        </CardContent>
      </Card>

      {/* 变量配置 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">模拟变量配置</CardTitle>
          <CardDescription>调整各变量的基准值（均值）和不确定性（标准差σ），修改后需重新模拟</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {variables.map((v) => (
            <div key={v.key} className="space-y-2">
              <div>
                <Label className="text-sm font-medium">{v.title}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <PctInput
                  label="基准值（均值）"
                  value={mcConfig[v.meanKey] as number}
                  onChange={(val) => updateConfig({ [v.meanKey]: val })}
                />
                <PctInput
                  label="不确定性（σ）"
                  value={mcConfig[v.sdKey] as number}
                  onChange={(val) => updateConfig({ [v.sdKey]: val })}
                />
              </div>
            </div>
          ))}

          {/* 寿命单独处理（单位为岁，非百分比） */}
          <div className="space-y-2">
            <div>
              <Label className="text-sm font-medium">预期寿命</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                影响资金池需维持的时长，寿命越长提取期越久
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">基准值（均值）</p>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step={1}
                    min={60}
                    max={105}
                    value={mcConfig.lifeExpMean}
                    onChange={(e) => updateConfig({ lifeExpMean: Number(e.target.value) })}
                    className="h-8 text-sm text-center w-20"
                  />
                  <span className="text-xs text-muted-foreground">岁</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">不确定性（σ）</p>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    step={1}
                    min={0}
                    max={15}
                    value={mcConfig.lifeExpSd}
                    onChange={(e) => updateConfig({ lifeExpSd: Number(e.target.value) })}
                    className="h-8 text-sm text-center w-20"
                  />
                  <span className="text-xs text-muted-foreground">岁</span>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={runSim} disabled={running} className="gap-2">
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {running ? '模拟中…' : result ? '重新模拟（5000次）' : '开始模拟（5000次）'}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />
              恢复默认值
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 结果区 */}
      {result && (
        <>
          {/* 成功率对比 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Dices className="w-5 h-5 text-primary" />
                模拟结果（{result.current.simulationCount.toLocaleString()} 次）
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* 成功率 */}
                <div className="space-y-3">
                  <SuccessRateBox
                    rate={result.current.successRate}
                    label="概率达成退休目标"
                    sub="当前储蓄水平"
                  />
                  {result.withSavings && (
                    <SuccessRateBox
                      rate={result.withSavings.successRate}
                      label="概率达成退休目标"
                      sub={`按建议补充储蓄后（+${formatCurrency(requiredMonthlySaving)}/月）`}
                    />
                  )}
                </div>

                {/* 分位数表 */}
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">退休首月收入分布</p>
                  {([
                    { label: '最差 10%', key: 'p10', color: 'text-red-500' },
                    { label: '较差 25%', key: 'p25', color: 'text-orange-500' },
                    { label: '中位数',   key: 'p50', color: 'text-blue-600' },
                    { label: '较好 75%', key: 'p75', color: 'text-green-500' },
                    { label: '最好 90%', key: 'p90', color: 'text-green-600' },
                  ] as const).map(row => (
                    <div key={row.key} className="flex justify-between items-center text-sm py-0.5">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-medium ${row.color}`}>
                        {formatCurrency(result.current.monthlyIncomeAtRetirement[row.key])}/月
                        <span className="text-xs text-muted-foreground ml-1 font-normal">
                          ({(result.current.adequacyAtRetirement[row.key] * 100).toFixed(0)}% 充足率)
                        </span>
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    随机变量：投资回报（两池独立）、社平工资涨幅、预期寿命
                  </div>
                </div>
              </div>

              {/* 扇形图 */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  资金池积累路径分布（至退休）
                </p>
                <MonteCarloFanChart
                  yearlyBands={result.current.yearlyBands}
                  retirementAge={input.retirementAge}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!result && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          确认参数后，点击「开始模拟」查看概率分布结果
        </div>
      )}
    </div>
  );
}
