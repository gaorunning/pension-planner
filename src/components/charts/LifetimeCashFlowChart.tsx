import { useMemo, useState } from 'react';
import { RetirementPlan, UserInput } from '@/engine';
import { formatCurrency } from '@/lib/utils';

interface YearData {
  age: number;
  isRetired: boolean;
  outPension: number;
  outDedicated: number;
  outInsurance: number;
  outTotal: number;
  inPillar1: number;
  inPillar2: number;
  inCommercial: number;
  inPool: number;
  inTotal: number;
}

function getCommercialAnnuityAtAge(input: UserInput, age: number): number {
  return input.commercialInsurances
    .filter(c => c.benefitType === 'annual')
    .reduce((sum, c) => {
      const active =
        age >= c.benefitStartAge &&
        (c.benefitYears === 0 || age < c.benefitStartAge + c.benefitYears);
      return sum + (active ? c.benefitAmount / 12 : 0);
    }, 0);
}

interface LifetimeCashFlowChartProps {
  plan: RetirementPlan;
  input: UserInput;
}

export function LifetimeCashFlowChart({ plan, input }: LifetimeCashFlowChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const data: YearData[] = useMemo(() => {
    const result: YearData[] = [];
    for (let age = input.currentAge; age <= input.lifeExpectancy; age++) {
      const isRetired = age >= input.retirementAge;
      const burden = plan.annualCashFlow.yearlyBurden.find(b => b.age === age);

      const outPension   = (!isRetired && burden) ? burden.personalPension  : 0;
      const outDedicated = (!isRetired && burden) ? burden.dedicatedSaving   : 0;
      const outInsurance = (!isRetired && burden) ? burden.insurancePremium  : 0;

      const inPillar1    = isRetired ? plan.pillar1Monthly : 0;
      const inPillar2    = isRetired ? plan.pillar2Monthly : 0;
      const inCommercial = isRetired ? getCommercialAnnuityAtAge(input, age) : 0;
      const inPool       = isRetired ? plan.retirementPool.monthlyWithdrawal : 0;

      result.push({
        age, isRetired,
        outPension, outDedicated, outInsurance,
        outTotal: outPension + outDedicated + outInsurance,
        inPillar1, inPillar2, inCommercial, inPool,
        inTotal: inPillar1 + inPillar2 + inCommercial + inPool,
      });
    }
    return result;
  }, [plan, input]);

  const { width, height, pad, zeroY, yPos, yNeg, xScale, barW, yTicks } =
    useMemo(() => {
      const width  = 700;
      const height = 360;
      const pad    = { top: 28, right: 30, bottom: 48, left: 80 };
      const innerW = width - pad.left - pad.right;
      const innerH = height - pad.top - pad.bottom;

      const maxIn  = Math.max(...data.map(d => d.inTotal), plan.targetMonthlyAtRetirement, 1);
      const maxOut = Math.max(...data.map(d => d.outTotal), 1);

      // Proportional zone allocation with small padding
      const inH   = innerH * (maxIn  / (maxIn + maxOut)) * 0.90;
      const outH  = innerH * (maxOut / (maxIn + maxOut)) * 0.90;
      const zeroY = pad.top + (innerH - inH - outH) / 2 + inH;

      const yPos = (v: number) => zeroY - (v / maxIn)  * inH;
      const yNeg = (v: number) => zeroY + (v / maxOut) * outH;

      const barW   = Math.max(3, innerW / data.length - 1.5);
      const xScale = (i: number) => pad.left + (i + 0.5) * (innerW / data.length);

      // Y-axis ticks (inflow side only)
      const tickStep = Math.ceil(maxIn / 4 / 1000) * 1000 || 1000;
      const yTicks: number[] = [];
      for (let v = 0; v <= maxIn * 1.05; v += tickStep) yTicks.push(v);

      return { width, height, pad, zeroY, yPos, yNeg, xScale, barW, maxIn, maxOut, yTicks };
    }, [data, plan.targetMonthlyAtRetirement]);

  const retIdx = data.findIndex(d => d.age === input.retirementAge);
  const retX   = retIdx >= 0 ? xScale(retIdx) : null;

  const hovered = hoverIdx !== null ? data[hoverIdx] : null;
  const hoverX  = hoverIdx !== null ? xScale(hoverIdx) : 0;

  const fmt = (v: number) =>
    v >= 10000 ? `${(v / 10000).toFixed(1)}万`
    : v >= 1000 ? `${(v / 1000).toFixed(0)}k`
    : v.toFixed(0);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[700px]"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Y-axis grid + labels */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={pad.left} y1={yPos(v)}
              x2={width - pad.right} y2={yPos(v)}
              stroke="#f3f4f6" strokeWidth={1}
            />
            <text
              x={pad.left - 8} y={yPos(v) + 4}
              textAnchor="end" fontSize={10} fill="#9ca3af"
            >
              {fmt(v)}
            </text>
          </g>
        ))}

        {/* Zero line */}
        <line
          x1={pad.left} y1={zeroY}
          x2={width - pad.right} y2={zeroY}
          stroke="#d1d5db" strokeWidth={1}
        />

        {/* Stacked bars */}
        {data.map((d, i) => {
          const x = xScale(i) - barW / 2;
          const segs: React.ReactNode[] = [];

          if (d.isRetired) {
            const layers = [
              { val: d.inPillar1,    fill: '#2563eb' },
              { val: d.inPillar2,    fill: '#0d9488' },
              { val: d.inCommercial, fill: '#7c3aed' },
              { val: d.inPool,       fill: '#16a34a' },
            ];
            let cum = 0;
            for (const l of layers) {
              if (l.val > 0) {
                segs.push(
                  <rect key={l.fill} x={x} y={yPos(cum + l.val)}
                    width={barW} height={Math.max(0, yPos(cum) - yPos(cum + l.val))}
                    fill={l.fill} />
                );
                cum += l.val;
              }
            }
          } else {
            const layers = [
              { val: d.outPension,   fill: '#60a5fa' },
              { val: d.outDedicated, fill: '#fb923c' },
              { val: d.outInsurance, fill: '#c084fc' },
            ];
            let cum = 0;
            for (const l of layers) {
              if (l.val > 0) {
                segs.push(
                  <rect key={l.fill} x={x} y={yNeg(cum)}
                    width={barW} height={Math.max(0, yNeg(cum + l.val) - yNeg(cum))}
                    fill={l.fill} fillOpacity={0.85} />
                );
                cum += l.val;
              }
            }
          }

          return <g key={d.age}>{segs}</g>;
        })}

        {/* Target income dashed line (retirement zone only) */}
        {retIdx >= 0 && (
          <>
            <line
              x1={xScale(retIdx)} y1={yPos(plan.targetMonthlyAtRetirement)}
              x2={width - pad.right} y2={yPos(plan.targetMonthlyAtRetirement)}
              stroke="#f97316" strokeWidth={1.5} strokeDasharray="5 3"
            />
            <text
              x={width - pad.right - 4}
              y={yPos(plan.targetMonthlyAtRetirement) - 5}
              textAnchor="end" fontSize={9} fill="#f97316"
            >
              目标 {formatCurrency(plan.targetMonthlyAtRetirement)}/月
            </text>
          </>
        )}

        {/* Retirement age vertical marker */}
        {retX !== null && (
          <>
            <line
              x1={retX} y1={pad.top}
              x2={retX} y2={height - pad.bottom}
              stroke="#f97316" strokeWidth={1.5} strokeDasharray="6 3"
            />
            <text x={retX + 4} y={pad.top + 12} fontSize={10} fill="#f97316">
              退休
            </text>
          </>
        )}

        {/* X-axis labels */}
        {data.map((d, i) =>
          d.age % 5 === 0 ? (
            <text
              key={i}
              x={xScale(i)} y={height - pad.bottom + 16}
              textAnchor="middle" fontSize={10} fill="#9ca3af"
            >
              {d.age}
            </text>
          ) : null,
        )}

        {/* Zone labels */}
        <text x={pad.left + 4} y={pad.top + 14} fontSize={9} fill="#9ca3af">↑ 退休收入</text>
        <text x={pad.left + 4} y={height - pad.bottom - 6} fontSize={9} fill="#9ca3af">↓ 养老投入</text>

        {/* Y-axis title */}
        <text
          x={12} y={height / 2}
          textAnchor="middle" fontSize={10} fill="#9ca3af"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          月均金额（元）
        </text>

        {/* Hover interaction layer */}
        {data.map((_, i) => {
          const segW = (width - pad.left - pad.right) / data.length;
          return (
            <rect
              key={i}
              x={xScale(i) - segW / 2} y={pad.top}
              width={segW} height={height - pad.top - pad.bottom}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
          );
        })}

        {/* Hover tooltip */}
        {hovered && (() => {
          const rows = hovered.isRetired
            ? [
                { label: '基础养老金', val: hovered.inPillar1,    color: '#2563eb' },
                { label: '企业年金',   val: hovered.inPillar2,    color: '#0d9488' },
                { label: '商业年金',   val: hovered.inCommercial, color: '#7c3aed' },
                { label: '资金池提取', val: hovered.inPool,       color: '#16a34a' },
              ].filter(r => r.val > 0)
            : [
                { label: '个人养老金', val: hovered.outPension,   color: '#60a5fa' },
                { label: '养老定投',   val: hovered.outDedicated, color: '#fb923c' },
                { label: '商业险保费', val: hovered.outInsurance, color: '#c084fc' },
              ].filter(r => r.val > 0);

          const tipW  = 184;
          const tipH  = 24 + rows.length * 17;
          const tipX  = hoverX > width - tipW - 10 ? hoverX - tipW - 6 : hoverX + 8;
          const tipY  = pad.top + 4;

          return (
            <g>
              <line
                x1={hoverX} y1={pad.top} x2={hoverX} y2={height - pad.bottom}
                stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2"
              />
              <rect x={tipX} y={tipY} width={tipW} height={tipH}
                rx={4} fill="white" stroke="#e5e7eb" strokeWidth={1} />
              <text x={tipX + 8} y={tipY + 15} fontSize={11} fontWeight={600} fill="#111827">
                {hovered.age} 岁{hovered.isRetired ? '（退休后）' : '（积累期）'}
              </text>
              {rows.map((row, ri) => (
                <g key={ri}>
                  <rect x={tipX + 8} y={tipY + 21 + ri * 17} width={7} height={7}
                    rx={1} fill={row.color} />
                  <text x={tipX + 18} y={tipY + 28 + ri * 17} fontSize={10} fill="#374151">
                    {row.label}: {formatCurrency(row.val)}/月
                  </text>
                </g>
              ))}
            </g>
          );
        })()}
      </svg>

      {/* Legend */}
      <div className="mt-2 space-y-1.5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs text-muted-foreground">
          <span className="w-full text-center font-medium text-gray-500">退休收入来源</span>
          {[
            { color: '#2563eb', label: '基础养老金' },
            { color: '#0d9488', label: '企业年金' },
            { color: '#7c3aed', label: '商业年金' },
            { color: '#16a34a', label: '资金池提取' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-7 h-2.5 rounded-sm" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center text-xs text-muted-foreground">
          <span className="w-full text-center font-medium text-gray-500">积累期月均投入</span>
          {[
            { color: '#60a5fa', label: '个人养老金' },
            { color: '#fb923c', label: '养老定投' },
            { color: '#c084fc', label: '商业险保费' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-7 h-2.5 rounded-sm" style={{ background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
