# 🚀 خطة التطوير الشامل - منصة شموخ v3
## الترقية إلى Next.js 15 و React 19

**📅 التاريخ:** 23 نوفمبر 2025  
**📍 الحالة الحالية:** الجلسة 17.5 مكتملة (~55%)  
**🎯 الهدف:** تطبيق الأنماط الحديثة (Server Actions + React 19) مع الحفاظ على الاستقرار

---

## 📋 المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [المنهجية المطبقة](#المنهجية-المطبقة)
3. [الجلسة 18.0: التأسيس والأمان](#الجلسة-180-التأسيس-والأمان)
4. [الجلسة 18.1: الطلاب والعمليات](#الجلسة-181-الطلاب-والعمليات)
5. [الجلسة 18.2: المعلمة والبيانات](#الجلسة-182-المعلمة-والبيانات)
6. [معايير النجاح](#معايير-النجاح)

---

## 🎯 نظرة عامة

### لماذا هذا التحديث؟

#### المشاكل الحالية
- ❌ **34 ملف API Route** → كود معقد وصعب الصيانة
- ❌ **جلب من العميل فقط** → بطء في التحميل الأولي
- ❌ **إدارة يدوية للحالات** → `useState`, `useEffect` في كل مكان
- ❌ **لا Optimistic UI** → تجربة مستخدم بطيئة
- ❌ **نقاط API مكشوفة** → مخاطر أمنية (IDOR)

#### الحلول الحديثة
- ✅ **Server Actions** → دوال خادم مباشرة
- ✅ **Server Components** → جلب من الخادم مباشرة
- ✅ **useActionState** → إدارة تلقائية للنماذج
- ✅ **useOptimistic** → تحديث فوري للواجهة
- ✅ **Automatic CSRF Protection** → أمان مدمج

### الفوائد المتوقعة

| المقياس | التحسين |
|---------|---------|
| كمية الكود | تقليل 60% |
| حجم JavaScript | تقليل 70% |
| سرعة التحميل | تحسين 40% |
| الأمان | حماية CSRF + Zod |
| تجربة المستخدم | Optimistic UI |

---

## 🔧 المنهجية المطبقة

### بروتوكول ترس الشفرة (Code Gear Protocol)

تطبيق **هندسة الوحدات الوظيفية (Module-Driven Engineering)** مع التقسيم إلى 3 جلسات فرعية:

```
الجلسة 18.0: التأسيس والأمان
    ↓
الجلسة 18.1: الطلاب والعمليات
    ↓
الجلسة 18.2: المعلمة والبيانات
```

### القواعد الذهبية

1. ✅ **لا حذف بدون بديل** → نبني الجديد قبل إزالة القديم
2. ✅ **اختبار بعد كل وحدة** → نتأكد من الاستقرار قبل المتابعة
3. ✅ **الحفاظ على التصميم** → لا تغيير في الواجهة الحالية
4. ✅ **احترام AI_CONTEXT.md** → الالتزام بالقواعد الحاكمة

---

## 🏗️ الجلسة 18.0: التأسيس والأمان
**Foundation & Security**

### 🎯 الهدف
إعداد البنية التحتية والتحسينات الأمنية الأساسية

---

### الوحدة 1.1: الترقية والتحضير

#### الخطوات

**1️⃣ ترقية React 19**
```bash
npm install react@latest react-dom@latest
```

**2️⃣ تثبيت التبعيات**
```bash
npm install zod  # للتحقق من البيانات
```

**3️⃣ إنشاء البنية الأساسية**
```bash
mkdir -p src/actions
mkdir -p src/lib/data
mkdir -p src/types
```

**4️⃣ إنشاء ملفات الأنواع المشتركة**
```typescript
// src/types/index.ts
import { Prisma } from '@prisma/client';

export type Student = Prisma.StudentGetPayload<{
  include: { user: true }
}>;

export type Course = Prisma.CourseGetPayload<{
  include: { program: true, teacher: true }
}>;

export type Program = Prisma.ProgramGetPayload<{}>;

export type EnrollmentRequest = Prisma.EnrollmentRequestGetPayload<{
  include: { student: true, course: true }
}>;
```

#### ✅ التحقق
- [ ] `npm run dev` يعمل بدون أخطاء
- [ ] `npm run build` ينجح
- [ ] React 19 مثبت بنجاح
- [ ] المجلدات الجديدة موجودة

---

### الوحدة 1.2: الأمان الأساسي

#### الخطوات

**1️⃣ إزالة المستخدمين التجريبيين**

⚠️ **خطر أمني حالي:**
```typescript
// src/lib/auth.ts - السطر ~50
const testUsers = [
  { email: "admin@shamokh.edu", password: "admin123" }
];
```

**الحل:**
```typescript
// src/lib/auth.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "البريد", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // ✅ فقط من قاعدة البيانات
        const user = await prisma.user.findUnique({
          where: { userEmail: credentials.email }
        });

        if (!user) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.userName,
          email: user.userEmail,
          role: user.userRole,
        };
      }
    })
  ],
  // ... باقي الإعدادات
};
```

**2️⃣ تحسين Middleware**

```typescript
// src/middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // حماية مسارات المعلمين
    if (path.startsWith("/teacher") && token?.role !== "TEACHER" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // حماية مسارات الطلاب
    if (path.startsWith("/enrollment") && token?.role !== "STUDENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // حماية مسارات الأدمن
    if (path.startsWith("/users") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher/:path*",
    "/enrollment/:path*",
    "/users/:path*",
    "/my-grades/:path*",
  ],
};
```

**3️⃣ إنشاء دوال التحقق المشتركة**

```typescript
// src/lib/auth-helpers.ts
'use server';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/dashboard');
  }
  return session;
}

export async function requireTeacher() {
  return await requireRole(['TEACHER', 'ADMIN']);
}

export async function requireStudent() {
  return await requireRole(['STUDENT']);
}

export async function requireAdmin() {
  return await requireRole(['ADMIN']);
}
```

#### ✅ التحقق
- [ ] لا مستخدمين Hardcoded في `auth.ts`
- [ ] Middleware يحمي المسارات بشكل صحيح
- [ ] دوال التحقق تعمل بشكل صحيح
- [ ] `npm run build` ينجح

---

### الوحدة 1.3: دوال الاستعلام المشتركة

#### الخطوات

**1️⃣ إنشاء ملف الاستعلامات**

```typescript
// src/lib/data/queries.ts
import { cache } from 'react';
import { prisma } from '@/lib/db';

// ✅ cache() تمنع الاستعلامات المكررة في نفس الطلب

export const getPrograms = cache(async () => {
  return await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { programName: 'asc' },
  });
});

export const getCourses = cache(async () => {
  return await prisma.course.findMany({
    where: { isActive: true },
    include: {
      program: true,
      teacher: { select: { id: true, userName: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { courseName: 'asc' },
  });
});

export const getCourseById = cache(async (id: string) => {
  return await prisma.course.findUnique({
    where: { id },
    include: {
      program: true,
      teacher: { select: { id: true, userName: true } },
    },
  });
});

export const getTeacherCourses = cache(async (teacherId: string) => {
  return await prisma.course.findMany({
    where: {
      teacherId,
      isActive: true,
    },
    include: {
      program: true,
      _count: { select: { enrollments: true } }
    },
    orderBy: { courseName: 'asc' },
  });
});
```

#### ✅ التحقق
- [ ] ملف الاستعلامات موجود
- [ ] جميع الدوال تستخدم `cache()`
- [ ] TypeScript لا يعرض أخطاء
- [ ] `npm run build` ينجح

---

### معايير النجاح للجلسة 18.0

- ✅ React 19 مثبت وي عمل
- ✅ Zod مثبت
- ✅ البنية الأساسية جاهزة (`actions/`, `lib/data/`, `types/`)
- ✅ لا مستخدمين Hardcoded
- ✅ Middleware محسّن
- ✅ دوال التحقق والاستعلام جاهزة
- ✅ `npm run build` ينجح بدون أخطاء
- ✅ التطبيق يعمل كما كان سابقاً (لا تعطل)

---

## 🎓 الجلسة 18.1: الطلاب والعمليات
**Students & Core Operations**

### 🎯 الهدف
تحويل عمليات الطلاب إلى Server Actions مع Optimistic UI

---

### الوحدة 2.1: Server Action - طلب الانضمام

#### الخطوات

**1️⃣ إنشاء Server Action**

```typescript
// src/actions/enrollment.ts
'use server';

import { z } from 'zod';
import { requireStudent } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const enrollmentSchema = z.object({
  courseId: z.string().cuid(),
  message: z.string().max(500).optional(),
});

export async function enrollInCourse(prevState: any, formData: FormData) {
  // 1️⃣ التحقق من المصادقة
  const session = await requireStudent();

  // 2️⃣ التحقق من البيانات
  const parsed = enrollmentSchema.safeParse({
    courseId: formData.get('courseId'),
    message: formData.get('message'),
  });

  if (!parsed.success) {
    return { error: 'بيانات غير صحيحة' };
  }

  const { courseId, message } = parsed.data;

  // 3️⃣ التحقق من عدم وجود طلب سابق
  const student = await prisma.student.findFirst({
    where: { userId: session.user.id }
  });

  if (!student) {
    return { error: 'لم يتم العثور على بيانات الطالبة' };
  }

  const existingRequest = await prisma.enrollmentRequest.findFirst({
    where: {
      studentId: student.id,
      courseId,
      status: 'PENDING',
    }
  });

  if (existingRequest) {
    return { error: 'لديك طلب معلق بالفعل لهذه الحلقة' };
  }

  // 4️⃣ الحفظ في قاعدة البيانات
  try {
    await prisma.enrollmentRequest.create({
      data: {
        studentId: student.id,
        courseId,
        message,
        status: 'PENDING',
      },
    });

    // 5️⃣ تحديث الصفحات المتأثرة
    revalidatePath('/enrollment');
    revalidatePath('/teacher-requests');

    return { success: true, message: 'تم إرسال الطلب بنجاح ✅' };
  } catch (error) {
    console.error('Enrollment error:', error);
    return { error: 'حدث خطأ، حاول مرة أخرى' };
  }
}
```

**2️⃣ تحديث مكون النموذج**

```typescript
// src/app/enrollment/EnrollmentForm.tsx
'use client';

import { useActionState } from 'react';
import { enrollInCourse } from '@/actions/enrollment';

interface EnrollmentFormProps {
  courseId: string;
  courseName: string;
}

export function EnrollmentForm({ courseId, courseName }: EnrollmentFormProps) {
  const [state, formAction, isPending] = useActionState(
    enrollInCourse,
    { message: '' }
  );

  return (
    <form action={formAction} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <input type="hidden" name="courseId" value={courseId} />
      
      <div>
        <label className="block text-sm font-medium mb-2">
          الحلقة المختارة
        </label>
        <p className="text-lg font-bold text-primary-purple">{courseName}</p>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          رسالة للمعلمة (اختياري)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          disabled={isPending}
          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 disabled:bg-gray-100"
          placeholder="اكتب رسالة للمعلمة..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-gradient-to-r from-primary-purple to-primary-blue text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? '⏳ جاري الإرسال...' : '📝 إرسال الطلب'}
      </button>

      {/* رسائل الحالة */}
      {state?.error && (
        <div className="bg-red-50 border-2 border-red-200 text-red-600 p-4 rounded-lg">
          ❌ {state.error}
        </div>
      )}
      {state?.success && (
        <div className="bg-green-50 border-2 border-green-200 text-green-600 p-4 rounded-lg">
          ✅ {state.message}
        </div>
      )}
    </form>
  );
}
```

**3️⃣ تحديث الصفحة الرئيسية**

```typescript
// src/app/enrollment/page.tsx
import { requireStudent } from '@/lib/auth-helpers';
import { getCourses } from '@/lib/data/queries';
import { EnrollmentForm } from './EnrollmentForm';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

export default async function EnrollmentPage() {
  await requireStudent();
  const courses = await getCourses();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 mr-64">
        <AppHeader />
        <div className="p-6">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 text-secondary-dark">
            📚 التسجيل في الحلقات
          </h1>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map(course => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-2">{course.courseName}</h2>
                <p className="text-sm text-gray-600 mb-4">{course.program.programName}</p>
                <EnrollmentForm 
                  courseId={course.id}
                  courseName={course.courseName}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### ✅ التحقق
- [ ] Server Action يعمل بشكل صحيح
- [ ] النموذج يرسل البيانات
- [ ] رسائل الخطأ والنجاح تظهر
- [ ] `isPending` يعمل (زر معطل أثناء الإرسال)
- [ ] لا أخطاء في Console

---

### الوحدة 2.2: Server Component - صفحة الحلقات

#### الخطوات

**1️⃣ تحويل الصفحة إلى Server Component**

```typescript
// src/app/programs/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { getPrograms } from '@/lib/data/queries';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import Link from 'next/link';

// ✅ Caching لمدة 10 دقائق
export const revalidate = 600;

export default async function ProgramsPage() {
  await requireAuth();
  const programs = await getPrograms();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 mr-64">
        <AppHeader />
        <div className="p-6">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 text-secondary-dark">
            📖 البرامج التعليمية
          </h1>

          <div className="grid gap-6 md:grid-cols-2">
            {programs.map(program => (
              <div 
                key={program.id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h2 className="text-2xl font-bold mb-3 text-primary-purple">
                  {program.programName}
                </h2>
                <p className="text-gray-600 mb-4">
                  {program.description || 'لا يوجد وصف'}
                </p>
                <Link
                  href={`/programs/${program.id}`}
                  className="inline-block bg-gradient-to-r from-primary-purple to-primary-blue text-white px-6 py-2 rounded-lg hover:shadow-md transition"
                >
                  عرض التفاصيل ←
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### ✅ التحقق
- [ ] الصفحة تعمل كـ Server Component
- [ ] البيانات تُجلب من الخادم مباشرة
- [ ] Caching يعمل (revalidate = 600)
- [ ] التصميم محافظ على الهوية البصرية
- [ ] لا loading state (تحميل سريع)

---

### الوحدة 2.3: حذف الملفات القديمة (Cleanup)

#### الخطوات

**⚠️ مهم:** فقط بعد التأكد من عمل النظام الجديد!

```bash
# حذف API Routes القديمة
rm src/app/api/enrollment/request/route.ts

# حذف SWR Hooks القديمة
rm src/hooks/useEnrollments.ts  # (جزئياً - نحتفظ ببعض الدوال)
```

**ملاحظة:** لا تحذف `useEnrollments.ts` بالكامل إذا كانت هناك دوال أخرى مستخدمة.

#### ✅ التحقق
- [ ] `npm run build` ينجح
- [ ] لا import errors
- [ ] التطبيق يعمل بدون مشاكل

---

### معايير النجاح للجلسة 18.1

- ✅ Server Action للتسجيل يعمل
- ✅ النماذج تستخدم `useActionState`
- ✅ صفحة البرامج Server Component
- ✅ رسائل الحالة واضحة وجميلة
- ✅ التصميم محافظ على الهوية
- ✅ Cleanup تم بنجاح
- ✅ `npm run build` ينجح
- ✅ لا regression (الميزات القديمة تعمل)

---

## 👩‍🏫 الجلسة 18.2: المعلمة والبيانات
**Teachers & Data Management**

### 🎯 الهدف
تطبيق Optimistic UI على صفحات المعلمة (حضور + درجات)

---

### الوحدة 3.1: Server Action - تسجيل الحضور

#### الخطوات

**1️⃣ إنشاء Server Action**

```typescript
// src/actions/attendance.ts
'use server';

import { z } from 'zod';
import { requireTeacher } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const attendanceSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  date: z.string(),
  status: z.enum(['PRESENT', 'ABSENT', 'EXCUSED', 'REVIEWED', 'LEFT_EARLY']),
});

export async function markAttendance(formData: FormData) {
  // 1️⃣ التحقق من المصادقة
  const session = await requireTeacher();

  // 2️⃣ التحقق من البيانات
  const parsed = attendanceSchema.safeParse({
    studentId: formData.get('studentId'),
    courseId: formData.get('courseId'),
    date: formData.get('date'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return { error: 'بيانات غير صحيحة' };
  }

  const { studentId, courseId, date, status } = parsed.data;

  // 3️⃣ التحقق من ملكية الحلقة
  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherId: session.user.id,
    }
  });

  if (!course) {
    return { error: 'غير مصرح لك بتعديل هذه الحلقة' };
  }

  // 4️⃣ الحفظ في قاعدة البيانات
  try {
    await prisma.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId,
          courseId,
          date: new Date(date),
        }
      },
      update: { status },
      create: {
        studentId,
        courseId,
        date: new Date(date),
        status,
      },
    });

    revalidatePath('/attendance');
    revalidatePath('/reports');

    return { success: true };
  } catch (error) {
    console.error('Attendance error:', error);
    return { error: 'حدث خطأ أثناء الحفظ' };
  }
}
```

**2️⃣ إنشاء مكون Optimistic UI**

```typescript
// src/app/attendance/AttendanceTable.tsx
'use client';

import { useOptimistic, useTransition } from 'react';
import { markAttendance } from '@/actions/attendance';

interface Student {
  id: string;
  studentName: string;
  attendanceStatus: string | null;
}

interface AttendanceTableProps {
  students: Student[];
  courseId: string;
  date: string;
}

export function AttendanceTable({ students, courseId, date }: AttendanceTableProps) {
  const [isPending, startTransition] = useTransition();
  
  // ✨ Optimistic State
  const [optimisticStudents, updateOptimistic] = useOptimistic(
    students,
    (state, { studentId, status }: { studentId: string; status: string }) =>
      state.map(s => 
        s.id === studentId ? { ...s, attendanceStatus: status } : s
      )
  );

  function handleMark(studentId: string, status: string) {
    const formData = new FormData();
    formData.append('studentId', studentId);
    formData.append('courseId', courseId);
    formData.append('date', date);
    formData.append('status', status);

    startTransition(async () => {
      // 1️⃣ تحديث فوري في الواجهة
      updateOptimistic({ studentId, status });
      
      // 2️⃣ إرسال للخادم
      const result = await markAttendance(formData);
      
      if (result.error) {
        alert(result.error);
      }
    });
  }

  const statusButtons = [
    { value: 'PRESENT', label: 'حاضرة', emoji: '✅', color: 'green' },
    { value: 'ABSENT', label: 'غائبة', emoji: '❌', color: 'red' },
    { value: 'EXCUSED', label: 'معتذرة', emoji: '📝', color: 'orange' },
    { value: 'REVIEWED', label: 'راجعت', emoji: '📖', color: 'blue' },
    { value: 'LEFT_EARLY', label: 'خروج مبكر', emoji: '🏃', color: 'yellow' },
  ];

  return (
    <div className="space-y-2">
      {optimisticStudents.map(student => (
        <div 
          key={student.id}
          className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border-2 border-gray-200"
        >
          <span className="flex-1 font-medium text-lg">{student.studentName}</span>
          
          <div className="flex gap-2">
            {statusButtons.map(btn => (
              <button
                key={btn.value}
                onClick={() => handleMark(student.id, btn.value)}
                disabled={isPending}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  student.attendanceStatus === btn.value
                    ? `bg-${btn.color}-500 text-white shadow-md`
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title={btn.label}
              >
                {btn.emoji}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**3️⃣ تحديث الصفحة الرئيسية**

```typescript
// src/app/attendance/page.tsx
import { requireTeacher } from '@/lib/auth-helpers';
import { getTeacherCourses } from '@/lib/data/queries';
import { prisma } from '@/lib/db';
import { AttendanceTable } from './AttendanceTable';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';

export default async function AttendancePage({
  searchParams
}: {
  searchParams: { courseId?: string; date?: string }
}) {
  const session = await requireTeacher();
  const courses = await getTeacherCourses(session.user.id);

  const selectedCourseId = searchParams.courseId || courses[0]?.id;
  const selectedDate = searchParams.date || new Date().toISOString().split('T')[0];

  // جلب الطالبات مع حالة الحضور
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: selectedCourseId },
    include: {
      student: {
        include: {
          attendance: {
            where: {
              courseId: selectedCourseId,
              date: new Date(selectedDate),
            }
          }
        }
      }
    }
  });

  const students = enrollments.map(e => ({
    id: e.student.id,
    studentName: e.student.studentName,
    attendanceStatus: e.student.attendance[0]?.status || null,
  }));

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 mr-64">
        <AppHeader />
        <div className="p-6">
          <BackButton />
          <h1 className="text-3xl font-bold mb-6 text-secondary-dark">
            ✅ تسجيل الحضور
          </h1>

          {/* Course Selector */}
          <div className="mb-6 flex gap-4">
            <select className="px-4 py-2 border-2 rounded-lg">
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.courseName}</option>
              ))}
            </select>
            <input 
              type="date"
              value={selectedDate}
              className="px-4 py-2 border-2 rounded-lg"
            />
          </div>

          <AttendanceTable
            students={students}
            courseId={selectedCourseId}
            date={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
```

#### ✅ التحقق
- [ ] Optimistic UI يعمل (تحديث فوري)
- [ ] البيانات تُحفظ في قاعدة البيانات
- [ ] إذا فشل الحفظ، الواجهة ترجع للحالة السابقة
- [ ] التحقق من الملكية يعمل
- [ ] التصميم جميل ومتناسق

---

### الوحدة 3.2: Cleanup النهائي

#### الخطوات

**1️⃣ حذف API Routes القديمة**

```bash
rm src/app/api/attendance/mark/route.ts
rm src/app/api/attendance/bulk-mark/route.ts
```

**2️⃣ حذف SWR Hooks القديمة**

```bash
rm src/hooks/useAttendance.ts  # بعد التأكد
```

**3️⃣ تحديث ملف التوثيق**

```bash
# تحديث PROJECT_TIMELINE.md
# إضافة الجلسة 18 كاملة
```

#### ✅ التحقق
- [ ] `npm run build` ينجح
- [ ] لا import errors
- [ ] جميع الصفحات تعمل
- [ ] لا warnings في console

---

### معايير النجاح للجلسة 18.2

- ✅ Server Action للحضور يعمل
- ✅ Optimistic UI يعمل بسلاسة
- ✅ التحقق من الملكية فعّال
- ✅ Cleanup تم بنجاح
- ✅ التصميم محافظ على الهوية
- ✅ `npm run build` ينجح
- ✅ تجربة المستخدم سلسة وسريعة

---

## ✅ معايير النجاح الإجمالية

### تقنية
- ✅ **كل الجلسات الفرعية مكتملة** (18.0, 18.1, 18.2)
- ✅ **React 19 يعمل بشكل صحيح**
- ✅ **Server Actions تعمل**
- ✅ **Optimistic UI يعمل**
- ✅ **لا API Routes قديمة غير مستخدمة**
- ✅ **npm run build ينجح بدون أخطاء**
- ✅ **TypeScript بدون errors**

### أمان
- ✅ **لا مستخدمين Hardcoded**
- ✅ **Zod validation في كل Server Action**
- ✅ **التحقق من الصلاحيات في كل عملية**
- ✅ **CSRF protection تلقائي**
- ✅ **Middleware فعّال**

### تجربة المستخدم
- ✅ **التحديث الفوري (Optimistic UI)**
- ✅ **رسائل واضحة للحالات**
- ✅ **loading states واضحة**
- ✅ **التصميم محافظ على الهوية البصرية**
- ✅ **لا regression في الميزات**

### أداء
- ✅ **تقليل في كمية الكود**
- ✅ **تقليل في حجم JavaScript**
- ✅ **Caching فعّال**
- ✅ **سرعة تحميل محسّنة**

---

## 📝 ملاحظات مهمة

### قبل البدء
1. ✅ قراءة `AI_CONTEXT.md` بالكامل
2. ✅ قراءة `PROJECT_TIMELINE.md` حتى الجلسة 17.5
3. ✅ عمل backup للكود الحالي
4. ✅ التأكد من `npm run dev` يعمل

### أثناء التنفيذ
1. ✅ اختبر بعد كل وحدة
2. ✅ commit بعد كل نجاح
3. ✅ لا حذف قبل إنشاء البديل
4. ✅ راقب console للأخطاء

### بعد الانتهاء
1. ✅ `npm run build` للتأكد
2. ✅ اختبار شامل لجميع الميزات
3. ✅ تحديث `PROJECT_TIMELINE.md`
4. ✅ تحديث `AI_CONTEXT.md` إذا لزم

---

## 🎯 الخطوة التالية

بعد إكمال الجلسة 18 بنجاح:
- **الجلسة 19:** التقارير والإحصائيات المتقدمة
- **الجلسة 20:** تحسينات النظام الشامل

---

**📅 تم إنشاء هذه الخطة بتاريخ:** 23 نوفمبر 2025  
**🔄 آخر تحديث:** 23 نوفمبر 2025  
**📍 المرجع:** `AI_CONTEXT.md`, `PROJECT_TIMELINE.md`, `دليل التطوير الشامل.md`, `بروتوكول ترس الشفرة.md`
