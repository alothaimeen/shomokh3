# ⚡ خطة تحسين الأداء - منصة شموخ v3

**تاريخ الإنشاء:** 20 نوفمبر 2025  
**الهدف:** حل مشكلة البطء في التنقل وتحميل البيانات  
**المدة الإجمالية:** 6-8 ساعات (جلستان)

---

## 🎯 المشكلة

من التحليل الشامل تم اكتشاف:
- 🔴 جميع الصفحات Client Components (استخدام 'use client' في كل مكان)
- 🔴 استعلامات متسلسلة (3+ fetch متتالية بدلاً من موازية)
- 🔴 لا يوجد caching مطلقاً
- 🔴 استعلامات Prisma ثقيلة (include عميق بدون select)
- 🔴 re-renders غير ضرورية (useEffect بدون dependencies صحيحة)
- 🔴 N+1 queries في الحفظ (حلقة لكل طالبة)

**النتيجة:** بطء ملحوظ في التنقل وتحميل البيانات

---

## 📅 الجلسات

---

## ✅ الجلسة PERF-1: التحسينات السريعة (3-4 ساعات)

**الأولوية:** عالية جداً  
**التأثير المتوقع:** تقليل 40-50% من وقت التحميل

### المهام:

#### 1. Parallel Data Fetching (60 دقيقة)

**الملفات المتأثرة:** 10+ صفحات

**قبل:**
```typescript
// ❌ استعلامات متسلسلة
useEffect(() => { fetchStats(); }, [session]);
useEffect(() => { fetchCourses(); }, [session]);
useEffect(() => { fetchEnrollments(); }, [session]);
```

**بعد:**
```typescript
// ✅ استعلامات موازية
useEffect(() => {
  const fetchAllData = async () => {
    const [stats, courses, enrollments] = await Promise.all([
      fetch('/api/dashboard/stats'),
      fetch('/api/courses/teacher-courses'),
      fetch('/api/enrollment/my-enrollments')
    ]);
    // معالجة النتائج...
  };
  fetchAllData();
}, [session]);
```

**الصفحات المستهدفة:**
- `src/app/dashboard/page.tsx` - 3 استعلامات → 1
- `src/app/attendance/page.tsx` - 2 استعلامات → 1
- `src/components/assessment/DailyGradesTab.tsx` - 6 استعلامات → تحسين

#### 2. useCallback للدوال (45 دقيقة)

**المشكلة:** functions تُعاد كتابتها في كل render

**الحل:**
```typescript
// ❌ قبل
const fetchData = async () => { /* ... */ };

// ✅ بعد
const fetchData = useCallback(async () => {
  /* ... */
}, [dependencies]);
```

**الصفحات المستهدفة:**
- `src/app/attendance/page.tsx` - 2 functions
- `src/app/daily-grades/page.tsx` - 3 functions
- `src/app/enrolled-students/page.tsx` - 2 functions
- 10+ صفحات أخرى

#### 3. Bulk APIs (90 دقيقة)

**المشكلة:** N+1 queries في الحفظ

**قبل:**
```typescript
// ❌ حلقة - 20 طالبة = 20 request
students.map(s => fetch('/api/attendance/mark', {...}));
```

**بعد:**
```typescript
// ✅ endpoint موحد
fetch('/api/attendance/bulk-mark', {
  method: 'POST',
  body: JSON.stringify({ records: [...] })
});
```

**APIs الجديدة:**
- `/api/attendance/bulk-mark` - حفظ حضور جماعي
- `/api/grades/bulk-save` - حفظ درجات جماعي
- `/api/points/bulk-save` - حفظ نقاط جماعي

#### 4. Prisma Select (45 دقيقة)

**المشكلة:** جلب بيانات غير مستخدمة

**قبل:**
```typescript
// ❌ جلب كل الحقول
const enrollments = await db.enrollment.findMany({
  include: { student: true, course: true }
});
```

**بعد:**
```typescript
// ✅ حقول محددة فقط
const enrollments = await db.enrollment.findMany({
  select: {
    id: true,
    student: { select: { id: true, studentName: true } },
    course: { select: { id: true, courseName: true } }
  }
});
```

**APIs المستهدفة:**
- `/api/enrollment/enrolled-students` - 9 حقول → 4
- `/api/grades/academic-report` - تحسين include
- `/api/attendance/course-attendance` - تحسين

### معايير النجاح:
- ✅ Dashboard: من 1.5s → 500ms
- ✅ Attendance: من 800ms → 350ms
- ✅ DailyGrades: من 1.2s → 450ms
- ✅ npm run build ينجح
- ✅ لا أخطاء في console

---

## ✅ الجلسة PERF-2: التحسينات المتقدمة (3-4 ساعات)

**الأولوية:** متوسطة  
**التأثير المتوقع:** تقليل إضافي 30-40%

### المهام:

#### 1. React Server Components (90 دقيقة)

**الهدف:** تحويل الصفحات الثابتة إلى RSC

**الصفحات المستهدفة:**
- `src/app/about/page.tsx` - ثابتة بالكامل
- `src/app/about/achievements/page.tsx` - ثابتة
- `src/app/about/contact/page.tsx` - نموذج فقط Client

**الفائدة:** تقليل JavaScript المُرسل للعميل

#### 2. Next.js Caching (60 دقيقة)

**استراتيجية 1: Server-side Revalidation**
```typescript
// في API routes
export const revalidate = 60; // 1 دقيقة

export async function GET() {
  const data = await db.program.findMany();
  return NextResponse.json(data);
}
```

**استراتيجية 2: React Cache**
```typescript
import { cache } from 'react';

export const getPrograms = cache(async () => {
  return await db.program.findMany();
});
```

**APIs المستهدفة:**
- `/api/programs` - revalidate: 300 (5 دقائق)
- `/api/courses` - revalidate: 180 (3 دقائق)
- `/api/dashboard/stats` - revalidate: 60 (1 دقيقة)

#### 3. Database Indexing (45 دقيقة)

**الهدف:** تسريع الاستعلامات الشائعة

**Indexes المطلوبة:**
```prisma
model Enrollment {
  // إضافة indexes
  @@index([studentId, courseId])
  @@index([courseId, isActive])
}

model DailyGrade {
  @@index([studentId, courseId, date])
}

model Attendance {
  @@index([courseId, date])
}
```

#### 4. React.memo للمكونات (45 دقيقة)

**المكونات المستهدفة:**
```typescript
// في DailyGradesTab
const StudentCard = React.memo(({ student, onChange }) => {
  // المكون
}, (prevProps, nextProps) => {
  return prevProps.student.id === nextProps.student.id &&
         prevProps.student.grades === nextProps.student.grades;
});
```

**المكونات:**
- `StudentCard` في DailyGradesTab
- `CourseCard` في Dashboard
- `AttendanceRow` في Attendance

### معايير النجاح:
- ✅ صفحات ثابتة لا تحمل JS غير ضروري
- ✅ تقليل استعلامات DB المكررة بنسبة 70%
- ✅ تحسين وقت الاستعلامات بنسبة 40%
- ✅ npm run build ينجح
- ✅ لا regression في الوظائف

---

## 🔍 بروتوكول التحقق المبسط

### قبل البدء (5 دقائق):
```yaml
✅ قراءة: AI_CONTEXT.md + PROJECT_TIMELINE.md
✅ تحديد: الصفحات المتأثرة (قائمة)
✅ تحديد: APIs المتأثرة (قائمة)
✅ تحديد: الأدوار (ADMIN/TEACHER/STUDENT)
```

### أثناء التنفيذ (كل 3 ملفات):
```bash
npm run build  # فحص الأخطاء
# فتح الصفحة في المتصفح
# فحص console (لا errors)
```

### بعد الانتهاء (20 دقيقة):

#### 1. الفحص التلقائي:
```bash
npm run build  # يجب النجاح
```

#### 2. الاختبار اليدوي:
```yaml
ADMIN (admin@shamokh.edu):
  - /dashboard - قياس الوقت
  - صفحة معدّلة 1
  - صفحة معدّلة 2

TEACHER (teacher1@shamokh.edu):
  - /dashboard - قياس الوقت
  - /attendance - قياس الوقت
  - /unified-assessment

STUDENT (student1@shamokh.edu):
  - /dashboard - قياس الوقت
  - /my-grades
  - /daily-tasks
```

#### 3. قياس الأداء:
```javascript
// في console
console.time('load');
// تحميل الصفحة
console.timeEnd('load');
```

#### 4. Verification Log:
```markdown
**⚡ Performance Log:**
- Build: ✅ نجح
- Dashboard load: قبل 1500ms → بعد 500ms (تحسن 67%)
- Attendance: قبل 800ms → بعد 350ms (تحسن 56%)
- Console: لا أخطاء
- Tested: ADMIN ✅ | TEACHER ✅ | STUDENT ✅
- Regression: /programs - تعمل ✅
```

---

## 📊 النتائج المتوقعة

### بعد PERF-1:
| الصفحة | قبل | بعد | التحسن |
|--------|-----|-----|--------|
| Dashboard | 1500ms | 500ms | 67% |
| Attendance | 800ms | 350ms | 56% |
| DailyGrades | 1200ms | 450ms | 63% |

### بعد PERF-2:
| الصفحة | قبل | بعد | التحسن الإجمالي |
|--------|-----|-----|------------------|
| Dashboard | 1500ms | 300ms | 80% |
| Attendance | 800ms | 250ms | 69% |
| About | 600ms | 150ms | 75% |

---

## 📝 الملفات المتوقعة

### الجلسة PERF-1:
```yaml
معدّلة (15):
  - src/app/dashboard/page.tsx
  - src/app/attendance/page.tsx
  - src/app/daily-grades/page.tsx
  - src/app/enrolled-students/page.tsx
  - src/components/assessment/DailyGradesTab.tsx
  - [10+ صفحات أخرى]

جديدة (3):
  - src/app/api/attendance/bulk-mark/route.ts
  - src/app/api/grades/bulk-save/route.ts
  - src/app/api/points/bulk-save/route.ts
```

### الجلسة PERF-2:
```yaml
معدّلة (12):
  - src/app/about/page.tsx
  - src/app/api/programs/route.ts
  - src/app/api/courses/route.ts
  - src/app/api/dashboard/stats/route.ts
  - prisma/schema.prisma
  - [8+ ملفات API]

جديدة (2):
  - src/lib/cache.ts
  - scripts/add-indexes.js
```

---

## 🎯 معايير النجاح الإجمالية

- ✅ تحسن 60-70% في وقت التحميل
- ✅ تقليل استعلامات DB بنسبة 70%
- ✅ لا أخطاء جديدة في console
- ✅ جميع الوظائف تعمل كما هي
- ✅ npm run build ينجح
- ✅ اختبار جميع الأدوار ناجح

---

## ⚠️ تحذيرات مهمة

### لا تفعل:
❌ تغيير منطق العمل (business logic)  
❌ إضافة ميزات جديدة  
❌ تغيير UI  
❌ تعديل قاعدة البيانات (إلا indexes)

### افعل:
✅ تحسين الأداء فقط  
✅ اختبر كل تعديل فوراً  
✅ قِس الأداء قبل وبعد  
✅ وثّق كل تحسين

---

## 🚀 الخطوة التالية

1. مراجعة هذا الملف
2. الموافقة على الجلستين (PERF-1, PERF-2)
3. تحديد موعد التنفيذ
4. البدء بـ PERF-1

**بعد الانتهاء:** دمج في `PROJECT_TIMELINE.md` كالجلسة 17.2 و 17.3
