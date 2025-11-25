import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import Link from 'next/link';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import StudentsTable from '@/components/students/StudentsTable';

interface SearchParams {
  search?: string;
  payment?: string;
}

export default async function StudentsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const session = await auth();

  console.log('🔍 Students Page - Session:', {
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    userName: session?.user?.name
  });

  if (!session?.user || session.user.role !== 'ADMIN') {
    console.log('❌ Students Page - Access Denied, redirecting to dashboard');
    redirect('/dashboard');
  }

  const params = await searchParams;
  const searchTerm = params.search || '';
  const paymentFilter = params.payment || 'ALL';

  // جلب الطالبات مع البحث والفلترة
  const whereClause: any = {};
  
  if (searchTerm) {
    whereClause.OR = [
      { studentName: { contains: searchTerm, mode: 'insensitive' } },
      { studentPhone: { contains: searchTerm } },
      { nationality: { contains: searchTerm, mode: 'insensitive' } }
    ];
  }

  if (paymentFilter !== 'ALL') {
    whereClause.paymentStatus = paymentFilter;
  }

  const students = await db.student.findMany({
    where: whereClause,
    orderBy: { studentNumber: 'asc' },
    select: {
      id: true,
      studentNumber: true,
      studentName: true,
      qualification: true,
      nationality: true,
      studentPhone: true,
      memorizedAmount: true,
      paymentStatus: true,
      memorizationPlan: true,
      notes: true,
      isActive: true,
      createdAt: true
    }
  });

  const studentsData = students.map(student => ({
    ...student,
    createdAt: student.createdAt.toISOString()
  }));

  const stats = {
    total: students.length,
    active: students.filter(s => s.isActive).length,
    paid: students.filter(s => s.paymentStatus === 'PAID').length,
    unpaid: students.filter(s => s.paymentStatus === 'UNPAID').length,
    partial: students.filter(s => s.paymentStatus === 'PARTIAL').length
  };

  return (
    <>
      <AppHeader title="إدارة الطالبات" />
        <div className="p-8">
          <BackButton />
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">
              إدارة الطالبات
            </h1>
            <p className="text-gray-600">عرض وإدارة جميع الطالبات المسجلات</p>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">إجمالي الطالبات</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-green-700">نشطة</div>
            </div>
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <div className="text-2xl font-bold text-emerald-600">{stats.paid}</div>
              <div className="text-sm text-emerald-700">مدفوعة</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
              <div className="text-sm text-yellow-700">جزئية</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{stats.unpaid}</div>
              <div className="text-sm text-red-700">غير مدفوعة</div>
            </div>
          </div>

          {/* جدول الطالبات */}
          <StudentsTable 
            students={studentsData} 
            currentSearch={searchTerm}
            currentFilter={paymentFilter}
          />

          {/* روابط العودة */}
          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
    </>
  );
}
