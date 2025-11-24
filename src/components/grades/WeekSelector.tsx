'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface WeekSelectorProps {
  selectedWeek: number;
  courseId: string;
}

export default function WeekSelector({ selectedWeek, courseId }: WeekSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleWeekChange = (week: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('courseId', courseId);
    params.set('week', week.toString());
    router.replace(`/weekly-grades?${params.toString()}`, { scroll: false });
  };

  return (
    <div>
      <label className="block text-lg font-semibold text-gray-700 mb-2">الأسبوع:</label>
      <select
        value={selectedWeek}
        onChange={(e) => handleWeekChange(parseInt(e.target.value))}
        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-lg"
      >
        {[...Array(10)].map((_, i) => (
          <option key={i + 1} value={i + 1}>
            الأسبوع {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
}
