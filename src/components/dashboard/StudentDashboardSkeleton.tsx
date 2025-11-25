import { BookOpen, CalendarCheck, GraduationCap, ListChecks } from 'lucide-react';

export default function StudentDashboardSkeleton() {
    const quickLinks = [
        { title: 'الانضمام لحلقة', icon: <BookOpen size={20} />, description: 'تقديم طلب للانضمام لحلقة جديدة' },
        { title: 'حضوري', icon: <CalendarCheck size={20} />, description: 'عرض سجل الحضور والغياب' },
        { title: 'درجاتي', icon: <GraduationCap size={20} />, description: 'عرض جميع الدرجات والتقييمات' },
        { title: 'المهام اليومية', icon: <ListChecks size={20} />, description: 'عرض المهام والواجبات' }
    ];

    return (
        <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">حلقاتي</h2>
                {/* Skeleton for enrollments grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="p-5 rounded-lg border-2 border-gray-100 bg-gray-50"
                        >
                            <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-3"></div>
                            <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
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
