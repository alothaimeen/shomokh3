'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// أنواع البيانات
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'LEFT_EARLY';

interface Student {
  id: string;
  studentName: string;
  studentNumber: number;
  studentPhone: string;
}

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
  };
  _count: {
    enrollments: number;
  };
}

interface AttendanceRecord {
  id?: string;
  status: AttendanceStatus | null;
  notes: string | null;
}

interface AttendanceData {
  student: Student;
  attendance: AttendanceRecord | null;
  status: AttendanceStatus | null;
  notes: string | null;
}

interface AttendanceResponse {
  course: Course;
  date: string;
  attendanceData: AttendanceData[];
  summary: {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    leftEarlyCount: number;
    notMarkedCount: number;
  };
}

// خريطة الرموز والألوان
const statusConfig = {
  PRESENT: {
    label: 'حاضر',
    symbol: 'ح',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  ABSENT: {
    label: 'غائب',
    symbol: 'غ',
    color: 'bg-red-100 text-red-800 border-red-300'
  },
  LATE: {
    label: 'متأخر',
    symbol: 'ث',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  EXCUSED: {
    label: 'رخصة',
    symbol: 'ر',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  LEFT_EARLY: {
    label: 'خروج مبكر',
    symbol: 'خ',
    color: 'bg-orange-100 text-orange-800 border-orange-300'
  },
};

export default function AttendancePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // تعريف الدوال أولاً
  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/attendance/teacher-courses');

      if (!response.ok) {
        console.error('خطأ في API:', response.status, response.statusText);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('خطأ: الاستجابة ليست JSON:', contentType);
        const text = await response.text();
        console.error('محتوى الاستجابة:', text);
        return;
      }

      const data = await response.json();
      setCourses(data.courses || []);
      if (data.courses && data.courses.length > 0) {
        setSelectedCourse(data.courses[0].id);
      }
    } catch (error) {
      console.error('خطأ في جلب الحلقات:', error);
    }
  };

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/attendance/course-attendance?courseId=${selectedCourse}&date=${selectedDate}`
      );

      if (!response.ok) {
        console.error('خطأ في API:', response.status, response.statusText);
        return;
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('خطأ: الاستجابة ليست JSON:', contentType);
        const text = await response.text();
        console.error('محتوى الاستجابة:', text);
        return;
      }

      const data: AttendanceResponse = await response.json();
      setAttendanceData(data.attendanceData || []);
      setCourseInfo(data.course || null);
      setSummary(data.summary || null);
    } catch (error) {
      console.error('خطأ في جلب الحضور:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedDate]);

  // التحقق من الصلاحيات
  useEffect(() => {
    if (session && !['ADMIN', 'MANAGER', 'TEACHER'].includes(session.user.userRole)) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // جلب الحلقات
  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session]);

  // جلب الحضور عند تغيير الحلقة أو التاريخ
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate, fetchAttendance]);

  const markAttendance = async (studentId: string, status: AttendanceStatus, notes?: string) => {
    setSaving(true);
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          courseId: selectedCourse,
          status,
          notes: notes || '',
          date: selectedDate,
        }),
      });

      if (response.ok) {
        // إعادة جلب البيانات
        await fetchAttendance();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'حدث خطأ في تسجيل الحضور');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الحضور:', error);
      alert('حدث خطأ في تسجيل الحضور');
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">تسجيل الحضور والغياب</h1>

      {/* اختيار الحلقة والتاريخ */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">اختيار الحلقة</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر الحلقة</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseName} - {course.program.programName} (المستوى {course.level})
                  {course.teacher && ` - ${course.teacher.userName}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">التاريخ</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* معلومات الحلقة والملخص */}
      {courseInfo && summary && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {courseInfo.courseName} - {courseInfo.program.programName}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold">{summary.totalStudents}</div>
              <div className="text-sm text-gray-600">إجمالي الطالبات</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-2xl font-bold text-green-600">{summary.presentCount}</div>
              <div className="text-sm text-gray-600">حاضرات</div>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <div className="text-2xl font-bold text-red-600">{summary.absentCount}</div>
              <div className="text-sm text-gray-600">غائبات</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <div className="text-2xl font-bold text-yellow-600">{summary.lateCount}</div>
              <div className="text-sm text-gray-600">متأخرات</div>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-2xl font-bold text-blue-600">{summary.excusedCount}</div>
              <div className="text-sm text-gray-600">رخص</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-2xl font-bold text-orange-600">{summary.leftEarlyCount}</div>
              <div className="text-sm text-gray-600">خروج مبكر</div>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-2xl font-bold text-gray-600">{summary.notMarkedCount}</div>
              <div className="text-sm text-gray-600">لم يُسجل</div>
            </div>
          </div>
        </div>
      )}

      {/* جدول الحضور */}
      {loading ? (
        <div className="text-center py-8">جاري تحميل البيانات...</div>
      ) : attendanceData.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    م
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    اسم الطالبة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    رقم التواصل
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة الحالية
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تسجيل الحضور
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((item, index) => (
                  <tr key={item.student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.student.studentNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.student.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.student.studentPhone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {item.status ? (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusConfig[item.status].color}`}>
                          {statusConfig[item.status].symbol} - {statusConfig[item.status].label}
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-300">
                          لم يُسجل
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center gap-2">
                        {Object.entries(statusConfig).map(([status, config]) => (
                          <button
                            key={status}
                            onClick={() => markAttendance(item.student.id, status as AttendanceStatus)}
                            disabled={saving}
                            className={`px-3 py-2 text-sm font-medium rounded border transition-colors hover:opacity-80 disabled:opacity-50 ${config.color}`}
                            title={config.label}
                          >
                            {config.symbol}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : selectedCourse ? (
        <div className="text-center py-8 text-gray-500">
          لا توجد طالبات مسجلات في هذه الحلقة
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          يرجى اختيار الحلقة لعرض الطالبات
        </div>
      )}

      {/* شرح الرموز */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">شرح الرموز:</h3>
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
    </div>
  );
}