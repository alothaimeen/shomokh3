# 📖 دليل استخدام SWR Hooks

تم تطبيق **Client-Side Smart Caching** باستخدام مكتبة SWR في الجلسة PERF-2.

## 🎯 الفلسفة

- ✅ تحديث فوري بعد كل تعديل (mutate)
- ✅ منع استعلامات مكررة (dedupe)
- ✅ لا caching قديم (revalidation ذكية)
- ✅ تجربة reactive سلسة

---

## 📦 الملفات المضافة

### 1. Core Files
- `src/lib/fetcher.ts` - Fetcher مركزي لـ SWR
- `src/hooks/useGrades.ts` - Hook للدرجات
- `src/hooks/useAttendance.ts` - Hook للحضور
- `src/hooks/useCourses.ts` - Hook للحلقات والبرامج

### 2. API Routes (مدعومة)
- `src/app/api/grades/route.ts` - GET/POST للدرجات
- `src/app/api/attendance/route.ts` - GET للحضور

---

## 🚀 أمثلة الاستخدام

### مثال 1: جلب وحفظ الدرجات

```typescript
'use client';

import { useGrades } from '@/hooks/useGrades';

export default function GradesPage() {
  const { grades, isLoading, error, saveGrade } = useGrades({
    courseId: 'course-123',
    date: '2025-11-20',
  });

  const handleSave = async (studentId: string, memorization: number) => {
    await saveGrade({
      studentId,
      courseId: 'course-123',
      date: '2025-11-20',
      memorization,
      review: 0,
    });
    // الـ cache يتحدث تلقائياً - لا داعي لـ refetch
  };

  if (isLoading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ في التحميل</div>;

  return (
    <div>
      {grades.map(grade => (
        <div key={grade.id}>
          {grade.studentId}: {grade.memorization}
        </div>
      ))}
    </div>
  );
}
```

### مثال 2: جلب وتسجيل الحضور

```typescript
'use client';

import { useAttendance } from '@/hooks/useAttendance';
import { AttendanceStatus } from '@prisma/client';

export default function AttendancePage() {
  const { attendance, isLoading, markAttendance } = useAttendance({
    courseId: 'course-123',
    date: '2025-11-20',
  });

  const handleMark = async (studentId: string, status: AttendanceStatus) => {
    await markAttendance({
      studentId,
      courseId: 'course-123',
      date: '2025-11-20',
      status,
    });
    // تحديث فوري
  };

  return (
    <div>
      {attendance.map(record => (
        <div key={record.id}>
          {record.studentId}: {record.status}
        </div>
      ))}
    </div>
  );
}
```

### مثال 3: قوائم الحلقات

```typescript
'use client';

import { usePrograms, useCourses } from '@/hooks/useCourses';

export default function CoursesPage() {
  const { programs, isLoading: programsLoading } = usePrograms();
  const { courses, isLoading: coursesLoading } = useCourses();

  if (programsLoading || coursesLoading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h2>البرامج</h2>
      {programs.map(p => <div key={p.id}>{p.programName}</div>)}
      
      <h2>الحلقات</h2>
      {courses.map(c => <div key={c.id}>{c.courseName}</div>)}
    </div>
  );
}
```

### مثال 4: Bulk Operations

```typescript
const { saveBulkGrades } = useGrades({ courseId: 'course-123' });
const { markBulkAttendance } = useAttendance({ courseId: 'course-123' });

// حفظ درجات جماعية
await saveBulkGrades([
  { studentId: 's1', courseId: 'c1', date: '2025-11-20', memorization: 5 },
  { studentId: 's2', courseId: 'c1', date: '2025-11-20', memorization: 4 },
]);

// تسجيل حضور جماعي
await markBulkAttendance([
  { studentId: 's1', courseId: 'c1', date: '2025-11-20', status: 'PRESENT' },
  { studentId: 's2', courseId: 'c1', date: '2025-11-20', status: 'ABSENT' },
]);
```

---

## ⚙️ تكوين SWR

### إعدادات الـ Hooks

#### useGrades & useAttendance
```typescript
{
  revalidateOnFocus: true,      // تحديث عند العودة للصفحة
  dedupingInterval: 2000,       // منع استعلامات متكررة (2 ثانية)
  refreshInterval: 0,           // لا تحديث تلقائي
  revalidateOnReconnect: false, // لا تحديث عند إعادة الاتصال
}
```

#### useCourses & usePrograms
```typescript
{
  revalidateOnFocus: false,     // البرامج لا تتغير كثيراً
  dedupingInterval: 5000,       // منع استعلامات متكررة (5 ثواني)
  refreshInterval: 0,
  revalidateOnReconnect: false,
}
```

---

## 🔄 متى يحدث التحديث (Revalidation)

### تلقائياً:
1. **onFocus** - عند العودة للصفحة (للدرجات والحضور فقط)
2. **بعد mutate()** - بعد كل عملية حفظ

### لا يحدث تلقائياً:
- ❌ على فترات زمنية (refreshInterval = 0)
- ❌ عند إعادة الاتصال بالإنترنت
- ❌ على كل تبديل tabs

---

## 🎯 الفوائد

### 1. تحسين الأداء
- منع استعلامات API متكررة
- Deduplication - استعلام واحد لنفس البيانات
- تقليل الحمل على السيرفر

### 2. تجربة مستخدم أفضل
- تحديث فوري بعد التعديل
- لا انتظار لـ refetch
- واجهة reactive

### 3. كود أنظف
- لا useState معقدة
- لا useEffect متداخلة
- إدارة الأخطاء مدمجة

---

## 📊 مقارنة Before/After

### قبل (Fetch اليدوي):
```typescript
const [grades, setGrades] = useState([]);
const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchGrades = async () => {
    setLoading(true);
    const res = await fetch('/api/grades?courseId=...');
    const data = await res.json();
    setGrades(data);
    setLoading(false);
  };
  fetchGrades();
}, [courseId]);

const saveGrade = async (grade) => {
  await fetch('/api/grades', { method: 'POST', body: JSON.stringify(grade) });
  // إعادة جلب يدوياً
  await fetchGrades();
};
```

### بعد (SWR):
```typescript
const { grades, isLoading, saveGrade } = useGrades({ courseId });

// saveGrade يحدث الـ cache تلقائياً
```

**النتيجة:**
- 70% أقل كود
- أداء أفضل (deduplication)
- تحديثات أسرع

---

## 🚨 ملاحظات مهمة

### 1. التثبيت
```bash
npm install swr --legacy-peer-deps
```
(استخدمنا `--legacy-peer-deps` بسبب React 19 RC)

### 2. API Routes المطلوبة
يجب أن تُرجع APIs البيانات بهذا الشكل:
```typescript
{ success: true, data: [...] }
```

### 3. Mutate للتحديث الفوري
جميع الـ hooks توفر دالة `refresh()` أو `mutate()` للتحديث اليدوي.

### 4. Error Handling
```typescript
const { grades, error } = useGrades({ courseId });

if (error) {
  console.error('Error:', error.message, error.status);
}
```

---

## 📈 الخطوات القادمة

### PERF-2 (باقي المهام):
- ✅ Client-Side Smart Caching (مكتمل)
- ⏭️ Conditional Database Indexing
- ⏭️ Adaptive Debounced Search
- ⏭️ Optimistic Updates

### التطبيق في الصفحات:
- [ ] `src/app/attendance/page.tsx`
- [ ] `src/app/daily-grades/page.tsx`
- [ ] `src/components/assessment/DailyGradesTab.tsx`
- [ ] 10+ صفحات أخرى

---

## 🔗 المراجع

- [SWR Documentation](https://swr.vercel.app/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
