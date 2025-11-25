import { db } from '@/lib/db';

interface Props {
  searchTerm?: string;
  paymentFilter?: string;
}

export default async function StatsCardsAsync({ searchTerm = '', paymentFilter = 'ALL' }: Props) {
  // Build where clause
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

  // جلب البيانات
  const students = await db.student.findMany({
    where: whereClause,
    select: {
      isActive: true,
      paymentStatus: true
    }
  });
  
  // حساب الإحصائيات
  const stats = {
    total: students.length,
    active: students.filter(s => s.isActive).length,
    paid: students.filter(s => s.paymentStatus === 'PAID').length,
    unpaid: students.filter(s => s.paymentStatus === 'UNPAID').length,
    partial: students.filter(s => s.paymentStatus === 'PARTIAL').length
  };
  
  return (
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
  );
}
