'use client';

import { memo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import type { StudentProgressItem } from '@/actions/analytics';

interface StudentProgressChartProps {
  data: StudentProgressItem[];
  height?: number;
}

/**
 * رسم بياني مساحي لتقدم الطالبة مع مقارنة بمتوسط الحلقة
 */
function StudentProgressChart({ data, height = 300 }: StudentProgressChartProps) {
  if (!data || data.length < 2) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
      >
        <defs>
          <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="averageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="dateLabel"
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
            name === 'score' ? 'درجتك' : 'متوسط الحلقة'
          ]}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          formatter={(value) => value === 'score' ? 'درجتك' : 'متوسط الحلقة'}
        />
        <Area
          type="monotone"
          dataKey="courseAverage"
          name="courseAverage"
          stroke="#3B82F6"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#averageGradient)"
        />
        <Area
          type="monotone"
          dataKey="score"
          name="score"
          stroke="#8B5CF6"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#studentGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default memo(StudentProgressChart);
