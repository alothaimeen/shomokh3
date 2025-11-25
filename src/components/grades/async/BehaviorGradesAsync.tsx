import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import BehaviorGradesForm from '@/components/behavior-grades/BehaviorGradesForm';

async function getTeacherCourses(teacherId: string) {
  const courses = await db.course.findMany({
    where: { teacherId },
    include: {
      program: {
        select: {
          programName: true
        }
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

async function getCourseStudentsWithGrades(courseId: string, date: string) {
  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: { student: true },
    orderBy: {
      student: { studentNumber: 'asc' }
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

  const gradesMap = new Map(
    behaviorGrades.map(g => [g.studentId, g])
  );

  return enrollments.map(e => ({
    student: e.student,
    currentGrade: gradesMap.get(e.studentId) || null
  }));
}

interface Props {
  courseId: string;
  date: string;
}

export default async function BehaviorGradesAsync({ courseId, date }: Props) {
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
    const studentsData = await getCourseStudentsWithGrades(selectedCourseId, date);
    students = studentsData.map(sd => ({
      id: sd.student.id,
      studentName: sd.student.studentName,
      studentNumber: sd.student.studentNumber,
      studentPhone: sd.student.studentPhone,
      behaviorGrade: sd.currentGrade ? {
        dailyScore: sd.currentGrade.dailyScore,
        notes: sd.currentGrade.notes
      } : null
    }));
  }

  return (
    <BehaviorGradesForm
      courses={courses}
      students={students}
      selectedCourseId={selectedCourseId}
      selectedDate={date}
    />
  );
}
