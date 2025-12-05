import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import CoursesContent from './CoursesContent';

interface PageProps {
  params: Promise<{ programId: string }>;
}

function CoursesSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function CoursesPage({ params }: PageProps) {
  const session = await auth();
  const { programId } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <>
      <AppHeader title="إدارة الحلقات" />
      <div className="p-8">
        <BackButton />
        
        <Suspense fallback={<CoursesSkeleton />}>
          <CoursesContent 
            programId={programId} 
            userRole={session.user.role} 
          />
        </Suspense>

        {/* رابط العودة */}
        <div className="mt-6 text-center">
          <Link
            href="/programs"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← العودة للبرامج
          </Link>
        </div>
      </div>
    </>
  );
}