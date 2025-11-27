# 📊 Reports System - نظام التقارير

## نظرة عامة

نظام تقارير شامل ومتقدم لمنصة شموخ، مبني على أساس تقني نظيف وقابل للتوسع.

---

## 🏗️ البنية المعمارية

```
src/
├── actions/
│   └── reports.ts              # Server Actions - الطبقة الخلفية
│
├── components/
│   └── reports/
│       ├── ExportModal.tsx         # Modal التصدير
│       └── SmartExportButton.tsx   # زر التصدير الذكي
│
└── lib/
    └── utils/
        └── exportHelpers.ts    # دوال مساعدة للتصدير
```

---

## 📋 أنواع التقارير

### 1. تقرير الحضور (Attendance Report)
- **عرضان:**
  - `by-student`: حسب الطالبة (افتراضي)
  - `by-date`: حسب التاريخ (مع إحصائيات يومية)

### 2. تقرير النقاط التحفيزية (Behavior Points)
- تجميع النقاط من 4 معايير
- حساب المعدل لكل جلسة
- ترتيب حسب الإجمالي

### 3. التقرير الأكاديمي (Academic Report)
- الدرجات اليومية
- الدرجات الأسبوعية
- الدرجات الشهرية
- الدرجات السلوكية
- النسبة المئوية والحالة

---

## 🔧 استخدام Server Actions

### مثال: تقرير الحضور

```typescript
import { getAttendanceReportData } from '@/actions/reports';

// بدون فلاتر (جميع البيانات)
const result = await getAttendanceReportData();

// مع فلاتر
const result = await getAttendanceReportData(
  {
    courseId: 'course-123',
    dateFrom: '2024-01-01',
    dateTo: '2024-12-31',
    status: 'PRESENT'
  },
  { field: 'date', order: 'desc' },  // ترتيب
  'by-student'                        // نوع العرض
);

if (result.success) {
  console.log(result.data);
  console.log(result.viewMode); // 'by-student' | 'by-date'
}
```

### مثال: تقرير النقاط

```typescript
import { getBehaviorPointsReportData } from '@/actions/reports';

const result = await getBehaviorPointsReportData(
  { courseId: 'course-123' },
  { field: 'points', order: 'desc' }
);

if (result.success) {
  result.data.forEach(item => {
    console.log(`${item.studentName}: ${item.totalPoints} نقطة`);
  });
}
```

---

## 📤 استخدام التصدير

### مثال: التصدير مع المكونات المشتركة

```typescript
'use client';

import { useState } from 'react';
import SmartExportButton from '@/components/reports/SmartExportButton';
import { exportAttendanceReport } from '@/lib/utils/exportHelpers';
import type { ExportFormat } from '@/actions/reports';

export default function MyReportPage() {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});

  const handleExport = (format: ExportFormat) => {
    exportAttendanceReport(data, format, filters);
  };

  return (
    <div>
      <SmartExportButton
        onExport={handleExport}
        variant="primary"
        size="md"
      />
    </div>
  );
}
```

---

## 🎨 التخصيص

### تخصيص ExportModal

```typescript
<ExportModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onExport={handleExport}
  title="تصدير تقرير الحضور"
  description="اختر النوع المناسب للتصدير"
/>
```

### تخصيص SmartExportButton

```typescript
<SmartExportButton
  onExport={handleExport}
  variant="secondary"      // primary | secondary
  size="lg"                // sm | md | lg
  className="custom-class"
  disabled={data.length === 0}
  isLoading={isPending}
/>
```

---

## 🔍 الفلاتر المتاحة

```typescript
interface ReportFilters {
  courseId?: string;     // تصفية حسب الحلقة
  programId?: string;    // تصفية حسب البرنامج
  studentId?: string;    // تصفية حسب الطالبة
  dateFrom?: string;     // من تاريخ (YYYY-MM-DD)
  dateTo?: string;       // إلى تاريخ (YYYY-MM-DD)
  status?: string;       // حالة الحضور (للحضور فقط)
}
```

---

## 📊 خيارات الترتيب

```typescript
type SortField = 
  | 'date'           // التاريخ
  | 'studentName'    // اسم الطالبة
  | 'studentNumber'  // رقم الطالبة
  | 'courseName'     // اسم الحلقة
  | 'status'         // الحالة
  | 'points'         // النقاط
  | 'total';         // الإجمالي

type SortOrder = 'asc' | 'desc';
```

---

## 📋 أنواع البيانات

### AttendanceReportItem
```typescript
{
  id: string;
  date: string;
  studentNumber: number;
  studentName: string;
  courseName: string;
  programName: string;
  status: string;
  statusLabel: string;
}
```

### BehaviorPointsReportItem
```typescript
{
  studentNumber: number;
  studentName: string;
  courseName: string;
  totalPoints: number;
  earlyAttendancePoints: number;
  perfectMemorizationPoints: number;
  activeParticipationPoints: number;
  timeCommitmentPoints: number;
  recordsCount: number;
  averagePerSession: number;
}
```

---

## 🎯 أفضل الممارسات

### 1. استخدام الفلاتر بذكاء
```typescript
// ❌ لا تجلب جميع البيانات بدون داعٍ
const all = await getAttendanceReportData();

// ✅ استخدم الفلاتر للحد من البيانات
const filtered = await getAttendanceReportData({
  courseId: currentCourse,
  dateFrom: startOfMonth,
  dateTo: endOfMonth
});
```

### 2. احترام صلاحيات المستخدم
```typescript
// الـ Server Actions تتعامل مع الصلاحيات تلقائياً
// ADMIN يرى كل شيء
// TEACHER يرى حلقاته فقط
// STUDENT يرى بياناته فقط
```

### 3. معالجة الأخطاء
```typescript
const result = await getAttendanceReportData(filters);

if (result.error) {
  toast.error(result.error);
  return;
}

// استخدم البيانات
processData(result.data);
```

---

## 🧪 الاختبارات

### اختبار Server Action
```typescript
// في بيئة التطوير
const result = await getAttendanceReportData(
  { courseId: 'test-course' },
  { field: 'date', order: 'desc' }
);

console.log('Data count:', result.data?.length);
console.log('First item:', result.data?.[0]);
```

### اختبار التصدير
```typescript
// تجربة التصدير
const testData = [
  {
    date: '2024-11-27',
    studentNumber: 101,
    studentName: 'فاطمة',
    statusLabel: 'حاضرة'
  }
];

exportAttendanceReport(testData, 'summary');
// تحقق من تنزيل الملف: report_attendance_summary_2024-11-27.csv
```

---

## 🐛 استكشاف الأخطاء

### مشكلة: CSV لا يعرض العربية بشكل صحيح
**الحل:** تأكد من استخدام `generateCSV` الذي يضيف BOM تلقائياً

### مشكلة: Decimal types errors
**الحل:** استخدم `Number()` للتحويل
```typescript
const total = Number(grade.memorization) + Number(grade.review);
```

### مشكلة: TypeScript errors في الفلاتر
**الحل:** تأكد من تمرير كائن وليس string
```typescript
// ❌
getAttendanceReportData(courseId)

// ✅
getAttendanceReportData({ courseId })
```

---

## 📚 موارد إضافية

- [Prisma Decimal Documentation](https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-decimal)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [CSV UTF-8 BOM](https://en.wikipedia.org/wiki/Byte_order_mark#UTF-8)

---

## 🤝 المساهمة

عند إضافة تقرير جديد:

1. أضف Server Action في `reports.ts`
2. أضف Type في نفس الملف
3. أضف Export function في `exportHelpers.ts`
4. وثّق الاستخدام في هذا الملف

---

**آخر تحديث:** 27 نوفمبر 2025 (Session 20.1)
