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
import type { CourseComparisonItem } from '@/actions/analytics';

interface CourseComparisonChartProps {
  data: CourseComparisonItem[];
  height?: number;
}

// تدرج ألوان من البنفسجي للأزرق
const getBarColor = (index: number, total: number) => {
  const startColor = { r: 139, g: 92, b: 246 }; // primary-purple
  const endColor = { r: 59, g: 130, b: 246 };   // primary-blue
  
  const ratio = total > 1 ? index / (total - 1) : 0;
  
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * ratio);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * ratio);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * ratio);
  
  return `rgb(${r}, ${g}, ${b})`;
};

/**
 * رسم بياني عمودي لمقارنة متوسط الدرجات بين الحلقات
 */
function CourseComparisonChart({ data, height = 300 }: CourseComparisonChartProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // عرض أسماء الحلقات كاملة (بدون اختصار)
  const processedData = data.slice(0, 10).map(item => ({
    ...item,
    displayName: item.courseName
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={processedData}
        margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          domain={[0, 5]}
          tick={{ fill: '#6b7280', fontSize: 12 }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickFormatter={(value) => value.toFixed(1)}
        />
        <YAxis
          type="category"
          dataKey="displayName"
          tick={{ 
            fill: '#6b7280', 
            fontSize: 12,
            textAnchor: 'end',
            direction: 'rtl'
          }}
          tickLine={{ stroke: '#e5e7eb' }}
          axisLine={{ stroke: '#e5e7eb' }}
          width={180}
          orientation="right"
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
          formatter={(value: number) => [`${value.toFixed(2)} / 5`, 'المتوسط']}
          labelFormatter={(label, payload) => {
            const item = payload?.[0]?.payload as CourseComparisonItem | undefined;
            return item ? `${item.courseName} (${item.studentCount} طالبة)` : String(label);
          }}
        />
        <Bar dataKey="average" radius={[0, 4, 4, 0]} maxBarSize={30}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(index, processedData.length)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(CourseComparisonChart);
