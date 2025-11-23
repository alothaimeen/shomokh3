# 🤖 AI Context - منصة شموخ v3 (الإصدار 2.0)

**آخر تحديث:** 23 نوفمبر 2025  
**الحالة:** الجلسة 18 - الترقية إلى Next.js 15 و React 19  
**البروتوكول:** Code Gear Protocol (ترس الشفرة)

---

## 📋 نظرة عامة

**Stack:** Next.js 15, React 19, TypeScript, Prisma, Supabase PostgreSQL  
**Roles:** ADMIN, TEACHER, STUDENT  
**Model:** Multi-Tenant (قاعدة بيانات منفصلة لكل جمعية)  
**Progress:** 17.5/36 (~55%)

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

## 🎯 الأنماط الأساسية

### Server Action (Session 18)
```typescript
'use server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function action(prevState: any, formData: FormData) {
  const session = await requireAuth();
  const parsed = schema.safeParse(data);
  // Check ownership
  await db.model.create({ data });
  revalidatePath('/path');
  return { success: true };
}
```

### Client Component
```typescript
'use client';
import { useActionState } from 'react';

const [state, formAction, isPending] = useActionState(action, {});
return <form action={formAction}>...</form>;
```

### Server Component
```typescript
export default async function Page() {
  const session = await requireAuth();
  const data = await db.model.findMany();
  return <UI data={data} />;
}
export const revalidate = 3600;
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
2. **COMPREHENSIVE_UPGRADE_PLAN4.md** - خطة الجلسة 18
3. **بروتوكول ترس الشفرة.md** - قواعد التنفيذ

**مرجعية:**
- `schema.prisma` - مصدر الحقيقة
- `src/types/index.ts` - الأنواع
- `src/lib/data/queries.ts` - الاستعلامات
- `assurance_report.md` - الأمان

---

## 🚀 الجلسة 18: الترقية

**3 جلسات فرعية:**
1. **18.0:** التأسيس + الأمان (ترقية + إزالة testUsers + auth-helpers)
2. **18.1:** Server Actions للطلاب (enrollment + types + queries)
3. **18.2:** Optimistic UI للمعلمة (attendance + grades)

**المرجع:** `COMPREHENSIVE_UPGRADE_PLAN4.md` للتفاصيل الكاملة

---

## 💡 دروس v1/v2/17.5

- userId/teacherId > userName/email
- Response format consistency مهم
- Hook interfaces تحتاج conditional calls
- Server Actions > Client Fetch (أمان + أداء)
- Ownership Check = إلزامي
- لا Schema changes في هذه المرحلة

---

## 🔧 أخطاء شائعة

| الخطأ | الحل |
|-------|------|
| P1001 | استخدم :6543 + ?pgbouncer=true |
| useActionState not found | ترقية React 19 |
| 'use client' missing | أضف في أول ملف Client Component |

---

**📅 مرجع ثابت - يُقرأ مرة واحدة في بداية كل جلسة**
