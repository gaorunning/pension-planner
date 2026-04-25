import { UserInput, calculatePlan } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { AssetGrowthChart } from './charts/AssetGrowthChart';
import { ReplacementRateChart } from './charts/ReplacementRateChart';
import { IncomeBreakdownChart } from './charts/IncomeBreakdownChart';
import { AlertTriangle, CheckCircle2, Target } from 'lucide-react';

interface Step4ReportProps {
  input: UserInput;
}

export function Step4Report({ input }: Step4ReportProps) {
  const plan = calculatePlan(input);

  const getAdequacyColor = (ratio: number) => {
    if (ratio < 0.6) return 'text-red-600';
    if (ratio < 0.8) return 'text-yellow-600';
    if (ratio < 1.0) return 'text-blue-600';
    return 'text-green-600';
  };

  const getAdequacyBg = (ratio: number) => {
    if (ratio < 0.6) return 'bg-red-100';
    if (ratio < 0.8) return 'bg-yellow-100';
    if (ratio < 1.0) return 'bg-blue-100';
    return 'bg-green-100';
  };

  const adequacyLabel = {
    critical: '严重不足',
    warning: '需要补充',
    adequate: '基本充足',
    comfortable: '准备充分',
  }[plan.adequacyLevel];

  // 收入构成数据（折现到今天）
  const incomeItems = [
    { label: '基本养老金', value: plan.pillar1Monthly / Math.pow(1 + input.inflationRate, plan.yearsToRetirement), color: '#3b82f6' },
    { label: '企业年金', value: plan.pillar2Monthly / Math.pow(1 + input.inflationRate, plan.yearsToRetirement), color: '#22c55e' },
    { label: '商业年金险', value: plan.commercialAnnuityMonthly / Math.pow(1 + input.inflationRate, plan.yearsToRetirement), color: '#a855f7' },
    { label: '资金池提取', value: plan.assetPoolMonthly / Math.pow(1 + input.inflationRate, plan.yearsToRetirement), color: '#f97316' },
  ];

  const totalIncomeToday = incomeItems.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-8">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-2">您的养老规划报告</h2>
        <p className="text-muted-foreground">以下是基于您输入的详细分析</p>
      </div>

      {/* 1. 养老资金池快照（顶部卡片）*/}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            养老资金池快照
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">当前总值</p>
                <p className="text-2xl font-bold">{formatCurrency(plan.retirementPool.currentBalance)}</p>
                <div className="pl-4 mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">个人养老金账户</span>
                    <span>{formatCurrency(input.personalPensionCurrentBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">养老专项储蓄</span>
                    <span>{formatCurrency(input.dedicatedRetirementSavings)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">退休时预期</p>
                <p className="text-2xl font-bold">{formatCurrency(plan.retirementPool.balanceAtRetirement)}</p>
                <div className="pl-4 mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">个人养老金</span>
                    <span>{formatCurrency(plan.retirementPool.personalPensionFV)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">养老专项储蓄</span>
                    <span>{formatCurrency(plan.retirementPool.dedicatedSavingsFV + plan.retirementPool.monthlyDedicatedFV)}</span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t mt-2">
                  <span className="text-muted-foreground">退休后每月可提取</span>
                  <span className="font-medium">{formatCurrency(plan.retirementPool.monthlyWithdrawal)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 顶部摘要 Banner */}
      <Card className={getAdequacyBg(plan.adequacyRatio)}>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">目标月收入（今日购买力）</p>
              <p className="text-3xl font-bold">{formatCurrency(plan.targetMonthlyToday)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">充足率</p>
              <p className={`text-3xl font-bold ${getAdequacyColor(plan.adequacyRatio)}`}>
                {(plan.adequacyRatio * 100).toFixed(0)}%
              </p>
              <p className="text-sm">{adequacyLabel}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span>固定保障（社保 + 年金）</span>
              <span className="font-medium">{formatCurrency(plan.fixedIncomeMonthly / Math.pow(1 + input.inflationRate, plan.yearsToRetirement))}/月</span>
            </div>
            <div className="flex justify-between items-center">
              <span>资金池提取</span>
              <span className="font-medium">{formatCurrency(plan.assetPoolMonthly / Math.pow(1 + input.inflationRate, plan.yearsToRetirement))}/月</span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="font-semibold">合计可支配</span>
              <span className="font-semibold">{formatCurrency(totalIncomeToday)}/月</span>
            </div>
            {plan.monthlyGap > 0 && (
              <div className="flex justify-between items-center text-red-600">
                <span>每月缺口</span>
                <span className="font-semibold">{formatCurrency(plan.monthlyGap)}/月</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 3. 资产积累曲线图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">资产积累曲线</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <AssetGrowthChart
            yearlyData={plan.yearlyData}
            retirementAge={input.retirementAge}
          />
        </CardContent>
      </Card>

      {/* 4. 替代率对比图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">收入替代率对比</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ReplacementRateChart
            currentMonthlyIncome={input.monthlyIncome}
            targetMonthlyToday={plan.targetMonthlyToday}
            actualMonthlyToday={totalIncomeToday}
            targetRate={input.replacementRate}
            actualRate={totalIncomeToday / input.monthlyIncome}
          />
        </CardContent>
      </Card>

      {/* 5. 收入构成堆叠图 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">收入构成（今日购买力）</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <IncomeBreakdownChart
            targetValue={plan.targetMonthlyToday}
            items={incomeItems}
            gapValue={plan.monthlyGap}
          />
        </CardContent>
      </Card>

      {/* 6. 情景分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">情景分析</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {plan.scenarios.map((scenario) => (
              <div key={scenario.name} className="space-y-2 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-lg">{scenario.name}</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">回报率</span>
                    <span>{formatPercent(scenario.returnAssumption)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">通胀</span>
                    <span>{formatPercent(scenario.inflationAssumption)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">充足率</span>
                    <span className={getAdequacyColor(scenario.adequacyRatio)}>
                      {(scenario.adequacyRatio * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 7. 行动建议卡片 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">每月储蓄建议</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{formatCurrency(plan.requiredMonthlySaving)}</p>
            <p className="text-sm text-muted-foreground">
              每月额外储蓄这么多，以{formatPercent(plan.expectedReturn)}的年化回报，
              {plan.yearsToRetirement}年后可补足{formatCurrency(plan.totalGapPV)}的总缺口
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">个人养老金账户</CardTitle>
          </CardHeader>
          <CardContent>
            {plan.pillar3Advice.gap > 0 ? (
              <>
                <p className="text-lg font-semibold mb-2">还可存入 {formatCurrency(plan.pillar3Advice.gap)}/年</p>
                <p className="text-sm text-muted-foreground">
                  预计节税 {formatCurrency(plan.pillar3Advice.taxSaving)}
                </p>
                <p className="text-sm mt-2">{plan.pillar3Advice.recommendation}</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold mb-2 text-green-600">已充分利用</p>
                <p className="text-sm text-muted-foreground">{plan.pillar3Advice.recommendation}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">推荐资产配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>股权类</span>
                <span className="font-medium">{formatPercent(plan.assetAllocation.equityPct)}</span>
              </div>
              <div className="flex justify-between">
                <span>固收类</span>
                <span className="font-medium">{formatPercent(plan.assetAllocation.bondPct)}</span>
              </div>
              <div className="flex justify-between">
                <span>预期年化回报</span>
                <span className="font-medium">{formatPercent(plan.assetAllocation.expectedReturn)}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{plan.assetAllocation.glidePathNote}</p>
          </CardContent>
        </Card>
      </div>

      {/* 8. 政策风险提示 */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">政策风险提示</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>以下政策变化可能影响您的规划，建议每 1-2 年重新测算：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>退休年龄改革：男性正式退休年龄预计逐步从 60 岁延至 63 岁；当前弹性退休政策已允许提前 3 年退休，但养老金会相应减少</li>
            <li>个人账户利率下行：2024 年记账利率仅 2.62%，为历史最低；本规划使用 4% 保守估算</li>
            <li>养老金并轨与待遇计算调整：历次改革均按老人老办法过渡</li>
          </ul>
        </CardContent>
      </Card>

      {/* 9. 行动清单 */}
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
              `从工资中额外每月储蓄 ${formatCurrency(plan.requiredMonthlySaving)} 投入养老账户`,
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
