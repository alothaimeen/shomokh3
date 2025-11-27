import { db } from '@/lib/db';
import DetailedReports from './DetailedReports';

interface Props {
  userId: string;
  userRole: string;
}

async function getCourses(userId: string, userRole: string) {
  if (userRole === 'TEACHER') {
    const teacherCourses = await db.course.findMany({
      where: { teacherId: userId },
      include: {
        program: { select: { programName: true } }
      },
      orderBy: { courseName: 'asc' }
    });
    
    return teacherCourses.map(c => ({
      id: c.id,
      courseName: c.courseName,
      programName: c.program.programName,
      teacherName: undefined
    }));
  }
  
  // ADMIN يرى جميع الحلقات
  const adminCourses = await db.course.findMany({
    include: {
      program: { select: { programName: true } },
      teacher: { select: { userName: true } }
    },
    orderBy: { courseName: 'asc' }
  });
  
  return adminCourses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    programName: c.program.programName,
    teacherName: c.teacher?.userName
  }));
}

export default async function DetailedReportsAsync({ userId, userRole }: Props) {
  const coursesData = await getCourses(userId, userRole);
  return <DetailedReports courses={coursesData} />;
}
