'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import DualDatePicker from '@/components/shared/DualDatePicker';

interface DateSelectorProps {
  selectedDate: string;
  courseId: string;
  pageType: 'daily' | 'behavior';
}

export default function DateSelector({ selectedDate, courseId, pageType }: DateSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateChange = (date: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('date', date);
    params.set('courseId', courseId);
    
    const url = pageType === 'daily' 
      ? `/daily-grades?${params.toString()}`
      : `/behavior-points?${params.toString()}`;
    router.replace(url, { scroll: false });
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-700 mb-2">
        {pageType === 'daily' ? 'تاريخ التقييم:' : 'التاريخ:'}
      </label>
      <DualDatePicker
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        maxDate={new Date().toISOString().split('T')[0]}
      />
    </div>
  );
}
