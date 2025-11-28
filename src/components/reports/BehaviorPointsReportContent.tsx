'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  getBehaviorPointsReportData, 
  type BehaviorPointsReportItem,
  type ReportFilters, 
  type SortOptions, 
  type ExportFormat 
} from '@/actions/reports';
import SmartExportButton from './SmartExportButton';
import { exportBehaviorPointsReport } from '@/lib/utils/exportHelpers';

interface Course {
  id: string;
  courseName: string;
}

interface Props {
  userId: string;
  userRole: string;
}

const medalEmojis = ['🥇', '🥈', '🥉'];

export default function BehaviorPointsReportContent({ userId, userRole }: Props) {
  const [data, setData] = useState<BehaviorPointsReportItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  
  const [filters, setFilters] = useState<ReportFilters>({});
  const [sortBy, setSortBy] = useState<SortOptions>({ field: 'total', order: 'desc' });

  useEffect(() => { fetchCourses(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (hasLoadedOnce) fetchData(); }, [filters, sortBy]);

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
      const result = await getBehaviorPointsReportData(filters, sortBy);
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
    setFilters(prev => ({ ...prev, [key]: value || undefined }));
  };

  const handleExport = (format: ExportFormat) => {
    exportBehaviorPointsReport(data, format, filters);
  };

  const top3 = data.slice(0, 3);

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
          <SmartExportButton onExport={handleExport} isLoading={isPending} disabled={data.length === 0} />
          
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
                🏆 عرض التقرير
              </>
            )}
          </button>
        </div>
      </div>

      {!hasLoadedOnce ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">اختر الحلقة واضغط على زر &quot;عرض التقرير&quot;</h3>
          <p className="text-gray-500">سيتم عرض ترتيب الطالبات حسب النقاط بعد الضغط على الزر</p>
        </div>
      ) : isLoading || isPending ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center text-gray-500">لا توجد بيانات</div>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-center mb-8">🏆 المتصدرات</h2>
              <div className="flex justify-center items-end gap-4">
                {top3[1] && (
                  <div className="text-center flex-1 max-w-48">
                    <div className="text-5xl mb-2">{medalEmojis[1]}</div>
                    <div className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-xl pt-8 pb-4">
                      <div className="w-16 h-16 mx-auto bg-gray-400 rounded-full flex items-center justify-center text-white text-xl font-bold">2</div>
                      <p className="mt-2 font-semibold text-gray-800 text-sm px-2 line-clamp-2">{top3[1].studentName}</p>
                      <p className="text-2xl font-bold text-gray-700">{top3[1].totalPoints}</p>
                    </div>
                  </div>
                )}
                {top3[0] && (
                  <div className="text-center flex-1 max-w-56">
                    <div className="text-6xl mb-2">{medalEmojis[0]}</div>
                    <div className="bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-xl pt-12 pb-6">
                      <div className="w-20 h-20 mx-auto bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">1</div>
                      <p className="mt-3 font-bold text-gray-800 px-2 line-clamp-2">{top3[0].studentName}</p>
                      <p className="text-3xl font-bold text-yellow-800">{top3[0].totalPoints}</p>
                      <p className="text-sm text-yellow-700">نقطة</p>
                    </div>
                  </div>
                )}
                {top3[2] && (
                  <div className="text-center flex-1 max-w-44">
                    <div className="text-4xl mb-2">{medalEmojis[2]}</div>
                    <div className="bg-gradient-to-b from-orange-200 to-orange-300 rounded-t-xl pt-6 pb-4">
                      <div className="w-14 h-14 mx-auto bg-orange-400 rounded-full flex items-center justify-center text-white text-lg font-bold">3</div>
                      <p className="mt-2 font-semibold text-gray-800 text-xs px-2 line-clamp-2">{top3[2].studentName}</p>
                      <p className="text-xl font-bold text-orange-700">{top3[2].totalPoints}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-primary-purple to-primary-blue text-white">
                  <tr>
                    <th className="p-3 text-center w-16">الترتيب</th>
                    <th className="p-3 text-right">الطالبة</th>
                    <th className="p-3 text-center">الحلقة</th>
                    <th className="p-3 text-center">الحضور المبكر</th>
                    <th className="p-3 text-center">الحفظ المتقن</th>
                    <th className="p-3 text-center">المشاركة</th>
                    <th className="p-3 text-center">الالتزام</th>
                    <th className="p-3 text-center">عدد الجلسات</th>
                    <th className="p-3 text-center font-bold">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, idx) => (
                    <tr key={item.studentId} className={idx < 3 ? 'bg-amber-50' : 'hover:bg-gray-50'}>
                      <td className="p-3 text-center">
                        {idx < 3 ? <span className="text-2xl">{medalEmojis[idx]}</span> : <span className="text-gray-500 font-medium">{idx + 1}</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="font-medium">{item.studentName}</div>
                        <div className="text-xs text-gray-500">{item.studentNumber}</div>
                      </td>
                      <td className="p-3 text-center text-sm text-gray-600">{item.courseName}</td>
                      <td className="p-3 text-center"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{item.earlyAttendancePoints}</span></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">{item.perfectMemorizationPoints}</span></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">{item.activeParticipationPoints}</span></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">{item.timeCommitmentPoints}</span></td>
                      <td className="p-3 text-center"><span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm">{item.recordsCount}</span></td>
                      <td className="p-3 text-center"><span className="px-3 py-1 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-full font-bold">{item.totalPoints}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium mb-3">معايير احتساب النقاط:</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-green-500 rounded-full"></span>الحضور المبكر: 5 نقاط</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-500 rounded-full"></span>الحفظ المتقن: 5 نقاط</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-full"></span>المشاركة الفعالة: 5 نقاط</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-orange-500 rounded-full"></span>الالتزام بالوقت: 5 نقاط</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}