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
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const [filters, setFilters] = useState<ReportFilters>({});
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'total', order: 'desc' });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses();
  }, []);

  // إعادة جلب البيانات عند تغيير الفلاتر فقط إذا تم التحميل مسبقاً
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (hasLoadedOnce) {
      fetchData();
    }
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
      setHasLoadedOnce(true);
    });
  };

  const handleShowReport = () => {
    fetchData();
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

          <button
            onClick={handleShowReport}
            disabled={isPending || isLoading}
            className="px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 font-medium disabled:opacity-50"
          >
            {isPending || isLoading ? (
              <>
                <span className="animate-spin">⏳</span>
                جاري التحميل...
              </>
            ) : (
              <>
                📊 عرض التقرير
              </>
            )}
          </button>

          <SmartExportButton 
            onExport={handleExport}
            isLoading={isPending}
            disabled={data.length === 0}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-sm mb-6 border border-purple-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🧮</span>
          نظام حساب الدرجات الأكاديمية (من 200)
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="font-semibold text-purple-700 mb-1">📚 اليومية</h4>
            <p className="text-gray-600 text-xs">حفظ + مراجعة</p>
            <p className="text-lg font-bold text-purple-600">50 درجة</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="font-semibold text-purple-700 mb-1">📅 الأسبوعية</h4>
            <p className="text-gray-600 text-xs">10 أسابيع × 5</p>
            <p className="text-lg font-bold text-purple-600">50 درجة</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="font-semibold text-purple-700 mb-1">🗓️ الشهرية</h4>
            <p className="text-gray-600 text-xs">3 أشهر × 30</p>
            <p className="text-lg font-bold text-purple-600">30 درجة</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="font-semibold text-purple-700 mb-1">⭐ السلوك</h4>
            <p className="text-gray-600 text-xs">70 يوم</p>
            <p className="text-lg font-bold text-purple-600">10 درجات</p>
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <h4 className="font-semibold text-purple-700 mb-1">📝 النهائي</h4>
            <p className="text-gray-600 text-xs">قرآن + تجويد</p>
            <p className="text-lg font-bold text-purple-600">60 درجة</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-lg shadow-md text-white">
            <h4 className="font-bold mb-1">🎯 الإجمالي</h4>
            <p className="text-xs opacity-90">المجموع الكلي</p>
            <p className="text-lg font-bold">200 درجة</p>
          </div>
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
        {!hasLoadedOnce ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">اختر الحلقة واضغط على زر &quot;عرض التقرير&quot;</h3>
            <p className="text-gray-500">سيتم عرض بيانات الطالبات بعد الضغط على الزر</p>
          </div>
        ) : isLoading || isPending ? (
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
                  <th className="p-3 text-center">اليومية (50)</th>
                  <th className="p-3 text-center">الأسبوعية (50)</th>
                  <th className="p-3 text-center">الشهرية (30)</th>
                  <th className="p-3 text-center">السلوك (10)</th>
                  <th className="p-3 text-center">النهائي (60)</th>
                  <th className="p-3 text-center bg-yellow-500">الإجمالي (200)</th>
                  <th className="p-3 text-center bg-green-600">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.studentId + item.courseId} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-right font-medium">{item.studentNumber}</td>
                    <td className="p-3 text-right">{item.studentName}</td>
                    <td className="p-3 text-center text-gray-600">{item.courseName}</td>
                    <td className="p-3 text-center">{item.dailyGrades.normalized.toFixed(1)}</td>
                    <td className="p-3 text-center">{item.weeklyGrades.total.toFixed(1)}</td>
                    <td className="p-3 text-center">{item.monthlyGrades.normalized.toFixed(1)}</td>
                    <td className="p-3 text-center">{item.behaviorGrades.normalized.toFixed(1)}</td>
                    <td className="p-3 text-center">
                      {item.finalExamGrade.total > 0 
                        ? item.finalExamGrade.total.toFixed(1) 
                        : <span className="text-gray-400 text-xs">⏳</span>}
                    </td>
                    <td className="p-3 text-center font-bold bg-yellow-50">{item.overallTotal.toFixed(1)}</td>
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