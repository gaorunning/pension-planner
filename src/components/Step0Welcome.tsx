import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronRight, Target, Layers, Wallet } from 'lucide-react';

interface Step0WelcomeProps {
  onStart: () => void;
}

export function Step0Welcome({ onStart }: Step0WelcomeProps) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-3">个人养老金规划计算器</h1>
        <p className="text-muted-foreground text-lg">
          了解未来的养老金收入，科学规划养老储备
        </p>
      </div>

      {/* 三层计算逻辑 */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-semibold text-center mb-4">计算逻辑</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">1</span>
            <div>
              <span className="font-medium">固定保障</span>
              <span className="text-muted-foreground text-sm ml-2">社保 + 企业年金 + 年金险 —— 确定的基本收入</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">2</span>
            <div>
              <span className="font-medium">养老资金池</span>
              <span className="text-muted-foreground text-sm ml-2">个人养老金账户 + 专项储蓄 —— 自主积累，增值提取</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <span className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold shrink-0">3</span>
            <div>
              <span className="font-medium">缺口补充</span>
              <span className="text-muted-foreground text-sm ml-2">还需要额外储蓄多少</span>
            </div>
          </div>
        </div>
      </div>

      {/* 关键概念卡片 */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              替代率
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>退休后月收入占退休前月收入的比例</p>
            <div className="space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">60%</span> 基本保障 — 覆盖衣食住行</p>
              <p><span className="font-medium text-foreground">75%</span> 舒适生活 — 维持生活品质（推荐）</p>
              <p><span className="font-medium text-foreground">90%</span> 富裕生活 — 旅行、医疗充足</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-500" />
              养老三支柱
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p><span className="font-medium">第一支柱（国家）</span> 社保基本养老金，广覆盖、保基本</p>
            <p><span className="font-medium">第二支柱（企业）</span> 企业年金，企业和个人共同缴费</p>
            <p><span className="font-medium">第三支柱（个人）</span> 个人养老金账户 + 商业养老保险，自愿参与、税收优惠</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-5 h-5 text-orange-500" />
              养老资金池
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>您专门用于养老的钱的总和</p>
            <p className="text-muted-foreground">
              包含个人养老金账户余额、养老专项储蓄、商业保险预期价值
            </p>
            <p className="text-muted-foreground">
              退休后不一次性取出，继续增值，按月等额提取保障至寿命终点
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 使用流程 */}
      <div className="text-center">
        <h3 className="font-semibold mb-3">使用流程</h3>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground flex-wrap">
          <span className="px-3 py-1 bg-primary/10 rounded-full">Step 1 基本信息</span>
          <ChevronRight className="w-4 h-4" />
          <span className="px-3 py-1 bg-primary/10 rounded-full">Step 2 养老底座</span>
          <ChevronRight className="w-4 h-4" />
          <span className="px-3 py-1 bg-primary/10 rounded-full">Step 3 目标偏好</span>
          <ChevronRight className="w-4 h-4" />
          <span className="px-3 py-1 bg-primary/10 rounded-full">Step 4 规划报告</span>
        </div>
      </div>

      <div className="text-center">
        <Button size="lg" onClick={onStart} className="text-lg px-8">
          开始规划
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
