import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import FinalExamForm from '@/components/final-exam/FinalExamForm';

async function getTeacherCourses(teacherId: string) {
  const courses = await db.course.findMany({
    where: { teacherId },
    include: {
      program: {
        select: { programName: true }
      },
      _count: {
        select: { enrollments: true }
      }
    },
    orderBy: { courseName: 'asc' }
  });

  return courses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    programName: c.program.programName,
    level: c.level,
    studentsCount: c._count.enrollments
  }));
}

async function getCourseStudentsWithGrades(courseId: string) {
  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: { student: true },
    orderBy: {
      student: { studentNumber: 'asc' }
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

interface Props {
  courseId: string;
}

export default async function FinalExamAsync({ courseId }: Props) {
  const session = await auth();
  
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const teacherId = session.user.role === 'TEACHER' ? session.user.id : undefined;
  if (!teacherId) {
    redirect('/dashboard');
  }

  const courses = await getTeacherCourses(teacherId);
  const selectedCourseId = courseId || courses[0]?.id || '';

  let students: any[] = [];

  if (selectedCourseId) {
    students = await getCourseStudentsWithGrades(selectedCourseId);
  }

  return (
    <FinalExamForm
      courses={courses}
      students={students}
      selectedCourseId={selectedCourseId}
    />
  );
}
