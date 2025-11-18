'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Users,
  BookOpen,
  FileText,
  Settings,
  ChevronRight,
  ClipboardList,
  Award,
  ListChecks,
  Star,
  BarChart3,
  ClipboardCheck,
  X
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: ('ADMIN' | 'TEACHER' | 'STUDENT')[];
}

const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'لوحة التحكم',
    icon: <LayoutDashboard size={20} />,
    roles: ['ADMIN', 'TEACHER', 'STUDENT']
  },
  // المديرة
  {
    href: '/programs',
    label: 'البرامج',
    icon: <BookOpen size={20} />,
    roles: ['ADMIN']
  },
  {
    href: '/users',
    label: 'المستخدمين',
    icon: <Users size={20} />,
    roles: ['ADMIN']
  },
  {
    href: '/students',
    label: 'الطالبات',
    icon: <Users size={20} />,
    roles: ['ADMIN']
  },
  {
    href: '/teacher-requests',
    label: 'طلبات المعلمات',
    icon: <ClipboardList size={20} />,
    roles: ['ADMIN']
  },
  {
    href: '/academic-reports',
    label: 'التقارير الأكاديمية',
    icon: <BarChart3 size={20} />,
    roles: ['ADMIN']
  },
  // المعلمة
  {
    href: '/attendance',
    label: 'الحضور',
    icon: <CalendarCheck size={20} />,
    roles: ['TEACHER']
  },
  {
    href: '/daily-grades',
    label: 'الدرجات اليومية',
    icon: <ClipboardCheck size={20} />,
    roles: ['TEACHER']
  },
  {
    href: '/weekly-grades',
    label: 'الدرجات الأسبوعية',
    icon: <FileText size={20} />,
    roles: ['TEACHER']
  },
  {
    href: '/monthly-grades',
    label: 'الدرجات الشهرية',
    icon: <GraduationCap size={20} />,
    roles: ['TEACHER']
  },
  {
    href: '/behavior-grades',
    label: 'درجات السلوك',
    icon: <Star size={20} />,
    roles: ['TEACHER']
  },
  {
    href: '/behavior-points',
    label: 'النقاط السلوكية',
    icon: <Award size={20} />,
    roles: ['TEACHER']
  },
  {
    href: '/final-exam',
    label: 'الاختبار النهائي',
    icon: <FileText size={20} />,
    roles: ['TEACHER']
  },
  {
    href: '/enrolled-students',
    label: 'الطالبات المسجلات',
    icon: <Users size={20} />,
    roles: ['TEACHER']
  },
  // الطالبة
  {
    href: '/enrollment',
    label: 'الانضمام لحلقة',
    icon: <BookOpen size={20} />,
    roles: ['STUDENT']
  },
  {
    href: '/my-attendance',
    label: 'حضوري',
    icon: <CalendarCheck size={20} />,
    roles: ['STUDENT']
  },
  {
    href: '/my-grades',
    label: 'درجاتي',
    icon: <GraduationCap size={20} />,
    roles: ['STUDENT']
  },
  {
    href: '/daily-tasks',
    label: 'المهام اليومية',
    icon: <ListChecks size={20} />,
    roles: ['STUDENT']
  },
  // مشترك
  {
    href: '/settings',
    label: 'الإعدادات',
    icon: <Settings size={20} />,
    roles: ['ADMIN', 'TEACHER', 'STUDENT']
  }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userRole = session?.user?.role as 'ADMIN' | 'TEACHER' | 'STUDENT';
  
  const filteredNavItems = navItems.filter(
    item => !item.roles || item.roles.includes(userRole)
  );

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full bg-white shadow-lg z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-xl">
                ش
              </div>
              <span className="font-bold text-lg">شموخ</span>
            </div>
          )}
          
          {/* Close button (mobile) */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>

          {/* Collapse button (desktop) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight
              size={20}
              className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200
                    ${isActive(item.href)
                      ? 'bg-gradient-to-r from-primary-purple to-primary-blue text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={isActive(item.href) ? 'text-white' : 'text-gray-600'}>
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        {!isCollapsed && session?.user && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold">
                {session.user.name?.charAt(0) || 'م'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {userRole === 'ADMIN' && 'مديرة'}
                  {userRole === 'TEACHER' && 'معلمة'}
                  {userRole === 'STUDENT' && 'طالبة'}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-br from-primary-purple to-primary-blue text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <LayoutDashboard size={24} />
      </button>
    </>
  );
}
