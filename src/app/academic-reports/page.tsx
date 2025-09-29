'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AcademicReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.userRole !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">التقارير الأكاديمية</h1>
          <p className="text-gray-600">تقارير مفصلة عن الأداء الأكاديمي والإحصائيات</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* تقرير أداء الطالبات */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-800">أداء الطالبات</h3>
                <p className="text-sm text-gray-600">إحصائيات الحضور والإنجاز</p>
              </div>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
              عرض التقرير
            </button>
          </div>

          {/* تقرير الحلقات */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-800">تقرير الحلقات</h3>
                <p className="text-sm text-gray-600">إحصائيات الحلقات والبرامج</p>
              </div>
            </div>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
              عرض التقرير
            </button>
          </div>

          {/* تقرير المعلمات */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">👩‍🏫</span>
              </div>
              <div className="mr-4">
                <h3 className="text-lg font-semibold text-gray-800">تقرير المعلمات</h3>
                <p className="text-sm text-gray-600">أداء وإحصائيات المعلمات</p>
              </div>
            </div>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded">
              عرض التقرير
            </button>
          </div>
        </div>

        {/* رسالة تحت التطوير */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-800">
            <h3 className="text-lg font-semibold mb-2">قريباً</h3>
            <p>هذه الصفحة تحت التطوير. سيتم إضافة التقارير التفصيلية قريباً.</p>
          </div>
        </div>

        {/* العودة للوحة التحكم */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
}