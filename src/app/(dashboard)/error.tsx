'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // تسجيل الخطأ في console للمطورين
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center">
        {/* أيقونة الخطأ */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* رسالة الخطأ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          عذراً، حدث خطأ ما
        </h2>
        <p className="text-gray-600 mb-6">
          حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
        </p>

        {/* تفاصيل الخطأ (للمطورين فقط في Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-right">
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* زر إعادة المحاولة */}
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            إعادة المحاولة
          </button>

          {/* زر العودة للرئيسية */}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
        </div>

        {/* نصيحة إضافية */}
        <p className="text-sm text-gray-500 mt-6">
          إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
        </p>
      </div>
    </div>
  );
}
