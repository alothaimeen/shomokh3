'use client';

import { useState, useEffect, useTransition } from 'react';
import { getAcademicReportData, type AcademicReportItem, type ReportFilters, type SortOptions, type SortField, type ExportFormat } from '@/actions/reports';
import SmartExportButton from './SmartExportButton';
import { exportAcademicReport } from '@/lib/utils/exportHelpers';

interface Course {
  id: string;
  courseName: string;
}

interface Props {
  userId: string;
  userRole: string;
}

export default function AcademicReportsContent({ userId, userRole }: Props) {
  const [data, setData] = useState<AcademicReportItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const [filters, setFilters] = useState<ReportFilters>({});
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'total', order: 'desc' });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [filters, sortBy]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) {
        const coursesData = await res.json();
        setCourses(coursesData);
      }
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchData = async () => {
    startTransition(async () => {
      setIsLoading(true);
      setError(null);
      
      const result = await getAcademicReportData(filters, sortBy);
      
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.data) {
        setData(result.data);
      }
      
      setIsLoading(false);
    });
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleSortChange = (field: SortField) => {
    setSortBy(prev => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleExport = (format: ExportFormat) => {
    exportAcademicReport(data, format, filters);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return '🟢';
    if (percentage >= 75) return '🟡';
    return '🔴';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">الحلقة</label>
            <select
              value={filters.courseId || ''}
              onChange={(e) => handleFilterChange('courseId', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحلقات</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.courseName}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">الترتيب</label>
            <select
              value={sortBy.field}
              onChange={(e) => handleSortChange(e.target.value as SortField)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="total">الإجمالي</option>
              <option value="studentName">اسم الطالبة</option>
              <option value="studentNumber">رقم الطالبة</option>
            </select>
          </div>

          <button
            onClick={() => setSortBy(prev => ({ ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' }))}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            {sortBy.order === 'desc' ? '↓ تنازلي' : '↑ تصاعدي'}
          </button>

          <SmartExportButton 
            onExport={handleExport}
            isLoading={isPending}
            disabled={data.length === 0}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{data.length}</div>
          <div className="text-sm text-gray-600">إجمالي الطالبات</div>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {data.filter(d => d.percentage >= 90).length}
          </div>
          <div className="text-sm text-gray-600">ممتاز (90%+)</div>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {data.filter(d => d.percentage >= 75 && d.percentage < 90).length}
          </div>
          <div className="text-sm text-gray-600">جيد جداً (75-89%)</div>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {data.filter(d => d.percentage < 75).length}
          </div>
          <div className="text-sm text-gray-600">يحتاج تحسين</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {isLoading || isPending ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-8 text-center text-gray-500">لا توجد بيانات متاحة</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-primary-purple to-primary-blue text-white">
                <tr>
                  <th className="p-3 text-right">الرقم</th>
                  <th className="p-3 text-right">اسم الطالبة</th>
                  <th className="p-3 text-center">الحلقة</th>
                  <th className="p-3 text-center">اليومية</th>
                  <th className="p-3 text-center">الأسبوعية</th>
                  <th className="p-3 text-center">الشهرية</th>
                  <th className="p-3 text-center">السلوك</th>
                  <th className="p-3 text-center bg-yellow-500">الإجمالي</th>
                  <th className="p-3 text-center bg-green-600">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.studentId + item.courseId} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-right font-medium">{item.studentNumber}</td>
                    <td className="p-3 text-right">{item.studentName}</td>
                    <td className="p-3 text-center text-gray-600">{item.courseName}</td>
                    <td className="p-3 text-center">{item.dailyGrades.average}</td>
                    <td className="p-3 text-center">{item.weeklyGrades.average}</td>
                    <td className="p-3 text-center">{item.monthlyGrades.average}</td>
                    <td className="p-3 text-center">{item.behaviorGrades.average}</td>
                    <td className="p-3 text-center font-bold bg-yellow-50">{item.overallTotal}</td>
                    <td className={`p-3 text-center font-bold ${getStatusColor(item.percentage)}`}>
                      {getStatusBadge(item.percentage)} {item.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-800 mb-2">📌 دليل الألوان</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1">🟢 ممتاز (90%+)</span>
          <span className="flex items-center gap-1">🟡 جيد جداً (75-89%)</span>
          <span className="flex items-center gap-1">🔴 يحتاج تحسين (&lt;75%)</span>
        </div>
      </div>
    </div>
  );
}