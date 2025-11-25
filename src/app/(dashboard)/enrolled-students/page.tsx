import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import EnrolledStudentsManager from '@/components/enrolled-students/EnrolledStudentsManager';

interface SearchParams {
  courseId?: string;
}

export default async function EnrolledStudentsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth();

  if (!session?.user || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  let selectedCourseId = params.courseId;

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

  // اختيار أول حلقة إذا لم يتم التحديد
  if (!selectedCourseId && courses.length > 0) {
    selectedCourseId = courses[0].id;
  }

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
            studentNumber: true,
            studentName: true,
            studentPhone: true,
            qualification: true,
            nationality: true,
            memorizedAmount: true,
            paymentStatus: true,
            memorizationPlan: true
          }
        },
        course: {
          select: {
            id: true,
            courseName: true,
            level: true,
            maxStudents: true,
            program: { select: { programName: true } },
            teacher: { select: { userName: true } }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });
  }

  const enrollmentsData = enrollments.map(e => ({
    id: e.id,
    enrolledAt: e.enrolledAt.toISOString(),
    student: e.student,
    course: {
      ...e.course,
      programName: e.course.program.programName,
      teacherName: e.course.teacher.userName
    }
  }));

  return (
    <>
      <AppHeader title="الطلاب المسجلين" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            الطلاب المسجلين
          </h1>
          <p className="text-gray-600 mb-6">عرض وإدارة الطلاب المسجلين في الحلقات</p>

          <EnrolledStudentsManager 
            courses={coursesData}
            enrollments={enrollmentsData}
            selectedCourseId={selectedCourseId || ''}
          />
        </div>
    </>
  );
}
