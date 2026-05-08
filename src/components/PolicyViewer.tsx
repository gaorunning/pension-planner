import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X, BookOpen, Calculator, TrendingUp, Scale, ArrowRight } from 'lucide-react';

interface PolicyViewerProps {
  onClose: () => void;
}

// ──────────────────────────────────────────────
// 时间线节点数据
// ──────────────────────────────────────────────
const TIMELINE = [
  {
    year: '1997',
    tag: '制度统一',
    color: 'blue',
    icon: Scale,
    title: '《国务院关于建立统一的企业职工基本养老保险制度的决定》（国发〔1997〕26号）',
    body: [
      '首次在全国层面统一了基本养老金计发办法，基本养老金由「基础养老金」和「个人账户养老金」两部分组成。',
      '基础养老金：退休时省、自治区、直辖市上年度职工月平均工资 × 20%；经济差异较大的省份，经批准可以地市级工资为计发基数。',
      '个人账户养老金：账户全部储存额 ÷ 120。',
    ],
    highlight: null,
  },
  {
    year: '2005',
    tag: '公式重大改革',
    color: 'purple',
    icon: Calculator,
    title: '《国务院关于完善企业职工基本养老保险制度的决定》（国发〔2005〕38号）',
    body: [
      '引入「本人指数化月平均缴费工资」，形成沿用至今的核心计算公式。',
      '个人账户养老金改为按「国家规定计发月数」（60岁对应 139 个月）确定，更科学地反映预期寿命。',
      '2005–2019 年间，公式中「上年度在岗职工月平均工资」实践中即城镇非私营单位在岗职工平均工资。',
    ],
    highlight: {
      label: '核心公式',
      formula: '基础养老金 = (退休时上年度在岗职工月平均工资 + 本人指数化月平均缴费工资) ÷ 2 × 缴费年限 × 1%',
    },
  },
  {
    year: '2010',
    tag: '法律层面确认',
    color: 'teal',
    icon: BookOpen,
    title: '《中华人民共和国社会保险法》颁布',
    body: [
      '在法律层面确认：个人缴费基数为本人上年度月平均工资，范围在当地职工平均工资 60%–300% 之间核定。',
      '未重新定义「职工平均工资」口径，实践中延续「非私营单位在岗职工平均工资」的统计传统。',
    ],
    highlight: null,
  },
  {
    year: '2016',
    tag: '个人账户利率改革',
    color: 'amber',
    icon: TrendingUp,
    title: '人社部、财政部首次统一公布个人账户记账利率',
    body: [
      '2016 年起，个人账户记账利率由参考银行存款利率改为由人社部、财政部统一公布，与国债收益率、资本市场挂钩。',
      '2016 年首次公布利率即高达 8.31%，远高于银行存款利率，有效保护了参保人权益。',
      '此后利率逐年波动：2018 年 8.29% → 2023 年 3.97% → 2024 年 2.62%，整体呈下行趋势。',
    ],
    highlight: null,
  },
  {
    year: '2019',
    tag: '口径历史性切换',
    color: 'red',
    icon: ArrowRight,
    title: '《降低社会保险费率综合方案》（国办发〔2019〕13号）',
    body: [
      '明确要求：以城镇非私营单位与城镇私营单位就业人员平均工资「加权」计算的全口径社平工资，作为核定缴费基数上下限的指标。',
      '全口径平均工资低于非私营单位平均工资，可降低低收入群体的缴费负担。',
      '同时为避免养老金待遇骤降，为养老金「计发基数」设立过渡期：各省单独公布计发基数，逐步向全口径社平工资靠拢。',
    ],
    highlight: {
      label: '制度影响',
      formula: '缴费基数参考：全口径社平工资（较低，降低缴费负担）\n养老金计发基数：独立公布 + 逐年过渡（保护已退休人员待遇）',
    },
  },
];

// ──────────────────────────────────────────────
// 统筹层次说明
// ──────────────────────────────────────────────
const POOLING_NOTES = [
  {
    type: '已实现省级统收统支',
    desc: '全省执行统一的计发基数，是主流模式。',
  },
  {
    type: '地市级单独计发（历史例外）',
    desc: '符合国发〔1997〕26号「省内差异较大」情形，经批准可由地市单独核定。',
  },
  {
    type: '计划单列市独立执行',
    desc: '深圳、大连、青岛、宁波、厦门等五个计划单列市享有省级管理权限，养老保险统筹独立于所在省份。',
  },
];

// ──────────────────────────────────────────────
// 演变对比表
// ──────────────────────────────────────────────
const EVOLUTION_TABLE = [
  {
    phase: '1997–2005 年',
    caliber: '各省或地市上年度职工月平均工资（以非私营单位数据为基础）',
    pooling: '省或地市两级均可选择',
  },
  {
    phase: '2005–2019 年',
    caliber: '统一为上年度在岗职工月平均工资（城镇非私营单位）',
    pooling: '以省或计划单列市为单位，逐步向省级统筹推进',
  },
  {
    phase: '2019 年 5 月后',
    caliber: '缴费基数改为全口径社平工资；计发基数独立公布、逐年过渡',
    pooling: '继续向完全的省级统筹迈进',
  },
];

// 颜色映射
const COLOR_MAP: Record<string, string> = {
  blue:   'border-blue-400   bg-blue-50   text-blue-700',
  purple: 'border-purple-400 bg-purple-50 text-purple-700',
  teal:   'border-teal-400   bg-teal-50   text-teal-700',
  amber:  'border-amber-400  bg-amber-50  text-amber-700',
  red:    'border-red-400    bg-red-50    text-red-700',
};
const DOT_MAP: Record<string, string> = {
  blue:   'bg-blue-500',
  purple: 'bg-purple-500',
  teal:   'bg-teal-500',
  amber:  'bg-amber-500',
  red:    'bg-red-500',
};

export function PolicyViewer({ onClose }: PolicyViewerProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">养老政策说明</h1>
            <p className="text-gray-500 text-sm">计发基数口径演变与统筹层次改革（1997–2025）</p>
          </div>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        {/* 简介卡片 */}
        <Card className="mb-8 border-l-4 border-l-indigo-500">
          <CardContent className="pt-5 pb-5">
            <p className="text-gray-700 leading-relaxed">
              中国基本养老保险制度自 1997 年统一以来，围绕「计发基数口径」和「统筹层次」两条主线持续演进。
              核心逻辑是：<strong>从"非私营"转变为"全口径"</strong>，统筹层级则<strong>从省与地市之间逐步收拢至省级统一</strong>。
              理解这一演变脉络，是准确预测个人养老金的基础。
            </p>
          </CardContent>
        </Card>

        {/* 时间线 */}
        <div className="relative mb-10">
          {/* 竖线 */}
          <div className="absolute left-[72px] top-2 bottom-2 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {TIMELINE.map((node) => {
              const Icon = node.icon;
              const colorCls = COLOR_MAP[node.color] ?? COLOR_MAP.blue;
              const dotCls = DOT_MAP[node.color] ?? DOT_MAP.blue;

              return (
                <div key={node.year} className="relative flex gap-6">
                  {/* 年份标签 + 圆点 */}
                  <div className="flex-none w-[72px] flex flex-col items-center gap-1 pt-1">
                    <span className="text-xs font-bold text-gray-500">{node.year}</span>
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow ${dotCls}`} />
                  </div>

                  {/* 内容卡片 */}
                  <div className="flex-1">
                    <div className={`rounded-xl border-l-4 p-5 ${colorCls}`}>
                      <div className="flex items-start gap-3 mb-3">
                        <Icon className="w-5 h-5 mt-0.5 flex-none" />
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wide opacity-70">{node.tag}</span>
                          <p className="text-sm font-medium mt-0.5">{node.title}</p>
                        </div>
                      </div>
                      <ul className="space-y-1.5 ml-8">
                        {node.body.map((line, i) => (
                          <li key={i} className="text-sm text-gray-700 leading-relaxed list-disc ml-4">{line}</li>
                        ))}
                      </ul>
                      {node.highlight && (
                        <div className="mt-4 ml-8 bg-white bg-opacity-60 rounded-lg p-3 border border-current border-opacity-20">
                          <p className="text-xs font-semibold mb-1 opacity-70">{node.highlight.label}</p>
                          <pre className="text-sm font-mono whitespace-pre-wrap text-gray-800 leading-relaxed">
                            {node.highlight.formula}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 统筹层次 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-500" />
              统筹层次：三种并存模式
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {POOLING_NOTES.map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="flex-none w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-medium text-gray-800">{item.type}：</span>
                    <span className="text-gray-600">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 演变对比表 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              三阶段演变总结
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 w-1/5">阶段</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 w-2/5">计发基数口径</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 w-2/5">统筹层次</th>
                  </tr>
                </thead>
                <tbody>
                  {EVOLUTION_TABLE.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                      <td className="py-3 px-3 font-medium text-indigo-700 whitespace-nowrap">{row.phase}</td>
                      <td className="py-3 px-3 text-gray-700 leading-relaxed">{row.caliber}</td>
                      <td className="py-3 px-3 text-gray-700 leading-relaxed">{row.pooling}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* 计发月数说明 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-500" />
              个人账户计发月数（2005 年起适用）
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              按退休年龄确定，反映预期余命。计发月数越小，每月领取金额越多，但资金池消耗更快。
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {[
                { age: 40, months: 233 },
                { age: 45, months: 216 },
                { age: 50, months: 195 },
                { age: 55, months: 170 },
                { age: 60, months: 139 },
                { age: 65, months: 101 },
                { age: 70, months:  56 },
              ].map(item => (
                <div key={item.age} className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-amber-700">{item.age} 岁</div>
                  <div className="text-sm text-amber-600">{item.months} 个月</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 注释 */}
        <div className="text-xs text-gray-400 text-center pb-4 space-y-1">
          <p>政策依据：国发〔1997〕26号 · 国发〔2005〕38号 · 国办发〔2019〕13号 · 《社会保险法》（2010）</p>
          <p>数据来源：人力资源和社会保障部 · 财政部 · 国家统计局历年公告</p>
        </div>

      </div>
    </div>
  );
}
