import { UserInput, CommercialAnnuity } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';

interface Step2AssetsProps {
  input: UserInput;
  onChange: (input: UserInput) => void;
}

export function Step2Assets({ input, onChange }: Step2AssetsProps) {
  const update = (updates: Partial<UserInput>) => {
    onChange({ ...input, ...updates });
  };

  const addAnnuity = () => {
    const newAnnuity: CommercialAnnuity = {
      type: 'annuity_insurance',
      monthlyPayment: 0,
      policyEndAge: input.retirementAge,
      monthlyBenefit: 0,
      estimatedTotalValue: 0,
    };
    update({ commercialAnnuities: [...input.commercialAnnuities, newAnnuity] });
  };

  const removeAnnuity = (index: number) => {
    update({
      commercialAnnuities: input.commercialAnnuities.filter((_, i) => i !== index),
    });
  };

  const updateAnnuity = (index: number, updates: Partial<CommercialAnnuity>) => {
    const newAnnuities = [...input.commercialAnnuities];
    newAnnuities[index] = { ...newAnnuities[index], ...updates };
    update({ commercialAnnuities: newAnnuities });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">养老底座</h2>
        <p className="text-muted-foreground">请填写您的社保和养老资产情况</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">社保情况</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contributionYears">社保已缴年限</Label>
              <Input
                id="contributionYears"
                type="number"
                min={0}
                max={40}
                value={input.contributionYears}
                onChange={(e) => update({ contributionYears: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>缴费基数比例</Label>
              <RadioGroup
                value={String(input.contributionRatio)}
                onValueChange={(v) => update({ contributionRatio: Number(v) })}
                className="flex flex-wrap gap-2"
              >
                {[0.6, 0.8, 1.0, 1.5, 2.0, 3.0].map((ratio) => (
                  <div key={ratio} className="flex items-center gap-2">
                    <RadioGroupItem value={String(ratio)} id={`ratio-${ratio}`} />
                    <Label htmlFor={`ratio-${ratio}`}>{(ratio * 100).toFixed(0)}%</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="p-4 bg-muted rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">计发基数</span>
                <span className="font-medium">{formatCurrency(input.avgSocialWage)}/月</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">缴费基数上下限</span>
                <span className="font-medium">
                  {input.province ? (() => {
                    // 简单查找，实际应该从 regionData 导入
                    const dummyData = { contribBaseLower: 3600, contribBaseUpper: 18000 };
                    return `${formatCurrency(dummyData.contribBaseLower)} - ${formatCurrency(dummyData.contribBaseUpper)}`;
                  })() : '请先选择省份'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">社平工资增速</span>
                <span className="font-medium">{(input.socialWageGrowthRate * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="hasEnterpriseAnnuity">有企业年金</Label>
              <Switch
                id="hasEnterpriseAnnuity"
                checked={input.hasEnterpriseAnnuity}
                onCheckedChange={(checked) => update({ hasEnterpriseAnnuity: checked })}
              />
            </div>

            {input.hasEnterpriseAnnuity && (
              <div className="space-y-2">
                <Label htmlFor="annuityMonthly">企业年金月缴（个人 + 单位）</Label>
                <Input
                  id="annuityMonthly"
                  type="number"
                  min={0}
                  value={input.annuityMonthly}
                  onChange={(e) => update({ annuityMonthly: Number(e.target.value) })}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">养老专项资金池</CardTitle>
            <CardDescription>请填写您专门用于养老的钱</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dedicatedRetirementSavings">已划入养老的存量资金</Label>
              <Input
                id="dedicatedRetirementSavings"
                type="number"
                min={0}
                value={input.dedicatedRetirementSavings}
                onChange={(e) => update({ dedicatedRetirementSavings: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyDedicatedSaving">每月额外定投养老</Label>
              <Input
                id="monthlyDedicatedSaving"
                type="number"
                min={0}
                value={input.monthlyDedicatedSaving}
                onChange={(e) => update({ monthlyDedicatedSaving: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="personalPensionAnnual">个人养老金账户年缴</Label>
              <Input
                id="personalPensionAnnual"
                type="number"
                min={0}
                max={12000}
                value={input.personalPensionAnnual}
                onChange={(e) => update({ personalPensionAnnual: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">上限 12000 元/年，可税前扣除</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personalPensionContribYears">已缴年数</Label>
                <Input
                  id="personalPensionContribYears"
                  type="number"
                  min={0}
                  value={input.personalPensionContribYears}
                  onChange={(e) => update({ personalPensionContribYears: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalPensionCurrentBalance">当前余额（可选）</Label>
                <Input
                  id="personalPensionCurrentBalance"
                  type="number"
                  min={0}
                  value={input.personalPensionCurrentBalance}
                  onChange={(e) => update({ personalPensionCurrentBalance: Number(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 商业养老保险 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">商业养老保险</CardTitle>
            <CardDescription>可添加多份保单</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={addAnnuity}>
            <Plus className="w-4 h-4 mr-2" />
            添加一份
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {input.commercialAnnuities.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              暂时未添加商业养老保险
            </p>
          ) : (
            input.commercialAnnuities.map((annuity, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <CardTitle className="text-base">第 {index + 1} 份保单</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAnnuity(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>保险类型</Label>
                    <RadioGroup
                      value={annuity.type}
                      onValueChange={(v: string) =>
                        updateAnnuity(index, { type: v as 'annuity_insurance' | 'savings_insurance' | 'participating' })
                      }
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="annuity_insurance" id={`type-annuity-${index}`} />
                        <Label htmlFor={`type-annuity-${index}`}>
                          年金险（确定收入）
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="savings_insurance" id={`type-savings-${index}`} />
                        <Label htmlFor={`type-savings-${index}`}>
                          储蓄险（增额寿/万能险）
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="participating" id={`type-participating-${index}`} />
                        <Label htmlFor={`type-participating-${index}`}>
                          分红险（收益不确定）
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`monthly-payment-${index}`}>每月在缴保费（元）</Label>
                    <Input
                      id={`monthly-payment-${index}`}
                      type="number"
                      min={0}
                      value={annuity.monthlyPayment}
                      onChange={(e) => updateAnnuity(index, { monthlyPayment: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`policy-end-${index}`}>保单约定领取年龄</Label>
                    <Input
                      id={`policy-end-${index}`}
                      type="number"
                      min={50}
                      max={80}
                      value={annuity.policyEndAge}
                      onChange={(e) => updateAnnuity(index, { policyEndAge: Number(e.target.value) })}
                    />
                  </div>

                  {annuity.type === 'annuity_insurance' ? (
                    <div className="space-y-2">
                      <Label htmlFor={`monthly-benefit-${index}`}>约定每月领取金额（元）</Label>
                      <Input
                        id={`monthly-benefit-${index}`}
                        type="number"
                        min={0}
                        value={annuity.monthlyBenefit ?? 0}
                        onChange={(e) => updateAnnuity(index, { monthlyBenefit: Number(e.target.value) })}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor={`estimated-value-${index}`}>预计领取时账户价值（元）</Label>
                      <Input
                        id={`estimated-value-${index}`}
                        type="number"
                        min={0}
                        value={annuity.estimatedTotalValue ?? 0}
                        onChange={(e) => updateAnnuity(index, { estimatedTotalValue: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        可从保险公司演示文件读取保守情景值
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
