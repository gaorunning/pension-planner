import { UserInput, REGION_DATA, REGION_GROUPS } from '@/engine';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { PROVINCE_LIFE_EXPECTANCY, PENSION_BASE_BY_REGION } from '@/engine/constants';

interface Step1BasicProps {
  input: UserInput;
  onChange: (input: UserInput) => void;
}

// Derive life expectancy from province + gender using 2020 census data + ~1yr adjustment
function deriveLifeExpectancy(provinceCode: string, gender: 'male' | 'female'): number {
  const lifeRegionCode = provinceCode === 'shenzhen' ? 'guangdong' : provinceCode;
  const regionData = PROVINCE_LIFE_EXPECTANCY.find(r => r.regionCode === lifeRegionCode)
    ?? PROVINCE_LIFE_EXPECTANCY.find(r => r.regionCode === 'national');
  if (!regionData) return gender === 'male' ? 80 : 85;
  const d2020 = regionData.data.find(d => d.year === 2020);
  if (!d2020) return gender === 'male' ? 80 : 85;
  const base = gender === 'male' ? d2020.male : d2020.female;
  return Math.round(base + 1); // ~1 year improvement since 2020 census
}

// Get latest pension base for a region
function getPensionBase(provinceCode: string): number | null {
  const regionEntry = PENSION_BASE_BY_REGION.find(r => r.regionCode === provinceCode);
  if (!regionEntry) return null;
  const sorted = [...regionEntry.data].sort((a, b) => b.year - a.year);
  return sorted[0]?.monthlyBase ?? null;
}

export function Step1Basic({ input, onChange }: Step1BasicProps) {
  const update = (updates: Partial<UserInput>) => onChange({ ...input, ...updates });

  const handleCurrentAgeChange = (currentAge: number) => {
    update({ currentAge, retirementAge: Math.max(input.retirementAge, currentAge + 1) });
  };

  const handleProvinceChange = (province: string) => {
    const region = REGION_DATA[province];
    // Use pension base as avgSocialWage; fall back to REGION_DATA avgMonthlyWage
    const pensionBase = getPensionBase(province) ?? region.avgMonthlyWage;
    const lifeExpectancy = deriveLifeExpectancy(province, input.gender);
    update({
      province,
      avgSocialWage: pensionBase,
      lifeExpectancy,
    });
  };

  const handleGenderChange = (gender: 'male' | 'female') => {
    const lifeExpectancy = deriveLifeExpectancy(input.province, gender);
    update({ gender, lifeExpectancy });
  };

  const yearsToRetirement = input.retirementAge - input.currentAge;
  const yearsInRetirement = input.lifeExpectancy - input.retirementAge;
  const pensionBase = getPensionBase(input.province) ?? REGION_DATA[input.province]?.avgMonthlyWage ?? 0;

  const handleRetirementAgeChange = (value: string) => {
    if (value === '') return; // 允许空值，让用户可以编辑
    const num = Number(value);
    if (isNaN(num)) return;
    // 在 blur 时再做范围校验，这里先允许用户自由输入
    update({ retirementAge: num });
  };

  const handleRetirementAgeBlur = () => {
    const minAge = Math.max(50, input.currentAge + 1);
    const clamped = Math.max(Math.min(input.retirementAge, 70), minAge);
    if (clamped !== input.retirementAge) {
      update({ retirementAge: clamped });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">基本信息</h2>
        <p className="text-muted-foreground">请告诉我们您的基本情况</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">个人与收入信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Age inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentAge">当前年龄</Label>
              <Input id="currentAge" type="number" min={22} max={65}
                value={input.currentAge}
                onChange={e => handleCurrentAgeChange(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retirementAge">计划退休年龄</Label>
              <Input id="retirementAge" type="number"
                value={input.retirementAge}
                onChange={e => handleRetirementAgeChange(e.target.value)}
                onBlur={handleRetirementAgeBlur} />
            </div>
          </div>

          {/* Row 2: Gender */}
          <div className="space-y-2">
            <Label>性别</Label>
            <RadioGroup value={input.gender}
              onValueChange={v => handleGenderChange(v as 'male' | 'female')}
              className="flex flex-row gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="male" id="male" /><Label htmlFor="male">男</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="female" id="female" /><Label htmlFor="female">女</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Row 3: Province */}
          <div className="space-y-2">
            <Label htmlFor="province">所在地区</Label>
            <Select id="province" value={input.province}
              onChange={e => handleProvinceChange(e.target.value)}>
              {REGION_GROUPS.map(group => (
                <optgroup key={group.name} label={group.name}>
                  {group.regions.map(code => {
                    const region = REGION_DATA[code];
                    const base = getPensionBase(code) ?? region.avgMonthlyWage;
                    return (
                      <option key={code} value={code}>
                        {region.name} — 计发基数 ¥{base.toLocaleString()}/月
                      </option>
                    );
                  })}
                </optgroup>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">计发基数为该地区养老金计算基准月工资（人社局公告）</p>
          </div>

          {/* Row 4: Income */}
          <div className="space-y-2">
            <Label htmlFor="monthlyIncome">当前税前月收入（元）</Label>
            <Input id="monthlyIncome" type="number" min={1}
              value={input.monthlyIncome}
              onChange={e => update({ monthlyIncome: Math.max(1, Number(e.target.value)) })} />
          </div>

          {/* Info panel */}
          <div className="p-4 bg-muted/60 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">距退休</p>
              <p className="font-semibold">{yearsToRetirement} 年</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">退休后生活</p>
              <p className="font-semibold">{yearsInRetirement} 年</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">计发基数</p>
              <p className="font-semibold">¥{pensionBase.toLocaleString()}/月</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-0.5">预期寿命（自动）</p>
              <p className="font-semibold">{input.lifeExpectancy} 岁</p>
              <p className="text-xs text-muted-foreground">基于{input.province === 'shenzhen' ? '广东省' : '本地'}数据</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
