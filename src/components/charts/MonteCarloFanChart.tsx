import { MonteCarloYearBand } from '@/engine';
import { formatCurrency } from '@/lib/utils';
import { useMemo, useState } from 'react';

interface MonteCarloFanChartProps {
  yearlyBands: MonteCarloYearBand[];
  retirementAge: number;
}

export function MonteCarloFanChart({ yearlyBands, retirementAge }: MonteCarloFanChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const { width, height, padding, xScale, yScale, maxVal } = useMemo(() => {
    const width   = 600;
    const height  = 300;
    const padding = { top: 30, right: 30, bottom: 48, left: 72 };
    const maxVal  = Math.max(...yearlyBands.map(d => d.p90)) * 1.1;

    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const xScale = (i: number) =>
      padding.left + (i / Math.max(yearlyBands.length - 1, 1)) * innerW;
    const yScale = (v: number) =>
      padding.top + innerH - (v / maxVal) * innerH;

    return { width, height, padding, xScale, yScale, maxVal };
  }, [yearlyBands]);

  // 构建封闭多边形路径（上沿左→右，下沿右→左）
  const bandPath = (upper: keyof MonteCarloYearBand, lower: keyof MonteCarloYearBand) => {
    const fwd = yearlyBands
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)},${yScale(d[upper] as number).toFixed(1)}`)
      .join(' ');
    const bwd = [...yearlyBands]
      .reverse()
      .map((d, i, arr) => `${i === 0 ? 'L' : 'L'} ${xScale(arr.length - 1 - i).toFixed(1)},${yScale(d[lower] as number).toFixed(1)}`)
      .join(' ');
    return `${fwd} ${bwd} Z`;
  };

  const linePath = (key: keyof MonteCarloYearBand) =>
    yearlyBands
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i).toFixed(1)},${yScale(d[key] as number).toFixed(1)}`)
      .join(' ');

  // 退休年龄对应的索引
  const retIdx = yearlyBands.findIndex(d => d.age === retirementAge);
  const retX   = retIdx >= 0 ? xScale(retIdx) : null;

  // Y 轴刻度
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(r => maxVal * r);

  const hovered = hoverIdx !== null ? yearlyBands[hoverIdx] : null;
  const hoverX  = hoverIdx !== null ? xScale(hoverIdx) : 0;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[600px]"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Y 轴刻度线和标签 */}
        {yTicks.map((v, i) => (
          <g key={i}>
            <line
              x1={padding.left} y1={yScale(v)}
              x2={width - padding.right} y2={yScale(v)}
              stroke="#f3f4f6" strokeWidth={1}
            />
            <text
              x={padding.left - 6} y={yScale(v) + 4}
              textAnchor="end" fontSize={10} fill="#9ca3af"
            >
              {v >= 1e6
                ? `${(v / 1e4).toFixed(0)}万`
                : v >= 1e3
                ? `${(v / 1e3).toFixed(0)}k`
                : v.toFixed(0)}
            </text>
          </g>
        ))}

        {/* 分位带：P10-P90（最宽、最浅） */}
        <path d={bandPath('p90', 'p10')} fill="#3b82f6" fillOpacity={0.10} />
        {/* 分位带：P25-P75（中宽、中深） */}
        <path d={bandPath('p75', 'p25')} fill="#3b82f6" fillOpacity={0.20} />
        {/* P10 / P90 虚线 */}
        <path d={linePath('p10')} fill="none" stroke="#93c5fd" strokeWidth={1} strokeDasharray="4 3" />
        <path d={linePath('p90')} fill="none" stroke="#93c5fd" strokeWidth={1} strokeDasharray="4 3" />
        {/* P25 / P75 */}
        <path d={linePath('p25')} fill="none" stroke="#60a5fa" strokeWidth={1} />
        <path d={linePath('p75')} fill="none" stroke="#60a5fa" strokeWidth={1} />
        {/* P50 中位线 */}
        <path d={linePath('p50')} fill="none" stroke="#2563eb" strokeWidth={2} />

        {/* 退休年龄竖线 */}
        {retX !== null && (
          <>
            <line
              x1={retX} y1={padding.top}
              x2={retX} y2={yScale(0)}
              stroke="#f97316" strokeWidth={1.5} strokeDasharray="6 3"
            />
            <text x={retX + 4} y={padding.top + 12} fontSize={10} fill="#f97316">
              退休
            </text>
          </>
        )}

        {/* X 轴线 */}
        <line
          x1={padding.left} y1={yScale(0)}
          x2={width - padding.right} y2={yScale(0)}
          stroke="#e5e7eb" strokeWidth={1}
        />

        {/* X 轴标签（每5岁一个） */}
        {yearlyBands.map((d, i) =>
          d.age % 5 === 0 ? (
            <text
              key={i}
              x={xScale(i)} y={height - padding.bottom + 16}
              textAnchor="middle" fontSize={10} fill="#9ca3af"
            >
              {d.age}
            </text>
          ) : null,
        )}

        {/* 鼠标交互透明覆盖层 */}
        {yearlyBands.map((_, i) => {
          const segW = (width - padding.left - padding.right) / yearlyBands.length;
          return (
            <rect
              key={i}
              x={xScale(i) - segW / 2}
              y={padding.top}
              width={segW}
              height={height - padding.top - padding.bottom}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
          );
        })}

        {/* Hover 竖线 + Tooltip */}
        {hovered && (
          <g>
            <line
              x1={hoverX} y1={padding.top}
              x2={hoverX} y2={yScale(0)}
              stroke="#6b7280" strokeWidth={1} strokeDasharray="3 2"
            />
            <circle cx={hoverX} cy={yScale(hovered.p50)} r={3} fill="#2563eb" />
            {(() => {
              const tipW = 168;
              const tipH = 108;
              const tipX = hoverX > width - tipW - 10 ? hoverX - tipW - 6 : hoverX + 8;
              const tipY = padding.top + 4;
              return (
                <g>
                  <rect x={tipX} y={tipY} width={tipW} height={tipH}
                    rx={4} fill="white" stroke="#e5e7eb" strokeWidth={1} />
                  <text x={tipX + 8} y={tipY + 16} fontSize={11} fontWeight={600} fill="#111827">
                    {hovered.age} 岁
                  </text>
                  {([
                    { label: '乐观 (P90)', value: hovered.p90, color: '#93c5fd' },
                    { label: '较好 (P75)', value: hovered.p75, color: '#60a5fa' },
                    { label: '中位 (P50)', value: hovered.p50, color: '#2563eb' },
                    { label: '较差 (P25)', value: hovered.p25, color: '#60a5fa' },
                    { label: '悲观 (P10)', value: hovered.p10, color: '#93c5fd' },
                  ] as const).map((row, ri) => (
                    <g key={ri}>
                      <rect x={tipX + 8} y={tipY + 24 + ri * 17} width={7} height={7}
                        rx={1} fill={row.color} />
                      <text x={tipX + 18} y={tipY + 31 + ri * 17} fontSize={10} fill="#374151">
                        {row.label}: {formatCurrency(row.value)}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}
          </g>
        )}

        {/* Y 轴标题 */}
        <text
          x={12} y={height / 2}
          textAnchor="middle" fontSize={10} fill="#9ca3af"
          transform={`rotate(-90, 12, ${height / 2})`}
        >
          资金池余额（元）
        </text>
      </svg>

      {/* 图例 */}
      <div className="flex flex-wrap gap-4 justify-center mt-1 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-2 rounded" style={{ background: 'rgba(59,130,246,0.30)' }} />
          <span>P25–P75（50%概率区间）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-2 rounded" style={{ background: 'rgba(59,130,246,0.10)' }} />
          <span>P10–P90（80%概率区间）</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-0.5 bg-blue-600" />
          <span>中位数（P50）</span>
        </div>
      </div>
    </div>
  );
}
