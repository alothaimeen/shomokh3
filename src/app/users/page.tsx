'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

// أنواع البيانات
interface User {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // التحقق من الصلاحيات - فقط ADMIN
  useEffect(() => {
    if (session && session.user.userRole !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [session, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('فشل في جلب المستخدمين');
        // بيانات احتياطية في حالة فشل API
        setFallbackUsers();
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      setFallbackUsers();
    } finally {
      setLoading(false);
    }
  }, []);

  // جلب المستخدمين
  useEffect(() => {
    if (session && session.user.userRole === 'ADMIN') {
      fetchUsers();
    }
  }, [session, fetchUsers]);

  const setFallbackUsers = () => {
    const fallbackUsers: User[] = [
      {
        id: 'admin-1',
        userName: 'المدير الأول',
        userEmail: 'admin@shamokh.edu',
        userRole: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'manager-1',
        userName: 'المدير الأكاديمي',
        userEmail: 'manager1@shamokh.edu',
        userRole: 'MANAGER',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'teacher-1',
        userName: 'المعلمة سارة',
        userEmail: 'teacher1@shamokh.edu',
        userRole: 'TEACHER',
        isActive: true,
        createdAt: new Date().toISOString()
      },
      {
        id: 'student-1',
        userName: 'الطالبة فاطمة',
        userEmail: 'student1@shamokh.edu',
        userRole: 'STUDENT',
        isActive: true,
        createdAt: new Date().toISOString()
      }
    ];
    setUsers(fallbackUsers);
  };

  if (!session) {
    return <div>جاري التحميل...</div>;
  }

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800 border-red-300',
    MANAGER: 'bg-blue-100 text-blue-800 border-blue-300',
    TEACHER: 'bg-green-100 text-green-800 border-green-300',
    STUDENT: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  const roleLabels = {
    ADMIN: 'مدير أعلى',
    MANAGER: 'مدير أكاديمي',
    TEACHER: 'معلمة',
    STUDENT: 'طالبة'
  };

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">إدارة المستخدمين</h1>
        <p className="text-gray-600">عرض وإدارة جميع مستخدمي النظام</p>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => u.userRole === 'ADMIN').length}
          </div>
          <div className="text-sm text-red-700">مدراء</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.userRole === 'MANAGER').length}
          </div>
          <div className="text-sm text-blue-700">مدراء أكاديميين</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.userRole === 'TEACHER').length}
          </div>
          <div className="text-sm text-green-700">معلمات</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.userRole === 'STUDENT').length}
          </div>
          <div className="text-sm text-purple-700">طالبات</div>
        </div>
      </div>

      {/* جدول المستخدمين */}
      {loading ? (
        <div className="text-center py-8">جاري تحميل البيانات...</div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">قائمة المستخدمين ({users.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الاسم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الدور
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإنشاء
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.userEmail}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${roleColors[user.userRole as keyof typeof roleColors]}`}>
                        {roleLabels[user.userRole as keyof typeof roleLabels]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                        user.isActive
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-red-100 text-red-800 border-red-300'
                      }`}>
                        {user.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm ml-2"
                        onClick={() => alert('ميزة التعديل ستُضاف قريباً')}
                      >
                        تعديل
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => alert('ميزة الحذف ستُضاف قريباً')}
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ملاحظة */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-600 text-lg">ℹ️</span>
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-blue-800">
              ملاحظة
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>هذه البيانات تجريبية. في الجلسات القادمة ستُضاف ميزات:</p>
              <ul className="mt-1 list-disc list-inside">
                <li>إضافة مستخدمين جدد</li>
                <li>تعديل بيانات المستخدمين</li>
                <li>تغيير الأدوار والصلاحيات</li>
                <li>إيقاف/تفعيل المستخدمين</li>
                <li>ميزة &quot;تسجيل الدخول باسم&quot; للمدير</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* روابط العودة */}
      <div className="mt-6 text-center">
        <Link
          href="/dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          العودة للوحة التحكم
        </Link>
      </div>
    </div>
  );
}