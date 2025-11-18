'use client';

import { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { formatFullDate, formatHijriDateWithDay, formatHijriDate } from '@/lib/hijri-date';

interface HijriDateDisplayProps {
  date?: Date;
  format?: 'full' | 'withDay' | 'simple';
  showIcon?: boolean;
  className?: string;
}

export default function HijriDateDisplay({ 
  date, 
  format = 'withDay',
  showIcon = true,
  className = '' 
}: HijriDateDisplayProps) {
  const [displayDate, setDisplayDate] = useState('');

  useEffect(() => {
    const targetDate = date || new Date();
    
    let formatted = '';
    switch (format) {
      case 'full':
        formatted = formatFullDate(targetDate);
        break;
      case 'withDay':
        formatted = formatHijriDateWithDay(targetDate);
        break;
      case 'simple':
        formatted = formatHijriDate(targetDate);
        break;
    }
    
    setDisplayDate(formatted);
  }, [date, format]);

  if (!displayDate) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-gray-600 ${className}`}>
      {showIcon && <Calendar size={18} className="text-primary-purple" />}
      <span className="font-medium">{displayDate}</span>
    </div>
  );
}
