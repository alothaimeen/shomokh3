'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  className?: string;
}

export default function BackButton({ label = 'رجوع', className = '' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className={`
        inline-flex items-center gap-2 px-4 py-2
        bg-gradient-to-r from-gray-100 to-gray-50
        hover:from-gray-200 hover:to-gray-100
        text-gray-700 font-medium
        rounded-lg shadow-sm
        transition-all duration-200
        hover:shadow-md
        ${className}
      `}
    >
      <ArrowRight size={18} />
      <span>{label}</span>
    </button>
  );
}
