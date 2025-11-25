import { db } from '@/lib/db';
import StudentsTable from './StudentsTable';

interface Props {
  searchTerm?: string;
  paymentFilter?: string;
}

export default async function StudentsTableAsync({ searchTerm = '', paymentFilter = 'ALL' }: Props) {
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
  
  return (
    <StudentsTable 
      students={studentsData}
      currentSearch={searchTerm}
      currentFilter={paymentFilter}
    />
  );
}
