'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [userProfile, setUserProfile] = useState({
    userName: "",
    userEmail: "",
    userRole: "STUDENT",
    isActive: true,
    createdAt: "2024-01-15",
    phone: "966501234567",
    department: "إدارة المنصة"
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('/login');
      return;
    }

    // تحديث البيانات من session
    setUserProfile(prev => ({
      ...prev,
      userName: session.user?.name || "",
      userEmail: session.user?.email || "",
      userRole: session.user?.role || "STUDENT"
    }));
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: 'success', text: 'تم تحديث الملف الشخصي بنجاح' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              الملف الشخصي
            </h1>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800"
              >
                لوحة التحكم
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 hover:text-red-800"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Toast Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
              معلومات المستخدم
            </h3>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اسم المستخدم */}
                <div>
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-700">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    id="userName"
                    value={userProfile.userName}
                    onChange={(e) => setUserProfile(prev => ({...prev, userName: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* البريد الإلكتروني */}
                <div>
                  <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="userEmail"
                    value={userProfile.userEmail}
                    onChange={(e) => setUserProfile(prev => ({...prev, userEmail: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* رقم الهاتف */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile(prev => ({...prev, phone: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* القسم */}
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                    القسم
                  </label>
                  <input
                    type="text"
                    id="department"
                    value={userProfile.department}
                    onChange={(e) => setUserProfile(prev => ({...prev, department: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* الدور */}
                <div>
                  <label htmlFor="userRole" className="block text-sm font-medium text-gray-700">
                    الدور
                  </label>
                  <select
                    id="userRole"
                    value={userProfile.userRole}
                    onChange={(e) => setUserProfile(prev => ({...prev, userRole: e.target.value}))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ADMIN">مدير</option>
                    <option value="TEACHER">معلمة</option>
                    <option value="STUDENT">طالبة</option>
                  </select>
                </div>

                {/* تاريخ الإنشاء */}
                <div>
                  <label htmlFor="createdAt" className="block text-sm font-medium text-gray-700">
                    تاريخ الإنشاء
                  </label>
                  <input
                    type="date"
                    id="createdAt"
                    value={userProfile.createdAt}
                    disabled
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* حالة التفعيل */}
              <div className="flex items-center">
                <input
                  id="isActive"
                  type="checkbox"
                  checked={userProfile.isActive}
                  onChange={(e) => setUserProfile(prev => ({...prev, isActive: e.target.checked}))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="mr-2 block text-sm text-gray-900">
                  الحساب مفعل
                </label>
              </div>

              {/* أزرار الحفظ */}
              <div className="flex justify-end space-x-3 space-x-reverse">
                <Link
                  href="/dashboard"
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </Link>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-500 mr-4">
            الصفحة الرئيسية
          </Link>
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            تسجيل الدخول
          </Link>
        </div>
      </main>
    </div>
  );
}