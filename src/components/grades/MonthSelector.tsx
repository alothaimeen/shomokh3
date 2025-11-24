'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface MonthSelectorProps {
  selectedMonth: number;
  courseId: string;
}

export default function MonthSelector({ selectedMonth, courseId }: MonthSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMonthChange = (month: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('courseId', courseId);
    params.set('month', month.toString());
    router.replace(`/monthly-grades?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-700 mb-2">الشهر:</label>
      <select
        value={selectedMonth}
        onChange={(e) => handleMonthChange(parseInt(e.target.value))}
        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
      >
        {[1, 2, 3].map((m) => (
          <option key={m} value={m}>
            الشهر {m}
          </option>
        ))}
      </select>
    </div>
  );
}
