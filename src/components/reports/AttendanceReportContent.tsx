'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  getAttendanceReportData, 
  type AttendanceReportItem, 
  type AttendanceReportByDate,
  type ReportFilters, 
  type SortOptions, 
  type ExportFormat,
  type AttendanceViewMode 
} from '@/actions/reports';
import SmartExportButton from './SmartExportButton';
import { exportAttendanceReport } from '@/lib/utils/exportHelpers';

interface Course {
  id: string;
  courseName: string;
}

interface Props {
  userId: string;
  userRole: string;
}

const statusConfig: Record<string, { label: string; symbol: string; color: string }> = {
  PRESENT: { label: 'حاضرة', symbol: 'ح', color: 'bg-green-100 text-green-800 border-green-300' },
  EXCUSED: { label: 'غائبة بعذر', symbol: 'م', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  ABSENT: { label: 'غائبة', symbol: 'غ', color: 'bg-red-100 text-red-800 border-red-300' },
  REVIEWED: { label: 'راجعت', symbol: 'ر', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  LEFT_EARLY: { label: 'خروج مبكر', symbol: 'خ', color: 'bg-orange-100 text-orange-800 border-orange-300' }
};

export default function AttendanceReportContent({ userId, userRole }: Props) {
  const [data, setData] = useState<AttendanceReportItem[]>([]);
  const [byDateData, setByDateData] = useState<AttendanceReportByDate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const [filters, setFilters] = useState<ReportFilters>({});
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'date', order: 'desc' });
  const [viewMode, setViewMode] = useState<AttendanceViewMode>('by-student');

  const [stats, setStats] = useState({
    present: 0, excused: 0, absent: 0, reviewed: 0, leftEarly: 0, total: 0, attendanceRate: 0
  });

  useEffect(() => { fetchCourses(); fetchData(); }, []);
  useEffect(() => { fetchData(); }, [filters, sortBy, viewMode]);
  useEffect(() => {
    if (viewMode === 'by-student' && data.length > 0) {
      calculateStats(data);
    }
  }, [data, viewMode]);

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      if (res.ok) { setCourses(await res.json()); }
    } catch (err) { console.error('Error:', err); }
  };

  const fetchData = async () => {
    startTransition(async () => {
      setIsLoading(true);
      setError(null);
      const result = await getAttendanceReportData(filters, sortBy, viewMode);
      if (result.error) {
        setError(result.error);
      } else if (result.success && result.data) {
        if (result.viewMode === 'by-date') {
          setByDateData(result.data as AttendanceReportByDate[]);
          setData([]);
        } else {
          setData(result.data as AttendanceReportItem[]);
          setByDateData([]);
        }
      }
      setIsLoading(false);
    });
  };

  const calculateStats = (records: AttendanceReportItem[]) => {
    const newStats = { present: 0, excused: 0, absent: 0, reviewed: 0, leftEarly: 0, total: records.length, attendanceRate: 0 };
    records.forEach(r => {
      if (r.status === 'PRESENT') newStats.present++;
      else if (r.status === 'EXCUSED') newStats.excused++;
      else if (r.status === 'ABSENT') newStats.absent++;
      else if (r.status === 'REVIEWED') newStats.reviewed++;
      else if (r.status === 'LEFT_EARLY') newStats.leftEarly++;
    });
    newStats.attendanceRate = newStats.total > 0 ? Math.round((newStats.present / newStats.total) * 100) : 0;
    setStats(newStats);
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleExport = (format: ExportFormat) => {
    if (viewMode === 'by-student') { exportAttendanceReport(data, format, filters); }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('by-student')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${viewMode === 'by-student' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            عرض بحسب الطالبة
          </button>
          <button
            onClick={() => setViewMode('by-date')}
            className={`flex-1 py-3 rounded-lg font-medium transition-colors ${viewMode === 'by-date' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            عرض بحسب التاريخ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">الحلقة</label>
            <select value={filters.courseId || ''} onChange={(e) => handleFilterChange('courseId', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="">جميع الحلقات</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.courseName}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">من تاريخ</label>
            <input type="date" value={filters.dateFrom || ''} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">إلى تاريخ</label>
            <input type="date" value={filters.dateTo || ''} onChange={(e) => handleFilterChange('dateTo', e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <select value={filters.status || ''} onChange={(e) => handleFilterChange('status', e.target.value)} className="w-full px-4 py-2 border rounded-lg">
              <option value="">جميع الحالات</option>
              {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          {viewMode === 'by-student' && <SmartExportButton onExport={handleExport} isLoading={isPending} disabled={data.length === 0} />}
        </div>
      </div>

      {viewMode === 'by-student' && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center"><div className="text-2xl font-bold text-gray-800">{stats.total}</div><div className="text-sm text-gray-600">إجمالي</div></div>
          <div className="bg-green-50 rounded-lg shadow p-4 text-center"><div className="text-2xl font-bold text-green-600">{stats.present}</div><div className="text-sm">حاضرة</div></div>
          <div className="bg-blue-50 rounded-lg shadow p-4 text-center"><div className="text-2xl font-bold text-blue-600">{stats.excused}</div><div className="text-sm">بعذر</div></div>
          <div className="bg-red-50 rounded-lg shadow p-4 text-center"><div className="text-2xl font-bold text-red-600">{stats.absent}</div><div className="text-sm">غائبة</div></div>
          <div className="bg-purple-50 rounded-lg shadow p-4 text-center"><div className="text-2xl font-bold text-purple-600">{stats.reviewed}</div><div className="text-sm">راجعت</div></div>
          <div className={`rounded-lg shadow p-4 text-center ${stats.attendanceRate >= 80 ? 'bg-green-100' : stats.attendanceRate >= 60 ? 'bg-yellow-100' : 'bg-red-100'}`}>
            <div className={`text-2xl font-bold ${stats.attendanceRate >= 80 ? 'text-green-700' : stats.attendanceRate >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>{stats.attendanceRate}%</div>
            <div className="text-sm">نسبة الحضور</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {isLoading || isPending ? (
          <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div><p className="mt-4 text-gray-600">جاري تحميل...</p></div>
        ) : viewMode === 'by-student' ? (
          data.length === 0 ? <div className="p-8 text-center text-gray-500">لا توجد سجلات</div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-purple to-primary-blue text-white">
                  <tr><th className="p-3 text-right">التاريخ</th><th className="p-3 text-right">رقم</th><th className="p-3 text-right">الاسم</th><th className="p-3 text-center">الحلقة</th><th className="p-3 text-center">البرنامج</th><th className="p-3 text-center">الحالة</th></tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-right font-medium">{item.date}</td>
                      <td className="p-3 text-right">{item.studentNumber}</td>
                      <td className="p-3 text-right">{item.studentName}</td>
                      <td className="p-3 text-center text-gray-600">{item.courseName}</td>
                      <td className="p-3 text-center text-gray-600">{item.programName}</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[item.status]?.color || 'bg-gray-100'}`}>
                          {statusConfig[item.status]?.symbol} {item.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          byDateData.length === 0 ? <div className="p-8 text-center text-gray-500">لا توجد سجلات</div> : (
            <div className="divide-y">
              {byDateData.map((dg) => (
                <div key={dg.date} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">{dg.date}</h3>
                    <div className="flex gap-2 text-sm">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">ح: {dg.stats.present}</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">م: {dg.stats.excused}</span>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded">غ: {dg.stats.absent}</span>
                      <span className="px-2 py-1 bg-gray-100 rounded">المجموع: {dg.stats.total}</span>
                    </div>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100"><tr><th className="p-2 text-right">رقم</th><th className="p-2 text-right">الاسم</th><th className="p-2 text-center">الحلقة</th><th className="p-2 text-center">الحالة</th></tr></thead>
                    <tbody>
                      {dg.records.map((r, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-2 text-right">{r.studentNumber}</td>
                          <td className="p-2 text-right">{r.studentName}</td>
                          <td className="p-2 text-center text-gray-600">{r.courseName}</td>
                          <td className="p-2 text-center"><span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusConfig[r.status]?.color}`}>{statusConfig[r.status]?.symbol} {r.statusLabel}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">رموز الحضور:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statusConfig).map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <span className={`px-2 py-1 text-sm font-medium rounded border ${v.color}`}>{v.symbol}</span>
              <span className="text-sm">{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}