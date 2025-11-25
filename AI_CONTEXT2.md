# 🤖 AI Context - منصة شموخ v3 (الإصدار 2.0)

**آخر تحديث:** 25 نوفمبر 2025  
**الحالة:** الجلسة 19 مكتملة - Navigation Performance (5 مراحل)  
**البروتوكول:** Code Gear Protocol (ترس الشفرة)  
**Branch:** feat/route-groups-phase1

---

## 📋 نظرة عامة

**Stack:** Next.js 15, React 19, TypeScript, Prisma, Supabase PostgreSQL  
**Roles:** ADMIN, TEACHER, STUDENT  
**Model:** Multi-Tenant (قاعدة بيانات منفصلة لكل جمعية)  
**Progress:** 18 + 19/36 (~53%)

---

## 🛡️ حالة الأمان (أولوية قصوى)

### ✅ قاعدة البيانات
- سليمة 100% (لا سجلات يتيمة)
- جميع العلاقات صحيحة (Users <-> Students <-> Courses)

### 🚨 ثغرات IDOR المعروفة
**ملفان مصابان:**
1. `src/app/api/grades/route.ts`
2. `src/app/api/enrollment/manage-request/route.ts`

**الحل الإلزامي:** Ownership Check في كل Server Action/API Route  
**قاعدة:** لا تثق في الواجهة الأمامية أبداً - تحقق من Session + Role + Ownership

---

## 🔄 بروتوكول ترس الشفرة (5 قواعد إلزامية)

1. **التأسيس أولاً:** لا كتابة ملفات قبل موافقة المستخدم
2. **وحدة واحدة فقط:** بناء وحدة وظيفية واحدة في كل مرة
3. **التحرير الآمن:** اقرأ → فكّر → نفّذ (لكل ملف تعدله)
4. **قانون جاكوب:** الواجهة المألوفة > المبتكرة
5. **لا حذف بدون بديل:** ❌ لا تحذف ملفات/Schema في هذه المرحلة

---

## 🏗️ القرارات المعمارية (Session 18)

### الانتقال
**من:** Client Fetch → API Routes → DB  
**إلى:** Server Components → DB | Client → Server Actions → DB  
**نتيجة:** -60% كود, -70% bundle, +40% سرعة

### ملفات معيارية جديدة
- `src/types/index.ts` - أنواع موحدة
- `src/lib/data/queries.ts` - استعلامات Server-side
- `src/lib/auth-helpers.ts` - requireAuth, requireRole, requireTeacher
- `src/actions/` - Server Actions (enrollment, attendance, grades)

### Zombie Code
- ❌ `src/app/api/tasks` - تجاهله تماماً، استخدم `api/points`
- ❌ `testUsers` في auth.ts - ممنوع، استخدم DB فقط
- ✅ استخدم `userId` دائماً (ليس userName/email)

---

## 🚨 Supabase (قواعد حرجة)

### الإعداد الوحيد
```
DATABASE_URL="postgresql://postgres:[pass]@db.[proj].supabase.co:6543/postgres?pgbouncer=true"
```

### المحظورات
❌ Port 5432 | ❌ prisma db push | ❌ prisma migrate dev | ❌ DIRECT_URL

### تعديل Schema
```typescript
await prisma.$executeRawUnsafe(`...`);
npm run db:setup
```

---

## 📏 معايير التسمية (إلزامي)

**camelCase في كل مكان:**
```typescript
userName, userEmail, passwordHash, userRole, isActive, courseName, maxStudents
```
❌ name, email, max_students

---

## 🗄️ Schema الأساسي

```
User (teachers) ──< Course >── Program
                      │
                      ├── EnrollmentRequest >── Student
                      ├── Enrollment >── Student
                      ├── Attendance >── Student
                      └── DailyGrade >── Student
```

**AttendanceStatus:** PRESENT, EXCUSED, ABSENT, REVIEWED, LEFT_EARLY

---

## 🎯 الأنماط الأساسية (Sessions 18-19)

### 1. Server Action Pattern
```typescript
'use server';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function saveAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }
  
  // Extract and validate data
  const data = formData.get('field') as string;
  
  // Database operation
  await db.model.create({ data });
  
  // Revalidate paths
  revalidatePath('/path');
  return { success: true, message: 'تم الحفظ' };
}
```

### 2. Server Component Pattern (Basic)
```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDataFromDB } from '@/lib/data/queries';

export default async function Page({ searchParams }: { searchParams: Promise<{...}> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const params = await searchParams;
  const data = await getDataFromDB(params.id);
  
  return <ClientForm data={data} />;
}
```

### 3. Server Component with Suspense (Session 18.3 - Advanced)
```typescript
import { Suspense } from 'react';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DataAsync from '@/components/DataAsync';
import DataSkeleton from '@/components/DataSkeleton';

export default async function Page({ searchParams }: { searchParams: Promise<{...}> }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const params = await searchParams;
  
  return (
    <>
      <Header title="عنوان الصفحة" />
      <div className="p-8">
        {/* Progressive Loading مع Suspense */}
        <Suspense fallback={<DataSkeleton />}>
          <DataAsync params={params} />
        </Suspense>
      </div>
    </>
  );
}
```

### 4. Async Server Component Pattern
```typescript
import { db } from '@/lib/db';

interface Props {
  params: { id: string };
}

export default async function DataAsync({ params }: Props) {
  // جلب البيانات (async operation)
  const data = await db.model.findMany({
    where: { id: params.id },
    include: { relation: true }
  });
  
  return (
    <div>
      {/* عرض البيانات */}
      {data.map(item => <Item key={item.id} data={item} />)}
    </div>
  );
}
```

### 5. Skeleton Component Pattern
```typescript
export default function DataSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="h-16 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### 6. Client Form with useTransition
```typescript
'use client';
import { useState, useTransition } from 'react';
import { saveAction } from '@/actions/example';

export default function Form({ data }) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    startTransition(async () => {
      const result = await saveAction(formData);
      setMessage(result.success ? result.message : result.error);
    });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 7. Data Query with React.cache
```typescript
import { cache } from 'react';
import { db } from '@/lib/db';

export const getData = cache(async (id: string) => {
  return await db.model.findMany({
    where: { id },
    include: { relation: true },
    orderBy: { field: 'asc' }
  });
});
```

---

## 🛡️ بروتوكولات الأمان

### قبل البدء
1. اقرأ AI_CONTEXT2.md
2. اقرأ COMPREHENSIVE_UPGRADE_PLAN4.md
3. npm run dev - تأكد أن كل شيء يعمل

### أثناء العمل
- ✅ ميزة واحدة لكل جلسة
- ✅ اختبار فوري بعد كل تغيير
- ✅ commit بعد كل نجاح
- ✅ Ownership Check في كل عملية تعديل/حذف
- ❌ لا افتراضات
- ❌ لا انتقال قبل npm run build ينجح

### بعد الانتهاء
1. npm run build - صفر أخطاء
2. حدّث PROJECT_TIMELINE.md
3. commit

---

## 🚨 الفرق المهم

**الصفحة الرئيسية:** `src/app/page.tsx` → `/` (عامة، قبل تسجيل الدخول)  
**Dashboard:** `src/app/dashboard/page.tsx` → `/dashboard` (محمية، بعد تسجيل الدخول)

---

## 📊 ملفات القراءة الإلزامية

1. **AI_CONTEXT2.md** (هذا الملف) - القواعد التقنية
2. **PROJECT_TIMELINE.md** - تاريخ الجلسات والإنجازات
3. **بروتوكول ترس الشفرة.md** - قواعد التنفيذ

**مرجعية:**
- `schema.prisma` - مصدر الحقيقة
- `src/types/index.ts` - الأنواع
- `src/lib/data/queries.ts` - الاستعلامات
- `docs/navigation-improvement/` - معايير الأداء والتنقل
- `assurance_report.md` - الأمان

---

## 🚀 الجلسات 18-19: الترقية الكاملة

**الجلسة 18 (23-24 نوفمبر - React 19 + Server Components):**
1. **18.0:** التأسيس + الأمان (ترقية + إزالة testUsers + auth-helpers)
2. **18.1:** Server Actions للطلاب (enrollment + types + queries)
3. **18.2:** Server Components - Admin Pages (users, students, teacher-requests)
4. **18.3:** Server Components - Grades Pages (daily, weekly, monthly, behavior)
5. **18.4:** Server Components - Student & Attendance (my-grades, attendance)
- **النتيجة:** 16 صفحة محولة + 10 Server Actions جديدة

**الجلسة 19 (25 نوفمبر - Navigation Performance):**
1. **19.1:** Route Groups - Sidebar ثابت (تحسين 80%)
2. **19.2:** Loading State - loading.tsx فوري
3. **19.3:** Error Boundary - error.tsx للأخطاء
4. **19.4:** Sidebar Transition - useTransition للاستجابة الفورية
5. **19.5:** Suspense - تحميل تدريجي مع Skeleton UI

**المراجع:**
- `PROJECT_TIMELINE.md` - تاريخ كامل للجلسات
- `docs/navigation-improvement/` - الجلسة 19 (5 مراحل)

---

## 💡 دروس مستفادة

- userId/teacherId > userName/email
- Response format consistency مهم
- Hook interfaces تحتاج conditional calls
- Server Actions > Client Fetch (أمان + أداء)
- Ownership Check = إلزامي
- لا Schema changes في هذه المرحلة
- Route Groups للصفحات المشتركة (Sidebar واحد)
- Suspense للصفحات ذات البيانات الكثيرة (progressive loading)
- useTransition للاستجابة الفورية (< 16ms)

## 🎨 معايير الصفحات الجديدة (Session 19+)

**لكل صفحة محمية جديدة:**
1. ✅ تكون داخل `(dashboard)` route group
2. ✅ استخدم Server Component (async function)
3. ✅ إذا كانت البيانات > 100 سجل → استخدم Suspense
4. ✅ أنشئ Async Component + Skeleton Component
5. ✅ لا تضع Sidebar في الصفحة (موجود في Layout)

**مثال التطبيق:**
```typescript
// ✅ صفحة جديدة صحيحة
import { Suspense } from 'react';
import DataAsync from '@/components/DataAsync';
import DataSkeleton from '@/components/DataSkeleton';

export default async function NewPage({ searchParams }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const params = await searchParams;
  
  return (
    <>
      <AppHeader title="العنوان" />
      <div className="p-8">
        <Suspense fallback={<DataSkeleton />}>
          <DataAsync params={params} />
        </Suspense>
      </div>
    </>
  );
}
```

---

## 🔧 أخطاء شائعة

| الخطأ | الحل |
|-------|------|
| P1001 | استخدم :6543 + ?pgbouncer=true |
| useActionState not found | ترقية React 19 |
| 'use client' missing | أضف في أول ملف Client Component |

---

**📅 مرجع ثابت - يُقرأ مرة واحدة في بداية كل جلسة**
