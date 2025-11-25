import { db } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

async function getAdminStats() {
  const [totalUsers, totalStudents, totalPrograms, totalCourses] = await Promise.all([
    db.user.count(),
    db.student.count(),
    db.program.count(),
    db.course.count()
  ]);
  
  return { totalUsers, totalStudents, totalPrograms, totalCourses };
}

export default async function AdminStatsAsync() {
  // محاكاة تأخير بسيط لرؤية تأثير Streaming (اختياري، يمكن حذفه)
  // await new Promise(resolve => setTimeout(resolve, 1000));

  const stats = await getAdminStats();
  return <AdminDashboard stats={stats} />;
}
