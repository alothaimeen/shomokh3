import Link from 'next/link';
import { Users, BookOpen, GraduationCap, UserCheck, BarChart3 } from 'lucide-react';

export default function AdminDashboardSkeleton() {
    const adminCards = [
        { title: 'إجمالي المستخدمين', icon: <Users className="w-8 h-8" />, color: 'from-blue-500 to-blue-600' },
        { title: 'الطالبات', icon: <UserCheck className="w-8 h-8" />, color: 'from-purple-500 to-purple-600' },
        { title: 'البرامج', icon: <BookOpen className="w-8 h-8" />, color: 'from-indigo-500 to-indigo-600' },
        { title: 'الحلقات', icon: <GraduationCap className="w-8 h-8" />, color: 'from-pink-500 to-pink-600' }
    ];

    const quickLinks = [
        { title: 'إدارة المستخدمين', href: '/users', icon: <Users size={20} />, description: 'إضافة وتعديل حسابات المستخدمين' },
        { title: 'إدارة البرامج', href: '/programs', icon: <BookOpen size={20} />, description: 'إنشاء وإدارة البرامج والحلقات' },
        { title: 'التقارير الأكاديمية', href: '/academic-reports', icon: <BarChart3 size={20} />, description: 'عرض التقارير والإحصائيات' },
        { title: 'طلبات المعلمات', href: '/teacher-requests', icon: <GraduationCap size={20} />, description: 'مراجعة طلبات الانضمام' }
    ];

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {adminCards.map((card, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6 border-r-4 border-transparent">
                        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${card.color} text-white mb-4`}>
                            {card.icon}
                        </div>
                        <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
                        {/* Pulse animation for the value */}
                        <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">الوصول السريع</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickLinks.map((link, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200"
                        >
                            <div className="p-2 rounded-lg bg-gradient-to-r from-primary-purple to-primary-blue text-white">
                                {link.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800 mb-1">{link.title}</h3>
                                <p className="text-sm text-gray-600">{link.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
