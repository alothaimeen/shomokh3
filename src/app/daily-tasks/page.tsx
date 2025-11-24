import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Sidebar from '@/components/shared/Sidebar';
import BackButton from '@/components/shared/BackButton';
import AppHeader from '@/components/shared/AppHeader';
import DailyTasksForm from '@/components/daily-tasks/DailyTasksForm';
import CourseSelector from '@/components/daily-tasks/CourseSelector';

interface DailyTask {
  date: Date;
  listening5Times: boolean;
  repetition10Times: boolean;
  recitedToPeer: boolean;
  notes?: string | null;
}

async function getStudentEnrollments(userId: string) {
  return await db.enrollment.findMany({
    where: {
      studentId: userId
    },
    include: {
      course: {
        include: {
          program: true,
          teacher: true
        }
      }
    }
  });
}

async function getDailyTask(courseId: string, date: string, studentId: string) {
  return await db.dailyTask.findFirst({
    where: {
      courseId,
      studentId,
      date: new Date(date)
    }
  });
}

export default async function DailyTasksPage({
  searchParams
}: {
  searchParams: Promise<{ courseId?: string; date?: string }>
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.role !== 'STUDENT') {
    redirect('/dashboard');
  }

  const enrollments = await getStudentEnrollments(session.user.id);

  if (enrollments.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:mr-72">
          <AppHeader title="مهامي اليومية" />
          <div className="p-8 max-w-4xl mx-auto">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 mb-4">لم تسجلي في أي حلقة بعد</p>
              <a
                href="/enrollment"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md inline-block"
              >
                📝 طلب الانضمام للحلقات
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedCourseId = params.courseId || enrollments[0].id;
  const selectedDate = params.date || new Date().toISOString().split('T')[0];

  const existingTask = await getDailyTask(selectedCourseId, selectedDate, session.user.id);

  const formattedEnrollments = enrollments.map(e => ({
    id: e.id,
    courseName: e.course.courseName,
    programName: e.course.program.programName,
    level: e.course.level,
    teacherName: e.course.teacher?.userName || 'غير محدد'
  }));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="مهامي اليومية" />
        <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            📋 مهامي اليومية
          </h1>

          <CourseSelector
            enrollments={formattedEnrollments}
            selectedCourseId={selectedCourseId}
            selectedDate={selectedDate}
          />

          <DailyTasksForm
            courseId={selectedCourseId}
            initialTask={existingTask ? {
              date: existingTask.date.toISOString().split('T')[0],
              listening5Times: existingTask.listening5Times,
              repetition10Times: existingTask.repetition10Times,
              recitedToPeer: existingTask.recitedToPeer,
              notes: existingTask.notes || ''
            } : null}
            initialDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
