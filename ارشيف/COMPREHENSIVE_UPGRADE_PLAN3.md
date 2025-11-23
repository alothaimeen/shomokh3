# 🚀 خطة التطوير الشامل - منصة شموخ v3 (الجلسة 18)
## الترقية إلى Next.js 15 و React 19 - بروتوكول ترس الشفرة

**📅 التاريخ:** 23 نوفمبر 2025
**📍 الحالة الحالية:** الجلسة 17.5 مكتملة (~55%)
**🎯 الهدف:** تطبيق الأنماط الحديثة (Server Actions + React 19) مع الحفاظ على الاستقرار الكامل.
**🛡️ البروتوكول:** Code Gear Protocol (الهندسة الموجهة بالوحدات).

---

## 📋 المنهجية: بروتوكول ترس الشفرة (Code Gear Protocol)

سيتم تنفيذ العمل عبر **3 جلسات فرعية**، وكل جلسة مقسمة إلى **وحدات وظيفية (Modules)**.
لكل وحدة، يجب اتباع دورة: **(اقرأ Read -> فكّر Think -> نفّذ Act -> تحقق Verify)**.

### 🚫 القواعد الصارمة (من AI_CONTEXT.md)
1.  **لا حذف بدون بديل:** لا تحذف أي API Route أو Hook قبل التأكد 100% من عمل البديل الجديد.
2.  **الحفاظ على التصميم:** أي تغيير في الكود يجب ألا يؤثر على واجهة المستخدم (UI/UX).
3.  **اختبار البناء:** `npm run build` يجب أن ينجح بعد كل وحدة.
4.  **قاعدة البيانات:** ممنوع تعديل Schema في هذه المرحلة (التركيز على التطبيق).

---

## 🏗️ الجلسة 18.0: التأسيس والأمان (Foundation & Security)
**الهدف:** تجهيز البنية التحتية، ترقية المكتبات، وسد الثغرات الأمنية.

### ✅ الوحدة 18.0.1: الترقية والتحضير (Upgrade & Setup)
*   **الهدف:** ترقية React/Next.js وتثبيت Zod.
*   **الخطوات:**
    1.  ترقية `react`, `react-dom`, `next` إلى أحدث نسخة مستقرة.
    2.  تثبيت `zod` للتحقق من البيانات.
    3.  إنشاء المجلدات: `src/actions`, `src/lib/data`, `src/types`.
*   **كود التنفيذ:**
```bash
npm install react@latest react-dom@latest next@latest
npm install zod
mkdir src/actions
mkdir src/lib/data
```
*   **التحقق (Verify):**
    *   `npm run build` ينجح.
    *   التطبيق يعمل محلياً (`npm run dev`).

### ✅ الوحدة 18.0.2: تعريف الأنواع الموحدة (Unified Types)
*   **الهدف:** إنشاء ملف `src/types/index.ts` لتوحيد الأنواع ومنع التكرار.
*   **الخطوات:**
    1.  إنشاء `src/types/index.ts`.
*   **كود التنفيذ:**
```typescript
// src/types/index.ts
import { User, Course, Enrollment, Attendance, Program } from '@prisma/client';

// Response Types
export type ActionResponse<T = void> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

// Extended Types
export type CourseWithTeacher = Course & {
  teacher: Pick<User, 'id' | 'userName' | 'userEmail'>;
  program: Pick<Program, 'id' | 'programName'>;
  _count: { enrollments: number };
};

export type EnrollmentWithDetails = Enrollment & {
  course: CourseWithTeacher;
  student: Pick<User, 'id' | 'userName' | 'userEmail'>;
};

// Form State Types
export type EnrollmentFormState = {
  message?: string;
  error?: string;
};

export type AttendanceFormState = {
  message?: string;
  error?: string;
};
```
*   **التحقق (Verify):**
    *   لا توجد أخطاء TypeScript.

### ✅ الوحدة 18.0.3: تنظيف المصادقة (Auth Cleanup) - 🔴 حرج
*   **الهدف:** إزالة المستخدمين التجريبيين (Hardcoded Users) من `auth.ts`.
*   **الخطوات:**
    1.  تعديل `src/lib/auth.ts` لإزالة مصفوفة `testUsers`.
    2.  الاعتماد حصرياً على قاعدة البيانات في `authorize`.
    3.  إنشاء `src/lib/auth-helpers.ts` لدوال التحقق (`requireAuth`, `requireRole`).
*   **كود التنفيذ (auth.ts):**
```typescript
// src/lib/auth.ts - استبدال authorize
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;
  const user = await db.user.findUnique({ where: { userEmail: credentials.email } });
  if (!user || !user.isActive) return null;
  const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!isValid) return null;
  return { id: user.id, name: user.userName, email: user.userEmail, role: user.userRole };
}
```
*   **كود التنفيذ (auth-helpers.ts):**
```typescript
// src/lib/auth-helpers.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) redirect('/dashboard');
  return session;
}

export async function requireTeacher() { return await requireRole(['TEACHER', 'ADMIN']); }
export async function requireStudent() { return await requireRole(['STUDENT']); }
export async function requireAdmin() { return await requireRole(['ADMIN']); }
```
*   **التحقق (Verify):**
    *   محاولة الدخول ببيانات وهمية (يجب أن تفشل).
    *   محاولة الدخول ببيانات حقيقية من DB (يجب أن تنجح).

---

## 🎓 الجلسة 18.1: الطلاب والعمليات (Students & Core Ops)
**الهدف:** تحويل عمليات الطلاب إلى Server Actions وتحسين الأداء.

### ✅ الوحدة 18.1.1: استعلامات البيانات (Data Queries)
*   **الهدف:** إنشاء طبقة استعلامات مفصولة ومخزنة مؤقتاً.
*   **الخطوات:**
    1.  إنشاء `src/lib/data/queries.ts`.
*   **كود التنفيذ:**
```typescript
// src/lib/data/queries.ts
import { cache } from 'react';
import { db } from '@/lib/db';

export const getPrograms = cache(async () => {
  return await db.program.findMany({
    where: { isActive: true },
    orderBy: { programName: 'asc' }
  });
});

export const getCoursesByProgram = cache(async (programId: string) => {
  return await db.course.findMany({
    where: { programId, isActive: true },
    include: {
      teacher: { select: { id: true, userName: true, userEmail: true } },
      program: { select: { id: true, programName: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { courseName: 'asc' }
  });
});
```
*   **التحقق (Verify):**
    *   استخدام الدوال في صفحة تجريبية أو Console للتأكد من جلب البيانات.

### ✅ الوحدة 18.1.2: تحويل صفحة البرامج (Programs Server Component)
*   **الهدف:** تحويل `src/app/programs/page.tsx` إلى Server Component.
*   **الخطوات:**
    1.  إزالة `use client` (إذا وجد).
    2.  استخدام `getPrograms` مباشرة بدلاً من `fetch`.
*   **كود التنفيذ:**
```typescript
// src/app/programs/page.tsx
import { requireAdmin } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
// ... imports

export default async function ProgramsPage() {
  await requireAdmin();
  const programs = await db.program.findMany({
    where: { isActive: true },
    include: { _count: { select: { courses: true } } },
    orderBy: { programName: 'asc' }
  });
  // ... JSX (نفس التصميم الحالي)
}
export const revalidate = 3600;
```
*   **التحقق (Verify):**
    *   الصفحة تفتح فوراً (بدون ومضة تحميل).
    *   البيانات صحيحة.

### ✅ الوحدة 18.1.3: طلب الانضمام (Enrollment Server Action)
*   **الهدف:** تحويل عملية الانضمام إلى Server Action مع `useActionState`.
*   **الخطوات:**
    1.  إنشاء `src/actions/enrollment.ts`.
    2.  تحديث `src/app/enrollment/EnrollmentForm.tsx`.
*   **كود التنفيذ (enrollment.ts):**
```typescript
// src/actions/enrollment.ts
'use server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

const enrollmentSchema = z.object({
  courseId: z.string().cuid(),
  requestMessage: z.string().max(500).optional(),
});

export async function enrollInCourse(prevState: any, formData: FormData) {
  const session = await requireAuth();
  if (session.user.role !== 'STUDENT') return { success: false, error: 'للطالبات فقط' };
  
  const parsed = enrollmentSchema.safeParse({
    courseId: formData.get('courseId'),
    requestMessage: formData.get('requestMessage'),
  });
  
  if (!parsed.success) return { success: false, error: 'بيانات غير صحيحة' };
  
  // ... (التحقق من الوجود والعدد - انظر الكود الكامل في Plan 2)
  
  await db.enrollmentRequest.create({
    data: {
      studentId: session.user.id,
      courseId: parsed.data.courseId,
      requestMessage: parsed.data.requestMessage || '',
      status: 'PENDING'
    }
  });
  
  revalidatePath('/enrollment');
  return { success: true, message: 'تم الإرسال بنجاح' };
}
```
*   **التحقق (Verify):**
    *   إرسال طلب انضمام ناجح.
    *   إرسال طلب مكرر (يجب أن يظهر خطأ).

---

## 👩‍🏫 الجلسة 18.2: المعلمة والبيانات (Teachers & Data)
**الهدف:** تطبيق Optimistic UI لعمليات المعلمة (الحضور والدرجات).

### ✅ الوحدة 18.2.1: تسجيل الحضور (Attendance Server Action)
*   **الهدف:** تحويل تسجيل الحضور إلى Server Action.
*   **الخطوات:**
    1.  إنشاء `src/actions/attendance.ts`.
*   **كود التنفيذ:**
```typescript
// src/actions/attendance.ts
'use server';
// ... imports & schema
export async function markAttendance(studentId, courseId, date, status) {
  const session = await requireTeacher();
  // ... تحقق من الملكية
  await db.attendance.upsert({
    where: { studentId_courseId_date: { studentId, courseId, date: new Date(date) } },
    update: { status },
    create: { studentId, courseId, date: new Date(date), status },
  });
  revalidatePath('/attendance');
  return { success: true };
}
```
*   **التحقق (Verify):**
    *   تسجيل حضور طالبة.
    *   التأكد من التحديث في قاعدة البيانات.

### ✅ الوحدة 18.2.2: واجهة الحضور التفاؤلية (Optimistic Attendance UI)
*   **الهدف:** جعل الواجهة تستجيب فوراً.
*   **الخطوات:**
    1.  تحديث `AttendanceTable` لاستخدام `useOptimistic`.
*   **كود التنفيذ:**
```typescript
// src/app/attendance/AttendanceTable.tsx
'use client';
import { useOptimistic } from 'react';
import { markAttendance } from '@/actions/attendance';

export function AttendanceTable({ students, courseId, date }) {
  const [optimisticStudents, updateOptimistic] = useOptimistic(
    students,
    (state, { studentId, status }) =>
      state.map(s => s.id === studentId ? { ...s, currentStatus: status } : s)
  );

  async function handleMark(studentId, newStatus) {
    updateOptimistic({ studentId, status: newStatus }); // تحديث فوري
    await markAttendance(studentId, courseId, date, newStatus); // تحديث الخادم
  }
  
  // ... JSX
}
```
*   **التحقق (Verify):**
    *   النقر على "حاضرة" يغير اللون فوراً.
    *   تحديث الصفحة يؤكد حفظ البيانات.

---

## 🧹 التنظيف النهائي (Cleanup)
*   **يتم فقط بعد نجاح جميع الجلسات 18.0 - 18.2**
*   حذف API Routes القديمة التي تم استبدالها بالكامل.
*   حذف Hooks التي لم تعد مستخدمة.

## 📝 ملاحظات التنفيذ
*   **التعامل مع الأخطاء:** يجب عرض رسائل خطأ ودية للمستخدم (Toast notifications أو Inline).
*   **الأمان:** كل Server Action يجب أن يتحقق من `session` و `role` و `ownership`.
*   **الأداء:** استخدام `revalidatePath` بحكمة لتجنب إعادة بناء الموقع بالكامل.

---
**تم الاعتماد بواسطة:** Code Gear Protocol Agent
**النسخة:** 3.1 (Expanded with Code)
