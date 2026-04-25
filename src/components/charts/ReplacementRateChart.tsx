import { formatCurrency, formatPercent } from '@/lib/utils';

interface ReplacementRateChartProps {
  currentMonthlyIncome: number;
  targetMonthlyToday: number;
  actualMonthlyToday: number;
  targetRate: number;
  actualRate: number;
}

export function ReplacementRateChart({
  currentMonthlyIncome,
  targetMonthlyToday,
  actualMonthlyToday,
  targetRate,
  actualRate,
}: ReplacementRateChartProps) {
  const width = 500;
  const height = 300;
  const padding = { top: 40, right: 30, bottom: 60, left: 70 };
  const barWidth = 80;
  const barGap = 40;
  const maxValue = Math.max(currentMonthlyIncome, targetMonthlyToday, actualMonthlyToday) * 1.2;

  const yScale = (value: number) => {
    const innerHeight = height - padding.top - padding.bottom;
    return padding.top + innerHeight - (value / maxValue) * innerHeight;
  };

  const bars = [
    {
      label: '退休前',
      value: currentMonthlyIncome,
      color: '#9ca3af',
      subLabel: formatCurrency(currentMonthlyIncome),
    },
    {
      label: '目标',
      value: targetMonthlyToday,
      color: '#3b82f6',
      subLabel: `${formatCurrency(targetMonthlyToday)} (${formatPercent(targetRate)})`,
    },
    {
      label: '实际',
      value: actualMonthlyToday,
      color: actualRate >= targetRate ? '#22c55e' : actualRate >= targetRate * 0.8 ? '#eab308' : '#ef4444',
      subLabel: `${formatCurrency(actualMonthlyToday)} (${formatPercent(actualRate)})`,
    },
  ];

  const startX = (width - (barWidth * 3 + barGap * 2)) / 2;

  return (
    <div className="relative">
      <svg width={width} height={height} className="w-full">
        {/* Y轴网格 */}
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

        {/* 柱状图 */}
        {bars.map((bar, i) => {
          const x = startX + i * (barWidth + barGap);
          const barHeight = yScale(0) - yScale(bar.value);
          return (
            <g key={i}>
              <rect
                x={x}
                y={yScale(bar.value)}
                width={barWidth}
                height={barHeight}
                fill={bar.color}
                rx={4}
              />
              <text
                x={x + barWidth / 2}
                y={yScale(bar.value) - 8}
                textAnchor="middle"
                className="text-xs font-medium"
              >
                {bar.subLabel}
              </text>
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                className="text-sm font-medium"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 说明 */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        注：所有金额均折现到今天的购买力，方便直接对比
      </div>
    </div>
  );
}
