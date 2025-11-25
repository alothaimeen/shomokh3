import { db } from '@/lib/db';
import RequestsManager from '@/components/teacher-requests/RequestsManager';

interface RequestsDataAsyncProps {
  userId: string;
  courseId?: string;
}

export default async function RequestsDataAsync({ userId, courseId }: RequestsDataAsyncProps) {
  const whereClause: any = {
    course: { teacherId: userId }
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">طلبات الانضمام</h2>
            <p className="text-sm text-gray-600 mt-1">
              إجمالي الطلبات: {requests.length}
            </p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
            <span className="font-bold">{requests.filter(r => r.status === 'PENDING').length}</span> قيد الانتظار
          </div>
        </div>
      </div>

      <RequestsManager requests={requestsData} pendingCount={requests.filter(r => r.status === 'PENDING').length} />
    </>
  );
}
