'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

// أنواع البيانات
interface User {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isActive: boolean;
  createdAt: string;
}

interface UserFormData {
  userName: string;
  userEmail: string;
  userRole: string;
  password?: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    userName: '',
    userEmail: '',
    userRole: 'STUDENT',
    password: ''
  });
  const [submitting, setSubmitting] = useState(false);

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
        setFallbackUsers();
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      setFallbackUsers();
    } finally {
      setLoading(false);
    }
  }, []);

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

  // إضافة مستخدم جديد
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([newUser, ...users]);
        setShowAddModal(false);
        setFormData({ userName: '', userEmail: '', userRole: 'STUDENT', password: '' });
        alert('✅ تم إضافة المستخدم بنجاح');
      } else {
        const error = await response.json();
        alert('❌ خطأ: ' + error.error);
      }
    } catch (error) {
      console.error('خطأ في إضافة المستخدم:', error);
      alert('❌ فشل في إضافة المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  // تعديل مستخدم
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          updateData: {
            userName: formData.userName,
            userEmail: formData.userEmail
          }
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ userName: '', userEmail: '', userRole: 'STUDENT', password: '' });
        alert('✅ تم تعديل المستخدم بنجاح');
      } else {
        const error = await response.json();
        alert('❌ خطأ: ' + error.error);
      }
    } catch (error) {
      console.error('خطأ في تعديل المستخدم:', error);
      alert('❌ فشل في تعديل المستخدم');
    } finally {
      setSubmitting(false);
    }
  };

  // تغيير حالة المستخدم (تفعيل/إيقاف)
  const handleToggleStatus = async (user: User) => {
    if (!confirm(`هل تريد ${user.isActive ? 'إيقاف' : 'تفعيل'} المستخدم "${user.userName}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users?id=${user.id}&isActive=${!user.isActive}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(users.map(u => u.id === result.id ? { ...u, isActive: result.isActive } : u));
        alert(`✅ تم ${result.isActive ? 'تفعيل' : 'إيقاف'} المستخدم بنجاح`);
      } else {
        const error = await response.json();
        alert('❌ خطأ: ' + error.error);
      }
    } catch (error) {
      console.error('خطأ في تغيير حالة المستخدم:', error);
      alert('❌ فشل في تغيير حالة المستخدم');
    }
  };

  // تغيير دور المستخدم
  const handleChangeRole = async (user: User, newRole: string) => {
    if (!confirm(`هل تريد تغيير دور "${user.userName}" إلى "${roleLabels[newRole as keyof typeof roleLabels]}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${user.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole })
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(users.map(u => u.id === result.user.id ? result.user : u));
        alert('✅ تم تغيير الدور بنجاح');
      } else {
        const error = await response.json();
        alert('❌ خطأ: ' + error.error);
      }
    } catch (error) {
      console.error('خطأ في تغيير الدور:', error);
      alert('❌ فشل في تغيير الدور');
    }
  };

  // فتح نافذة التعديل
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      userName: user.userName,
      userEmail: user.userEmail,
      userRole: user.userRole,
      password: ''
    });
    setShowEditModal(true);
  };

  if (!session) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800 border-red-300',
    TEACHER: 'bg-green-100 text-green-800 border-green-300',
    STUDENT: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  const roleLabels = {
    ADMIN: 'مدير أعلى',
    TEACHER: 'معلمة',
    STUDENT: 'طالبة'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="إدارة المستخدمين" />
        <div className="p-8">
          <BackButton />
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent">إدارة المستخدمين</h1>
              <p className="text-gray-600">عرض وإدارة جميع مستخدمي النظام</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
            >
              + إضافة مستخدم جديد
            </button>
          </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => u.userRole === 'ADMIN').length}
          </div>
          <div className="text-sm text-red-700">مدراء</div>
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
                      <select
                        value={user.userRole}
                        onChange={(e) => handleChangeRole(user, e.target.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer ${roleColors[user.userRole as keyof typeof roleColors]}`}
                        disabled={user.id === session.user.id}
                      >
                        <option value="ADMIN">مدير أعلى</option>
                        <option value="TEACHER">معلمة</option>
                        <option value="STUDENT">طالبة</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        disabled={user.id === session.user.id}
                        className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer transition-colors ${
                          user.isActive
                            ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                        } ${user.id === session.user.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {user.isActive ? 'نشط' : 'معطل'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 space-x-reverse">
                      <button
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                        onClick={() => openEditModal(user)}
                      >
                        تعديل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal إضافة مستخدم */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">إضافة مستخدم جديد</h2>
            <form onSubmit={handleAddUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="اتركها فارغة لاستخدام كلمة المرور الافتراضية"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور
                </label>
                <select
                  value={formData.userRole}
                  onChange={(e) => setFormData({ ...formData, userRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">مدير أعلى</option>
                  <option value="TEACHER">معلمة</option>
                  <option value="STUDENT">طالبة</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
                >
                  {submitting ? 'جاري الإضافة...' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ userName: '', userEmail: '', userRole: 'STUDENT', password: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal تعديل مستخدم */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">تعديل المستخدم</h2>
            <form onSubmit={handleEditUser}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={formData.userName}
                  onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
                >
                  {submitting ? 'جاري التعديل...' : 'حفظ التعديلات'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                    setFormData({ userName: '', userEmail: '', userRole: 'STUDENT', password: '' });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
      </div>
    </div>
  );
}
