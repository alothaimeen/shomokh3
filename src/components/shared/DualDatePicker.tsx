'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { 
  convertToHijri, 
  convertHijriToGregorian,
  HIJRI_MONTHS,
  GREGORIAN_MONTHS,
  WEEKDAYS,
  getHijriMonthDays,
  getGregorianMonthDays
} from '@/lib/hijri-date';

interface DualDatePickerProps {
  selectedDate: string; // ISO format: YYYY-MM-DD
  onDateChange: (date: string) => void;
  maxDate?: string;
  className?: string;
  /** إذا كان true، يظهر التقويمين فوق بعض بدل جنب بعض */
  stackVertically?: boolean;
}

export default function DualDatePicker({
  selectedDate,
  onDateChange,
  maxDate,
  className = '',
  stackVertically = false
}: DualDatePickerProps) {
  // تاريخ اليوم بالتوقيت المحلي - ثابت لا يتغير
  const today = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);
  
  // حساب القيم الابتدائية
  const initialGregorian = () => {
    const dateStr = selectedDate || today;
    const d = new Date(dateStr + 'T00:00:00');
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  };
  
  const initialHijri = () => {
    const dateStr = selectedDate || today;
    const d = new Date(dateStr + 'T00:00:00');
    return convertToHijri(d);
  };
  
  // الحالة الهجرية
  const [hijriState, setHijriState] = useState(initialHijri);
  // الحالة الميلادية
  const [gregorianState, setGregorianState] = useState(initialGregorian);
  // التاريخ المختار مؤقتاً (قبل الضغط على زر الانتقال)
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  
  // تزامن التاريخ عند تغيير selectedDate
  useEffect(() => {
    const dateStr = selectedDate || today;
    const date = new Date(dateStr + 'T00:00:00');
    if (isNaN(date.getTime())) return;
    
    const hijri = convertToHijri(date);
    setHijriState(hijri);
    setGregorianState({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    });
    setPendingDate(null);
  }, [selectedDate, today]);

  // عند تغيير التاريخ الهجري
  const handleHijriChange = (field: 'year' | 'month' | 'day', value: number) => {
    const newHijri = { ...hijriState, [field]: value };
    
    const maxDay = getHijriMonthDays(newHijri.year, newHijri.month);
    if (newHijri.day > maxDay) {
      newHijri.day = maxDay;
    }
    
    setHijriState(newHijri);
    
    try {
      const gregorianDate = convertHijriToGregorian(newHijri.year, newHijri.month, newHijri.day);
      const isoDate = gregorianDate.toISOString().split('T')[0];
      
      if (maxDate && isoDate > maxDate) return;
      
      setGregorianState({
        year: gregorianDate.getFullYear(),
        month: gregorianDate.getMonth() + 1,
        day: gregorianDate.getDate()
      });
      
      setPendingDate(isoDate);
    } catch {
      console.warn('خطأ في تحويل التاريخ الهجري');
    }
  };

  // عند تغيير التاريخ الميلادي
  const handleGregorianChange = (field: 'year' | 'month' | 'day', value: number) => {
    const newGregorian = { ...gregorianState, [field]: value };
    
    const maxDay = getGregorianMonthDays(newGregorian.year, newGregorian.month);
    if (newGregorian.day > maxDay) {
      newGregorian.day = maxDay;
    }
    
    setGregorianState(newGregorian);
    
    const date = new Date(newGregorian.year, newGregorian.month - 1, newGregorian.day);
    const isoDate = date.toISOString().split('T')[0];
    
    if (maxDate && isoDate > maxDate) return;
    
    const hijri = convertToHijri(date);
    setHijriState(hijri);
    
    setPendingDate(isoDate);
  };

  // تنفيذ الانتقال
  const handleGoToDate = useCallback(() => {
    if (pendingDate) {
      onDateChange(pendingDate);
    }
  }, [pendingDate, onDateChange]);

  // الانتقال لتاريخ اليوم
  const handleGoToToday = useCallback(() => {
    onDateChange(today);
  }, [today, onDateChange]);

  // إنشاء خيارات الأيام مع اسم اليوم
  const hijriDaysWithNames = useMemo(() => {
    const daysCount = getHijriMonthDays(hijriState.year, hijriState.month);
    return Array.from({ length: daysCount }, (_, i) => {
      const dayNum = i + 1;
      // حساب اسم اليوم بالتحويل للميلادي
      try {
        const gregDate = convertHijriToGregorian(hijriState.year, hijriState.month, dayNum);
        const dayName = WEEKDAYS[gregDate.getDay()];
        return { value: dayNum, label: `${dayNum} ${dayName}` };
      } catch {
        return { value: dayNum, label: `${dayNum}` };
      }
    });
  }, [hijriState.year, hijriState.month]);

  const gregorianDaysWithNames = useMemo(() => {
    const daysCount = getGregorianMonthDays(gregorianState.year, gregorianState.month);
    return Array.from({ length: daysCount }, (_, i) => {
      const dayNum = i + 1;
      const date = new Date(gregorianState.year, gregorianState.month - 1, dayNum);
      const dayName = WEEKDAYS[date.getDay()];
      return { value: dayNum, label: `${dayNum} ${dayName}` };
    });
  }, [gregorianState.year, gregorianState.month]);

  const hijriYears = [1445, 1446, 1447, 1448, 1449, 1450];
  const gregorianYears = [2023, 2024, 2025, 2026, 2027, 2028];
  
  // اسم يوم الأسبوع للتاريخ المحدد
  const selectedDayName = useMemo(() => {
    const dateStr = pendingDate || selectedDate || today;
    const d = new Date(dateStr + 'T00:00:00');
    return WEEKDAYS[d.getDay()];
  }, [pendingDate, selectedDate, today]);

  // التاريخ المستهدف للانتقال
  const targetDate = pendingDate || selectedDate;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* زر الذهاب لتاريخ اليوم - يظهر دائماً */}
      <button
        type="button"
        onClick={handleGoToToday}
        className="w-full py-2 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg border border-amber-300 font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Calendar size={18} />
        الذهاب لتاريخ اليوم
      </button>

      {/* عرض التاريخ المنسق */}
      <div className="text-center py-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-lg font-bold">
          <span className="text-green-700">
            {hijriState.day} {selectedDayName} | {hijriState.month} {HIJRI_MONTHS[hijriState.month - 1]} | {hijriState.year} هـ
          </span>
          <span className="text-gray-400">-</span>
          <span className="text-blue-700">
            {gregorianState.day} {selectedDayName} | {gregorianState.month} {GREGORIAN_MONTHS[gregorianState.month - 1]} | {gregorianState.year} م
          </span>
        </div>
      </div>

      <div className={`grid gap-4 ${stackVertically ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {/* التاريخ الهجري */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-green-600" size={20} />
            <label className="font-semibold text-green-800">التاريخ الهجري</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select 
              value={hijriState.day}
              onChange={(e) => handleHijriChange('day', +e.target.value)}
              className="p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
            >
              {hijriDaysWithNames.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <select 
              value={hijriState.month}
              onChange={(e) => handleHijriChange('month', +e.target.value)}
              className="p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
            >
              {HIJRI_MONTHS.map((name, i) => (
                <option key={i+1} value={i+1}>{i+1} {name}</option>
              ))}
            </select>
            <select 
              value={hijriState.year}
              onChange={(e) => handleHijriChange('year', +e.target.value)}
              className="p-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm"
            >
              {hijriYears.map(y => (
                <option key={y} value={y}>{y}هـ</option>
              ))}
            </select>
          </div>
        </div>

        {/* التاريخ الميلادي */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-blue-600" size={20} />
            <label className="font-semibold text-blue-800">التاريخ الميلادي</label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <select 
              value={gregorianState.day}
              onChange={(e) => handleGregorianChange('day', +e.target.value)}
              className="p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              {gregorianDaysWithNames.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <select 
              value={gregorianState.month}
              onChange={(e) => handleGregorianChange('month', +e.target.value)}
              className="p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              {GREGORIAN_MONTHS.map((name, i) => (
                <option key={i+1} value={i+1}>{i+1} {name}</option>
              ))}
            </select>
            <select 
              value={gregorianState.year}
              onChange={(e) => handleGregorianChange('year', +e.target.value)}
              className="p-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
            >
              {gregorianYears.map(y => (
                <option key={y} value={y}>{y}م</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* زر الانتقال للتاريخ المختار - يظهر دائماً */}
      <button
        type="button"
        onClick={handleGoToDate}
        disabled={!pendingDate || pendingDate === selectedDate}
        className={`w-full py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-md ${
          pendingDate && pendingDate !== selectedDate
            ? 'bg-gradient-to-r from-primary-purple to-primary-blue hover:opacity-90 text-white'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        <ArrowLeft size={20} />
        انتقل للتاريخ المختار
      </button>
    </div>
  );
}
