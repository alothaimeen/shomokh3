'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// أنواع البيانات (مطابقة لواجهة المعلمة)
type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'LEFT_EARLY';

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
  lateDays: number;
  excusedDays: number;
  leftEarlyDays: number;
  attendancePercentage: number;
}

interface StudentAttendanceResponse {
  student: Student;
  attendanceRecords: AttendanceRecord[];
  statistics: AttendanceStatistics;
}

// خريطة الرموز والألوان (مطابقة لواجهة المعلمة)
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

export default function MyAttendancePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [attendanceData, setAttendanceData] = useState<StudentAttendanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // التحقق من أن المستخدم طالبة
  useEffect(() => {
    if (session && session.user.userRole !== 'STUDENT') {
      router.push('/dashboard');
    }
  }, [session, router]);

  // في الوقت الحالي، سنعرض رسالة أن الميزة قيد التطوير
  // لأننا نحتاج لربط جدول Student بجدول User
  if (!session) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">سجل حضوري</h1>

      {/* رسالة مؤقتة */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">🚧</span>
          </div>
          <div className="mr-3">
            <h3 className="text-lg font-medium text-yellow-800">
              الميزة قيد التطوير
            </h3>
            <p className="text-yellow-700 mt-2">
              سجل الحضور للطالبات سيكون متاحاً قريباً. حالياً، يمكن للمعلمات والإدارة فقط عرض وإدارة الحضور.
            </p>
            <p className="text-yellow-700 mt-1">
              لعرض حضورك، يرجى التواصل مع معلمتك أو الإدارة.
            </p>
          </div>
        </div>
      </div>

      {/* الإجراءات المتاحة */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">الإجراءات المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/enrollment"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">📝</span>
            <span>طلب الانضمام للحلقات</span>
          </a>
          <a
            href="/programs"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">📚</span>
            <span>البرامج المتاحة</span>
          </a>
        </div>
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

      {/* رابط العودة */}
      <div className="mt-6 text-center">
        <a
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          العودة للوحة التحكم
        </a>
      </div>
    </div>
  );
}