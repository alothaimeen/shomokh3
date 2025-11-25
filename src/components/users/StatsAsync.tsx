import { db } from '@/lib/db';

export default async function StatsAsync() {
  const users = await db.user.findMany({
    select: {
      userRole: true
    }
  });

  const stats = {
    admins: users.filter(u => u.userRole === 'ADMIN').length,
    teachers: users.filter(u => u.userRole === 'TEACHER').length,
    students: users.filter(u => u.userRole === 'STUDENT').length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
        <div className="text-sm text-red-700">مدراء</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="text-2xl font-bold text-green-600">{stats.teachers}</div>
        <div className="text-sm text-green-700">معلمات</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="text-2xl font-bold text-purple-600">{stats.students}</div>
        <div className="text-sm text-purple-700">طالبات</div>
      </div>
    </div>
  );
}
