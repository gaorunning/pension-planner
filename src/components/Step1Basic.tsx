import { UserInput, REGION_DATA, REGION_GROUPS } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { formatCurrency } from '@/lib/utils';

interface Step1BasicProps {
  input: UserInput;
  onChange: (input: UserInput) => void;
}

export function Step1Basic({ input, onChange }: Step1BasicProps) {
  const update = (updates: Partial<UserInput>) => {
    onChange({ ...input, ...updates });
  };

  const handleCurrentAgeChange = (currentAge: number) => {
    update({
      currentAge,
      retirementAge: Math.max(input.retirementAge, currentAge + 1),
    });
  };

  const handleRetirementAgeChange = (retirementAge: number) => {
    update({
      retirementAge: Math.max(retirementAge, input.currentAge + 1),
    });
  };

  const handleProvinceChange = (province: string) => {
    const region = REGION_DATA[province];
    update({
      province,
      avgSocialWage: region.avgMonthlyWage,
      socialWageGrowthRate: region.wageGrowthRate,
    });
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    update({
      gender,
      lifeExpectancy: gender === 'male' ? 80 : 85,
    });
  };

  const yearsToRetirement = input.retirementAge - input.currentAge;
  const yearsInRetirement = input.lifeExpectancy - input.retirementAge;
  const currentRegion = REGION_DATA[input.province];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">基本信息</h2>
        <p className="text-muted-foreground">请告诉我们您的基本情况</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">个人信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge">当前年龄</Label>
              <Input
                id="currentAge"
                type="number"
                min={22}
                max={65}
                value={input.currentAge}
                onChange={(e) => handleCurrentAgeChange(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retirementAge">计划退休年龄</Label>
              <Input
                id="retirementAge"
                type="number"
                min={Math.max(50, input.currentAge + 1)}
                max={70}
                value={input.retirementAge}
                onChange={(e) => handleRetirementAgeChange(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>性别</Label>
              <RadioGroup
                value={input.gender}
                onValueChange={(v) => handleGenderChange(v as 'male' | 'female')}
                className="flex flex-row gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">男</Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">女</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifeExpectancy">预期寿命</Label>
              <Input
                id="lifeExpectancy"
                type="number"
                min={75}
                max={100}
                value={input.lifeExpectancy}
                onChange={(e) => update({ lifeExpectancy: Number(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">地区与收入</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="province">所在省份</Label>
              <Select
                id="province"
                value={input.province}
                onChange={(e) => handleProvinceChange(e.target.value)}
              >
                {REGION_GROUPS.map((group) => (
                  <optgroup key={group.name} label={group.name}>
                    {group.regions.map((code) => {
                      const region = REGION_DATA[code];
                      return (
                        <option key={code} value={code}>
                          {region.name} - {formatCurrency(region.avgMonthlyWage)}/月
                        </option>
                      );
                    })}
                  </optgroup>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">当前税前月收入</Label>
              <Input
                id="monthlyIncome"
                type="number"
                min={1}
                value={input.monthlyIncome}
                onChange={(e) => update({ monthlyIncome: Math.max(1, Number(e.target.value)) })}
              />
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">距离退休</span>
                <span className="font-medium">{yearsToRetirement} 年</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">退休后生活</span>
                <span className="font-medium">{yearsInRetirement} 年</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">计发基数</span>
                <span className="font-medium">{formatCurrency(currentRegion.avgMonthlyWage)}/月</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
