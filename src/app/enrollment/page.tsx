import { requireAuth } from '@/lib/auth-helpers';
import { getPrograms, getCoursesByProgram } from '@/lib/data/queries';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import { EnrollmentList } from './EnrollmentList';

export default async function EnrollmentPage() {
  const session = await requireAuth();
  const programs = await getPrograms();
  
  const firstProgramCourses = programs.length > 0 
    ? await getCoursesByProgram(programs[0].id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 lg:mr-72">
        <AppHeader title="طلب الانضمام للحلقات" />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <BackButton />
              <h1 className="text-2xl font-bold">الحلقات المتاحة</h1>
            </div>

            <EnrollmentList 
              programs={programs}
              initialCourses={firstProgramCourses}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export const revalidate = 1800;
