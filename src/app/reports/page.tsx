import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import ReportsViewer from '@/components/reports/ReportsViewer';

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <ReportsViewer />;
}