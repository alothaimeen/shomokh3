'use client';

import { useState } from 'react';
import ExportModal from './ExportModal';
import type { ExportFormat } from '@/actions/reports';

interface SmartExportButtonProps {
  onExport: (format: ExportFormat) => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function SmartExportButton({
  onExport,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = ''
}: SmartExportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300'
  };

  const buttonClasses = `
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    rounded-lg font-medium
    transition-colors duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center gap-2
    ${className}
  `.trim();

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        disabled={disabled || isLoading}
        className={buttonClasses}
        aria-label="تصدير التقرير">
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <span>جاري التحميل...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>تصدير CSV</span>
          </>
        )}
      </button>

      <ExportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={onExport}
      />
    </>
  );
}
