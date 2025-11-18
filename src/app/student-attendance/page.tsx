'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type AttendanceStatus = 'PRESENT' | 'EXCUSED' | 'ABSENT' | 'REVIEWED' | 'LEFT_EARLY';

interface AttendanceRecord {
  id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
  course: {
    id: string;
    courseName: string;
    level: number;
    program: {
      id: string;
      programName: string;
    };
  };
}

interface Student {
  id: string;
  studentName: string;
  studentNumber: number;
  studentPhone: string;
}

interface AttendanceStatistics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  excusedDays: number;
  reviewedDays: number;
  leftEarlyDays: number;
  attendancePercentage: number;
}

interface StudentAttendanceResponse {
  student: Student;
  attendanceRecords: AttendanceRecord[];
  statistics: AttendanceStatistics;
}

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

function StudentAttendancePageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [attendanceData, setAttendanceData] = useState<StudentAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session && session.user.userRole !== 'TEACHER' && session.user.userRole !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!studentId) {
        setError('معرف الطالبة مفقود');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`/api/attendance/student-record?studentId=${studentId}`);
        if (!response.ok) {
          throw new Error('فشل في جلب سجل الحضور');
        }
        const data = await response.json();
        setAttendanceData(data);
      } catch (err) {
        setError('حدث خطأ في تحميل البيانات');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  if (!session) {
    return <div>جاري التحميل...</div>;
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <div className="text-center">جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
        <Link
          href="/attendance"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          ← العودة للحضور
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">سجل حضور الطالبة</h1>
        <Link
          href="/attendance"
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
        >
          ← العودة للحضور
        </Link>
      </div>

      {attendanceData && (
        <>
          {/* معلومات الطالبة */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">معلومات الطالبة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600">الاسم: </span>
                <span className="font-medium">{attendanceData.student.studentName}</span>
              </div>
              <div>
                <span className="text-gray-600">الرقم التسلسلي: </span>
                <span className="font-medium">{attendanceData.student.studentNumber}</span>
              </div>
              <div>
                <span className="text-gray-600">رقم التواصل: </span>
                <span className="font-medium">{attendanceData.student.studentPhone}</span>
              </div>
            </div>
          </div>

          {/* إحصائيات الحضور */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">إحصائيات الحضور</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">
                  {attendanceData.statistics.totalDays}
                </div>
                <div className="text-sm text-gray-600">إجمالي الأيام</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-800">
                  {attendanceData.statistics.presentDays}
                </div>
                <div className="text-sm text-green-600">أيام الحضور</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-800">
                  {attendanceData.statistics.absentDays}
                </div>
                <div className="text-sm text-red-600">أيام الغياب</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-800">
                  {attendanceData.statistics.excusedDays}
                </div>
                <div className="text-sm text-blue-600">معتذرة</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded">
                <div className="text-2xl font-bold text-purple-800">
                  {attendanceData.statistics.reviewedDays}
                </div>
                <div className="text-sm text-purple-600">راجعت</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded">
                <div className="text-2xl font-bold text-indigo-800">
                  {attendanceData.statistics.attendancePercentage}%
                </div>
                <div className="text-sm text-indigo-600">نسبة الحضور</div>
              </div>
            </div>
          </div>

          {/* سجل الحضور */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">سجل الحضور التفصيلي</h2>
            {attendanceData.attendanceRecords.length === 0 ? (
              <p className="text-gray-500 text-center py-4">لا توجد سجلات حضور بعد</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-right">التاريخ</th>
                      <th className="px-4 py-2 text-right">الحلقة</th>
                      <th className="px-4 py-2 text-right">الحالة</th>
                      <th className="px-4 py-2 text-right">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.attendanceRecords.map((record) => {
                      const date = new Date(record.date);
                      const hijriDate = date.toLocaleDateString('ar-SA-u-ca-islamic-umalqura');
                      const gregorianDate = date.toLocaleDateString('en-GB');
                      const dayName = date.toLocaleDateString('ar-SA', { weekday: 'long' });
                      
                      return (
                        <tr key={record.id} className="border-b">
                          <td className="px-4 py-3">
                            <div className="font-medium">{dayName}</div>
                            <div>{hijriDate}</div>
                            <div className="text-sm text-gray-500">{gregorianDate}</div>
                          </td>
                          <td className="px-4 py-3">{record.course.courseName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-sm font-medium rounded border ${statusConfig[record.status].color}`}>
                              {statusConfig[record.status].symbol} - {statusConfig[record.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {record.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* معلومات أساسية عن الحضور */}
          <div className="bg-gray-50 p-6 rounded-lg">
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
        </>
      )}
    </div>
  );
}

export default function StudentAttendancePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">جاري التحميل...</div>}>
      <StudentAttendancePageContent />
    </Suspense>
  );
}
