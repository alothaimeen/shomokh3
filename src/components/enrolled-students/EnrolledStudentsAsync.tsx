import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import EnrolledStudentsManager from '@/components/enrolled-students/EnrolledStudentsManager';

interface Props {
  courseId: string;
}

export default async function EnrolledStudentsAsync({ courseId }: Props) {
  const session = await auth();

  if (!session?.user || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  // جلب حلقات المعلم
  const whereClause: any = session.user.role === 'TEACHER' 
    ? { teacherId: session.user.id }
    : {};

  const courses = await db.course.findMany({
    where: whereClause,
    include: {
      program: { select: { programName: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { courseName: 'asc' }
  });

  const selectedCourseId = courseId || courses[0]?.id || '';

  const coursesData = courses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    level: c.level,
    maxStudents: c.maxStudents,
    programName: c.program.programName,
    enrollmentsCount: c._count.enrollments
  }));

  // جلب الطلاب المسجلين
  let enrollments: any[] = [];
  if (selectedCourseId) {
    enrollments = await db.enrollment.findMany({
      where: { courseId: selectedCourseId },
      include: {
        student: {
          select: {
            id: true,
            studentName: true,
            studentNumber: true,
            studentPhone: true,
            user: {
              select: {
                userEmail: true
              }
            }
          }
        }
      },
      orderBy: {
        student: { studentNumber: 'asc' }
      }
    });
  }

  return (
    <EnrolledStudentsManager
      courses={coursesData}
      selectedCourseId={selectedCourseId}
      enrollments={enrollments}
    />
  );
}
