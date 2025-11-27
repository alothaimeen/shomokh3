# 🚀 QUICK_REFERENCE - شموخ v3

> **ملخص:** البطاقة السريعة للمشروع. تحتوي على المعلومات الحرجة التي يجب معرفتها قبل كتابة أي كود.

## 🔌 Database Connection (نسخ ولصق)
```bash
postgresql://postgres:[pass]@db.[proj].supabase.co:6543/postgres?pgbouncer=true
```

## 🛡️ القواعد الحرجة (3 أسطر لكل قاعدة)
- **IDOR Check:** Always verify: Session + Role + Ownership (في كل Server Action/API).
- **Port:** 6543 (NEVER 5432) - Supabase Transaction Pooler.
- **Naming:** camelCase everywhere (`userId`, NOT `user_id`).
- **Zombie Code:** ❌ `api/tasks` | ❌ `testUsers` | ❌ Port 5432

## 📋 أنماط جاهزة (Patterns)

### 1. Server Action (Write)
```typescript
'use server';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';

export async function myAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: 'غير مصرح' };
  
  // Ownership Check Here
  
  await db.model.create({ ... });
  revalidatePath('/path');
  return { success: true, message: 'تم الحفظ' };
}
```

### 2. Server Component + Suspense (Read)
```typescript
import { Suspense } from 'react';
import { auth } from '@/lib/auth';

export default async function Page({ searchParams }) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  return (
    <>
      <AppHeader title="العنوان" />
      <Suspense fallback={<DataSkeleton />}>
        <DataAsync params={searchParams} />
      </Suspense>
    </>
  );
}
```

## 📍 مسارات مهمة (Critical Paths)
| الغرض | المسار |
|------|--------|
| الصفحة الرئيسية | `src/app/page.tsx` → `/` (عامة) |
| Dashboard | `src/app/(dashboard)/dashboard/page.tsx` → `/dashboard` (محمية) |
| Schema | `prisma/schema.prisma` (مصدر الحقيقة) |
| Types | `src/types/index.ts` (الأنواع الموحدة) |

## 🔧 حلول الأخطاء الشائعة
| الخطأ | السبب | الحل |
|------|-------|-----|
| `P1001` | منفذ خاطئ | استخدم **6543** + `pgbouncer=true` |
| `useActionState` missing | React قديم | تأكد من `React 19` |
| `403 Forbidden` | صلاحيات | تحقق من `role` و `ownership` |

## 🚨 Known Errors Registry (من تجربتنا الفعلية)

### Error: useActionState is not a function
- **الجلسة:** 18
- **السبب:** استخدام React 18 بدل React 19
- **الحل:** `npm install react@rc react-dom@rc --legacy-peer-deps`
- **كيف فشل AI:** افترض أن React 18 كافٍ لـ Next.js 15
- **الدرس:** دائماً تحقق من متطلبات Next.js الدقيقة

### Error: P1001 Connection Timeout
- **الجلسة:** 8, 15 (متكرر)
- **السبب:** استخدام Port 5432 بدل 6543
- **الحل:** `DATABASE_URL` يجب أن يحتوي على `:6543/postgres?pgbouncer=true`
- **كيف فشل AI:** نسخ connection string من مثال عام
- **الدرس:** Supabase مختلف عن PostgreSQL العادي

### Error: 403 Forbidden on Server Actions
- **الجلسة:** 18
- **السبب:** عدم التحقق من الملكية (Ownership)
- **الحل:** إضافة Ownership Check قبل أي عملية DB
- **النمط الصحيح:** `Session → Role → Ownership → DB Operation`
- **الدرس:** لا تثق أبداً في IDs القادمة من Client

## 📖 Glossary - قاموس المصطلحات

### 🔒 Security Terms
- **IDOR:** Insecure Direct Object Reference - ثغرة تسمح بالوصول لبيانات مستخدمين آخرين
- **Ownership Check:** التحقق من أن المستخدم يملك البيانات قبل السماح بالعملية

### 🏗️ Architectural Terms
- **Server Components:** مكونات React تعمل على الخادم فقط، تجلب البيانات مباشرة من DB
- **Server Actions:** دوال تعمل على الخادم لعمليات الكتابة (Mutations)
- **Route Groups:** مجلدات بأقواس `(name)` لا تؤثر على URL لكن تشارك Layout واحد
- **Streaming:** تقنية لإرسال أجزاء الصفحة تدريجياً بدل الانتظار لكل البيانات

### 🎨 UI/UX Terms
- **High-Fidelity Skeletons:** شاشات تحميل تشبه المحتوى الحقيقي بالضبط (نفس الألوان والأحجام)
- **Suspense Boundary:** نقطة في الصفحة يمكن أن تعرض fallback UI أثناء تحميل البيانات
- **Progressive Enhancement:** بناء الواجهة بشكل تدريجي من الأساسيات إلى التحسينات

### 🧟 Legacy/Deprecated Terms (DO NOT USE)
- **Zombie Code:** كود قديم غير مستخدم لكنه ما زال موجوداً (مثل `api/tasks`, `testUsers`)
- **testUsers:** ❌ FORBIDDEN - See DECISION_LOG.md
- **Port 5432:** ❌ FORBIDDEN - Use 6543

---
**ملاحظة:** اقرأ هذا الملف في بداية كل جلسة لتنشيط الذاكرة.
