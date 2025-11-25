# ⚡ خطة تحسين تحميل لوحة التحكم (Streaming)

**المشكلة:** الصفحة تنتظر تحميل البيانات بالكامل قبل أن تظهر (بسبب `await` في المستوى الأعلى).  
**الهدف:** ظهور هيكل الصفحة فوراً (Header, ترحيب) ثم ظهور البيانات تدريجياً.

---

## 🛠️ التغييرات المطلوبة

### 1. فصل جلب البيانات (Refactoring)
سنقوم بنقل منطق جلب البيانات من `page.tsx` إلى مكونات منفصلة (Async Components).

#### الملفات الجديدة المقترحة:
1. `src/components/dashboard/AdminStatsAsync.tsx`
2. `src/components/dashboard/TeacherCoursesAsync.tsx`
3. `src/components/dashboard/StudentEnrollmentsAsync.tsx`

### 2. تحديث الصفحة الرئيسية
تعديل `src/app/(dashboard)/dashboard/page.tsx` ليكون سريعاً جداً (بدون `await` للبيانات الثقيلة).

---

## 📝 تفاصيل التنفيذ

### خطوة 1: إنشاء مكونات جلب البيانات

#### `AdminStatsAsync.tsx`
```tsx
import { db } from '@/lib/db';
import AdminDashboard from './AdminDashboard';

export default async function AdminStatsAsync() {
  // نقل كود جلب البيانات هنا
  const [totalUsers, totalStudents, totalPrograms, totalCourses] = await Promise.all([
    db.user.count(),
    db.student.count(),
    db.program.count(),
    db.course.count()
  ]);
  
  const stats = { totalUsers, totalStudents, totalPrograms, totalCourses };
  return <AdminDashboard stats={stats} />;
}
```

*(نفس النمط للمعلم والطالب)*

### خطوة 2: تحديث `page.tsx`

```tsx
import { Suspense } from 'react';
import AdminStatsAsync from '@/components/dashboard/AdminStatsAsync';
// ... imports

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const role = session.user.role;

  return (
    <>
      <AppHeader title="لوحة التحكم" />
      <div className="p-8">
        {/* الجزء الثابت يظهر فوراً */}
        <div className="mb-6...">
          <h1>مرحباً، {session.user.name}</h1>
          <HijriDateDisplay />
        </div>

        {/* البيانات تحمل في الخلفية */}
        {role === 'ADMIN' && (
          <Suspense fallback={<div className="animate-pulse...">جاري تحميل الإحصائيات...</div>}>
            <AdminStatsAsync />
          </Suspense>
        )}
        
        {/* ... باقي الأدوار */}
      </div>
    </>
  );
}
```

---

## ⚠️ ملاحظة حول `loading.tsx`
ملف `loading.tsx` الذي أنشأناه في المرحلة 2 يعمل كـ "Global Loader" للصفحة.
عندما نطبق التغييرات أعلاه، `loading.tsx` سيختفي بسرعة جداً (لأن الصفحة الرئيسية لم تعد تنتظر البيانات)، وسيظهر المحتوى الثابت فوراً، ثم تظهر البيانات داخل حدود `Suspense`.

هذا هو السلوك الذي طلبته بالضبط! ✅

---

## 🚀 خطوات التنفيذ
1. إنشاء المكونات الجديدة (Async Components).
2. تعديل `dashboard/page.tsx`.
3. التحقق من النتيجة.
