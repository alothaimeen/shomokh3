'use client';

import { useState, useTransition } from 'react';
import { getAttendanceReport, getBehaviorPointsReport } from '@/actions/reports';
import { Download, FileSpreadsheet, Award, Calendar } from 'lucide-react';

interface Course {
  id: string;
  courseName: string;
  programName: string;
  teacherName?: string;
}

interface Props {
  courses: Course[];
}

type ReportType = 'attendance' | 'behavior' | null;

export default function DetailedReports({ courses }: Props) {
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');
  const [reportType, setReportType] = useState<ReportType>(null);
  const [reportData, setReportData] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');

  const handleGenerateReport = (type: ReportType) => {
    if (!selectedCourse) {
      setMessage('الرجاء اختيار حلقة');
      return;
    }

    setReportType(type);
    setMessage('');

    startTransition(async () => {
      if (type === 'attendance') {
        const result = await getAttendanceReport(selectedCourse);
        if (result.success && result.data) {
          setReportData(result.data);
          setMessage(`تم جلب ${result.data.length} سجل حضور`);
        } else {
          setMessage(result.error || 'حدث خطأ');
        }
      } else if (type === 'behavior') {
        const result = await getBehaviorPointsReport(selectedCourse);
        if (result.success && result.data) {
          setReportData(result.data);
          setMessage(`تم جلب بيانات ${result.data.length} طالبة`);
        } else {
          setMessage(result.error || 'حدث خطأ');
        }
      }
    });
  };

  const handleExportToCSV = () => {
    if (reportData.length === 0) {
      setMessage('لا توجد بيانات للتصدير');
      return;
    }

    let csv = '';
    let filename = '';

    if (reportType === 'attendance') {
      csv = 'التاريخ,رقم الطالبة,اسم الطالبة,الحلقة,البرنامج,الحالة\n';
      reportData.forEach((row: any) => {
        csv += `${row.date},${row.studentNumber},${row.studentName},${row.courseName},${row.programName},${row.statusLabel}\n`;
      });
      filename = 'attendance_report.csv';
    } else if (reportType === 'behavior') {
      csv = 'رقم الطالبة,اسم الطالبة,الحلقة,إجمالي النقاط,نقاط إيجابية,نقاط سلبية,عدد السجلات\n';
      reportData.forEach((row: any) => {
        csv += `${row.studentNumber},${row.studentName},${row.courseName},${row.totalPoints},${row.positivePoints},${row.negativePoints},${row.recordsCount}\n`;
      });
      filename = 'behavior_points_report.csv';
    }

    // إنشاء وتنزيل الملف
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setMessage('تم التصدير بنجاح ✓');
  };

  return (
    <div className="space-y-6">
      {/* اختيار الحلقة */}
      <div className="bg-white rounded-lg shadow p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          اختر الحلقة:
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
        >
          <option value="">-- اختر حلقة --</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.courseName} ({course.programName})
              {course.teacherName && ` - ${course.teacherName}`}
            </option>
          ))}
        </select>
      </div>

      {/* أنواع التقارير */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* تقرير الحضور */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-bold text-gray-800">تقرير الحضور</h3>
              <p className="text-sm text-gray-600">سجلات الحضور التفصيلية</p>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('attendance')}
            disabled={isPending || !selectedCourse}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <FileSpreadsheet size={20} />
            {isPending && reportType === 'attendance' ? 'جاري التحميل...' : 'عرض التقرير'}
          </button>
        </div>

        {/* تقرير النقاط */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-lg p-6 border-2 border-yellow-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Award className="text-white" size={24} />
            </div>
            <div className="mr-4">
              <h3 className="text-lg font-bold text-gray-800">تقرير النقاط</h3>
              <p className="text-sm text-gray-600">النقاط التحفيزية للطالبات</p>
            </div>
          </div>
          <button
            onClick={() => handleGenerateReport('behavior')}
            disabled={isPending || !selectedCourse}
            className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Award size={20} />
            {isPending && reportType === 'behavior' ? 'جاري التحميل...' : 'عرض التقرير'}
          </button>
        </div>
      </div>

      {/* رسالة الحالة */}
      {message && (
        <div className={`p-4 rounded-lg ${message.includes('خطأ') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}

      {/* جدول النتائج */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-primary-purple to-primary-blue flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">
              {reportType === 'attendance' ? 'سجلات الحضور' : 'النقاط التحفيزية'}
            </h2>
            <button
              onClick={handleExportToCSV}
              className="bg-white text-primary-purple px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <Download size={18} />
              تصدير CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            {reportType === 'attendance' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطالبة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{row.studentNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.studentName}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(row.status)}`}>
                          {row.statusLabel}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {reportType === 'behavior' && (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">رقم الطالبة</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">إجمالي النقاط</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">نقاط إيجابية</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">نقاط سلبية</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{row.studentNumber}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.studentName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-lg font-bold ${row.totalPoints >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {row.totalPoints}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-green-600 font-semibold">+{row.positivePoints}</td>
                      <td className="px-4 py-3 text-center text-red-600 font-semibold">-{row.negativePoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-4 bg-gray-50 text-center text-sm text-gray-600">
            إجمالي السجلات: <span className="font-bold">{reportData.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    'PRESENT': 'bg-green-100 text-green-800',
    'EXCUSED': 'bg-yellow-100 text-yellow-800',
    'ABSENT': 'bg-red-100 text-red-800',
    'REVIEWED': 'bg-purple-100 text-purple-800',
    'LEFT_EARLY': 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
