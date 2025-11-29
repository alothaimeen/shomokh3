import Link from 'next/link';
import { BookOpen, CalendarCheck, GraduationCap, ListChecks } from 'lucide-react';
import StudentCharts from './StudentCharts';

interface StudentEnrollment {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  teacherName: string;
}

interface StudentDashboardProps {
  enrollments: StudentEnrollment[];
}

export default function StudentDashboard({ enrollments }: StudentDashboardProps) {
  const quickLinks = [
    { title: 'الانضمام لحلقة', href: '/enrollment', icon: <BookOpen size={20} />, description: 'تقديم طلب للانضمام لحلقة جديدة' },
    { title: 'حضوري', href: '/my-attendance', icon: <CalendarCheck size={20} />, description: 'عرض سجل الحضور والغياب' },
    { title: 'درجاتي', href: '/my-grades', icon: <GraduationCap size={20} />, description: 'عرض جميع الدرجات والتقييمات' },
    { title: 'المهام اليومية', href: '/daily-tasks', icon: <ListChecks size={20} />, description: 'عرض المهام والواجبات' }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">حلقاتي</h2>
        {enrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="p-5 rounded-lg border-2 border-gray-200 bg-gradient-to-br from-purple-50 to-blue-50"
              >
                <h3 className="font-bold text-lg text-gray-800 mb-2">{enrollment.courseName}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {enrollment.programName} - المستوى {enrollment.level}
                </p>
                <p className="text-sm text-primary-purple font-semibold">
                  المعلمة: {enrollment.teacherName}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">لم تنضمي لأي حلقة بعد</p>
            <Link
              href="/enrollment"
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              انضمي لحلقة الآن
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">الوصول السريع</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* قسم الرسوم البيانية - يظهر فقط إذا كانت الطالبة مسجلة في حلقة */}
      {enrollments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">تقدمك الدراسي</h2>
          <StudentCharts />
        </div>
      )}
    </>
  );
}
