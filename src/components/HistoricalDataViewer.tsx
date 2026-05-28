import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { X, TrendingUp, DollarSign, Percent, Users, PiggyBank, MapPin } from 'lucide-react';

import {
  ALL_WAGE_HISTORIES,
  SOCIAL_INSURANCE_INTEREST_HISTORY,
  BANK_DEPOSIT_RATE_HISTORY,
  TREASURY_BOND_YIELD_HISTORY,
  INFLATION_HISTORY,
  INFLATION_STATISTICS,
  // LIFE_EXPECTANCY_HISTORY,   // 预期寿命 Tab 暂时注释
  // LIFE_EXPECTANCY_PROJECTION,
  // CITY_LIFE_EXPECTANCY,
  PERSONAL_PENSION_RETURNS,
  HISTORICAL_DATABASE_INFO,
  PENSION_BASE_BY_REGION,
  getPensionBaseRanking,
  PROVINCE_LIFE_EXPECTANCY,
} from '@/engine/constants';

interface HistoricalDataViewerProps {
  onClose: () => void;
}

export function HistoricalDataViewer({ onClose }: HistoricalDataViewerProps) {
  const [selectedLifeRegion, setSelectedLifeRegion] = useState('national');

  // 准备工资数据（固定全国口径）
  const regionHistory = ALL_WAGE_HISTORIES['national'];
  const wageData = regionHistory?.data.map(d => ({
    year: d.year,
    avgMonthlyWage: d.avgMonthlyWage,
    growthRate: d.growthRate * 100,
  })) || [];

  // 准备利率数据
  const rateData = SOCIAL_INSURANCE_INTEREST_HISTORY.map(d => {
    const bankRate = BANK_DEPOSIT_RATE_HISTORY.find(r => r.year === d.year);
    const bondRate = TREASURY_BOND_YIELD_HISTORY.find(r => r.year === d.year);
    return {
      year: d.year,
      socialInsurance: d.rate * 100,
      bankDeposit: bankRate ? bankRate.rate * 100 : 0,
      treasuryBond: bondRate ? bondRate.rate * 100 : 0,
    };
  });

  // 准备通胀数据
  const inflationData = INFLATION_HISTORY.map(d => ({
    year: d.year,
    cpi: d.cpi * 100,
    cumulative: (d.cpiCumulative - 1) * 100,
  }));

  // 预期寿命数据准备 — 暂时注释，Tab 隐藏中
  // const LAST_REAL_YEAR = 2025;
  // const lifeExpectancyData = [...LIFE_EXPECTANCY_HISTORY, ...LIFE_EXPECTANCY_PROJECTION...];

  // 准备个人养老金收益率数据
  const pensionReturnData = PERSONAL_PENSION_RETURNS.filter(d => d.sampleSize > 0 || d.year >= 2022).reduce((acc, d) => {
    const existing = acc.find(a => a.year === d.year);
    if (existing) {
      existing[d.productType] = d.averageReturn * 100;
    } else {
      acc.push({
        year: d.year,
        [d.productType]: d.averageReturn * 100,
      });
    }
    return acc;
  }, [] as Array<{ year: number; savings?: number; wealthManagement?: number; fund?: number; insurance?: number }>);

  // 计发基数排名数据（2023年）
  const pensionBaseRanking = getPensionBaseRanking(2023);

  // 计发基数历年趋势（柱状图用，取前6个主要地区）
  const KEY_REGION_CODES = ['beijing', 'shanghai', 'shenzhen', 'guangdong', 'zhejiang', 'jiangsu'];
  const YEAR_LIST = [2023, 2024, 2025, 2026];
  const pensionBaseTrend = YEAR_LIST.map(year => {
    const row: Record<string, number | string> = { year };
    KEY_REGION_CODES.forEach(code => {
      const r = PENSION_BASE_BY_REGION.find(x => x.regionCode === code);
      const val = r?.data.find(d => d.year === year)?.monthlyBase;
      if (val) row[code] = val;
    });
    return row;
  });

  // 省级预期寿命数据
  const lifeRegions = PROVINCE_LIFE_EXPECTANCY.filter(r => r.regionCode !== 'national');
  const selectedLifeExpData = PROVINCE_LIFE_EXPECTANCY.find(r => r.regionCode === selectedLifeRegion);
  const lifeExpChartData = selectedLifeExpData?.data.map(d => ({
    year: d.year, male: d.male, female: d.female, total: d.total,
  })) ?? [];

  // 判断某条记录是否有真实数据来源
  const isRealData = (source: string) =>
    !source.includes('推算') && !source.includes('预测') && !source.includes('估算');

  // ── 年化统计计算 ──────────────────────────────────────
  /** CAGR：复合年化增长率 */
  const cagr = (start: number, end: number, years: number) =>
    ((end / start) ** (1 / years) - 1) * 100;

  /** 算术平均（数组） */
  const avg = (arr: number[]) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;

  // 社平工资统计（当前选中地区）
  const wageStats = (() => {
    const d = regionHistory?.data.filter(x => !x.source.includes('预测') && !x.source.includes('推算')) ?? [];
    if (d.length < 2) return null;
    const first = d[0], last = d[d.length - 1];
    const years10Start = d.find(x => x.year === last.year - 10) ?? d[0];
    const years5Start  = d.find(x => x.year === last.year - 5)  ?? d[0];
    const rates = d.slice(1).map(x => x.growthRate * 100);
    return {
      fullCAGR:  cagr(first.avgMonthlyWage, last.avgMonthlyWage, last.year - first.year),
      cagr10:    cagr(years10Start.avgMonthlyWage, last.avgMonthlyWage, last.year - years10Start.year),
      cagr5:     cagr(years5Start.avgMonthlyWage,  last.avgMonthlyWage, last.year - years5Start.year),
      avgRate:   avg(rates),
      firstYear: first.year, lastYear: last.year,
      firstWage: first.avgMonthlyWage, lastWage: last.avgMonthlyWage,
    };
  })();

  // 利率统计
  const rateStats = (() => {
    const govtPeriod = SOCIAL_INSURANCE_INTEREST_HISTORY.filter(d => d.type === 'govt');
    const bankPeriod = SOCIAL_INSURANCE_INTEREST_HISTORY.filter(d => d.type === 'bank');
    const bondAll    = TREASURY_BOND_YIELD_HISTORY.filter(d => d.year <= 2024);
    const bankAll    = BANK_DEPOSIT_RATE_HISTORY.filter(d => d.year <= 2024);
    const recent5    = govtPeriod.filter(d => d.year >= 2020 && d.year <= 2024);
    return {
      avgGovt:   avg(govtPeriod.map(d => d.rate * 100)),
      avgBank:   avg(bankPeriod.map(d => d.rate * 100)),
      avgBond:   avg(bondAll.map(d => d.rate * 100)),
      avgDeposit:avg(bankAll.map(d => d.rate * 100)),
      recent5Avg:avg(recent5.map(d => d.rate * 100)),
      latest:    (govtPeriod[govtPeriod.length - 1]?.rate ?? 0) * 100,
      peak:      Math.max(...govtPeriod.map(d => d.rate * 100)),
    };
  })();

  // CPI 统计
  const cpiStats = (() => {
    const real = INFLATION_HISTORY.filter(d => d.year <= 2024);
    const r5   = real.filter(d => d.year >= 2020);
    const r10  = real.filter(d => d.year >= 2015);
    const first = real[0], last = real[real.length - 1];
    return {
      avgFull:   avg(real.map(d => d.cpi * 100)),
      avg10:     avg(r10.map(d => d.cpi * 100)),
      avg5:      avg(r5.map(d => d.cpi * 100)),
      cumulative:(last.cpiCumulative / first.cpiCumulative - 1) * 100,
      maxYear:   real.reduce((a, b) => a.cpi > b.cpi ? a : b),
      minYear:   real.reduce((a, b) => a.cpi < b.cpi ? a : b),
    };
  })();

  // 预期寿命统计 — 暂时注释，Tab 隐藏中
  // const lifeStats = (...)();

  // 省级寿命统计（当前选中省份）
  const provinceLifeStats = (() => {
    const d = selectedLifeExpData?.data ?? [];
    if (d.length < 2) return null;
    const first = d[0], last = d[d.length - 1];
    const span = last.year - first.year;
    return {
      gainMale:   last.male   - first.male,
      gainFemale: last.female - first.female,
      gainTotal:  last.total  - first.total,
      annualMale:   (last.male   - first.male)   / span,
      annualFemale: (last.female - first.female) / span,
      annualTotal:  (last.total  - first.total)  / span,
      firstYear: first.year, lastYear: last.year,
    };
  })();

  // 养老金产品收益率统计
  const pensionReturnStats = (() => {
    const byType = (type: string) => {
      const vals = PERSONAL_PENSION_RETURNS.filter(d => d.productType === type && d.sampleSize > 0).map(d => d.averageReturn * 100);
      return vals.length ? avg(vals) : null;
    };
    return {
      savings:        byType('savings'),
      wealthManagement: byType('wealthManagement'),
      fund:           byType('fund'),
      insurance:      byType('insurance'),
    };
  })();

  // 计发基数统计（各省 2023→2026 CAGR）
  const pensionBaseStats = (() => {
    const excluded = new Set(['hubei_tier2', 'hubei_tier3']);
    const regions = PENSION_BASE_BY_REGION.filter(r => !excluded.has(r.regionCode));
    const cagrs = regions.map(r => {
      const d23 = r.data.find(d => d.year === 2023)?.monthlyBase ?? 0;
      const d26 = r.data.find(d => d.year === 2026)?.monthlyBase ?? 0;
      return d23 > 0 ? cagr(d23, d26, 3) : 0;
    }).filter(v => v > 0);
    const bases2023 = regions.map(r => r.data.find(d => d.year === 2023)?.monthlyBase ?? 0).filter(v => v > 0);
    const bases2026 = regions.map(r => r.data.find(d => d.year === 2026)?.monthlyBase ?? 0).filter(v => v > 0);
    return {
      avgCAGR:    avg(cagrs),
      maxCAGR:    Math.max(...cagrs),
      minCAGR:    Math.min(...cagrs),
      avg2023:    avg(bases2023),
      avg2026:    avg(bases2026),
      totalGrowth: (avg(bases2026) / avg(bases2023) - 1) * 100,
    };
  })();

  // ── 可复用：年化统计小面板 ────────────────────────────
  type StatItem = { label: string; value: string; sub?: string; highlight?: boolean };
  const AnnualStatPanel = ({ title, items }: { title: string; items: StatItem[] }) => (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">{title}</p>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-baseline gap-2">
            <span className="text-xs text-gray-500 leading-tight">{item.label}</span>
            <span className={`text-sm font-semibold whitespace-nowrap ${item.highlight ? 'text-blue-600' : 'text-gray-800'}`}>
              {item.value}
              {item.sub && <span className="text-xs font-normal text-gray-400 ml-1">{item.sub}</span>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // Tooltip formatter helper
  const formatNumber = (value: any, label: string) => {
    if (value === undefined || value === null) return '';
    return [`${Number(value).toFixed(2)}`, label];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">历史数据中心</h1>
            <p className="text-gray-600">
              数据来源：{HISTORICAL_DATABASE_INFO.sources.slice(0, 3).join('、')} 等
              <span className="text-sm text-gray-400 ml-2">v{HISTORICAL_DATABASE_INFO.version}</span>
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        <Tabs defaultValue="wages" className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-7 gap-1 h-auto">
            <TabsTrigger value="wages" className="flex items-center gap-1 text-xs py-2">
              <DollarSign className="w-3 h-3" />
              社平工资
            </TabsTrigger>
            <TabsTrigger value="pensionbase" className="flex items-center gap-1 text-xs py-2">
              <MapPin className="w-3 h-3" />
              计发基数
            </TabsTrigger>
            <TabsTrigger value="interest" className="flex items-center gap-1 text-xs py-2">
              <Percent className="w-3 h-3" />
              利率数据
            </TabsTrigger>
            <TabsTrigger value="inflation" className="flex items-center gap-1 text-xs py-2">
              <TrendingUp className="w-3 h-3" />
              通货膨胀
            </TabsTrigger>
            {/* 预期寿命 Tab 暂时隐藏，待数据源确认后恢复 */}
            {/* <TabsTrigger value="life" className="flex items-center gap-1 text-xs py-2">
              <Users className="w-3 h-3" />
              预期寿命
            </TabsTrigger> */}
            <TabsTrigger value="liferegion" className="flex items-center gap-1 text-xs py-2">
              <Users className="w-3 h-3" />
              预期寿命
            </TabsTrigger>
            <TabsTrigger value="pension" className="flex items-center gap-1 text-xs py-2">
              <PiggyBank className="w-3 h-3" />
              养老金产品
            </TabsTrigger>
          </TabsList>

          {/* 社平工资 */}
          <TabsContent value="wages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>社会平均工资历史趋势</CardTitle>
                <p className="text-xs text-gray-400 mt-1">口径：城镇非私营单位在岗职工平均工资（国家统计局·平均工资公报）</p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-2">
                  <div className="md:col-span-1">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">月均工资（元）</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={wageData}>
                        <defs>
                          <linearGradient id="wageGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatNumber(value, '月均工资')} />
                        <Area type="monotone" dataKey="avgMonthlyWage" stroke="#3b82f6" fillOpacity={1} fill="url(#wageGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="md:col-span-1">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">工资增长率（%）</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={wageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatNumber(value, '增长率')} />
                        <Bar dataKey="growthRate" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="md:col-span-1 flex flex-col gap-3 justify-start pt-6">
                    {wageStats ? (
                      <AnnualStatPanel title="年化统计" items={[
                        { label: `全期复合增速（${wageStats.firstYear}–${wageStats.lastYear}）`, value: `${wageStats.fullCAGR.toFixed(1)}%`, highlight: true },
                        { label: '近 10 年 CAGR', value: `${wageStats.cagr10.toFixed(1)}%` },
                        { label: '近 5 年 CAGR', value: `${wageStats.cagr5.toFixed(1)}%` },
                        { label: '算术平均增速', value: `${wageStats.avgRate.toFixed(1)}%` },
                        { label: `${wageStats.firstYear} 月均`, value: `${wageStats.firstWage.toLocaleString()} 元` },
                        { label: `${wageStats.lastYear} 月均`, value: `${wageStats.lastWage.toLocaleString()} 元` },
                      ]} />
                    ) : (
                      <div className="text-sm text-gray-400 pt-4">暂无统计数据</div>
                    )}
                  </div>
                </div>

                {/* 数据来源说明 */}
                {regionHistory && (
                  <div className="mt-4 flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
                      实测数据（统计年鉴）
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-amber-400" />
                      推算值（基于NBS锚点建模）
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-gray-300" />
                      预测值
                    </span>
                  </div>
                )}

                {/* 数据表格 */}
                {regionHistory && (
                  <div className="mt-4">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                          <tr className="border-b">
                            <th className="text-left py-2 px-3">年份</th>
                            <th className="text-right py-2 px-3">月均工资</th>
                            <th className="text-right py-2 px-3">年均工资</th>
                            <th className="text-right py-2 px-3">增长率</th>
                            <th className="text-left py-2 px-3">数据来源</th>
                          </tr>
                        </thead>
                        <tbody>
                          {regionHistory.data.slice().reverse().map(d => (
                            <tr key={d.year} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-3 font-medium">{d.year}</td>
                              <td className="text-right py-2 px-3">{d.avgMonthlyWage.toLocaleString()}</td>
                              <td className="text-right py-2 px-3">{d.avgAnnualWage.toLocaleString()}</td>
                              <td className="text-right py-2 px-3">{(d.growthRate * 100).toFixed(1)}%</td>
                              <td className="py-2 px-3">
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                  d.source.includes('预测')
                                    ? 'bg-gray-100 text-gray-500'
                                    : isRealData(d.source)
                                      ? 'bg-green-50 text-green-700'
                                      : 'bg-amber-50 text-amber-700'
                                }`}>
                                  {d.source}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 养老金计发基数 */}
          <TabsContent value="pensionbase" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>各省养老金计发基数（2023–2026）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-sm text-gray-500">
                  口径：全口径城镇单位就业人员平均工资（2019年后各省单独公布，逐步向全口径社平工资靠拢）
                </div>

                {/* 主要地区历年趋势 + 统计面板 */}
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">重点地区计发基数走势（元/月）</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={pensionBaseTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis domain={[6000, 14000]} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => [`${Number(value).toLocaleString()} 元`, '']} />
                        <Legend />
                        <Line type="monotone" dataKey="beijing"   stroke="#ef4444" strokeWidth={2} name="北京" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="shanghai"  stroke="#f97316" strokeWidth={2} name="上海" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="shenzhen"  stroke="#8b5cf6" strokeWidth={2} name="深圳" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="guangdong" stroke="#3b82f6" strokeWidth={2} name="广东" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="zhejiang"  stroke="#10b981" strokeWidth={2} name="浙江" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="jiangsu"   stroke="#f59e0b" strokeWidth={2} name="江苏" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 justify-start pt-6">
                    <AnnualStatPanel title="年化统计（2023–2026）" items={[
                      { label: '各省平均 CAGR', value: `${pensionBaseStats.avgCAGR.toFixed(1)}%`, highlight: true },
                      { label: '最高省份增速', value: `${pensionBaseStats.maxCAGR.toFixed(1)}%` },
                      { label: '最低省份增速', value: `${pensionBaseStats.minCAGR.toFixed(1)}%` },
                      { label: '2023 各省均值', value: `${Math.round(pensionBaseStats.avg2023).toLocaleString()} 元` },
                      { label: '2026 各省均值', value: `${Math.round(pensionBaseStats.avg2026).toLocaleString()} 元` },
                      { label: '三年累计增幅', value: `+${pensionBaseStats.totalGrowth.toFixed(1)}%` },
                    ]} />
                  </div>
                </div>

                {/* 全省排名表 */}
                <h4 className="text-sm font-medium text-gray-600 mb-3">各省 2023 年计发基数排名</h4>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">排名</th>
                        <th className="text-left py-2 px-3">地区</th>
                        <th className="text-right py-2 px-3">2023</th>
                        <th className="text-right py-2 px-3">2024</th>
                        <th className="text-right py-2 px-3">2025</th>
                        <th className="text-right py-2 px-3">2026</th>
                        <th className="text-right py-2 px-3">增速(23→26)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pensionBaseRanking.map((item, idx) => {
                        const region = PENSION_BASE_BY_REGION.find(r => r.regionCode === item.regionCode);
                        const d2024 = region?.data.find(d => d.year === 2024)?.monthlyBase ?? 0;
                        const d2025 = region?.data.find(d => d.year === 2025)?.monthlyBase ?? 0;
                        const d2026 = region?.data.find(d => d.year === 2026)?.monthlyBase ?? 0;
                        const growth = item.monthlyBase > 0 ? ((d2026 / item.monthlyBase - 1) * 100).toFixed(1) : '-';
                        return (
                          <tr key={item.regionCode} className={`border-b border-gray-100 hover:bg-gray-50 ${idx < 3 ? 'bg-amber-50' : ''}`}>
                            <td className="py-2 px-3 font-medium text-gray-500">{idx + 1}</td>
                            <td className="py-2 px-3 font-medium">{item.regionName}</td>
                            <td className="text-right py-2 px-3">{item.monthlyBase.toLocaleString()}</td>
                            <td className="text-right py-2 px-3 text-gray-600">{d2024.toLocaleString()}</td>
                            <td className="text-right py-2 px-3 text-gray-600">{d2025.toLocaleString()}</td>
                            <td className="text-right py-2 px-3 text-gray-600">{d2026.toLocaleString()}</td>
                            <td className="text-right py-2 px-3 text-emerald-600 font-medium">+{growth}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  数据来源：各省人力资源和社会保障厅历年公告 · 单位：元/月
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 省级预期寿命 */}
          <TabsContent value="liferegion" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>分省份预期寿命（1990–2020）</CardTitle>
                  <select
                    value={selectedLifeRegion}
                    onChange={e => setSelectedLifeRegion(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    <option value="national">全国</option>
                    {lifeRegions.map(r => (
                      <option key={r.regionCode} value={r.regionCode}>{r.regionName}</option>
                    ))}
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">出生时预期寿命走势（岁）</h4>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={lifeExpChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis domain={[55, 90]} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatNumber(value, '岁')} />
                        <Legend />
                        <Line type="monotone" dataKey="male"   stroke="#3b82f6" strokeWidth={2} name="男性" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="female" stroke="#ec4899" strokeWidth={2} name="女性" dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="total"  stroke="#6b7280" strokeWidth={2} name="合计" strokeDasharray="5 5" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 justify-start pt-6">
                    {provinceLifeStats ? (
                      <AnnualStatPanel title={`年化统计（${provinceLifeStats.firstYear}–${provinceLifeStats.lastYear}）`} items={[
                        { label: '年均增加·男性', value: `+${provinceLifeStats.annualMale.toFixed(2)} 岁/年`,   highlight: true },
                        { label: '年均增加·女性', value: `+${provinceLifeStats.annualFemale.toFixed(2)} 岁/年` },
                        { label: '年均增加·合计', value: `+${provinceLifeStats.annualTotal.toFixed(2)} 岁/年` },
                        { label: '累计增加·男性', value: `+${provinceLifeStats.gainMale.toFixed(1)} 岁` },
                        { label: '累计增加·女性', value: `+${provinceLifeStats.gainFemale.toFixed(1)} 岁` },
                        { label: '累计增加·合计', value: `+${provinceLifeStats.gainTotal.toFixed(1)} 岁` },
                      ]} />
                    ) : (
                      <div className="text-sm text-gray-400">暂无数据</div>
                    )}
                  </div>
                </div>

                {/* 2020年各省对比 */}
                <h4 className="text-sm font-medium text-gray-600 mb-3">各省 2020 年预期寿命对比</h4>
                <div className="overflow-x-auto max-h-80">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">省份</th>
                        <th className="text-right py-2 px-3">男性</th>
                        <th className="text-right py-2 px-3">女性</th>
                        <th className="text-right py-2 px-3">合计</th>
                        <th className="text-right py-2 px-3">1990→2020 增幅</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PROVINCE_LIFE_EXPECTANCY
                        .filter(r => r.regionCode !== 'national')
                        .sort((a, b) => {
                          const aTotal = a.data.find(d => d.year === 2020)?.total ?? 0;
                          const bTotal = b.data.find(d => d.year === 2020)?.total ?? 0;
                          return bTotal - aTotal;
                        })
                        .map(r => {
                          const d2020 = r.data.find(d => d.year === 2020);
                          const d1990 = r.data.find(d => d.year === 1990);
                          const gain = d2020 && d1990 ? (d2020.total - d1990.total).toFixed(1) : '-';
                          const isSelected = r.regionCode === selectedLifeRegion;
                          return (
                            <tr
                              key={r.regionCode}
                              className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                              onClick={() => setSelectedLifeRegion(r.regionCode)}
                            >
                              <td className="py-2 px-3 font-medium">{r.regionName}</td>
                              <td className="text-right py-2 px-3">{d2020?.male.toFixed(2)}</td>
                              <td className="text-right py-2 px-3">{d2020?.female.toFixed(2)}</td>
                              <td className="text-right py-2 px-3 font-medium">{d2020?.total.toFixed(2)}</td>
                              <td className="text-right py-2 px-3 text-emerald-600">+{gain}岁</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  点击任意行可在折线图中切换省份 · 数据来源：人口普查及分省份生命表研究（1990–2020）
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 利率数据 */}
          <TabsContent value="interest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>利率历史走势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">年化收益率（%）</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={rateData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatNumber(value, '')} />
                        <Legend />
                        <Line type="monotone" dataKey="socialInsurance" stroke="#8b5cf6" strokeWidth={2} name="社保记账利率" />
                        <Line type="monotone" dataKey="treasuryBond"    stroke="#f59e0b" strokeWidth={2} name="国债收益率" />
                        <Line type="monotone" dataKey="bankDeposit"     stroke="#6b7280" strokeWidth={2} name="银行存款" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 justify-start pt-6">
                    <AnnualStatPanel title="年化统计" items={[
                      { label: '社保利率均值（2016–2025）', value: `${rateStats.avgGovt.toFixed(2)}%`, highlight: true },
                      { label: '社保利率均值（近5年）',     value: `${rateStats.recent5Avg.toFixed(2)}%` },
                      { label: '社保利率最新（2024）',      value: `${rateStats.latest.toFixed(2)}%` },
                      { label: '社保利率峰值（2016）',      value: `${rateStats.peak.toFixed(2)}%` },
                      { label: '国债收益率均值',            value: `${rateStats.avgBond.toFixed(2)}%` },
                      { label: '银行存款利率均值',          value: `${rateStats.avgDeposit.toFixed(2)}%` },
                    ]} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">社保记账利率</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-80">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="border-b">
                              <th className="text-left py-2 px-3">年份</th>
                              <th className="text-right py-2 px-3">利率</th>
                            </tr>
                          </thead>
                          <tbody>
                            {SOCIAL_INSURANCE_INTEREST_HISTORY.slice().reverse().map(d => (
                              <tr key={d.year} className="border-b border-gray-100">
                                <td className="py-2 px-3">{d.year}</td>
                                <td className="text-right py-2 px-3">{(d.rate * 100).toFixed(2)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">统计摘要</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">社保利率历史最高</span>
                        <span className="font-medium">8.31%（2016年）</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">社保利率最新（2024）</span>
                        <span className="font-medium text-amber-600">2.62%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">2016–2024 平均</span>
                        <span className="font-medium">
                          {(SOCIAL_INSURANCE_INTEREST_HISTORY
                            .filter(d => d.year >= 2016 && d.year <= 2024)
                            .reduce((s, d) => s + d.rate, 0) / 9 * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-2 p-2 bg-amber-50 rounded text-amber-700 text-xs">
                        2016年起改为政府统一公布记账利率（与国债/资本市场挂钩），整体呈下行趋势。
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 通货膨胀 */}
          <TabsContent value="inflation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>通货膨胀率（CPI）</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">年度CPI同比（%）</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={inflationData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatNumber(value, '')} />
                        <Bar dataKey="cpi" fill="#ef4444" name="CPI同比" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-3">累计通胀（相对2000年，%）</h4>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={inflationData}>
                        <defs>
                          <linearGradient id="infGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatNumber(value, '累计涨幅')} />
                        <Area type="monotone" dataKey="cumulative" stroke="#ef4444" fillOpacity={1} fill="url(#infGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 justify-start pt-6">
                    <AnnualStatPanel title="年化统计" items={[
                      { label: '年均 CPI（2000–2024）', value: `${cpiStats.avgFull.toFixed(2)}%`, highlight: true },
                      { label: '年均 CPI（近10年）',     value: `${cpiStats.avg10.toFixed(2)}%` },
                      { label: '年均 CPI（近5年）',      value: `${cpiStats.avg5.toFixed(2)}%` },
                      { label: '2000→2024 累计涨幅',    value: `+${cpiStats.cumulative.toFixed(1)}%` },
                      { label: `最高（${cpiStats.maxYear.year}年）`, value: `${(cpiStats.maxYear.cpi * 100).toFixed(1)}%` },
                      { label: `最低（${cpiStats.minYear.year}年）`, value: `${(cpiStats.minYear.cpi * 100).toFixed(1)}%` },
                    ]} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">历年CPI数据</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-80">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="border-b">
                              <th className="text-left py-2 px-3">年份</th>
                              <th className="text-right py-2 px-3">CPI</th>
                              <th className="text-right py-2 px-3">累计涨幅</th>
                            </tr>
                          </thead>
                          <tbody>
                            {INFLATION_HISTORY.slice().reverse().map(d => (
                              <tr key={d.year} className="border-b border-gray-100">
                                <td className="py-2 px-3">{d.year}</td>
                                <td className="text-right py-2 px-3">{(d.cpi * 100).toFixed(2)}%</td>
                                <td className="text-right py-2 px-3">{((d.cpiCumulative - 1) * 100).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">统计摘要</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">2000-2024平均</span>
                        <span className="font-medium">{(INFLATION_STATISTICS.avg2000_2024 * 100).toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">历史最高</span>
                        <span className="font-medium">{(INFLATION_STATISTICS.max * 100).toFixed(2)}%（2008年）</span>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-gray-600">
                        注：2000年100元的购买力，相当于2025年的165元。
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 预期寿命 — 暂时注释，待数据源确认后恢复 */}
          {/* <TabsContent value="life" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>全国人口出生时预期寿命</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-4 mb-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-6 h-0.5 bg-blue-500" />实测数据（普查/年报）
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-4 border-t-2 border-dashed border-blue-300" />模型估算（{LAST_REAL_YEAR}年后）
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height={290}>
                      <LineChart data={lifeExpectancyData} margin={{ right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis domain={[68, 88]} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value: any, name: any) => {
                            if (value === null || value === undefined) return ['-', String(name ?? '')];
                            const n = String(name ?? '');
                            const label = n.replace('Proj', '（估算）').replace('male','男性').replace('female','女性').replace('total','合计');
                            return [`${Number(value).toFixed(2)} 岁`, label];
                          }}
                        />
                        <ReferenceLine x={LAST_REAL_YEAR} stroke="#d1d5db" strokeDasharray="4 4"
                          label={{ value: '预测→', position: 'insideTopRight', fontSize: 10, fill: '#9ca3af' }} />
                        <Line type="monotone" dataKey="male"   stroke="#3b82f6" strokeWidth={2} name="男性" dot={{ r: 3 }} connectNulls={false} legendType="line" />
                        <Line type="monotone" dataKey="female" stroke="#ec4899" strokeWidth={2} name="女性" dot={{ r: 3 }} connectNulls={false} legendType="line" />
                        <Line type="monotone" dataKey="total"  stroke="#6b7280" strokeWidth={2} name="合计" dot={{ r: 3 }} connectNulls={false} legendType="line" />
                        <Line type="monotone" dataKey="maleProj"   stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls legendType="none" name="maleProj" />
                        <Line type="monotone" dataKey="femaleProj" stroke="#ec4899" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls legendType="none" name="femaleProj" />
                        <Line type="monotone" dataKey="totalProj"  stroke="#6b7280" strokeWidth={1.5} strokeDasharray="5 4" dot={false} connectNulls legendType="none" name="totalProj" />
                        <Legend />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 justify-start pt-2">
                    <AnnualStatPanel title={`年化统计（${lifeStats.firstYear}–${lifeStats.lastYear}）`} items={[
                      { label: '年均增加·男性', value: `+${lifeStats.annualMale.toFixed(2)} 岁/年`,   highlight: true },
                      { label: '年均增加·女性', value: `+${lifeStats.annualFemale.toFixed(2)} 岁/年` },
                      { label: '年均增加·合计', value: `+${lifeStats.annualTotal.toFixed(2)} 岁/年` },
                      { label: '近10年增速·男', value: `+${lifeStats.recent10Male.toFixed(2)} 岁/年` },
                      { label: '近10年增速·女', value: `+${lifeStats.recent10Female.toFixed(2)} 岁/年` },
                      { label: '累计增加·合计', value: `+${lifeStats.totalGainTotal.toFixed(1)} 岁` },
                    ]} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">历年数据与来源</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3 flex gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block" />普查/抽样（官方）</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />年报（官方）</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />推算/预测</span>
                      </div>
                      <div className="overflow-x-auto max-h-72">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="border-b">
                              <th className="text-left py-2 px-2">年份</th>
                              <th className="text-right py-2 px-2">男</th>
                              <th className="text-right py-2 px-2">女</th>
                              <th className="text-right py-2 px-2">合计</th>
                              <th className="text-left py-2 px-2">来源</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              ...[...LIFE_EXPECTANCY_HISTORY].reverse(),
                              ...LIFE_EXPECTANCY_PROJECTION.slice().reverse(),
                            ].map(d => {
                              const isCensus = d.source.includes('普查') || d.source.includes('抽样');
                              const isReport = d.source.includes('卫生健康');
                              const isEstimate = d.source.includes('估算') || d.source.includes('推算') || d.source.includes('预测');
                              const dotCls = isCensus ? 'bg-green-500' : isReport ? 'bg-blue-400' : 'bg-gray-300';
                              const rowCls = isEstimate ? 'text-gray-400 bg-gray-50' : '';
                              return (
                                <tr key={d.year} className={`border-b border-gray-100 hover:bg-gray-50 ${rowCls}`}>
                                  <td className="py-2 px-2 font-medium">{d.year}{isEstimate && <span className="text-xs ml-1 text-gray-300">~</span>}</td>
                                  <td className="text-right py-2 px-2">{d.male.toFixed(2)}</td>
                                  <td className="text-right py-2 px-2">{d.female.toFixed(2)}</td>
                                  <td className={`text-right py-2 px-2 ${isEstimate ? '' : 'font-medium'}`}>{d.total.toFixed(2)}</td>
                                  <td className="py-2 px-2">
                                    <span className="flex items-center gap-1 text-xs text-gray-400">
                                      <span className={`w-2 h-2 rounded-full inline-block flex-none ${dotCls}`} />
                                      {d.source
                                        .replace('第五次全国人口普查', '五普')
                                        .replace('第六次全国人口普查', '六普')
                                        .replace('第七次全国人口普查', '七普')
                                        .replace('国家卫生健康委·卫生健康统计公报', '卫健委年报')
                                        .replace('模型估算（参考UN WPP 2024趋势）', '模型估算')}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">主要城市预期寿命（2020年）</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-3">城市</th>
                              <th className="text-right py-2 px-3">男</th>
                              <th className="text-right py-2 px-3">女</th>
                              <th className="text-right py-2 px-3">合计</th>
                            </tr>
                          </thead>
                          <tbody>
                            {CITY_LIFE_EXPECTANCY.map(d => (
                              <tr key={d.cityCode} className="border-b border-gray-100">
                                <td className="py-2 px-3">{d.cityName}</td>
                                <td className="text-right py-2 px-3">{d.male.toFixed(1)}</td>
                                <td className="text-right py-2 px-3">{d.female.toFixed(1)}</td>
                                <td className="text-right py-2 px-3 font-medium">{d.total.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="mt-3 text-xs text-gray-400">来源：各市统计局，数据年份 2020 年</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* 个人养老金产品 */}
          <TabsContent value="pension" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>个人养老金产品收益率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">各类产品年化收益率（%）</h4>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={pensionReturnData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(value) => formatNumber(value, '')} />
                        <Legend />
                        <Bar dataKey="savings"          fill="#3b82f6" name="养老储蓄" />
                        <Bar dataKey="wealthManagement" fill="#8b5cf6" name="养老理财" />
                        <Bar dataKey="insurance"        fill="#f59e0b" name="养老保险" />
                        <Bar dataKey="fund"             fill="#10b981" name="养老基金" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-3 justify-start pt-6">
                    <AnnualStatPanel title="历史均值收益率" items={[
                      ...(pensionReturnStats.savings        != null ? [{ label: '养老储蓄（历史均值）',   value: `${pensionReturnStats.savings.toFixed(2)}%`,        highlight: true }] : []),
                      ...(pensionReturnStats.wealthManagement != null ? [{ label: '养老理财（历史均值）', value: `${pensionReturnStats.wealthManagement.toFixed(2)}%` }] : []),
                      ...(pensionReturnStats.insurance       != null ? [{ label: '养老保险（历史均值）',  value: `${pensionReturnStats.insurance.toFixed(2)}%`        }] : []),
                      ...(pensionReturnStats.fund            != null ? [{ label: '养老基金（历史均值）',  value: `${pensionReturnStats.fund.toFixed(2)}%`             }] : []),
                      { label: '注', value: '2022年起有实际样本数据', sub: '' },
                    ]} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">历年产品收益率</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto max-h-80">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-white">
                            <tr className="border-b">
                              <th className="text-left py-2 px-3">年份</th>
                              <th className="text-left py-2 px-3">类型</th>
                              <th className="text-right py-2 px-3">收益率</th>
                            </tr>
                          </thead>
                          <tbody>
                            {PERSONAL_PENSION_RETURNS.filter(d => d.sampleSize > 0).slice().reverse().map((d, i) => (
                              <tr key={i} className="border-b border-gray-100">
                                <td className="py-2 px-3">{d.year}</td>
                                <td className="py-2 px-3">
                                  {d.productType === 'savings' ? '养老储蓄' :
                                   d.productType === 'wealthManagement' ? '养老理财' :
                                   d.productType === 'fund' ? '养老基金' : '养老保险'}
                                </td>
                                <td className="text-right py-2 px-3">{(d.averageReturn * 100).toFixed(2)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">产品配置建议</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-800 mb-1">保守型</div>
                        <div className="text-blue-700">储蓄40% + 理财25% + 保险25% + 基金10%</div>
                        <div className="text-blue-600 mt-1">预期收益率 3.0%</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800 mb-1">稳健型</div>
                        <div className="text-green-700">储蓄25% + 理财25% + 保险20% + 基金30%</div>
                        <div className="text-green-600 mt-1">预期收益率 3.6%</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="font-medium text-orange-800 mb-1">成长型</div>
                        <div className="text-orange-700">储蓄15% + 理财15% + 保险10% + 基金60%</div>
                        <div className="text-orange-600 mt-1">预期收益率 4.3%</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
