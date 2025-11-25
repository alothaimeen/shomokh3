import { db } from '@/lib/db';

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

interface StudentAttendanceResponse {
  attendanceRecords: AttendanceRecord[];
  statistics: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    excusedDays: number;
    leftEarlyDays: number;
    attendancePercentage: number;
  };
}

async function getStudentAttendance(userId: string): Promise<StudentAttendanceResponse | null> {
  const student = await db.student.findFirst({
    where: { userId },
    select: {
      id: true,
      attendances: {
        include: {
          course: {
            include: {
              program: true
            }
          }
        },
        orderBy: { date: 'desc' }
      }
    }
  });

  if (!student) return null;

  const attendanceRecords = student.attendances.map(att => ({
    id: att.id,
    date: att.date.toISOString().split('T')[0],
    status: att.status,
    notes: att.notes || undefined,
    course: {
      id: att.course.id,
      courseName: att.course.courseName,
      level: att.course.level,
      program: {
        id: att.course.program.id,
        programName: att.course.program.programName
      }
    }
  }));

  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(a => a.status === 'PRESENT').length;
  const absentDays = attendanceRecords.filter(a => a.status === 'ABSENT').length;
  const excusedDays = attendanceRecords.filter(a => a.status === 'EXCUSED').length;
  const leftEarlyDays = attendanceRecords.filter(a => a.status === 'LEFT_EARLY').length;
  const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

  return {
    attendanceRecords,
    statistics: {
      totalDays,
      presentDays,
      absentDays,
      excusedDays,
      leftEarlyDays,
      attendancePercentage
    }
  };
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

interface AttendanceDataAsyncProps {
  userId: string;
}

export default async function AttendanceDataAsync({ userId }: AttendanceDataAsyncProps) {
  const data = await getStudentAttendance(userId);

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-800">لا توجد بيانات حضور مسجلة</p>
      </div>
    );
  }

  const { attendanceRecords, statistics } = data;

  return (
    <>
      {/* إحصائيات الحضور */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">إحصائيات الحضور</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">{statistics.totalDays}</div>
            <div className="text-sm text-gray-600">إجمالي الأيام</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{statistics.presentDays}</div>
            <div className="text-sm text-green-600">حاضرة</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-700">{statistics.excusedDays}</div>
            <div className="text-sm text-blue-600">معتذرة</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">{statistics.absentDays}</div>
            <div className="text-sm text-red-600">غائبة</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-700">{statistics.attendancePercentage.toFixed(1)}%</div>
            <div className="text-sm text-purple-600">نسبة الحضور</div>
          </div>
        </div>
      </div>

      {/* سجل الحضور */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900">سجل الحضور</h2>
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>لا توجد سجلات حضور بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attendanceRecords.map((record) => {
              const config = statusConfig[record.status];
              return (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{record.course.courseName}</h3>
                      <p className="text-sm text-gray-600">{record.course.program.programName}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
                      {config.symbol} {config.label}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">التاريخ:</span> {new Date(record.date).toLocaleDateString('ar-SA')}
                  </div>
                  {record.notes && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <span className="font-medium">ملاحظات:</span> {record.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
