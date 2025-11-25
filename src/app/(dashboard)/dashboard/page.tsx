import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import AppHeader from '@/components/shared/AppHeader';
import HijriDateDisplay from '@/components/shared/HijriDateDisplay';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

async function getAdminStats() {
  const [totalUsers, totalStudents, totalPrograms, totalCourses] = await Promise.all([
    db.user.count(),
    db.student.count(),
    db.program.count(),
    db.course.count()
  ]);
  
  return { totalUsers, totalStudents, totalPrograms, totalCourses };
}

async function getTeacherData(teacherId: string) {
  const courses = await db.course.findMany({
    where: { teacherId },
    select: {
      id: true,
      courseName: true,
      program: { select: { programName: true } },
      _count: { select: { enrollments: true } }
    }
  });
  
  return courses.map(c => ({
    id: c.id,
    courseName: c.courseName,
    programName: c.program.programName,
    level: 1,
    studentsCount: c._count.enrollments
  }));
}

async function getStudentData(userId: string) {
  const student = await db.student.findUnique({
    where: { userId },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              program: { select: { programName: true } },
              teacher: { select: { userName: true } }
            }
          }
        }
      }
    }
  });
  
  if (!student) return [];
  
  return student.enrollments.map(e => ({
    id: e.id,
    courseName: e.course.courseName,
    programName: e.course.program.programName,
    level: 1,
    teacherName: e.course.teacher?.userName || 'غير محدد'
  }));
}

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  const role = session.user.role;
  
  let adminStats = null;
  let teacherCourses = null;
  let studentEnrollments = null;
  
  if (role === 'ADMIN') {
    adminStats = await getAdminStats();
  } else if (role === 'TEACHER') {
    teacherCourses = await getTeacherData(session.user.id);
  } else if (role === 'STUDENT') {
    studentEnrollments = await getStudentData(session.user.id);
  }
  
  return (
    <>
      <AppHeader title="لوحة التحكم" />
      <div className="p-8">
          <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
                مرحباً، {session.user.name}
              </h1>
              <p className="text-gray-600 text-lg">
                {role === 'ADMIN' && 'مديرة المنصة'}
                {role === 'TEACHER' && 'معلمة'}
                {role === 'STUDENT' && 'طالبة'}
              </p>
            </div>
            <HijriDateDisplay />
          </div>
          
          {role === 'ADMIN' && adminStats && <AdminDashboard stats={adminStats} />}
          {role === 'TEACHER' && teacherCourses && <TeacherDashboard courses={teacherCourses} />}
          {role === 'STUDENT' && studentEnrollments && <StudentDashboard enrollments={studentEnrollments} />}
        </div>
    </>
  );
}
