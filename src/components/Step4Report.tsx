import { UserInput, calculatePlan } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { AssetGrowthChart } from './charts/AssetGrowthChart';
import { LifetimeCashFlowChart } from './charts/LifetimeCashFlowChart';
import { AlertTriangle, CheckCircle2, Target, Wallet } from 'lucide-react';

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

  const pv = (v: number) => v / Math.pow(1 + input.inflationRate, plan.yearsToRetirement);
  const totalIncomeToday =
    pv(plan.pillar1Monthly) + pv(plan.pillar2Monthly) +
    pv(plan.commercialAnnuityMonthly) + pv(plan.assetPoolMonthly);

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

      {/* 4. 养老投入现金流 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            养老投入现金流
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 当前年度摘要 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">当前年度月均支出</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#3b82f6]" />
                    个人养老金
                  </span>
                  <span>{formatCurrency(plan.annualCashFlow.personalPensionMonthly)}/月</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#a855f7]" />
                    商业险保费（在缴）
                  </span>
                  <span>{formatCurrency(plan.annualCashFlow.activeInsurancePremiumMonthly)}/月</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#f97316]" />
                    养老定投
                  </span>
                  <span>{formatCurrency(plan.annualCashFlow.dedicatedSavingMonthly)}/月</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2 mt-1">
                  <span>已承诺合计</span>
                  <span>
                    {formatCurrency(plan.annualCashFlow.totalCommittedMonthly)}/月
                    <span className="ml-2 text-muted-foreground font-normal">
                      ({(plan.annualCashFlow.committedRatioOfIncome * 100).toFixed(1)}% 收入)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span className="flex items-center gap-2">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
                    建议补充储蓄
                  </span>
                  <span>{formatCurrency(plan.annualCashFlow.requiredAdditionalMonthly)}/月</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>全部合计</span>
                  <span>
                    {formatCurrency(plan.annualCashFlow.totalRequiredMonthly)}/月
                    <span className="ml-2 text-muted-foreground font-normal">
                      ({(plan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(1)}% 收入)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs pt-1 border-t">
                  <span>社保个人缴费（参考，已代扣）</span>
                  <span>{formatCurrency(plan.annualCashFlow.socialSecurityPersonalMonthly)}/月</span>
                </div>
              </div>
            </div>

            {/* 右侧：可负担性提示 */}
            <div className="flex flex-col justify-center space-y-3">
              {plan.annualCashFlow.totalRequiredRatioOfIncome > 0.5 ? (
                <div className="p-4 bg-red-50 rounded-lg text-sm text-red-700 space-y-1">
                  <p className="font-semibold">负担较重</p>
                  <p>
                    按当前规划，养老投入将占月收入的{' '}
                    {(plan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(0)}%，
                    建议重新评估目标替代率或延长退休年龄。
                  </p>
                </div>
              ) : plan.annualCashFlow.totalRequiredRatioOfIncome > 0.3 ? (
                <div className="p-4 bg-yellow-50 rounded-lg text-sm text-yellow-700 space-y-1">
                  <p className="font-semibold">负担适中</p>
                  <p>
                    养老投入占月收入的{' '}
                    {(plan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(0)}%，
                    处于合理区间，注意短期流动性。
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-green-50 rounded-lg text-sm text-green-700 space-y-1">
                  <p className="font-semibold">负担可控</p>
                  <p>
                    养老投入占月收入的{' '}
                    {(plan.annualCashFlow.totalRequiredRatioOfIncome * 100).toFixed(0)}%，
                    在可承受范围内。
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 全生命周期现金流时序图 */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">
              养老现金流时序（积累期投入 / 退休后收入）
            </p>
            <LifetimeCashFlowChart plan={plan} input={input} />
          </div>
        </CardContent>
      </Card>

      {/* 8. 行动建议卡片 */}
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

      {/* 9. 政策风险提示 */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-lg">政策风险提示</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>以下政策变化可能影响您的规划，建议每 1-2 年重新测算：</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>退休年龄进一步延迟：2025年改革将法定退休年龄逐步延至男63岁、女55/58岁，但随着预期寿命继续延长与养老金收支压力加大，未来10-20年内可能再次上调；若您当前设定的退休年龄低于届时法定年龄，可能无法按计划领取社保</li>
            <li>计发月数上调：个人账户月领金额 = 余额 ÷ 计发月数，政府可能依据寿命数据更新计发月数表，导致月领金额下降</li>
            <li>个人账户利率下行：2024年记账利率仅 2.62%，为历史最低；本规划使用 4% 保守估算</li>
            <li>养老金待遇计算调整：历次改革均按老人老办法过渡，但过渡期计算规则仍存在不确定性</li>
          </ul>
        </CardContent>
      </Card>

      {/* 10. 行动清单 */}
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
