'use client';

import Link from "next/link";
import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        userEmail,
        password,
        redirect: false,
      });

      if (result?.ok) {
        // الحصول على Session للتحقق من الدور
        const session = await getSession();
        console.log('تسجيل دخول ناجح:', session);

        // التوجه للوحة التحكم
        router.push('/dashboard');
        router.refresh();
      } else {
        alert('بيانات تسجيل الدخول غير صحيحة. جرب: admin@shamokh.edu / admin123');
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      alert('حدث خطأ في تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  // دخول سريع بحساب تجريبي
  const quickLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setUserEmail(email);
    setPassword(pass);

    try {
      const result = await signIn('credentials', {
        userEmail: email,
        password: pass,
        redirect: false,
      });

      if (result?.ok) {
        const session = await getSession();
        console.log('دخول سريع ناجح:', session);
        router.push('/dashboard');
        router.refresh();
      } else {
        alert('فشل الدخول السريع');
      }
    } catch (error) {
      console.error('خطأ في الدخول السريع:', error);
      alert('حدث خطأ في الدخول السريع');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            تسجيل الدخول
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            منصة شموخ التعليمية
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700">
                البريد الإلكتروني
              </label>
              <input
                id="userEmail"
                name="userEmail"
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@shamokh.edu"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin123"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </button>
          </div>
        </form>

        {/* قسم الدخول السريع التجريبي */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-center text-lg font-medium text-gray-900 mb-4">
            دخول سريع تجريبي
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {/* زر ادمن */}
            <button
              onClick={() => quickLogin('admin@shamokh.edu', 'admin123')}
              disabled={isLoading}
              className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg mb-1">👑</span>
              <span className="text-sm font-medium">ادمن</span>
              <span className="text-xs text-gray-500">المدير الأعلى</span>
            </button>

            {/* زر مدير أكاديمي */}
            <button
              onClick={() => quickLogin('manager1@shamokh.edu', 'manager123')}
              disabled={isLoading}
              className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg mb-1">👨‍💼</span>
              <span className="text-sm font-medium">مدير أكاديمي</span>
              <span className="text-xs text-gray-500">الإدارة التعليمية</span>
            </button>

            {/* زر معلمة */}
            <button
              onClick={() => quickLogin('teacher1@shamokh.edu', 'teacher123')}
              disabled={isLoading}
              className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg mb-1">👩‍🏫</span>
              <span className="text-sm font-medium">معلمة</span>
              <span className="text-xs text-gray-500">المعلمة سارة</span>
            </button>

            {/* زر طالبة */}
            <button
              onClick={() => quickLogin('student1@shamokh.edu', 'student123')}
              disabled={isLoading}
              className="flex flex-col items-center p-3 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg mb-1">👩‍🎓</span>
              <span className="text-sm font-medium">طالبة</span>
              <span className="text-xs text-gray-500">الطالبة فاطمة</span>
            </button>
          </div>

          {/* معلومات الحسابات للنسخ */}
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-xs font-medium text-gray-700 mb-2">معلومات الحسابات التجريبية:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div><strong>ادمن:</strong> admin@shamokh.edu / admin123</div>
              <div><strong>مدير:</strong> manager1@shamokh.edu / manager123</div>
              <div><strong>معلمة:</strong> teacher1@shamokh.edu / teacher123</div>
              <div><strong>طالبة:</strong> student1@shamokh.edu / student123</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-500">
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}