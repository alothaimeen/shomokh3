'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// أنواع البيانات
type AttendanceStatus = 'PRESENT' | 'EXCUSED' | 'ABSENT' | 'REVIEWED' | 'LEFT_EARLY';

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

export default function AttendancePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [preSelectedCourse, setPreSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Map<string, { status: AttendanceStatus; notes?: string }>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  // تعريف الدوال أولاً
  const fetchCourses = useCallback(async () => {
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
      if (data.courses && data.courses.length > 0 && !preSelectedCourse) {
        setSelectedCourse(data.courses[0].id);
      }
    } catch (error) {
      console.error('خطأ في جلب الحلقات:', error);
    }
  }, [preSelectedCourse]);

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
    if (session && !['ADMIN', 'TEACHER'].includes(session.user.userRole)) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // التحقق من وجود courseId في URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseIdFromUrl = urlParams.get('courseId');
    if (courseIdFromUrl) {
      setPreSelectedCourse(courseIdFromUrl);
      setSelectedCourse(courseIdFromUrl);
    }
  }, []);

  // جلب الحلقات
  useEffect(() => {
    if (session) {
      fetchCourses();
    }
  }, [session, fetchCourses]);

  // جلب الحضور عند تغيير الحلقة أو التاريخ
  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate, fetchAttendance]);

  // تحديث الملخص الإحصائي (محدث - الجلسة 10.6)
  const updateSummary = (updatedData: AttendanceData[]) => {
    const newSummary = {
      totalStudents: updatedData.length,
      presentCount: updatedData.filter(item => item.status === 'PRESENT').length,
      absentCount: updatedData.filter(item => item.status === 'ABSENT').length,
      lateCount: updatedData.filter(item => item.status === 'REVIEWED').length, // تم التحديث من LATE إلى REVIEWED
      excusedCount: updatedData.filter(item => item.status === 'EXCUSED').length,
      leftEarlyCount: updatedData.filter(item => item.status === 'LEFT_EARLY').length,
      notMarkedCount: updatedData.filter(item => !item.status).length,
    };
    setSummary(newSummary);
  };

  // تسجيل تغيير مؤقت (بدون حفظ فوري)
  const markAttendanceLocal = (studentId: string, status: AttendanceStatus, notes?: string) => {
    console.log('markAttendanceLocal called:', { studentId, status, notes });

    const newChanges = new Map(pendingChanges);
    newChanges.set(studentId, { status, notes });
    setPendingChanges(newChanges);
    setHasChanges(true);

    console.log('Updated pendingChanges:', newChanges);

    // تحديث العرض المحلي
    const updatedData = attendanceData.map(item =>
      item.student.id === studentId
        ? { ...item, status, notes: notes || null }
        : item
    );
    setAttendanceData(updatedData);

    // تحديث الملخص الإحصائي
    updateSummary(updatedData);
  };

  // حفظ جميع التغييرات دفعة واحدة
  const saveAllChanges = async () => {
    console.log('saveAllChanges called, pendingChanges:', pendingChanges);

    if (pendingChanges.size === 0) {
      console.log('No pending changes to save');
      return;
    }

    setSaving(true);
    try {
      const attendanceRecords = Array.from(pendingChanges.entries()).map(([studentId, change]) => ({
        studentId,
        courseId: selectedCourse,
        status: change.status,
        notes: change.notes || '',
        date: selectedDate,
      }));

      console.log('Sending attendance records:', attendanceRecords);

      const response = await fetch('/api/attendance/bulk-mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceRecords }),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Save successful:', result);
        alert(result.message);
        setPendingChanges(new Map());
        setHasChanges(false);
        // إعادة جلب البيانات لضمان التحديث
        await fetchAttendance();
      } else {
        const errorData = await response.json();
        console.error('Save failed:', errorData);
        alert(errorData.error || 'حدث خطأ في حفظ الحضور');
      }
    } catch (error) {
      console.error('خطأ في حفظ الحضور:', error);
      alert('حدث خطأ في حفظ الحضور');
    } finally {
      setSaving(false);
    }
  };

  // إلغاء التغييرات
  const cancelChanges = () => {
    setPendingChanges(new Map());
    setHasChanges(false);
    // إعادة جلب البيانات لاستعادة الحالة الأصلية
    fetchAttendance();
  };

  if (!session) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">تسجيل الحضور والغياب</h1>
        {preSelectedCourse && session?.user?.userRole === 'TEACHER' && (
          <Link
            href="/teacher"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            ← العودة لاختيار الحلقة
          </Link>
        )}
      </div>

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

      {/* أزرار الحفظ والإلغاء */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-800 font-medium">
                يوجد {pendingChanges.size} تغيير غير محفوظ
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={cancelChanges}
                disabled={saving}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded transition-colors"
              >
                إلغاء التغييرات
              </button>
              <button
                onClick={saveAllChanges}
                disabled={saving}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded transition-colors flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    💾 حفظ جميع التغييرات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <Link 
                        href={`/student-attendance?studentId=${item.student.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {item.student.studentName}
                      </Link>
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
                        {Object.entries(statusConfig).map(([status, config]) => {
                          const isSelected = item.status === status;
                          const isPending = pendingChanges.has(item.student.id) && pendingChanges.get(item.student.id)?.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => markAttendanceLocal(item.student.id, status as AttendanceStatus)}
                              disabled={saving}
                              className={`px-3 py-2 text-sm font-medium rounded border transition-colors hover:opacity-80 disabled:opacity-50 ${
                                isSelected || isPending
                                  ? `${config.color} ring-2 ring-blue-500`
                                  : `${config.color} opacity-60`
                              } ${isPending ? 'animate-pulse' : ''}`}
                              title={`${config.label}${isPending ? ' (مؤقت)' : ''}`}
                            >
                              {config.symbol}
                              {isPending && <span className="text-xs ml-1">*</span>}
                            </button>
                          );
                        })}
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