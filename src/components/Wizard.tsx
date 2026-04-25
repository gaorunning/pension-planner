import { useState } from 'react';
import { UserInput } from '@/engine';
import { createDefaultInput } from './defaults';
import { Step0Welcome } from './Step0Welcome';
import { Step1Basic } from './Step1Basic';
import { Step2Assets } from './Step2Assets';
import { Step3Goals } from './Step3Goals';
import { Step4Report } from './Step4Report';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function Wizard() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<UserInput>(createDefaultInput());

  const steps = [
    { id: 0, label: '首页' },
    { id: 1, label: '基本信息' },
    { id: 2, label: '养老底座' },
    { id: 3, label: '目标偏好' },
    { id: 4, label: '规划报告' },
  ];

  const goNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const start = () => {
    setStep(1);
  };

  const restart = () => {
    setInput(createDefaultInput());
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 标题 */}
        {step !== 0 && (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">个人养老金规划</h1>
            <p className="text-gray-600">科学规划，安心养老</p>
          </div>
        )}

        {/* 步骤指示器 (Step 0 不显示) */}
        {step !== 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.filter(s => s.id > 0).map((s) => (
                <div key={s.id} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      s.id < step
                        ? 'bg-green-500 text-white'
                        : s.id === step
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s.id}
                  </div>
                  <span
                    className={`text-sm mt-2 ${
                      s.id === step ? 'text-primary font-medium' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex">
              {steps.slice(1, -1).map((s) => (
                <div
                  key={s.id}
                  className={`flex-1 h-1 ${
                    s.id < step ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* 步骤内容 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {step === 0 && <Step0Welcome onStart={start} />}
          {step === 1 && <Step1Basic input={input} onChange={setInput} />}
          {step === 2 && <Step2Assets input={input} onChange={setInput} />}
          {step === 3 && <Step3Goals input={input} onChange={setInput} />}
          {step === 4 && <Step4Report input={input} />}

          {/* 导航按钮 (Step 0 不显示上一步/下一步) */}
          {step !== 0 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={step === 1}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                {step === 1 ? '返回首页' : '上一步'}
              </Button>
              {step < 4 ? (
                <Button onClick={goNext}>
                  下一步
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={restart}>
                  重新开始
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
