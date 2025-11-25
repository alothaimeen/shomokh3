import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CourseSelector from '@/components/attendance/CourseSelector';
import AttendanceManager from '@/components/attendance/AttendanceManager';

type AttendanceStatus = 'PRESENT' | 'EXCUSED' | 'ABSENT' | 'REVIEWED' | 'LEFT_EARLY';

interface AttendanceData {
  student: {
    id: string;
    studentName: string;
    studentNumber: number;
    studentPhone: string;
  };
  status: AttendanceStatus | null;
  notes: string | null;
}

interface Props {
  courseId: string;
  date: string;
}

export default async function AttendanceAsync({ courseId, date }: Props) {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  // جلب حلقات المعلم
  const teacherCourses = await db.course.findMany({
    where: session.user.role === 'ADMIN' ? {} : { teacherId: session.user.id },
    select: {
      id: true,
      courseName: true,
      level: true,
      program: {
        select: {
          programName: true,
        },
      },
    },
    orderBy: { courseName: 'asc' },
  });

  const courses = teacherCourses.map((course) => ({
    id: course.id,
    courseName: course.courseName,
    programName: course.program.programName,
    level: course.level,
  }));

  // إذا لم يتم اختيار حلقة، استخدم الأولى
  const selectedCourse = courseId || courses[0]?.id || '';

  let attendanceData: AttendanceData[] = [];
  let courseInfo = null;

  if (selectedCourse) {
    // جلب معلومات الحلقة
    courseInfo = await db.course.findUnique({
      where: { id: selectedCourse },
      select: {
        id: true,
        courseName: true,
        program: {
          select: {
            programName: true,
          },
        },
      },
    });

    // جلب الطالبات المسجلات
    const enrollments = await db.enrollment.findMany({
      where: {
        courseId: selectedCourse,
        isActive: true,
      },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
            studentPhone: true,
          },
        },
        course: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        student: {
          studentNumber: 'asc',
        },
      },
    });

    // جلب سجلات الحضور
    const attendanceRecords = await db.attendance.findMany({
      where: {
        courseId: selectedCourse,
        date: new Date(date),
      },
      select: {
        studentId: true,
        status: true,
        notes: true,
      },
    });

    const attendanceMap = new Map(
      attendanceRecords.map((record) => [
        record.studentId,
        { status: record.status as AttendanceStatus, notes: record.notes },
      ])
    );

    attendanceData = enrollments.map((enrollment) => {
      const attendance = attendanceMap.get(enrollment.student.id);
      return {
        student: enrollment.student,
        status: attendance?.status || null,
        notes: attendance?.notes || null,
      };
    });
  }

  return (
    <>
      <CourseSelector
        courses={courses}
        selectedCourse={selectedCourse}
        selectedDate={date}
      />

      {courseInfo && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {courseInfo.courseName} - {courseInfo.program.programName}
          </h2>
        </div>
      )}

      {selectedCourse ? (
        <AttendanceManager
          initialData={attendanceData}
          courseId={selectedCourse}
          date={date}
        />
      ) : (
        <div className="text-center py-8 text-gray-500">
          يرجى اختيار الحلقة لعرض الطالبات
        </div>
      )}
    </>
  );
}
