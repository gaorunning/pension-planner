# 个人养老金规划工具 — 项目说明

## 概述

一个面向中国大陆个人用户的养老金规划 SPA，帮助用户量化三支柱养老缺口、模拟多种市场情景、制定补充储蓄计划。技术栈：React 18 + TypeScript + Vite + Tailwind CSS + Recharts。

---

## 向导流程

```
Step0 欢迎  →  Step1 基本信息  →  Step2 目标偏好  →  Step3 养老底座
          →  Step4 规划报告  →  Step5 概率分析
```

### Step1 基本信息
收集当前年龄、计划退休年龄、性别、所在省市、税前月收入。

- **所在省市** 下拉列表同时展示该省的养老金计发基数（来源：`PENSION_BASE_BY_REGION`），选择后自动填入 `avgSocialWage`。
- **预期寿命** 根据省份 + 性别从 2020 年人口普查数据自动推算（+1 年调整），无需用户手填。

### Step2 目标偏好
支持两种目标设定方式（`targetMode`）：

**替代率模式**（`replacement_rate`，默认）
- 目标替代率（60% / 75% / 90%）
- 以退休前收入的百分比设定目标月收入

**费用测算模式**（`expense_based`）
- 三项费用输入（今日价格）：基本生活费、护工费用、养老院费用
- 费用分三段叠加：
  - 退休 → 75岁：仅基本生活费（通胀 2.5%）
  - 75 → 80岁：+ 护工费用（通胀 5%）
  - 80岁 → 预期寿命：+ 养老院费用（通胀 5.5%）
- 通胀假设来源：`基础参数/未来费用预估.PNG`
- 系统自动展示各阶段退休时预计费用，并显示分段堆叠预览条

两种模式均含：
- 投资风险偏好（保守 / 稳健 / 积极）
- 只读参数卡：展示系统使用的历史均值参数（社平工资增速、通胀、社保利率等），不可手动修改

### Step3 养老底座
按三支柱框架组织输入：

| 支柱 | 内容 |
|------|------|
| 第一支柱（国家基本） | 社保已缴年限、缴费基数比例（0.6–3.0）、社保个人账户余额（可选，来自社保App） |
| 第二支柱（职业年金） | 企业年金开关 + 月缴额（个人 + 单位合计） |
| 第三支柱（个人自愿） | 个人养老金账户（年缴/余额）+ 商业养老保险（可多条，支持年领/一次性领取） |
| 其他 | 以养老为目的的存量资金 + 月定投 |

> 这些参数在 Step4 的敏感性分析滑块中可进行情景模拟。

### Step4 规划报告
基准计划（`basePlan`）使用与 Step3 一致的历史均值参数计算，确保前后展示的数字口径统一。

主要区块：

1. **结论摘要**：充足率色块、目标月收入、每月缺口
2. **四支柱资金池**：堆叠柱状图，对比今日存量与退休时终值
3. **敏感性分析**：5 个参数滑块，实时更新现金流时序图和充足率对比
4. **养老投入现金流**：当前年度月均支出、建议补充储蓄、负担比例评估
5. **退休后收入来源**：横向比例条可视化，含可展开的逐项计算说明
6. **年度明细表**：全生命周期每年投入 / 收入 / 资金池余额
7. **行动建议**：月储蓄额、个人养老金账户、资产配置

### Step5 概率分析
蒙特卡洛模拟（5000 次），随机变量：

| 变量 | 分布 | 默认均值 | 默认σ |
|------|------|----------|-------|
| 个人养老金账户收益 | 正态 | 4.0% | 1.5% |
| 专项储蓄收益 | 正态 | 风险偏好对应值 | 风险偏好对应值 |
| 社平工资增速 | 正态（截断） | 历史CAGR | 1.5% |
| 预期寿命 | 正态（截断至[退休+1, 105]） | 用户寿命设定 | 5岁 |

输出：成功率、退休首月收入 P10–P90 分位表、资金池积累扇形图。

---

## 引擎架构

### 计算流程（`calculatePlan`）

```
UserInput
  ↓ precompute()          → yearsToRetirement, nominalReturn, realReturn, allocation
  ↓ calcPillar1()         → basicPension, accountPension
  ↓ calcPillar2()         → 企业年金月领额
  ↓ calcRetirementPool()  → 各组成FV、退休时总余额、月均提取额
  ↓ calcCommercialAnnuity()  → 商业年金等效月收入
  ↓ calcTarget() / calcExpenseBasedTarget()  → targetMonthlyToday, targetMonthlyAtRetirement
  ↓ calcTotalFundingNeeded()                → 总资金需求PV（费用测算模式含三段分相计算）
  ↓ 缺口计算              → monthlyGap, totalGapPV, requiredMonthlySaving
  ↓ calcScenarios()       → 乐观/基准/悲观三情景
  ↓ calcYearlyData()      → 逐年资金池轨迹（用于图表）
  ↓ calcAnnualCashFlow()  → 养老投入现金流（含逐年明细）
  → RetirementPlan
```

### 关键计算说明

**第一支柱**（`pillar1.ts`）：
```
基础养老金 = (退休时社平工资 + 本人指数月均工资) / 2 × 缴费年数 × 1%
个人账户月养老金 = 退休时账户余额 / 计发月数
```
- 退休时社平工资 = 当前社平工资 × (1 + `socialWageGrowthRate`)^n
- 计发月数查表（`payMonths.ts`），按退休年龄对应

**资金池**（`retirementPool.ts`）：
- 个人养老金账户：年化 `personalPensionReturn`（默认4%）
- 专项储蓄 + 月定投：年化 `savingsReturn`（默认来自riskProfile）
- 商业保险一次性领取：折现/增值至退休时点并入资金池
- 提取期：使用积累期回报率 × 0.7（保守估算），等额年金公式

**收益率参数层次**（可覆盖设计）：
```typescript
// UserInput 中的可选覆盖字段（用于 Step4 敏感性 & Step5 MC）
socialInsuranceRate?: number    // 默认 0.04 → pillar1.ts
personalPensionReturn?: number  // 默认 0.04 → retirementPool.ts
savingsReturn?: number          // 默认 riskProfile 对应值 → precompute.ts
```

**Step4 报告的计划层次**：
```typescript
// historicalInput：历史均值参数（与 Step3 展示一致）
basePlan = calculatePlan(historicalInput)   // 所有基准数字来源

// interactiveInput：滑块当前值
interactivePlan = calculatePlan(interactiveInput)  // 敏感性分析"调整后"数字
```

**蒙特卡洛**（`monteCarlo.ts`）：
```typescript
// 积累期：双池独立随机
poolPension = poolPension × (1 + N(pensionReturnMean, pensionReturnSd)) + 年缴额
poolSavings = poolSavings × (1 + N(savingsReturnMean, savingsReturnSd)) + 年定投

// 提取期：合并池，保守回报 = savingsReturnMean × 0.7
// 成功率 = 模拟路径中退休收入 ≥ 目标的比例
```

---

## 数据来源

| 数据集 | 来源 | 更新周期 |
|--------|------|----------|
| 各省社平工资 | 国家统计局城镇非私营单位在岗职工平均工资 | 年度（最新2024） |
| 各省养老金计发基数 | 各省人社厅公告 | 年度 |
| 社保个人账户记账利率 | 人力资源和社会保障部公告 | 年度 |
| 历年CPI | 国家统计局 | 年度 |
| 个人养老金历史收益 | 基金业协会披露 | 年度 |
| 分省预期寿命 | 2020年第七次全国人口普查 | 10年一次 |
| 计发月数 | 国务院发[2005]38号附表 | 政策文件 |

> 所有历史数据内嵌于 `src/engine/constants/` 目录，无需运行时网络请求。

---

## 本地开发

```bash
npm install
npm run dev       # 开发服务器
npm run build     # 生产构建 → dist/
```

## 部署

```bash
npm run build
rsync -avz --delete dist/ root@39.103.79.20:/opt/pension-planner/
```

服务器使用 Caddy（端口80）反向代理到 nginx:alpine 容器（端口8503），容器挂载 `/opt/pension-planner/` 目录提供静态文件。

---

## 目录结构

```
src/
├── App.tsx                    根组件，路由到 Wizard / HistoricalDataViewer / PolicyViewer
├── components/
│   ├── Wizard.tsx             向导容器，管理 step / input / mcConfig 状态
│   ├── Step0Welcome.tsx
│   ├── Step1Basic.tsx
│   ├── Step2Assets.tsx
│   ├── Step3Goals.tsx
│   ├── Step4Report.tsx        规划报告（7区块）
│   ├── Step5MonteCarlo.tsx    概率分析
│   ├── defaults.ts            createDefaultInput() 工厂函数
│   ├── HistoricalDataViewer.tsx
│   ├── PolicyViewer.tsx
│   ├── charts/
│   │   ├── LifetimeCashFlowChart.tsx   全生命周期现金流面积图
│   │   ├── MonteCarloFanChart.tsx      MC扇形图
│   │   ├── AssetGrowthChart.tsx
│   │   ├── CashFlowBurdenChart.tsx
│   │   ├── IncomeBreakdownChart.tsx
│   │   └── ReplacementRateChart.tsx
│   └── ui/                    通用UI组件（Button/Card/Input/Select等）
└── engine/
    ├── index.ts
    ├── types.ts
    ├── precompute.ts
    ├── pillar1.ts
    ├── pillar2.ts
    ├── retirementPool.ts
    ├── gap.ts
    ├── scenarios.ts
    ├── monteCarlo.ts
    └── constants/             所有内嵌历史数据
```
