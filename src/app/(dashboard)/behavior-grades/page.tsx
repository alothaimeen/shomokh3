import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import BehaviorGradesForm from '@/components/behavior-grades/BehaviorGradesForm';

async function getTeacherCourses(teacherId: string) {
  return await db.course.findMany({
    where: {
      teacherId
    },
    include: {
      program: true,
      _count: {
        select: {
          enrollments: true
        }
      }
    },
    orderBy: {
      courseName: 'asc'
    }
  });
}

async function getCourseStudentsWithGrades(courseId: string, date: string) {
  const enrollments = await db.enrollment.findMany({
    where: {
      courseId
    },
    include: {
      student: true
    },
    orderBy: {
      student: {
        studentNumber: 'asc'
      }
    }
  });

  const studentIds = enrollments.map(e => e.studentId);
  
  const behaviorGrades = await db.behaviorGrade.findMany({
    where: {
      courseId,
      studentId: { in: studentIds },
      date: new Date(date)
    }
  });

  const gradesByStudent = new Map(behaviorGrades.map(g => [g.studentId, g]));

  return enrollments.map(e => ({
    id: e.studentId,
    studentName: e.student.studentName,
    studentNumber: e.student.studentNumber,
    studentPhone: e.student.studentPhone,
    behaviorGrade: gradesByStudent.get(e.studentId) ? {
      dailyScore: Number(gradesByStudent.get(e.studentId)!.dailyScore),
      notes: gradesByStudent.get(e.studentId)!.notes
    } : null
  }));
}

export default async function BehaviorGradesPage({
  searchParams
}: {
  searchParams: Promise<{ courseId?: string; date?: string }>
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role !== 'TEACHER' && session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const courses = await getTeacherCourses(session.user.id);

  if (courses.length === 0) {
    return (
      <>
        <AppHeader title="درجات السلوك اليومية" />
          <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 mb-4">لا توجد حلقات مسندة إليك</p>
              <a
                href="/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md inline-block"
              >
                العودة للوحة التحكم
              </a>
            </div>
          </div>
      </>
    );
  }

  const selectedCourseId = params.courseId || courses[0].id;
  const selectedDate = params.date || new Date().toISOString().split('T')[0];
  const students = await getCourseStudentsWithGrades(selectedCourseId, selectedDate);

  const formattedCourses = courses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    programName: c.program.programName,
    level: c.level,
    studentsCount: c._count.enrollments
  }));

  return (
    <>
      <AppHeader title="درجات السلوك اليومية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            ⭐ درجات السلوك اليومية
          </h1>

          <BehaviorGradesForm
            courses={formattedCourses}
            selectedCourseId={selectedCourseId}
            selectedDate={selectedDate}
            students={students}
          />
        </div>
    </>
  );
}
