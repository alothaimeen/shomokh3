import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import RequestsManager from '@/components/teacher-requests/RequestsManager';

interface SearchParams {
  courseId?: string;
}

export default async function TeacherRequestsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth();

  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const courseId = params.courseId;

  const whereClause: any = {
    course: { teacherId: session.user.id }
  };

  if (courseId) {
    whereClause.courseId = courseId;
  }

  const requests = await db.enrollmentRequest.findMany({
    where: whereClause,
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
          paymentStatus: true
        }
      },
      course: {
        select: {
          id: true,
          courseName: true,
          program: {
            select: {
              programName: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const requestsData = requests.map(request => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
    course: {
      id: request.course.id,
      courseName: request.course.courseName,
      programName: request.course.program.programName
    }
  }));

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <>
      <AppHeader title="طلبات الانضمام" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            طلبات الانضمام للحلقات
          </h1>
          <p className="text-gray-600 mb-6">إدارة طلبات الطالبات للانضمام لحلقاتك</p>

          <RequestsManager 
            requests={requestsData} 
            pendingCount={pendingCount}
          />
        </div>
    </>
  );
}
