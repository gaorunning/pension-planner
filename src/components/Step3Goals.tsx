import { UserInput } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { RadioGroupItem } from './ui/radio-group';
import { formatCurrency } from '@/lib/utils';

interface Step3GoalsProps {
  input: UserInput;
  onChange: (input: UserInput) => void;
}

export function Step3Goals({ input, onChange }: Step3GoalsProps) {
  const update = (updates: Partial<UserInput>) => {
    onChange({ ...input, ...updates });
  };

  const yearsToRetirement = input.retirementAge - input.currentAge;

  const calculateTarget = (replacementRate: number) => {
    const today = input.monthlyIncome * replacementRate;
    const atRetirement = today * Math.pow(1 + input.inflationRate, yearsToRetirement);
    return { today, atRetirement };
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">目标与偏好</h2>
        <p className="text-muted-foreground">设定您的退休生活目标和投资偏好</p>
      </div>

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
              {formatCurrency(calculateTarget(0.60).today)}
            </p>
            <p className="text-sm text-muted-foreground">
              退休时: {formatCurrency(calculateTarget(0.60).atRetirement)}
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
              {formatCurrency(calculateTarget(0.75).today)}
            </p>
            <p className="text-sm text-muted-foreground">
              退休时: {formatCurrency(calculateTarget(0.75).atRetirement)}
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
              {formatCurrency(calculateTarget(0.90).today)}
            </p>
            <p className="text-sm text-muted-foreground">
              退休时: {formatCurrency(calculateTarget(0.90).atRetirement)}
            </p>
            <p className="text-sm mt-2 text-muted-foreground">
              旅行、医疗、兴趣充足
            </p>
          </CardContent>
        </Card>

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">高级参数（可选）</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="inflationRate">通胀率假设</Label>
            <Input
              id="inflationRate"
              type="number"
              step={0.005}
              min={0.01}
              max={0.1}
              value={input.inflationRate}
              onChange={(e) => update({ inflationRate: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">当前: {(input.inflationRate * 100).toFixed(1)}%</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="socialWageGrowthRate">社平工资增速</Label>
            <Input
              id="socialWageGrowthRate"
              type="number"
              step={0.005}
              min={0.02}
              max={0.1}
              value={input.socialWageGrowthRate}
              onChange={(e) => update({ socialWageGrowthRate: Number(e.target.value) })}
            />
            <p className="text-xs text-muted-foreground">当前: {(input.socialWageGrowthRate * 100).toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
