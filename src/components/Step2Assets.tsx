import { UserInput, CommercialInsurance, REGION_DATA } from '@/engine';
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

  const addInsurance = () => {
    const newInsurance: CommercialInsurance = {
      premiumStartAge: input.currentAge,
      premiumYears: 10,
      annualPremium: 0,
      benefitStartAge: input.retirementAge,
      benefitType: 'annual',
      benefitAmount: 0,
      benefitYears: 0,
    };
    update({ commercialInsurances: [...input.commercialInsurances, newInsurance] });
  };

  const removeInsurance = (index: number) => {
    update({
      commercialInsurances: input.commercialInsurances.filter((_, i) => i !== index),
    });
  };

  const updateInsurance = (index: number, updates: Partial<CommercialInsurance>) => {
    const newInsurances = [...input.commercialInsurances];
    newInsurances[index] = { ...newInsurances[index], ...updates };
    update({ commercialInsurances: newInsurances });
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
                  {input.province && REGION_DATA[input.province]
                    ? `${formatCurrency(REGION_DATA[input.province].contribBaseLower)} - ${formatCurrency(REGION_DATA[input.province].contribBaseUpper)}`
                    : '请先选择省份'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">社平工资增速</span>
                <span className="font-medium">{(input.socialWageGrowthRate * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialInsuranceAccountBalance">社保个人账户余额（可选）</Label>
              <Input
                id="socialInsuranceAccountBalance"
                type="number"
                min={0}
                value={input.socialInsuranceAccountBalance ?? 0}
                onChange={(e) => update({ socialInsuranceAccountBalance: Number(e.target.value) })}
              />
              <p className="text-xs text-muted-foreground">
                从社保App → 我的账户中查询实际余额；不填则按缴费年限自动估算（可能偏高）
              </p>
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

      {/* 商业保险 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">商业保险</CardTitle>
            <CardDescription>可添加多份保单，金额填写保单约定的确定值</CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={addInsurance}>
            <Plus className="w-4 h-4 mr-2" />
            添加一份
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {input.commercialInsurances.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              暂时未添加商业保险
            </p>
          ) : (
            input.commercialInsurances.map((ins, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                  <CardTitle className="text-base">第 {index + 1} 份保单</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInsurance(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 缴费信息 */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`premium-start-${index}`}>缴费开始年龄</Label>
                      <Input
                        id={`premium-start-${index}`}
                        type="number"
                        min={input.currentAge}
                        max={80}
                        value={ins.premiumStartAge}
                        onChange={(e) => updateInsurance(index, { premiumStartAge: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`premium-years-${index}`}>缴费年数</Label>
                      <Input
                        id={`premium-years-${index}`}
                        type="number"
                        min={1}
                        max={40}
                        value={ins.premiumYears}
                        onChange={(e) => updateInsurance(index, { premiumYears: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`annual-premium-${index}`}>年缴保费（元）</Label>
                      <Input
                        id={`annual-premium-${index}`}
                        type="number"
                        min={0}
                        value={ins.annualPremium}
                        onChange={(e) => updateInsurance(index, { annualPremium: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  {/* 领取信息 */}
                  <div className="space-y-2">
                    <Label>领取方式</Label>
                    <RadioGroup
                      value={ins.benefitType}
                      onValueChange={(v) =>
                        updateInsurance(index, { benefitType: v as 'lump_sum' | 'annual' })
                      }
                      className="flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="annual" id={`benefit-annual-${index}`} />
                        <Label htmlFor={`benefit-annual-${index}`}>每年领取</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="lump_sum" id={`benefit-lump-${index}`} />
                        <Label htmlFor={`benefit-lump-${index}`}>一次性领取</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`benefit-start-${index}`}>领取开始年龄</Label>
                      <Input
                        id={`benefit-start-${index}`}
                        type="number"
                        min={40}
                        max={90}
                        value={ins.benefitStartAge}
                        onChange={(e) => updateInsurance(index, { benefitStartAge: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`benefit-amount-${index}`}>
                        {ins.benefitType === 'annual' ? '年领取金额（元）' : '一次性领取总额（元）'}
                      </Label>
                      <Input
                        id={`benefit-amount-${index}`}
                        type="number"
                        min={0}
                        value={ins.benefitAmount}
                        onChange={(e) => updateInsurance(index, { benefitAmount: Number(e.target.value) })}
                      />
                    </div>
                    {ins.benefitType === 'annual' && (
                      <div className="space-y-2">
                        <Label htmlFor={`benefit-years-${index}`}>可领年数（0=终身）</Label>
                        <Input
                          id={`benefit-years-${index}`}
                          type="number"
                          min={0}
                          max={50}
                          value={ins.benefitYears}
                          onChange={(e) => updateInsurance(index, { benefitYears: Number(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>

                  {/* 缴费摘要 */}
                  <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg space-y-1">
                    <div className="flex justify-between">
                      <span>缴费期间</span>
                      <span>{ins.premiumStartAge} ~ {ins.premiumStartAge + ins.premiumYears - 1} 岁，共 {ins.premiumYears} 年</span>
                    </div>
                    <div className="flex justify-between">
                      <span>累计保费</span>
                      <span>{(ins.annualPremium * ins.premiumYears).toLocaleString()} 元</span>
                    </div>
                    {ins.benefitType === 'annual' && (
                      <div className="flex justify-between">
                        <span>月均领取</span>
                        <span>{(ins.benefitAmount / 12).toFixed(0)} 元/月</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
