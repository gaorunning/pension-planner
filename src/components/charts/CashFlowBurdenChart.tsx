import { AnnualCashFlowYear } from '@/engine';
import { formatCurrency } from '@/lib/utils';
import { useMemo, useState } from 'react';

interface CashFlowBurdenChartProps {
  yearlyBurden: AnnualCashFlowYear[];
  monthlyIncome: number;
  requiredAdditionalMonthly: number;
}

const COLORS = {
  insurance: '#a855f7',
  personalPension: '#3b82f6',
  dedicated: '#f97316',
  required: '#ef4444',
};

export function CashFlowBurdenChart({
  yearlyBurden,
  monthlyIncome,
  requiredAdditionalMonthly,
}: CashFlowBurdenChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { maxValue, width, height, padding } = useMemo(() => {
    const width = 600;
    const height = 280;
    const padding = { top: 30, right: 30, bottom: 50, left: 70 };
    const maxTotal = Math.max(...yearlyBurden.map(d => d.total + requiredAdditionalMonthly));
    const maxValue = Math.max(maxTotal, monthlyIncome * 0.6) * 1.15;
    return { maxValue, width, height, padding };
  }, [yearlyBurden, monthlyIncome, requiredAdditionalMonthly]);

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const barWidth = Math.max(4, innerWidth / yearlyBurden.length - 2);

  const xPos = (i: number) =>
    padding.left + (i / yearlyBurden.length) * innerWidth + barWidth / 2;

  const yScale = (v: number) =>
    padding.top + innerHeight - (v / maxValue) * innerHeight;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => maxValue * r);

  const hovered = hoverIdx !== null ? yearlyBurden[hoverIdx] : null;
  const hoveredX = hoverIdx !== null ? xPos(hoverIdx) : 0;

  return (
    <div className="relative w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[600px]"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Y 轴刻度 */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={padding.left} y1={yScale(v)}
              x2={width - padding.right} y2={yScale(v)}
              stroke="#e5e7eb" strokeWidth={1}
            />
            <text
              x={padding.left - 6} y={yScale(v) + 4}
              textAnchor="end" fontSize={10} fill="#6b7280"
            >
              {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* 堆叠柱状图 */}
        {yearlyBurden.map((d, i) => {
          const x = xPos(i) - barWidth / 2;
          const isHovered = hoverIdx === i;

          // 从底部堆叠：dedicated → personalPension → insurance → required
          const segments = [
            { key: 'dedicated',      value: d.dedicatedSaving,       color: COLORS.dedicated },
            { key: 'personalPension',value: d.personalPension,        color: COLORS.personalPension },
            { key: 'insurance',      value: d.insurancePremium,       color: COLORS.insurance },
            { key: 'required',       value: requiredAdditionalMonthly, color: COLORS.required },
          ];

          let cumulative = 0;
          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIdx(i)}
              style={{ cursor: 'crosshair' }}
            >
              {segments.map(seg => {
                if (seg.value <= 0) return null;
                const y = yScale(cumulative + seg.value);
                const h = yScale(cumulative) - y;
                cumulative += seg.value;
                return (
                  <rect
                    key={seg.key}
                    x={x} y={y} width={barWidth} height={Math.max(1, h)}
                    fill={seg.color}
                    opacity={isHovered ? 1 : 0.82}
                  />
                );
              })}
              {/* X 轴标签（每5岁一个） */}
              {d.age % 5 === 0 && (
                <text
                  x={xPos(i)} y={height - padding.bottom + 16}
                  textAnchor="middle" fontSize={10} fill="#6b7280"
                >
                  {d.age}
                </text>
              )}
            </g>
          );
        })}

        {/* X 轴线 */}
        <line
          x1={padding.left} y1={yScale(0)}
          x2={width - padding.right} y2={yScale(0)}
          stroke="#d1d5db" strokeWidth={1}
        />

        {/* Tooltip */}
        {hovered !== null && hoverIdx !== null && (
          <g>
            <line
              x1={hoveredX} y1={padding.top}
              x2={hoveredX} y2={yScale(0)}
              stroke="#9ca3af" strokeWidth={1} strokeDasharray="4 2"
            />
            <rect
              x={hoveredX > width - 180 ? hoveredX - 155 : hoveredX + 8}
              y={padding.top}
              width={148} height={hovered.insurancePremium > 0 ? 110 : 90}
              rx={4} fill="white" stroke="#e5e7eb" strokeWidth={1}
            />
            <text
              x={hoveredX > width - 180 ? hoveredX - 151 : hoveredX + 12}
              y={padding.top + 14}
              fontSize={11} fontWeight={600} fill="#111827"
            >
              {hovered.age} 岁
            </text>
            {[
              { label: '养老定投', value: hovered.dedicatedSaving, color: COLORS.dedicated },
              { label: '个人养老金', value: hovered.personalPension, color: COLORS.personalPension },
              ...(hovered.insurancePremium > 0
                ? [{ label: '商业险保费', value: hovered.insurancePremium, color: COLORS.insurance }]
                : []),
              { label: '建议补充储蓄', value: requiredAdditionalMonthly, color: COLORS.required },
            ].map((row, ri) => (
              <g key={ri}>
                <rect
                  x={hoveredX > width - 180 ? hoveredX - 151 : hoveredX + 12}
                  y={padding.top + 22 + ri * 18}
                  width={7} height={7} rx={1} fill={row.color}
                />
                <text
                  x={hoveredX > width - 180 ? hoveredX - 141 : hoveredX + 22}
                  y={padding.top + 29 + ri * 18}
                  fontSize={10} fill="#374151"
                >
                  {row.label}: {formatCurrency(row.value)}/月
                </text>
              </g>
            ))}
          </g>
        )}

        {/* Y 轴标签 */}
        <text
          x={14} y={height / 2}
          textAnchor="middle" fontSize={10} fill="#6b7280"
          transform={`rotate(-90, 14, ${height / 2})`}
        >
          月均支出（元）
        </text>
      </svg>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 justify-center mt-2 text-xs text-muted-foreground">
        {[
          { color: COLORS.dedicated, label: '养老定投' },
          { color: COLORS.personalPension, label: '个人养老金' },
          { color: COLORS.insurance, label: '商业险保费' },
          { color: COLORS.required, label: '建议补充储蓄' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
