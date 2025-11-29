'use client';

import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  noData?: boolean;
  noDataMessage?: string;
  className?: string;
  onRefresh?: () => void;
}

/**
 * غلاف موحد للرسوم البيانية
 * يتضمن العنوان، حالة التحميل، الأخطاء، ورسالة عدم وجود بيانات
 */
export default function ChartWrapper({
  title,
  description,
  children,
  isLoading = false,
  error = null,
  noData = false,
  noDataMessage = 'لا توجد بيانات كافية لعرض الرسم البياني',
  className = '',
  onRefresh
}: ChartWrapperProps) {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-primary-purple hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
            title="تحديث"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="min-h-[250px] flex items-center justify-center">
        {isLoading ? (
          <ChartSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : noData ? (
          <NoDataState message={noDataMessage} />
        ) : (
          children
        )}
      </div>
    </div>
  );
}

/**
 * هيكل التحميل للرسوم البيانية
 */
export function ChartSkeleton() {
  return (
    <div className="w-full h-[250px] flex flex-col items-center justify-center gap-4">
      <div className="flex items-end gap-2">
        {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
          <div
            key={i}
            className="w-8 bg-gray-200 rounded-t animate-pulse"
            style={{ height: `${height}%` }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

/**
 * حالة عدم وجود بيانات
 */
function NoDataState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

/**
 * حالة الخطأ
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <p className="text-red-600 text-sm">{message}</p>
    </div>
  );
}
