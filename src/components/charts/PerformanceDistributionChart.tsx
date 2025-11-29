'use client';

import { memo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import type { PerformanceDistributionItem } from '@/actions/analytics';

interface PerformanceDistributionChartProps {
  data: PerformanceDistributionItem[];
  height?: number;
}

// نوع بيانات الرسم البياني مع index signature
interface ChartData {
  [key: string]: string | number;
  level: string;
  levelLabel: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * رسم بياني دائري لتوزيع مستويات الأداء
 */
function PerformanceDistributionChart({ data, height = 300 }: PerformanceDistributionChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // فلترة البيانات التي لها قيم وتحويلها للنوع المطلوب
  const filteredData: ChartData[] = data
    .filter(d => d.count > 0)
    .map(d => ({
      level: d.level,
      levelLabel: d.levelLabel,
      count: d.count,
      percentage: d.percentage,
      color: d.color
    }));
  
  if (filteredData.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={40}
          fill="#8884d8"
          dataKey="count"
          nameKey="levelLabel"
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            direction: 'rtl',
            textAlign: 'right'
          }}
          formatter={(value: number, _name: string, props) => {
            const payload = props.payload as ChartData | undefined;
            return [
              `${value} طالبة (${payload?.percentage || 0}%)`,
              payload?.levelLabel || ''
            ];
          }}
        />
        <Legend
          layout="horizontal"
          align="center"
          verticalAlign="bottom"
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value: string, entry) => {
            const item = entry.payload as ChartData | undefined;
            return item ? `${item.levelLabel} (${item.count})` : value;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default memo(PerformanceDistributionChart);
