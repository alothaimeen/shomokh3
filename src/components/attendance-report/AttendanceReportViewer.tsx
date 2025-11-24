'use client';

import { useState } from 'react';

interface Course {
  id: string;
  courseName: string;
  level: number;
  program: {
    id: string;
    programName: string;
  };
  teacher?: {
    id: string;
    userName: string;
  } | null;
  enrollmentsCount: number;
}

interface Props {
  courses: Course[];
}

// خريطة الرموز والألوان (محدثة - الجلسة 10.6)
const statusConfig = {
  PRESENT: {
    label: 'حاضرة',
    symbol: 'ح',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  EXCUSED: {
    label: 'غائبة بعذر (معتذرة)',
    symbol: 'م',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  ABSENT: {
    label: 'غائبة بدون عذر',
    symbol: 'غ',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  REVIEWED: {
    label: 'راجعت بدون حضور',
    symbol: 'ر',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  LEFT_EARLY: {
    label: 'خروج مبكر',
    symbol: 'خ',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
};

export default function AttendanceReportViewer({ courses }: Props) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const totalStudents = courses.reduce((sum, course) => sum + course.enrollmentsCount, 0);

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
        تقرير الحضور والغياب
      </h1>

      {/* اختيار التاريخ */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">اختيار التاريخ</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              اليوم الحالي
            </button>
          </div>
        </div>
      </div>

      {/* ملخص عام */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-blue-600">{courses.length}</div>
          <div className="text-sm text-gray-600">إجمالي الحلقات</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-green-600">{totalStudents}</div>
          <div className="text-sm text-gray-600">إجمالي الطالبات</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-purple-600">-</div>
          <div className="text-sm text-gray-600">نسبة الحضور</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md text-center">
          <div className="text-2xl font-bold text-orange-600">-</div>
          <div className="text-sm text-gray-600">التقرير المفصل</div>
        </div>
      </div>

      {/* قائمة الحلقات مع روابط سريعة */}
      {courses.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">الحلقات وروابط الحضور السريعة</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحلقة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البرنامج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المعلمة
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    عدد الطالبات
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {course.courseName} (المستوى {course.level})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.program.programName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.teacher?.userName || 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {course.enrollmentsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <a
                        href={`/attendance?courseId=${course.id}&date=${selectedDate}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        عرض الحضور
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          لا توجد حلقات متاحة
        </div>
      )}

      {/* إجراءات سريعة */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/attendance"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">✅</span>
            <span>تسجيل الحضور</span>
          </a>
          <a
            href="/enrolled-students"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">📝</span>
            <span>الطالبات المسجلات</span>
          </a>
          <a
            href="/students"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">👩‍🎓</span>
            <span>بيانات الطالبات</span>
          </a>
        </div>
      </div>

      {/* شرح الرموز */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">رموز الحضور:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`px-2 py-1 text-sm font-medium rounded border ${config.color}`}>
                {config.symbol}
              </span>
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* رابط العودة */}
      <div className="mt-6 text-center">
        <a
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          العودة للوحة التحكم
        </a>
      </div>
    </>
  );
}
