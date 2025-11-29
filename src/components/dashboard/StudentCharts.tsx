'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  getStudentProgress,
  type StudentProgressItem
} from '@/actions/analytics';
import {
  ChartWrapper,
  StudentProgressChart
} from '@/components/charts';

/**
 * قسم الرسوم البيانية في Dashboard الطالبة
 */
export default function StudentCharts() {
  const [progressData, setProgressData] = useState<StudentProgressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getStudentProgress();
      if (result.success) {
        setProgressData(result.data || []);
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
    fetchData();
  }, [fetchData]);

  return (
    <ChartWrapper
      title="تقدمك عبر الأسابيع"
      description="مقارنة درجاتك مع متوسط الحلقة"
      isLoading={loading}
      error={error}
      noData={progressData.length < 2}
      noDataMessage="يلزم بيانات أسبوعين على الأقل لعرض التقدم"
      onRefresh={fetchData}
    >
      <StudentProgressChart data={progressData} height={280} />
    </ChartWrapper>
  );
}
