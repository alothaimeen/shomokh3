'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getPerformanceTrend,
  getGradesDistribution,
  type PerformanceTrendItem,
  type GradesDistributionItem
} from '@/actions/analytics';
import {
  ChartWrapper,
  PerformanceTrendChart,
  GradesDistributionChart
} from '@/components/charts';

interface TeacherChartsProps {
  courseId?: string;
}

/**
 * قسم الرسوم البيانية في Dashboard المعلمة
 */
export default function TeacherCharts({ courseId }: TeacherChartsProps) {
  const [trendData, setTrendData] = useState<PerformanceTrendItem[]>([]);
  const [distributionData, setDistributionData] = useState<GradesDistributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // استعلامات متسلسلة لتقليل استهلاك Connection Pool
      const trendResult = await getPerformanceTrend({ courseId });
      if (trendResult.success) {
        setTrendData(trendResult.data || []);
      }

      const distributionResult = await getGradesDistribution({ courseId, type: 'weekly' });
      if (distributionResult.success) {
        setDistributionData(distributionResult.data || []);
      }
      
      if (!trendResult.success && !distributionResult.success) {
        setError(trendResult.error || distributionResult.error || 'حدث خطأ');
      }
    } catch {
      setError('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* تقدم الطالبات عبر الأسابيع */}
      <ChartWrapper
        title="تقدم طالبات الحلقة"
        description="متوسط الدرجات الأسبوعية"
        isLoading={loading}
        error={error}
        noData={trendData.length < 2}
        noDataMessage="يلزم بيانات أسبوعين على الأقل"
        onRefresh={fetchData}
      >
        <PerformanceTrendChart data={trendData} />
      </ChartWrapper>

      {/* توزيع الدرجات */}
      <ChartWrapper
        title="توزيع الدرجات الأسبوعية"
        description="عدد الدرجات في كل مستوى"
        isLoading={loading}
        error={error}
        noData={distributionData.every(d => d.count === 0)}
        noDataMessage="لا توجد درجات لعرض التوزيع"
        onRefresh={fetchData}
      >
        <GradesDistributionChart data={distributionData} />
      </ChartWrapper>
    </div>
  );
}
