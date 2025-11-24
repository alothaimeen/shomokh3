import Link from 'next/link';
import { CalendarCheck, Users, ClipboardCheck, FileText, GraduationCap, Star, Award } from 'lucide-react';

interface TeacherCourse {
  id: string;
  courseName: string;
  programName: string;
  level: number;
  studentsCount: number;
}

interface TeacherDashboardProps {
  courses: TeacherCourse[];
}

export default function TeacherDashboard({ courses }: TeacherDashboardProps) {
  const quickLinks = [
    { title: 'تسجيل الحضور', href: '/attendance', icon: <CalendarCheck size={20} />, description: 'تسجيل حضور وغياب الطالبات' },
    { title: 'واجهة الدرجات الموحدة', href: '/unified-assessment', icon: <GraduationCap size={20} />, description: 'تسجيل جميع أنواع الدرجات' },
    { title: 'الدرجات اليومية', href: '/daily-grades', icon: <ClipboardCheck size={20} />, description: 'تسجيل درجات الحفظ والمراجعة' },
    { title: 'الدرجات الأسبوعية', href: '/weekly-grades', icon: <FileText size={20} />, description: 'تسجيل درجات الأسابيع' },
    { title: 'نقاط السلوك', href: '/behavior-points', icon: <Award size={20} />, description: 'تسجيل النقاط السلوكية اليومية' },
    { title: 'الطالبات المسجلات', href: '/enrolled-students', icon: <Users size={20} />, description: 'عرض قائمة الطالبات' }
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">حلقاتي</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/enrolled-students?courseId=${course.id}`}
                className="p-5 rounded-lg border-2 border-gray-200 hover:border-primary-purple hover:bg-purple-50 transition-all"
              >
                <h3 className="font-bold text-lg text-gray-800 mb-2">{course.courseName}</h3>
                <p className="text-sm text-gray-600 mb-1">{course.programName} - المستوى {course.level}</p>
                <p className="text-sm text-primary-purple font-semibold">
                  {course.studentsCount} طالبة
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>لا توجد حلقات مسندة لك حالياً</p>
          </div>
        )}
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
                <p className="text-xs text-gray-600">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
