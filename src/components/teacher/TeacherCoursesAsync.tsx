import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import TeacherCourseContent from './TeacherCourseContent';

export default async function TeacherCoursesAsync() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'TEACHER') {
    redirect('/dashboard');
  }

  // جلب حلقات المعلمة من قاعدة البيانات
  const courses = await db.course.findMany({
    where: {
      teacherId: session.user.id
    },
    include: {
      program: {
        select: {
          id: true,
          programName: true
        }
      },
      teacher: {
        select: {
          id: true,
          userName: true
        }
      },
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

  // تحويل البيانات للصيغة المطلوبة
  const formattedCourses = courses.map(course => ({
    id: course.id,
    courseName: course.courseName,
    level: course.level,
    program: {
      id: course.program.id,
      programName: course.program.programName
    },
    teacher: course.teacher ? {
      id: course.teacher.id,
      userName: course.teacher.userName
    } : undefined,
    _count: {
      enrollments: course._count.enrollments
    }
  }));

  return <TeacherCourseContent courses={formattedCourses} />;
}
