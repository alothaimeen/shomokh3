'use client';

import { useState } from 'react';
import type { ExportFormat } from '@/actions/reports';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
  title?: string;
  description?: string;
}

export default function ExportModal({
  isOpen,
  onClose,
  onExport,
  title = 'تصدير التقرير',
  description = 'اختر صيغة التصدير المناسبة'
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('summary');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(selectedFormat);
    } finally {
      setIsExporting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Summary Option */}
          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: selectedFormat === 'summary' ? '#10B981' : '#E5E7EB' }}>
            <input
              type="radio"
              name="format"
              value="summary"
              checked={selectedFormat === 'summary'}
              onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
              className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <div className="mr-3 flex-1">
              <span className="font-medium text-gray-900 block">ملخص</span>
              <span className="text-sm text-gray-600">
                البيانات الأساسية فقط (مناسب للطباعة)
              </span>
            </div>
          </label>

          {/* Detailed Option */}
          <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            style={{ borderColor: selectedFormat === 'detailed' ? '#10B981' : '#E5E7EB' }}>
            <input
              type="radio"
              name="format"
              value="detailed"
              checked={selectedFormat === 'detailed'}
              onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
              className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500"
            />
            <div className="mr-3 flex-1">
              <span className="font-medium text-gray-900 block">تفصيلي</span>
              <span className="text-sm text-gray-600">
                جميع البيانات والتفاصيل (للتحليل)
              </span>
            </div>
          </label>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 ml-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">ملاحظة:</p>
                <p>سيتم احترام الفلاتر والترتيب الحالي عند التصدير.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            إلغاء
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                <span>جاري التصدير...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>تصدير</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
