import Link from 'next/link';
import { Users, BookOpen, GraduationCap, UserCheck, BarChart3, Trophy, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  stats: {
    totalUsers: number;
    totalStudents: number;
    totalPrograms: number;
    totalCourses: number;
  };
}

export default function AdminDashboard({ stats }: AdminDashboardProps) {
  const adminCards = [
    { title: 'إجمالي المستخدمين', value: stats.totalUsers, icon: <Users className="w-8 h-8" />, link: '/users', color: 'from-blue-500 to-blue-600' },
    { title: 'الطالبات', value: stats.totalStudents, icon: <UserCheck className="w-8 h-8" />, link: '/students', color: 'from-purple-500 to-purple-600' },
    { title: 'البرامج', value: stats.totalPrograms, icon: <BookOpen className="w-8 h-8" />, link: '/programs', color: 'from-indigo-500 to-indigo-600' },
    { title: 'الحلقات', value: stats.totalCourses, icon: <GraduationCap className="w-8 h-8" />, link: '/programs', color: 'from-pink-500 to-pink-600' }
  ];

  const quickLinks = [
    { title: 'إدارة المستخدمين', href: '/users', icon: <Users size={20} />, description: 'إضافة وتعديل حسابات المستخدمين' },
    { title: 'إدارة البرامج', href: '/programs', icon: <BookOpen size={20} />, description: 'إنشاء وإدارة البرامج والحلقات' },
    { title: 'التقارير الأكاديمية', href: '/academic-reports', icon: <BarChart3 size={20} />, description: 'عرض التقارير والإحصائيات' },
    { title: 'النقاط التحفيزية', href: '/behavior-points-report', icon: <Trophy size={20} />, description: 'تقارير النقاط التحفيزية للطالبات' },
    { title: 'طلبات المعلمات', href: '/teacher-requests', icon: <GraduationCap size={20} />, description: 'مراجعة طلبات الانضمام' },
    { title: 'تقارير الحضور', href: '/attendance-report', icon: <TrendingUp size={20} />, description: 'تقارير الحضور الشاملة' }
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminCards.map((card, index) => (
          <Link key={index} href={card.link}>
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border-r-4 border-transparent hover:border-primary-purple">
              <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${card.color} text-white mb-4`}>
                {card.icon}
              </div>
              <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">الوصول السريع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-primary-purple hover:bg-purple-50 transition-all group"
            >
              <div className="p-2 rounded-lg bg-gradient-to-r from-primary-purple to-primary-blue text-white group-hover:scale-110 transition-transform">
                {link.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800 mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}