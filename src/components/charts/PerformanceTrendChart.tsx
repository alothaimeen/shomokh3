'use client';

import { memo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { PerformanceTrendItem } from '@/actions/analytics';

interface PerformanceTrendChartProps {
  data: PerformanceTrendItem[];
  height?: number;
}

/**
 * رسم بياني خطي لاتجاهات الأداء الأسبوعية
 */
function PerformanceTrendChart({ data, height = 300 }: PerformanceTrendChartProps) {
  if (!data || data.length < 2) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="weekLabel"
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          domain={[0, 5]}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => value.toFixed(1)}
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
          labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
          formatter={(value: number, name: string) => [
            `${value.toFixed(2)} / 5`,
            name === 'average' ? 'المتوسط' : name
          ]}
          labelFormatter={(label) => label}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={() => 'متوسط الدرجات'}
        />
        <Line
          type="monotone"
          dataKey="average"
          name="average"
          stroke="#8B5CF6"
          strokeWidth={3}
          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 8, fill: '#8B5CF6', stroke: 'white', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default memo(PerformanceTrendChart);
