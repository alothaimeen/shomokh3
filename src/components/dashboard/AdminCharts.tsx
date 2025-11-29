'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getDashboardChartsData,
  getPerformanceTrend,
  getPerformanceDistribution,
  getCourseComparison,
  type PerformanceTrendItem,
  type PerformanceDistributionItem,
  type CourseComparisonItem
} from '@/actions/analytics';
import {
  ChartWrapper,
  PerformanceTrendChart,
  PerformanceDistributionChart,
  CourseComparisonChart
} from '@/components/charts';

interface AdminChartsProps {
  initialData?: {
    performanceTrend: PerformanceTrendItem[];
    performanceDistribution: PerformanceDistributionItem[];
    courseComparison?: CourseComparisonItem[];
  };
}

/**
 * قسم الرسوم البيانية في Dashboard المديرة
 */
export default function AdminCharts({ initialData }: AdminChartsProps) {
  const [trendData, setTrendData] = useState<PerformanceTrendItem[]>(
    initialData?.performanceTrend || []
  );
  const [distributionData, setDistributionData] = useState<PerformanceDistributionItem[]>(
    initialData?.performanceDistribution || []
  );
  const [comparisonData, setComparisonData] = useState<CourseComparisonItem[]>(
    initialData?.courseComparison || []
  );
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getDashboardChartsData();
      if (result.success && result.data) {
        setTrendData(result.data.performanceTrend);
        setDistributionData(result.data.performanceDistribution);
        setComparisonData(result.data.courseComparison || []);
      } else {
        setError(result.error || 'حدث خطأ');
      }
    } catch {
      setError('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      fetchData();
    }
  }, [initialData, fetchData]);

  return (
    <div className="space-y-6">
      {/* صف الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* اتجاهات الأداء */}
        <ChartWrapper
          title="اتجاهات الأداء الأسبوعي"
          description="متوسط الدرجات عبر الأسابيع"
          isLoading={loading}
          error={error}
          noData={trendData.length < 2}
          noDataMessage="يلزم بيانات أسبوعين على الأقل لعرض الاتجاهات"
          onRefresh={fetchData}
        >
          <PerformanceTrendChart data={trendData} />
        </ChartWrapper>

        {/* توزيع مستويات الأداء */}
        <ChartWrapper
          title="توزيع مستويات الأداء"
          description="نسبة الطالبات في كل مستوى"
          isLoading={loading}
          error={error}
          noData={distributionData.every(d => d.count === 0)}
          noDataMessage="لا توجد بيانات درجات لعرض التوزيع"
          onRefresh={fetchData}
        >
          <PerformanceDistributionChart data={distributionData} />
        </ChartWrapper>
      </div>

      {/* مقارنة الحلقات - صف كامل */}
      <ChartWrapper
        title="مقارنة أداء الحلقات"
        description="متوسط الدرجات لكل حلقة (أعلى 10)"
        isLoading={loading}
        error={error}
        noData={comparisonData.length === 0}
        noDataMessage="لا توجد بيانات حلقات للمقارنة"
        onRefresh={fetchData}
        className="lg:col-span-2"
      >
        <CourseComparisonChart data={comparisonData} height={350} />
      </ChartWrapper>
    </div>
  );
}
