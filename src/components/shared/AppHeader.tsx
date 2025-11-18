'use client';

import { useSession, signOut } from 'next-auth/react';
import { Menu, User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface AppHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function AppHeader({ title, onMenuClick }: AppHeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userRole = session?.user?.role;
  
  // تحديد لون الـ header حسب الدور
  const getHeaderColor = () => {
    if (userRole === 'ADMIN') {
      return 'bg-gradient-to-r from-primary-purple to-primary-purple/80';
    } else if (userRole === 'TEACHER') {
      return 'bg-gradient-to-r from-primary-blue to-primary-blue/80';
    } else {
      return 'bg-gradient-to-r from-primary-purple to-primary-blue';
    }
  };

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className={`h-16 ${getHeaderColor()} text-white shadow-md`}>
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        {/* Right side - Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 className="text-xl font-bold">{title}</h1>
        </div>

        {/* Left side - User menu */}
        {session?.user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                {session.user.name?.charAt(0) || 'م'}
              </div>
              <span className="hidden sm:inline font-medium">
                {session.user.name}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{session.user.name}</p>
                  <p className="text-sm text-gray-500">{session.user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {userRole === 'ADMIN' && 'مديرة الأكاديمية'}
                    {userRole === 'TEACHER' && 'معلمة'}
                    {userRole === 'STUDENT' && 'طالبة'}
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User size={18} />
                    <span>الملف الشخصي</span>
                  </Link>

                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={18} />
                    <span>الإعدادات</span>
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={18} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
