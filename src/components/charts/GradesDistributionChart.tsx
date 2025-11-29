'use client';

import { memo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import type { GradesDistributionItem } from '@/actions/analytics';

interface GradesDistributionChartProps {
  data: GradesDistributionItem[];
  height?: number;
}

// ألوان مستويات الأداء
const LEVEL_COLORS: Record<string, string> = {
  excellent: '#22c55e',      // green-500
  veryGood: '#3b82f6',       // blue-500
  good: '#eab308',           // yellow-500
  needsImprovement: '#ef4444' // red-500
};

/**
 * رسم بياني عمودي لتوزيع الدرجات
 */
function GradesDistributionChart({ data, height = 300 }: GradesDistributionChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="rangeLabel"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
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
            const payload = props.payload as GradesDistributionItem | undefined;
            return [
              `${value} درجة (${payload?.percentage || 0}%)`,
              payload?.rangeLabel || ''
            ];
          }}
          labelFormatter={() => ''}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={LEVEL_COLORS[entry.range] || '#8B5CF6'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(GradesDistributionChart);
