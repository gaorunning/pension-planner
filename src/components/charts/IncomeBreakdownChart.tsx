import { formatCurrency } from '@/lib/utils';

interface IncomeBreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface IncomeBreakdownChartProps {
  targetValue: number;
  items: IncomeBreakdownItem[];
  gapValue: number;
}

export function IncomeBreakdownChart({ targetValue, items, gapValue }: IncomeBreakdownChartProps) {
  const width = 600;
  const height = 280;
  const padding = { top: 30, right: 42, bottom: 60, left: 150 };
  const barHeight = 40;
  const barGap = 20;
  const maxValue = Math.max(targetValue * 1.2, 1);

  const xScale = (value: number) => {
    const innerWidth = width - padding.left - padding.right;
    return padding.left + (value / maxValue) * innerWidth;
  };

  const allItems = [
    ...items,
    gapValue > 0 ? { label: '缺口', value: gapValue, color: '#fca5a5' } : null,
  ].filter(Boolean) as IncomeBreakdownItem[];

  // 目标线位置
  const targetX = xScale(targetValue);

  let currentX = padding.left;

  return (
    <div className="relative">
      <svg width={width} height={height} className="w-full">
        {/* X轴刻度 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const x = xScale(targetValue * ratio);
          return (
            <g key={i}>
              <line
                x1={x}
                x2={x}
                y1={padding.top}
                y2={height - padding.bottom}
                stroke={ratio === 1 ? '#3b82f6' : '#e5e7eb'}
                strokeWidth={ratio === 1 ? 2 : 1}
                strokeDasharray={ratio === 1 ? '4,4' : undefined}
              />
              <text
                x={x}
                y={height - padding.bottom + 24}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {formatCurrency(targetValue * ratio)}
              </text>
            </g>
          );
        })}

        {/* 堆叠条 */}
        {allItems.map((item, i) => {
          const itemWidth = Math.max(0, xScale(item.value) - padding.left);
          const x = currentX;
          currentX += itemWidth;
          return (
            <g key={i}>
              <rect
                x={x}
                y={padding.top + (barHeight + barGap)}
                width={itemWidth}
                height={barHeight}
                fill={item.color}
                rx={i === 0 ? 4 : 0}
                style={i === allItems.length - 1 ? { borderTopRightRadius: 4, borderBottomRightRadius: 4 } : undefined}
              />
              {/* 值标签（条上） */}
              {itemWidth > 60 && (
                <text
                  x={x + itemWidth / 2}
                  y={padding.top + (barHeight + barGap) + barHeight / 2 + 4}
                  textAnchor="middle"
                  className="text-sm fill-white font-medium"
                >
                  {formatCurrency(item.value)}
                </text>
              )}
            </g>
          );
        })}

        {/* 总合计标签 */}
        <text
          x={padding.left - 10}
          y={padding.top + (barHeight / 2) + 4}
          textAnchor="end"
          className="text-sm font-bold fill-gray-800"
        >
          总目标
        </text>
        <text
          x={padding.left - 10}
          y={padding.top + (barHeight + barGap) + barHeight / 2 + 4}
          textAnchor="end"
          className="text-sm font-bold fill-gray-800"
        >
          可支配收入
        </text>
        <text
          x={targetX}
          y={padding.top + (barHeight / 2) + 4}
          textAnchor="middle"
          className="text-sm font-bold fill-blue-600"
        >
          {formatCurrency(targetValue)}
        </text>
      </svg>

      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {allItems.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
