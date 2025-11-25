import { CalendarCheck, Users, ClipboardCheck, FileText, GraduationCap, Award } from 'lucide-react';

export default function TeacherDashboardSkeleton() {
    const quickLinks = [
        { title: 'تسجيل الحضور', icon: <CalendarCheck size={20} />, description: 'تسجيل حضور وغياب الطالبات' },
        { title: 'واجهة الدرجات الموحدة', icon: <GraduationCap size={20} />, description: 'تسجيل جميع أنواع الدرجات' },
        { title: 'الدرجات اليومية', icon: <ClipboardCheck size={20} />, description: 'تسجيل درجات الحفظ والمراجعة' },
        { title: 'الدرجات الأسبوعية', icon: <FileText size={20} />, description: 'تسجيل درجات الأسابيع' },
        { title: 'نقاط السلوك', icon: <Award size={20} />, description: 'تسجيل النقاط السلوكية اليومية' },
        { title: 'الطالبات المسجلات', icon: <Users size={20} />, description: 'عرض قائمة الطالبات' }
    ];

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">حلقاتي</h2>
                {/* Skeleton for courses grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="p-5 rounded-lg border-2 border-gray-100 bg-gray-50"
                        >
                            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">الوصول السريع</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                                <p className="text-xs text-gray-600">{link.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
