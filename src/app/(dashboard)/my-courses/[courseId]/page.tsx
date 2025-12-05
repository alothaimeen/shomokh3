import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

async function CourseDashboard({ courseId }: { courseId: string }) {
  const session = await auth();

  if (!session?.user || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
    notFound();
  }

  // التحقق من ملكية الحلقة للمعلمة
  const whereClause = session.user.role === 'TEACHER'
    ? { id: courseId, teacherId: session.user.id }
    : { id: courseId };

  const course = await db.course.findFirst({
    where: whereClause,
    select: {
      id: true,
      courseName: true,
      level: true,
      program: {
        select: { programName: true }
      }
    }
  });

  if (!course) {
    notFound();
  }

  const actionCards = [
    {
      href: `/attendance?courseId=${course.id}`,
      icon: '✅',
      title: 'الحضور والغياب',
      gradient: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
    },
    {
      href: `/daily-grades?courseId=${course.id}`,
      icon: '📊',
      title: 'التقييم اليومي',
      gradient: 'from-primary-purple to-primary-purple/80 hover:from-primary-purple/90 hover:to-primary-purple'
    },
    {
      href: `/daily-tasks?courseId=${course.id}`,
      icon: '📝',
      title: 'المهام اليومية',
      gradient: 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
    },
    {
      href: `/weekly-grades?courseId=${course.id}`,
      icon: '📅',
      title: 'التقييم الأسبوعي',
      gradient: 'from-primary-blue to-primary-blue/80 hover:from-primary-blue/90 hover:to-primary-blue'
    },
    {
      href: `/monthly-grades?courseId=${course.id}`,
      icon: '📆',
      title: 'التقييم الشهري',
      gradient: 'from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700'
    },
    {
      href: `/behavior-grades?courseId=${course.id}`,
      icon: '⭐',
      title: 'درجات السلوك',
      gradient: 'from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
    },
    {
      href: `/final-exam?courseId=${course.id}`,
      icon: '🎓',
      title: 'الاختبار النهائي',
      gradient: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700'
    },
    {
      href: `/enrolled-students?courseId=${course.id}`,
      icon: '👩‍🎓',
      title: 'الطالبات المسجلات',
      gradient: 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
    },
    {
      href: `/unified-assessment?courseId=${course.id}`,
      icon: '📋',
      title: 'التقييم الموحد',
      gradient: 'from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700'
    }
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {/* معلومات الحلقة */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{course.courseName}</h2>
        <p className="text-gray-600">
          {course.program.programName} - المستوى {course.level}
        </p>
      </div>

      {/* بطاقات الإجراءات */}
      <h3 className="text-xl font-bold text-gray-900 mb-6">إدارة الحلقة</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {actionCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`bg-gradient-to-r ${card.gradient} text-white px-6 py-4 rounded-lg transition-all flex items-center justify-center gap-3 hover:shadow-lg transform hover:scale-105`}
          >
            <span className="text-2xl">{card.icon}</span>
            <span className="font-semibold">{card.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CourseDashboardSkeleton() {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
      <div className="mb-8 text-center">
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}

export default async function MyCoursePage({ params }: PageProps) {
  const { courseId } = await params;

  return (
    <>
      <AppHeader title="لوحة تحكم الحلقة" />
      <div className="p-8">
        <BackButton />
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
          📚 لوحة تحكم الحلقة
        </h1>

        <Suspense fallback={<CourseDashboardSkeleton />}>
          <CourseDashboard courseId={courseId} />
        </Suspense>
      </div>
    </>
  );
}
