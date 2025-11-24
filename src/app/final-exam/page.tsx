import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import FinalExamForm from '@/components/final-exam/FinalExamForm';

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

async function getCourseStudentsWithGrades(courseId: string) {
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
  
  const finalExams = await db.finalExam.findMany({
    where: {
      courseId,
      studentId: { in: studentIds }
    }
  });

  const examsByStudent = new Map(finalExams.map(e => [e.studentId, e]));

  return enrollments.map(e => ({
    id: e.studentId,
    studentName: e.student.studentName,
    studentNumber: e.student.studentNumber,
    studentPhone: e.student.studentPhone,
    finalExam: examsByStudent.get(e.studentId) ? {
      quranTest: Number(examsByStudent.get(e.studentId)!.quranTest),
      tajweedTest: Number(examsByStudent.get(e.studentId)!.tajweedTest),
      notes: examsByStudent.get(e.studentId)!.notes
    } : null
  }));
}

export default async function FinalExamPage({
  searchParams
}: {
  searchParams: Promise<{ courseId?: string }>
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
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:mr-72">
          <AppHeader title="الاختبار النهائي" />
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
        </div>
      </div>
    );
  }

  const selectedCourseId = params.courseId || courses[0].id;
  const students = await getCourseStudentsWithGrades(selectedCourseId);

  const formattedCourses = courses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    programName: c.program.programName,
    level: c.level,
    studentsCount: c._count.enrollments
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="الاختبار النهائي" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            📝 الاختبار النهائي
          </h1>

          <FinalExamForm
            courses={formattedCourses}
            selectedCourseId={selectedCourseId}
            students={students}
          />
        </div>
      </div>
    </div>
  );
}
