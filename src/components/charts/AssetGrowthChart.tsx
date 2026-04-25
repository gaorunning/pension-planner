import { YearlyDataPoint } from '@/engine';
import { formatCurrency } from '@/lib/utils';
import { useMemo, useState } from 'react';

interface AssetGrowthChartProps {
  yearlyData: YearlyDataPoint[];
  retirementAge: number;
}

export function AssetGrowthChart({ yearlyData, retirementAge }: AssetGrowthChartProps) {
  const [hoverYear, setHoverYear] = useState<number | null>(null);

  const { maxValue, width, height, padding } = useMemo(() => {
    const width = 600;
    const height = 300;
    const padding = { top: 30, right: 30, bottom: 50, left: 70 };
    const maxValue = Math.max(
      ...yearlyData.map(d => Math.max(d.poolBalance, d.cumulativeContrib))
    ) * 1.1;
    return { maxValue, width, height, padding };
  }, [yearlyData]);

  const xScale = (year: number) => {
    const innerWidth = width - padding.left - padding.right;
    return padding.left + (year / yearlyData.length) * innerWidth;
  };

  const yScale = (value: number) => {
    const innerHeight = height - padding.top - padding.bottom;
    return padding.top + innerHeight - (value / maxValue) * innerHeight;
  };

  const poolPath = yearlyData
    .map((d, i) => {
      const x = xScale(d.year);
      const y = yScale(d.poolBalance);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const contribPath = yearlyData
    .map((d, i) => {
      const x = xScale(d.year);
      const y = yScale(d.cumulativeContrib);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  const hoverData = hoverYear !== null ? yearlyData.find(d => d.year === hoverYear) : null;

  return (
    <div className="relative">
      <svg width={width} height={height} className="w-full">
        {/* 网格线 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = yScale(maxValue * ratio);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
              />
              <text
                x={padding.left - 10}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {formatCurrency(maxValue * ratio)}
              </text>
            </g>
          );
        })}

        {/* 退休年龄垂直线 */}
        <line
          x1={xScale(yearlyData.find(d => d.age === retirementAge)?.year ?? 0)}
          x2={xScale(yearlyData.find(d => d.age === retirementAge)?.year ?? 0)}
          y1={padding.top}
          y2={height - padding.bottom}
          stroke="#f59e0b"
          strokeWidth={2}
          strokeDasharray="4,4"
        />

        {/* 累积投入线（灰色虚线） */}
        <path
          d={contribPath}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={2}
          strokeDasharray="4,4"
        />

        {/* 资金池余额线（蓝色实线） */}
        <path
          d={poolPath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={3}
        />

        {/* X轴标签（年龄） */}
        {yearlyData
          .filter((_, i) => i % Math.ceil(yearlyData.length / 6) === 0 || i === yearlyData.length - 1)
          .map(d => (
            <text
              key={d.year}
              x={xScale(d.year)}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {d.age}岁
            </text>
          ))}

        {/* 峰值标注 */}
        {(() => {
          const peakIdx = yearlyData.reduce((maxIdx, d, i, arr) =>
            d.poolBalance > arr[maxIdx].poolBalance ? i : maxIdx, 0);
          const peak = yearlyData[peakIdx];
          return (
            <text
              x={xScale(peak.year)}
              y={yScale(peak.poolBalance) - 10}
              textAnchor="middle"
              className="text-xs fill-blue-600 font-medium"
            >
              峰值 {formatCurrency(peak.poolBalance)}
            </text>
          );
        })()}

        {/* 交互区域 */}
        <rect
          x={padding.left}
          y={padding.top}
          width={width - padding.left - padding.right}
          height={height - padding.top - padding.bottom}
          fill="transparent"
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const innerWidth = width - padding.left - padding.right;
            const year = Math.round(((x - padding.left) / innerWidth) * yearlyData.length);
            if (year >= 0 && year < yearlyData.length) {
              setHoverYear(year);
            }
          }}
          onMouseLeave={() => setHoverYear(null)}
        />

        {/* 悬停指示器 */}
        {hoverData && (
          <g>
            <line
              x1={xScale(hoverData.year)}
              x2={xScale(hoverData.year)}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="#6b7280"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
            <circle
              cx={xScale(hoverData.year)}
              cy={yScale(hoverData.poolBalance)}
              r={5}
              fill="#3b82f6"
            />
            <circle
              cx={xScale(hoverData.year)}
              cy={yScale(hoverData.cumulativeContrib)}
              r={5}
              fill="#9ca3af"
            />
          </g>
        )}
      </svg>

      {/* 图例 */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500" style={{ borderWidth: 1.5, borderStyle: 'solid', borderColor: '#3b82f6' }} />
          <span className="text-sm text-gray-600">资金池余额</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#9ca3af' }} />
          <span className="text-sm text-gray-600">累计投入</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5" style={{ borderWidth: 2, borderStyle: 'dashed', borderColor: '#f59e0b' }} />
          <span className="text-sm text-gray-600">退休年龄</span>
        </div>
      </div>

      {/* 悬停提示 */}
      {hoverData && (
        <div className="absolute top-0 right-0 bg-white p-3 rounded-lg shadow-lg border text-sm">
          <div className="font-medium mb-1">{hoverData.age}岁</div>
          <div className="text-blue-600">资金池：{formatCurrency(hoverData.poolBalance)}</div>
          <div className="text-gray-500">累计投入：{formatCurrency(hoverData.cumulativeContrib)}</div>
          <div className="text-gray-400">{hoverData.isRetired ? '已退休' : '工作中'}</div>
        </div>
      )}
    </div>
  );
}
