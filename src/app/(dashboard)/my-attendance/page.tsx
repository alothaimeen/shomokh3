import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

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

async function getStudentAttendance(userId: string): Promise<StudentAttendanceResponse | null> {
  const student = await db.student.findFirst({
    where: { userId },
    select: {
      id: true,
      studentName: true,
      studentNumber: true,
      studentPhone: true
    }
  });

  if (!student) return null;

  const attendanceRecords = await db.attendance.findMany({
    where: { studentId: student.id },
    include: {
      course: {
        include: {
          program: {
            select: {
              id: true,
              programName: true
            }
          }
        }
      }
    },
    orderBy: { date: 'desc' }
  });

  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(r => r.status === 'PRESENT').length;
  const absentDays = attendanceRecords.filter(r => r.status === 'ABSENT').length;
  const excusedDays = attendanceRecords.filter(r => r.status === 'EXCUSED').length;
  const leftEarlyDays = attendanceRecords.filter(r => r.status === 'LEFT_EARLY').length;

  return {
    student,
    attendanceRecords: attendanceRecords.map(r => ({
      id: r.id,
      date: r.date.toISOString().split('T')[0],
      status: r.status as AttendanceStatus,
      notes: r.notes || undefined,
      course: {
        id: r.course.id,
        courseName: r.course.courseName,
        level: r.course.level,
        program: r.course.program
      }
    })),
    statistics: {
      totalDays,
      presentDays,
      absentDays,
      excusedDays,
      leftEarlyDays,
      attendancePercentage: totalDays > 0 ? (presentDays / totalDays) * 100 : 0
    }
  };
}

export default async function MyAttendancePage() {
  const session = await auth();
  if (!session || session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  const attendanceData = await getStudentAttendance(session.user.id);

  if (!attendanceData) {
    return (
      <>
        <AppHeader title="حضوري" />
          <main className="flex-1 overflow-auto p-6">
            <BackButton />
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
              لم يتم العثور على سجل طالبة
            </div>
          </main>
      </>
    );
  }

  const { student, attendanceRecords, statistics } = attendanceData;

  return (
    <>
      <AppHeader title="حضوري" />
        <main className="flex-1 overflow-auto p-6">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            حضوري
          </h1>
          <p className="text-gray-600 mb-6">عرض سجل حضورك وإحصائياتك</p>

          {/* معلومات الطالبة */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">معلومات الطالبة</h2>
            <p className="text-gray-700">
              <strong>الاسم:</strong> {student.studentName}
            </p>
            <p className="text-gray-700">
              <strong>الرقم التسلسلي:</strong> {student.studentNumber}
            </p>
          </div>

          {/* إحصائيات الحضور */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">إحصائيات الحضور</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded">
                <div className="text-2xl font-bold text-gray-800">
                  {statistics.totalDays}
                </div>
                <div className="text-sm text-gray-600">إجمالي الأيام</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-800">
                  {statistics.presentDays}
                </div>
                <div className="text-sm text-green-600">أيام الحضور</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-800">
                  {statistics.absentDays}
                </div>
                <div className="text-sm text-red-600">أيام الغياب</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-800">
                  {statistics.attendancePercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-blue-600">نسبة الحضور</div>
              </div>
            </div>
          </div>

          {/* سجل الحضور */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">سجل الحضور التفصيلي</h2>
            {attendanceRecords.length === 0 ? (
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
                    {attendanceRecords.map((record) => {
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
          <div className="mt-6 bg-gray-50 p-6 rounded-lg">
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
        </main>
    </>
  );
}
