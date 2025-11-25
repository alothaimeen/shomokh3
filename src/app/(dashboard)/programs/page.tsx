import { requireAuth } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import Link from "next/link";
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import { ProgramsList } from './ProgramsList';

export default async function ProgramsPage() {
  const session = await requireAuth();

  const programs = await db.program.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { courses: true } }
    },
    orderBy: { programName: 'asc' }
  });

  const userRole = session.user?.role;
  const canManagePrograms = userRole === 'ADMIN';

  return (
    <>
      <AppHeader title="البرامج" />
      <div className="p-8">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
            إدارة البرامج التعليمية
          </h1>

          <ProgramsList 
            initialPrograms={programs} 
            canManagePrograms={canManagePrograms}
          />
      </div>
    </>
  );
}

export const revalidate = 3600;
