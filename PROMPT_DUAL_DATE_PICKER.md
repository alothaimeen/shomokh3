# 🗓️ برومبت: إضافة محدد تاريخ ثنائي (هجري + ميلادي) - Dual Date Picker Implementation

## 📋 المطلوب

إضافة نظام محدد تاريخ ثنائي يعرض التاريخ الهجري والميلادي معاً في قائمتين متجاورتين، بحيث:
1. يظهر التاريخ الهجري والميلادي في قائمتين منفصلتين
2. عند تغيير التاريخ من أي قائمة، تتحدث القائمة الأخرى تلقائياً
3. ينتقل النظام إلى التاريخ المختار ويحمل البيانات

---

## 🔍 التحليل الحالي

### المكتبة المستخدمة
- **`hijri-date`** (v0.2.2) مثبتة في `package.json`
- موقع الكود: `src/lib/hijri-date.ts`
- **الدوال المتاحة:**
  - `convertToHijri(date)` → `{year, month, day}`
  - `formatHijriDate(date)` → `"15 جمادى الأولى 1447هـ"`
  - `formatHijriDateShort(date)` → `"15/5/1447هـ"`

### المشاكل الحالية

#### المشكلة 1: محدد التاريخ يستخدم حقل HTML الأصلي (ميلادي فقط)
جميع الصفحات تستخدم:
```tsx
<input type="date" value={selectedDate} onChange={...} />
```
هذا يعرض التقويم الميلادي فقط ولا يدعم التاريخ الهجري.

#### المشكلة 2: عدم الانتقال للتاريخ (في صفحة الحضور فقط)
`src/components/attendance/CourseSelector.tsx` (السطر 26):
```tsx
// ❌ المشكلة: hardcoded إلى /attendance
router.push(`/attendance?${params.toString()}`);
```
هذا يعمل بشكل صحيح، لكن المشكلة قد تكون في:
- عدم تحديث الصفحة بعد التنقل
- مشكلة في كيفية قراءة `searchParams`

#### صفحات الدرجات (تعمل بشكل صحيح):
`src/components/grades/DateSelector.tsx` و `CourseSelector.tsx` يستخدمون `router.replace()` بشكل صحيح.

---

## 📁 الملفات المطلوب تعديلها

### 1. مكونات محدد التاريخ الجديدة

| الملف | الحالة | الوصف |
|-------|--------|-------|
| `src/components/shared/DualDatePicker.tsx` | **[NEW]** | مكون محدد التاريخ الثنائي الموحد |
| `src/lib/hijri-date.ts` | **[MODIFY]** | إضافة دالة تحويل من هجري إلى ميلادي |

### 2. صفحات الحضور (Teacher/Admin)

| الملف | الحالة |
|-------|--------|
| `src/components/attendance/CourseSelector.tsx` | **[MODIFY]** |
| `src/components/attendance/async/AttendanceAsync.tsx` | **[CHECK]** |

### 3. صفحات الدرجات اليومية

| الملف | الحالة |
|-------|--------|
| `src/components/grades/DateSelector.tsx` | **[REPLACE]** |
| `src/components/grades/async/DailyGradesAsync.tsx` | **[CHECK]** |

### 4. صفحة درجات السلوك

| الملف | الحالة |
|-------|--------|
| `src/components/behavior-grades/BehaviorGradesForm.tsx` | **[MODIFY]** (السطور 142-153) |

### 5. صفحة التقييم الموحد

| الملف | الحالة |
|-------|--------|
| `src/app/(dashboard)/unified-assessment/page.tsx` | **[MODIFY]** (السطور 165-180) |

---

## 🛠️ خطوات التنفيذ

### الخطوة 1: إضافة دالة التحويل العكسي (من هجري إلى ميلادي)

في `src/lib/hijri-date.ts`:
```typescript
/**
 * تحويل تاريخ هجري إلى ميلادي
 * @param year السنة الهجرية
 * @param month الشهر الهجري (1-12)
 * @param day اليوم الهجري
 * @returns كائن Date ميلادي
 */
export function convertHijriToGregorian(year: number, month: number, day: number): Date {
  const hijriDate = new HijriDate(year, month, day);
  return hijriDate.toGregorian();
}

/**
 * إنشاء قائمة أيام الشهر الهجري
 */
export function getHijriMonthDays(year: number, month: number): number[] {
  // أشهر القمرية تتراوح بين 29-30 يوم
  const daysInMonth = new HijriDate(year, month, 1).getDaysInMonth();
  return Array.from({ length: daysInMonth }, (_, i) => i + 1);
}
```

### الخطوة 2: إنشاء مكون `DualDatePicker`

في `src/components/shared/DualDatePicker.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { 
  convertToHijri, 
  convertHijriToGregorian,
  HIJRI_MONTHS,
  GREGORIAN_MONTHS 
} from '@/lib/hijri-date';

interface DualDatePickerProps {
  selectedDate: string; // ISO format: YYYY-MM-DD
  onDateChange: (date: string) => void;
  maxDate?: string;
  className?: string;
}

export default function DualDatePicker({
  selectedDate,
  onDateChange,
  maxDate,
  className = ''
}: DualDatePickerProps) {
  // الحالة الهجرية
  const [hijriState, setHijriState] = useState({ year: 0, month: 0, day: 0 });
  // الحالة الميلادية
  const [gregorianState, setGregorianState] = useState({ year: 0, month: 0, day: 0 });
  
  // تزامن التاريخ عند التحميل أو تغيير selectedDate
  useEffect(() => {
    const date = new Date(selectedDate);
    const hijri = convertToHijri(date);
    setHijriState(hijri);
    setGregorianState({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    });
  }, [selectedDate]);

  // عند تغيير التاريخ الهجري
  const handleHijriChange = (field: 'year' | 'month' | 'day', value: number) => {
    const newHijri = { ...hijriState, [field]: value };
    setHijriState(newHijri);
    
    const gregorianDate = convertHijriToGregorian(newHijri.year, newHijri.month, newHijri.day);
    const isoDate = gregorianDate.toISOString().split('T')[0];
    onDateChange(isoDate);
  };

  // عند تغيير التاريخ الميلادي
  const handleGregorianChange = (field: 'year' | 'month' | 'day', value: number) => {
    const newGregorian = { ...gregorianState, [field]: value };
    setGregorianState(newGregorian);
    
    const date = new Date(newGregorian.year, newGregorian.month - 1, newGregorian.day);
    const isoDate = date.toISOString().split('T')[0];
    onDateChange(isoDate);
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* التاريخ الهجري */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="text-green-600" size={20} />
          <label className="font-semibold text-green-800">التاريخ الهجري</label>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {/* اليوم */}
          <select 
            value={hijriState.day}
            onChange={(e) => handleHijriChange('day', +e.target.value)}
            className="p-2 border rounded"
          >
            {[...Array(30)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
          {/* الشهر */}
          <select 
            value={hijriState.month}
            onChange={(e) => handleHijriChange('month', +e.target.value)}
            className="p-2 border rounded"
          >
            {HIJRI_MONTHS.map((name, i) => (
              <option key={i+1} value={i+1}>{name}</option>
            ))}
          </select>
          {/* السنة */}
          <select 
            value={hijriState.year}
            onChange={(e) => handleHijriChange('year', +e.target.value)}
            className="p-2 border rounded"
          >
            {[1445, 1446, 1447, 1448].map(y => (
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
          {/* اليوم */}
          <select 
            value={gregorianState.day}
            onChange={(e) => handleGregorianChange('day', +e.target.value)}
            className="p-2 border rounded"
          >
            {[...Array(31)].map((_, i) => (
              <option key={i+1} value={i+1}>{i+1}</option>
            ))}
          </select>
          {/* الشهر */}
          <select 
            value={gregorianState.month}
            onChange={(e) => handleGregorianChange('month', +e.target.value)}
            className="p-2 border rounded"
          >
            {GREGORIAN_MONTHS.map((name, i) => (
              <option key={i+1} value={i+1}>{name}</option>
            ))}
          </select>
          {/* السنة */}
          <select 
            value={gregorianState.year}
            onChange={(e) => handleGregorianChange('year', +e.target.value)}
            className="p-2 border rounded"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}م</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
```

### الخطوة 3: تحديث الملفات

#### 3.1 تحديث `src/lib/hijri-date.ts`
- تصدير المصفوفات `HIJRI_MONTHS` و `GREGORIAN_MONTHS`
- إضافة دالة `convertHijriToGregorian()`

#### 3.2 تحديث `src/components/attendance/CourseSelector.tsx`
استبدال:
```tsx
<input type="date" ... />
```
بـ:
```tsx
import DualDatePicker from '@/components/shared/DualDatePicker';
<DualDatePicker 
  selectedDate={selectedDate}
  onDateChange={handleDateChange}
/>
```

#### 3.3 تحديث `src/components/grades/DateSelector.tsx`
نفس التغيير

#### 3.4 تحديث `src/components/behavior-grades/BehaviorGradesForm.tsx`
استبدال السطور 142-153

#### 3.5 تحديث `src/app/(dashboard)/unified-assessment/page.tsx`
استبدال السطور 165-180

---

## ✅ معايير النجاح

1. [ ] يظهر محدد التاريخ بقائمتين (هجري + ميلادي)
2. [ ] عند تغيير التاريخ الهجري تتحدث القائمة الميلادية والعكس
3. [ ] يتم التنقل للتاريخ المختار وتحميل البيانات
4. [ ] يعمل في جميع الصفحات:
   - [ ] `/attendance` (صفحة الحضور للمعلمة)
   - [ ] `/daily-grades` (الدرجات اليومية)
   - [ ] `/behavior-grades` (درجات السلوك)
   - [ ] `/unified-assessment` (الصفحة الموحدة)

---

## 📚 ملاحظات تقنية

### مكتبة hijri-date
```typescript
import HijriDate from 'hijri-date';

// التحويل من ميلادي إلى هجري
const hijri = new HijriDate(2025, 12, 6); // ميلادي
hijri.getFullYear(); // السنة الهجرية
hijri.getMonth();    // الشهر الهجري (0-indexed)
hijri.getDate();     // اليوم الهجري

// التحويل من هجري إلى ميلادي
const gregorian = hijri.toGregorian(); // يعيد Date object
```

### الصفحات التي لا تحتاج تعديل
- `/weekly-grades` - تستخدم رقم الأسبوع (1-10)
- `/monthly-grades` - تستخدم رقم الشهر (1-3)
- `/my-attendance` - صفحة الطالبة (عرض فقط)
- `/my-grades` - صفحة الطالبة (عرض فقط)
- `/student-attendance` - صفحة سجل الحضور (عرض فقط)

---

## 🚀 البدء

1. ابدأ بإنشاء مكون `DualDatePicker.tsx`
2. اختبره في صفحة `/daily-grades` أولاً
3. بعد التأكد من عمله، طبقه على باقي الصفحات
4. تأكد من أن Build يعمل بدون أخطاء

---

**ملف البرومبت أُنشئ في:** 6 ديسمبر 2025
**المشروع:** منصة شموخ v3
