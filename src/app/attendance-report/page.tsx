import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import AttendanceReportViewer from '@/components/attendance-report/AttendanceReportViewer';

export default async function AttendanceReportPage() {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  // جلب الحلقات
  const whereClause: any = session.user.role === 'TEACHER' 
    ? { teacherId: session.user.id }
    : {};

  const courses = await db.course.findMany({
    where: whereClause,
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
    orderBy: { courseName: 'asc' }
  });

  const coursesData = courses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    level: c.level,
    program: c.program,
    teacher: c.teacher,
    enrollmentsCount: c._count.enrollments
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="تقرير الحضور" />
        <div className="p-8">
          <BackButton />
          <AttendanceReportViewer courses={coursesData} />
        </div>
      </div>
    </div>
  );
}
