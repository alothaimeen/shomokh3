'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  ChevronDown,
  ClipboardList,
  Award,
  ListChecks,
  Star,
  BarChart3,
  ClipboardCheck,
  X,
  Menu,
  Loader2,
  Trophy,
  Globe
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: ('ADMIN' | 'TEACHER' | 'STUDENT')[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
  { href: '/programs', label: 'البرامج', icon: <BookOpen size={20} />, roles: ['ADMIN'] },
  { href: '/users', label: 'المستخدمين', icon: <Users size={20} />, roles: ['ADMIN'] },
  { href: '/students', label: 'الطالبات', icon: <Users size={20} />, roles: ['ADMIN'] },
  { href: '/teacher-requests', label: 'طلبات المعلمات', icon: <ClipboardList size={20} />, roles: ['ADMIN'] },
  {
    href: '#reports',
    label: '📈 التقارير',
    icon: <BarChart3 size={20} />,
    roles: ['ADMIN', 'TEACHER'],
    children: [
      { href: '/academic-reports', label: 'التقارير الأكاديمية', icon: <GraduationCap size={18} />, roles: ['ADMIN', 'TEACHER'] },
      { href: '/attendance-report', label: 'تقارير الحضور', icon: <ClipboardList size={18} />, roles: ['ADMIN', 'TEACHER'] },
      { href: '/behavior-points-report', label: 'النقاط التحفيزية', icon: <Trophy size={18} />, roles: ['ADMIN', 'TEACHER'] }
    ]
  },
  { href: '/attendance', label: 'الحضور', icon: <CalendarCheck size={20} />, roles: ['TEACHER'] },
  { href: '/unified-assessment', label: 'واجهة الدرجات الموحدة', icon: <GraduationCap size={20} />, roles: ['TEACHER'] },
  { href: '/daily-grades', label: 'الدرجات اليومية', icon: <ClipboardCheck size={20} />, roles: ['TEACHER'] },
  { href: '/weekly-grades', label: 'الدرجات الأسبوعية', icon: <FileText size={20} />, roles: ['TEACHER'] },
  { href: '/monthly-grades', label: 'الدرجات الشهرية', icon: <GraduationCap size={20} />, roles: ['TEACHER'] },
  { href: '/behavior-grades', label: 'درجات السلوك', icon: <Star size={20} />, roles: ['TEACHER'] },
  { href: '/behavior-points', label: 'النقاط السلوكية', icon: <Award size={20} />, roles: ['TEACHER'] },
  { href: '/final-exam', label: 'الاختبار النهائي', icon: <FileText size={20} />, roles: ['TEACHER'] },
  { href: '/enrolled-students', label: 'الطالبات المسجلات', icon: <Users size={20} />, roles: ['TEACHER'] },
  { href: '/enrollment', label: 'الانضمام لحلقة', icon: <BookOpen size={20} />, roles: ['STUDENT'] },
  { href: '/my-attendance', label: 'حضوري', icon: <CalendarCheck size={20} />, roles: ['STUDENT'] },
  { href: '/my-grades', label: 'درجاتي', icon: <GraduationCap size={20} />, roles: ['STUDENT'] },
  { href: '/daily-tasks', label: 'المهام اليومية', icon: <ListChecks size={20} />, roles: ['STUDENT'] },
  {
    href: '#settings',
    label: 'الإعدادات',
    icon: <Settings size={20} />,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    children: [
      { href: '/settings', label: 'التفضيلات', icon: <Settings size={18} />, roles: ['ADMIN', 'TEACHER', 'STUDENT'] },
      { href: '/site-settings', label: 'بيانات الجمعية', icon: <Globe size={18} />, roles: ['ADMIN'] }
    ]
  }
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['#reports']));
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const userRole = session?.user?.role as 'ADMIN' | 'TEACHER' | 'STUDENT';
  const filteredNavItems = navItems.filter(item => !item.roles || item.roles.includes(userRole));
  const isActive = (href: string) => pathname === href;
  const isPendingPath = (href: string) => pendingPath === href && isPending;
  const isMenuActive = (item: NavItem) => item.children ? item.children.some(child => pathname === child.href) : pathname === item.href;

  const toggleMenu = (href: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) newSet.delete(href);
      else newSet.add(href);
      return newSet;
    });
  };

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) { toggleMenu(href); return; }
    if (pathname === href) return;
    setPendingPath(href);
    setIsMobileOpen(false);
    startTransition(() => { router.push(href); });
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const active = isActive(item.href);
    const pending = isPendingPath(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.has(item.href);
    const menuActive = isMenuActive(item);

    const baseClasses = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200";
    const activeClasses = active || pending ? "bg-gradient-to-r from-primary-purple to-primary-blue text-white shadow-md" : "";
    const hoverClasses = !active && !pending ? "hover:bg-gray-100" : "";
    const childClasses = isChild ? "mr-6 text-sm" : "";
    const menuActiveClasses = menuActive && hasChildren && !active ? "bg-blue-50 text-blue-700" : "";
    const btnClasses = [baseClasses, activeClasses, hoverClasses, childClasses, menuActiveClasses].filter(Boolean).join(" ");

    return (
      <li key={item.href}>
        <button onClick={() => handleNavigation(item.href)} disabled={active && !hasChildren} className={btnClasses} title={isCollapsed ? item.label : undefined}>
          <span className={active || pending ? 'text-white' : menuActive && hasChildren ? 'text-blue-600' : 'text-gray-600'}>{item.icon}</span>
          {!isCollapsed && (
            <>
              <span className="font-medium flex items-center gap-2 flex-1">{item.label}{pending && <Loader2 className="w-4 h-4 animate-spin" />}</span>
              {hasChildren && <span className="text-gray-400">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>}
            </>
          )}
        </button>
        {hasChildren && isExpanded && !isCollapsed && (
          <ul className="mt-1 space-y-1">{item.children?.filter(child => !child.roles || child.roles.includes(userRole)).map(child => renderNavItem(child, true))}</ul>
        )}
      </li>
    );
  };

  const sidebarClasses = [
    "fixed top-0 h-full bg-white shadow-lg z-50 transition-all duration-300 ease-in-out",
    isCollapsed ? "w-20" : "w-64",
    isMobileOpen ? "right-0" : "-right-64 lg:right-0"
  ].join(" ");

  return (
    <>
      {isMobileOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setIsMobileOpen(false)} />}
      <aside className={sidebarClasses + " flex flex-col"}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-xl">ش</div>
              <span className="font-bold text-lg">شموخ</span>
            </div>
          )}
          <button onClick={() => setIsMobileOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} className={isCollapsed ? "" : "rotate-180"} style={{ transition: "transform 0.3s" }} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 min-h-0"><ul className="space-y-1 px-3">{filteredNavItems.map((item) => renderNavItem(item))}</ul></nav>
        {!isCollapsed && session?.user && (
          <div className="p-4 border-t border-gray-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold">{session.user.name?.charAt(0) || 'م'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{session.user.name}</p>
                <p className="text-xs text-gray-500 truncate">{userRole === 'ADMIN' && 'مديرة'}{userRole === 'TEACHER' && 'معلمة'}{userRole === 'STUDENT' && 'طالبة'}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
      <button onClick={() => setIsMobileOpen(true)} className="lg:hidden fixed top-4 right-4 w-12 h-12 bg-white border-2 border-gray-200 text-gray-700 rounded-lg shadow-md flex items-center justify-center z-40 hover:bg-gray-50 transition-colors"><Menu size={24} /></button>
    </>
  );
}