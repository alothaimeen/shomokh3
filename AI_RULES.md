---
title: "AI_RULES"
version: "1.1"
last_updated: "2025-12-05"
status: "stable"
description: "القواعد التقنية، البروتوكولات، وأنماط التصميم المعتمدة في مشروع شموخ v3"
---

# 📜 AI RULES - دستور التطوير (منصة شموخ v3)

> **ملخص:** هذا الملف هو المرجع التقني الثابت. يحتوي على القواعد الصارمة، أنماط الكود (Patterns)، وبروتوكولات الأمان التي يجب الالتزام بها في كل سطر كود.

## 📚 فهرس
- [1. نظرة عامة والتقنيات](#1-نظرة-عامة-والتقنيات)
- [2. قواعد الأمان (أولوية قصوى)](#2-قواعد-الأمان-أولوية-قصوى)
- [3. بروتوكول ترس الشفرة](#3-بروتوكول-ترس-الشفرة)
- [4. القرارات المعمارية](#4-القرارات-المعمارية)
- [5. أنماط التصميم (Design Patterns)](#5-أنماط-التصميم-design-patterns)
- [6. قواعد قاعدة البيانات (Supabase)](#6-قواعد-قاعدة-البيانات-supabase)
- [7. معايير التسمية والكود](#7-معايير-التسمية-والكود)
- [8. دروس مستفادة وأخطاء شائعة](#8-دروس-مستفادة-وأخطاء-شائعة)

---

## 1. نظرة عامة والتقنيات

- **Stack:** Next.js 15, React 19, TypeScript, Prisma, Supabase PostgreSQL
- **Styling:** Tailwind CSS (Vanilla)
- **Roles:** `ADMIN`, `TEACHER`, `STUDENT`
- **Architecture:** Server Components First + Server Actions
- **Model:** Multi-Tenant (قاعدة بيانات منفصلة منطقياً لكل جمعية)

---

## 2. قواعد الأمان (أولوية قصوى) 🛡️

<CRITICAL_RULE type="security" severity="P0">

### ✅ التحقق من الملكية (Ownership Check)
يجب التحقق من الملكية في **كل** Server Action أو API Route. لا تثق أبداً في البيانات القادمة من الواجهة الأمامية (مثل `studentId` أو `courseId`).

**القاعدة:**
1. تحقق من الجلسة (`auth`).
2. تحقق من الدور (`role`).
3. تحقق من ملكية البيانات (هل المعلمة تملك هذه الحلقة؟ هل الطالبة تملك هذا السجل؟).

**Violation Consequence:** Security breach, IDOR vulnerability, data leak

</CRITICAL_RULE>

### 🚨 ثغرات IDOR المعروفة
- تم تأمين `src/app/api/grades/route.ts` و `src/app/api/enrollment/manage-request/route.ts`.
- **أي ملف جديد** يتعامل مع بيانات المستخدمين يجب أن يمر بمراجعة أمنية صارمة.

---

## 3. بروتوكول ترس الشفرة 🔄

**القواعد الخمس الإلزامية:**
1.  **التأسيس أولاً:** لا كتابة ملفات قبل موافقة المستخدم على الخطة.
2.  **وحدة واحدة فقط:** بناء وحدة وظيفية واحدة في كل مرة (لا تشتت الجهد).
3.  **التحرير الآمن:** اقرأ الملف ← فكّر في التغيير ← نفّذ التغيير (لا نسخ ولصق أعمى).
4.  **قانون جاكوب:** الواجهة المألوفة > الواجهة المبتكرة.
5.  **لا حذف بدون بديل:** ❌ لا تحذف ملفات أو أعمدة في الـ Schema إلا بوجود بديل جاهز ومختبر.

### 🚨 قاعدة تحذيرات البناء (Build Warnings)

<CRITICAL_RULE type="code_quality" severity="P1">

**يجب إصلاح تحذيرات البناء فوراً عند ظهورها** في نفس الجلسة التي تظهر فيها.

**السبب:** 
- التحذيرات التي تتراكم يصعب إصلاحها لاحقاً لفقدان السياق
- النموذج اللغوي يفهم الكود المعني بشكل أفضل وقت كتابته
- التأخير يؤدي إلى إصلاحات عشوائية (مثل `eslint-disable`) بدلاً من الإصلاح الصحيح

**الإجراء:**
1. بعد كل `npm run build`، تحقق من وجود تحذيرات
2. إذا ظهرت تحذيرات، أصلحها فوراً قبل الانتقال للمهمة التالية
3. إذا كان الإصلاح مستحيلاً، سجّل التحذير في `PROJECT_TIMELINE.md` مع السبب

**الأنماط الصحيحة:**
- ✅ استخدام `useCallback` لدوال الـ fetch داخل `useEffect`
- ✅ إضافة الدالة إلى مصفوفة dependencies
- ❌ استخدام `eslint-disable-next-line` للتجاهل

</CRITICAL_RULE>

---

## 4. القرارات المعمارية 🏗️

### الانتقال إلى Server Components
- **من:** Client Fetch (`useEffect`) → API Routes → DB
- **إلى:** Server Components (Direct DB) | Client (`useTransition`) → Server Actions → DB
- **الهدف:** تقليل كود الـ Client، تحسين الأداء، وزيادة الأمان.

### ملفات معيارية (Core Files)
- `src/types/index.ts`: جميع الأنواع (Types/Interfaces) الموحدة.
- `src/lib/data/queries.ts`: استعلامات قاعدة البيانات (Server-side only).
- `src/lib/auth-helpers.ts`: دوال التحقق (`requireAuth`, `requireRole`).
- `src/actions/*.ts`: جميع عمليات الكتابة (Mutations) تكون هنا.

<FORBIDDEN action="code_patterns" enforcement="permanent">

### Zombie Code (كود ميت)
- ❌ **FORBIDDEN:** `src/app/api/tasks` (مهجور، استخدم `api/points`)
- ❌ **FORBIDDEN:** `testUsers` في `auth.ts` (ثغرة أمنية - انظر DECISION_LOG.md)
- ✅ **REQUIRED:** استخدم `userId` دائماً للربط (وليس `userName` أو `email`)

**Rationale:** Security vulnerabilities and deprecated patterns
**See:** DECISION_LOG.md for historical context

</FORBIDDEN>

---

## 5. أنماط التصميم (Design Patterns) 🎯

### Pattern 1: Server Action (للكتابة)
```typescript
'use server';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function saveAction(formData: FormData) {
  // 1. Auth & Role Check
  const session = await auth();
  if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
    return { success: false, error: 'غير مصرح' };
  }
  
  // 2. Validation & Logic
  const data = formData.get('field') as string;
  
  // 3. DB Operation
  await db.model.create({ data });
  
  // 4. Revalidate
  revalidatePath('/path');
  return { success: true, message: 'تم الحفظ' };
}
```

### Pattern 2: Server Component with Suspense (للقراءة)
```typescript
import { Suspense } from 'react';
import DataAsync from '@/components/DataAsync';
import DataSkeleton from '@/components/DataSkeleton';

export default async function Page({ searchParams }) {
  return (
    <>
      <Header title="العنوان" />
      <div className="p-8">
        <Suspense fallback={<DataSkeleton />}>
          <DataAsync params={searchParams} />
        </Suspense>
      </div>
    </>
  );
}
```

### Pattern 3: Async Component (جلب البيانات)
```typescript
import { db } from '@/lib/db';

export default async function DataAsync({ params }) {
  // Direct DB Query
  const data = await db.model.findMany({ ... });
  return <DataDisplay data={data} />;
}
```

### Pattern 4: معايير الصفحات الجديدة (من Session 19 فصاعداً)

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

## 6. قواعد قاعدة البيانات (Supabase) 🗄️

<FORBIDDEN action="database" enforcement="strict">

### ⚠️ تنبيه: مشروع Supabase جديد (5 ديسمبر 2025)
تم ترحيل قاعدة البيانات إلى مشروع جديد:
- **Project Name:** ShomokhQ
- **Project ID:** dlfeucrbrkcywnwjxlaz
- **Region:** `aws-1-ap-southeast-2` (Asia-Pacific)

### الاتصال (Connection)
- ✅ **للاستخدام العادي:** Port **6543** مع `?pgbouncer=true`
  ```
  DATABASE_URL="postgresql://postgres.dlfeucrbrkcywnwjxlaz:[pass]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
  ```
- ✅ **لـ prisma db push فقط:** Port **5432** (بدون pgbouncer)
  ```
  DATABASE_URL="postgresql://postgres.dlfeucrbrkcywnwjxlaz:[pass]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
  ```

### المحظورات
- ❌ **NEVER** المنطقة القديمة `us-west-1` (المشروع الجديد في `ap-southeast-2`)
- ❌ **NEVER** `prisma migrate dev` (يحتاج DIRECT_URL غير متاح)
- ❌ **NEVER** prisma db push مع منفذ 6543 (يعلق للأبد)

**خطوات إنشاء/تحديث الجداول:**
1. غيّر `.env` لاستخدام منفذ 5432
2. نفّذ `npx prisma db push --accept-data-loss`
3. أعد `.env` لمنفذ 6543
4. نفّذ `npx prisma generate`

**Error if violated:** P1001 Connection Timeout أو "Tenant or user not found"

</FORBIDDEN>

### Schema Modifications
- ✅ لتعديل الـ Schema: استخدم SQL Editor أو `prisma db push` بحذر شديد وفقط بعد الموافقة.

---

## 7. معايير التسمية والكود 📏

- **camelCase:** للمتغيرات والدوال (`userName`, `isActive`, `calculateTotal`).
- **PascalCase:** للمكونات والملفات (`UserProfile.tsx`, `DailyGrades`).
- **kebab-case:** للمجلدات والمسارات (`/my-grades`, `/user-profile`).
- **الإنجليزية:** جميع المتغيرات والتعليقات البرمجية بالإنجليزية.
- **العربية:** واجهة المستخدم فقط.

---

## 8. دروس مستفادة وأخطاء شائعة 💡

- **userId vs Email:** الاعتماد على `userId` هو الأصح والأكثر أماناً.
- **Route Groups:** استخدم `(dashboard)` للمسارات المحمية لتوحيد الـ Layout.
- **Streaming:** استخدم `Suspense` للصفحات الثقيلة لتحسين تجربة المستخدم.
- **P1001 Error:** يعني عادةً مشكلة في الاتصال بـ Supabase (تأكد من المنفذ 6543).
- **useActionState:** تأكد من أنك تستخدم React 19.

---

## 📖 ملفات المشروع المرجعية

### للقراءة اليومية
1. **[AI_RULES.md](AI_RULES.md)** (هذا الملف) - القواعد التقنية والأنماط
2. **[PROJECT_TIMELINE.md](PROJECT_TIMELINE.md)** - الجلسات المكتملة والمخططة
3. **[CURRENT_STATUS.md](CURRENT_STATUS.md)** - الحالة الحالية والمهام النشطة
4. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - البطاقة السريعة والحلول الجاهزة

### للمرجعية عند الحاجة
- **[PROJECT_MAP.md](PROJECT_MAP.md)** - خريطة الملفات والمجلدات
- **[docs/history/](docs/history/)** - الأرشيف التاريخي للجلسات القديمة (1-17)

---

**⏰ متى يُحدّث هذا الملف؟**
- ✅ عند إضافة قاعدة تقنية جديدة (port، naming conventions، security rules)
- ✅ عند اعتماد نمط تصميم جديد (Pattern 5, 6, ...)
- ✅ عند اكتشاف ثغرة أمنية تحتاج لقاعدة صارمة
- ❌ لا يُحدّث لمجرد إكمال جلسة عمل عادية

---

**ملاحظة:** يتم تحديث هذا الملف عند إضافة قواعد تقنية جديدة أو أنماط تصميم معتمدة فقط.
