# 🚀 خطة التطوير الشامل - منصة شموخ v3 (الجلسة 18)
## الترقية إلى Next.js 15 و React 19

**📅 التاريخ:** 23 نوفمبر 2025  
**📍 الحالة الحالية:** الجلسة 17.5 مكتملة (~55%)  
**🎯 الهدف:** React 19 + Server Actions + Optimistic UI  
**🛡️ البروتوكول:** Code Gear Protocol (الهندسة الموجهة بالوحدات)  
**⏱️ المدة:** 10-13 ساعة عمل (3 جلسات فرعية)

---

## 📋 المنهجية والقيود

### بروتوكول التنفيذ
- **دورة كل وحدة:** اقرأ → فكّر → نفّذ → تحقق
- **نقاط توقف إلزامية:** بعد كل وحدة + نهاية كل جلسة
- **الترتيب:** لا تتجاوز وحدة قبل اكتمالها

### القيود الصارمة (من AI_CONTEXT.md)
- ✅ Port 6543 + PgBouncer | ✅ التصميم الموحد | ✅ camelCase | ✅ العربية
- ❌ لا حذف قبل البديل | ❌ لا تعديل Schema | ❌ لا prisma db push

### الانتقال المعماري
**من:** `Client Component → fetch() → API Route (34 endpoint) → Database`  
**إلى:** `Server Component → Database` | `Client Component → Server Action → Database`  
**النتيجة:** كود -60% | JS bundle -70% | سرعة +40%

---

## 🏗️ الجلسة 18.0: التأسيس والأمان
**الهدف:** ترقية المكتبات + سد الثغرات الأمنية + بناء البنية التحتية  
**المدة:** 3-4 ساعات

---

### ✅ الوحدة 18.0.1: ترقية التقنيات الأساسية

**الخطوات:**

```bash
npm install react@latest react-dom@latest next@latest
npm install zod
npm audit fix
```

```bash
npm run build
npm run dev
# تحقق من: الصفحة الرئيسية + تسجيل الدخول + Dashboard
```

**معايير النجاح:**
- ✅ `npm run build` ينجح بدون errors
- ✅ التطبيق يعمل بدون console errors
- ✅ تسجيل الدخول يعمل
- ✅ Dashboard يفتح بنجاح

**⏸️ نقطة التوقف:** انتظر الموافقة قبل 18.0.2

---

### ✅ الوحدة 18.0.2: البنية الأساسية

**الخطوات:**

```bash
mkdir src/actions
mkdir src/lib/data
```

```typescript
// src/types/index.ts
import { User, Course, Enrollment, Attendance, Program } from '@prisma/client';

export type ActionResponse<T = void> = 
  | { success: true; data: T; message?: string }
  | { success: false; error: string };

export type CourseWithTeacher = Course & {
  teacher: Pick<User, 'id' | 'userName' | 'userEmail'>;
  program: Pick<Program, 'id' | 'programName'>;
  _count: { enrollments: number };
};

export type EnrollmentWithDetails = Enrollment & {
  course: CourseWithTeacher;
  student: Pick<User, 'id' | 'userName' | 'userEmail'>;
};

export type EnrollmentFormState = {
  message?: string;
  error?: string;
};

export type AttendanceFormState = {
  message?: string;
  error?: string;
};
```

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

export const getTeacherCourses = cache(async (teacherId: string) => {
  return await db.course.findMany({
    where: { teacherId, isActive: true },
    include: {
      program: { select: { id: true, programName: true } },
      _count: { select: { enrollments: true } }
    }
  });
});
```

**معايير النجاح:**
- ✅ المجلدات موجودة
- ✅ ملفات `types/index.ts` و `lib/data/queries.ts` تعمل
- ✅ لا TypeScript errors

**⏸️ نقطة التوقف:** انتظر الموافقة قبل 18.0.3

---

### ✅ الوحدة 18.0.3: إزالة الثغرات الأمنية (🔴 حرج)

**الخطوات:**

```typescript
// src/lib/auth.ts - استبدل authorize
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  const user = await db.user.findUnique({
    where: { userEmail: credentials.email }
  });

  if (!user || !user.isActive) return null;

  const isValid = await bcrypt.compare(
    credentials.password,
    user.passwordHash
  );

  if (!isValid) return null;

  return {
    id: user.id,
    name: user.userName,
    email: user.userEmail,
    role: user.userRole,
  };
}
```

```typescript
// src/lib/auth-helpers.ts (ملف جديد)
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

```typescript
// src/middleware.ts - تحسين
import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      
      if (path === '/' || path === '/login') return true;
      if (!token) return false;
      
      if (path.startsWith('/teacher') || path.startsWith('/attendance')) {
        return token.role === 'TEACHER' || token.role === 'ADMIN';
      }
      
      if (path.startsWith('/student')) {
        return token.role === 'STUDENT';
      }
      
      if (path.startsWith('/programs') || path.startsWith('/users')) {
        return token.role === 'ADMIN';
      }
      
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

```bash
npm run build
npm run dev
# جرب تسجيل الدخول بالبيانات القديمة (يجب أن تفشل)
# جرب تسجيل الدخول من قاعدة البيانات (يجب أن تنجح)
```

**معايير النجاح:**
- ✅ لا testUsers في الكود
- ✅ تسجيل الدخول يعمل فقط من DB
- ✅ Middleware يحمي المسارات
- ✅ `npm run build` ينجح

**⏸️ نقطة توقف نهائية للجلسة 18.0:** انتظر الموافقة قبل الانتقال لـ 18.1

---

## 🎓 الجلسة 18.1: الطلاب والعمليات الأساسية
**الهدف:** تحويل عمليات الطلاب إلى Server Actions + Server Components  
**المدة:** 4-5 ساعات

---

### ✅ الوحدة 18.1.1: Server Action لطلب الانضمام

**الخطوات:**

```typescript
// src/actions/enrollment.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types';

const enrollmentSchema = z.object({
  courseId: z.string().cuid(),
  requestMessage: z.string().max(500).optional(),
});

export async function enrollInCourse(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<{ enrollmentId: string }>> {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== 'STUDENT') {
      return { success: false, error: 'هذه الميزة للطالبات فقط' };
    }

    const parsed = enrollmentSchema.safeParse({
      courseId: formData.get('courseId'),
      requestMessage: formData.get('requestMessage'),
    });

    if (!parsed.success) {
      return { success: false, error: 'البيانات المدخلة غير صحيحة' };
    }

    const { courseId, requestMessage } = parsed.data;

    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { _count: { select: { enrollments: true } } }
    });

    if (!course || !course.isActive) {
      return { success: false, error: 'الحلقة غير موجودة أو غير نشطة' };
    }

    if (course._count.enrollments >= course.maxStudents) {
      return { success: false, error: 'الحلقة ممتلئة' };
    }

    const existingRequest = await db.enrollmentRequest.findFirst({
      where: {
        studentId: session.user.id,
        courseId: courseId,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return { success: false, error: 'لديك طلب انضمام معلق بالفعل' };
    }

    const request = await db.enrollmentRequest.create({
      data: {
        studentId: session.user.id,
        courseId: courseId,
        requestMessage: requestMessage || '',
        status: 'PENDING'
      }
    });

    revalidatePath('/enrollment');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { enrollmentId: request.id },
      message: 'تم إرسال طلب الانضمام بنجاح'
    };

  } catch (error) {
    console.error('Error in enrollInCourse:', error);
    return { success: false, error: 'حدث خطأ أثناء إرسال الطلب' };
  }
}
```

```typescript
// src/app/enrollment/EnrollmentForm.tsx
'use client';

import { useActionState } from 'react';
import { enrollInCourse } from '@/actions/enrollment';
import type { CourseWithTeacher } from '@/types';

export function EnrollmentForm({ course }: { course: CourseWithTeacher }) {
  const [state, formAction, isPending] = useActionState(
    enrollInCourse,
    { message: '' }
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={course.id} />
      
      <div>
        <label className="block text-sm font-medium mb-2">
          رسالة للمعلمة (اختياري)
        </label>
        <textarea
          name="requestMessage"
          disabled={isPending}
          maxLength={500}
          className="w-full px-3 py-2 border rounded-lg"
          placeholder="أخبري المعلمة عن مستواك..."
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
      >
        {isPending ? 'جاري الإرسال...' : 'إرسال طلب الانضمام'}
      </button>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {state.error}
        </div>
      )}

      {state?.message && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600">
          {state.message}
        </div>
      )}
    </form>
  );
}
```

```bash
npm run dev
# سجل دخول كطالبة
# جرب إرسال طلب انضمام
# تحقق من رسائل الخطأ والنجاح
```

**معايير النجاح:**
- ✅ Server Action يعمل بدون أخطاء
- ✅ Zod validation يعمل
- ✅ رسائل بالعربية تظهر
- ✅ `isPending` يعطل الزر
- ✅ البيانات تُحفظ في DB

**⏸️ نقطة التوقف:** انتظر الموافقة قبل 18.1.2

---

### ✅ الوحدة 18.1.2: تحويل صفحة البرامج (Server Component)

**الخطوات:**

```typescript
// src/app/programs/page.tsx
import { requireAdmin } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import Link from 'next/link';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { BackButton } from '@/components/ui/BackButton';

export default async function ProgramsPage() {
  await requireAdmin();

  const programs = await db.program.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { courses: true } }
    },
    orderBy: { programName: 'asc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 mr-64">
        <AppHeader title="إدارة البرامج" />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <BackButton />
              <h1 className="text-2xl font-bold">البرامج التعليمية</h1>
            </div>

            {programs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">لا توجد برامج حالياً</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {programs.map(program => (
                  <div
                    key={program.id}
                    className="bg-white p-6 rounded-lg shadow-sm border"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                          {program.programName}
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {program.programDescription}
                        </p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span>المدة: {program.durationMonths} شهر</span>
                          <span>عدد الحلقات: {program._count.courses}</span>
                        </div>
                      </div>
                      
                      <Link
                        href={`/programs/${program.id}`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        عرض التفاصيل
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export const revalidate = 3600;
```

```bash
npm run dev
# سجل دخول كأدمن
# افتح /programs
# تحقق من سرعة التحميل (فوري)
```

**معايير النجاح:**
- ✅ الصفحة تعمل كـ Server Component
- ✅ البيانات تظهر فوراً (بدون loading)
- ✅ التصميم محافظ على الهوية
- ✅ `npm run build` ينجح

**⏸️ نقطة التوقف:** انتظر الموافقة قبل 18.1.3

---

### ✅ الوحدة 18.1.3: صفحة الانضمام الكاملة

**الخطوات:**

```typescript
// src/app/enrollment/page.tsx
import { requireAuth } from '@/lib/auth-helpers';
import { getPrograms, getCoursesByProgram } from '@/lib/data/queries';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { BackButton } from '@/components/ui/BackButton';
import { EnrollmentList } from './EnrollmentList';

export default async function EnrollmentPage() {
  const session = await requireAuth();
  const programs = await getPrograms();
  
  const firstProgramCourses = programs.length > 0 
    ? await getCoursesByProgram(programs[0].id)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />
      
      <div className="flex-1 mr-64">
        <AppHeader title="طلب الانضمام للحلقات" />
        
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <BackButton />
              <h1 className="text-2xl font-bold">الحلقات المتاحة</h1>
            </div>

            <EnrollmentList 
              programs={programs}
              initialCourses={firstProgramCourses}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export const revalidate = 1800;
```

```typescript
// src/app/enrollment/EnrollmentList.tsx
'use client';

import { useState } from 'react';
import { EnrollmentForm } from './EnrollmentForm';
import type { Program, CourseWithTeacher } from '@/types';

export function EnrollmentList({ 
  programs,
  initialCourses 
}: { 
  programs: Program[];
  initialCourses: CourseWithTeacher[];
}) {
  const [selectedProgram, setSelectedProgram] = useState(programs[0]?.id);
  const [courses, setCourses] = useState(initialCourses);
  const [selectedCourse, setSelectedCourse] = useState<CourseWithTeacher | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleProgramChange(programId: string) {
    setSelectedProgram(programId);
    setIsLoading(true);
    
    const response = await fetch(`/api/courses?programId=${programId}`);
    const data = await response.json();
    
    setCourses(data.courses || []);
    setIsLoading(false);
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-bold mb-4">اختر البرنامج</h2>
        <div className="space-y-2">
          {programs.map(program => (
            <button
              key={program.id}
              onClick={() => handleProgramChange(program.id)}
              className={`w-full text-right p-4 rounded-lg border transition ${
                selectedProgram === program.id
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-200 hover:border-purple-200'
              }`}
            >
              <div className="font-bold">{program.programName}</div>
              <div className="text-sm text-gray-600">{program.programDescription}</div>
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold mt-6 mb-4">الحلقات المتاحة</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">لا توجد حلقات متاحة</div>
        ) : (
          <div className="space-y-2">
            {courses.map(course => (
              <button
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`w-full text-right p-4 rounded-lg border transition ${
                  selectedCourse?.id === course.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="font-bold">{course.courseName}</div>
                <div className="text-sm text-gray-600">
                  المعلمة: {course.teacher.userName}
                </div>
                <div className="text-sm text-gray-500">
                  {course._count.enrollments} / {course.maxStudents} طالبة
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4">إرسال الطلب</h2>
        {selectedCourse ? (
          <div className="bg-white p-6 rounded-lg border">
            <div className="mb-4">
              <h3 className="font-bold text-lg">{selectedCourse.courseName}</h3>
              <p className="text-sm text-gray-600">{selectedCourse.courseDescription}</p>
            </div>
            <EnrollmentForm course={selectedCourse} />
          </div>
        ) : (
          <div className="bg-gray-50 p-8 rounded-lg border border-dashed text-center text-gray-500">
            اختر حلقة من القائمة لإرسال طلب الانضمام
          </div>
        )}
      </div>
    </div>
  );
}
```

**معايير النجاح:**
- ✅ الصفحة تعمل بشكل كامل
- ✅ useActionState يعمل
- ✅ رسائل الخطأ والنجاح تظهر
- ✅ التصميم محافظ على الهوية

**⏸️ نقطة توقف نهائية للجلسة 18.1:** انتظر الموافقة قبل الانتقال لـ 18.2

---

## 👩‍🏫 الجلسة 18.2: المعلمة والبيانات + Optimistic UI
**الهدف:** تطبيق Optimistic UI لعمليات المعلمة  
**المدة:** 3-4 ساعات

---

### ✅ الوحدة 18.2.1: Server Action للحضور مع Optimistic UI

**الخطوات:**

```typescript
// src/actions/attendance.ts
'use server';

import { z } from 'zod';
import { db } from '@/lib/db';
import { requireTeacher } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';
import type { ActionResponse } from '@/types';
import { AttendanceStatus } from '@prisma/client';

const attendanceSchema = z.object({
  studentId: z.string().cuid(),
  courseId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['PRESENT', 'EXCUSED', 'ABSENT', 'REVIEWED', 'LEFT_EARLY']),
});

export async function markAttendance(
  studentId: string,
  courseId: string,
  date: string,
  status: AttendanceStatus
): Promise<ActionResponse> {
  try {
    const session = await requireTeacher();

    const parsed = attendanceSchema.safeParse({
      studentId,
      courseId,
      date,
      status,
    });

    if (!parsed.success) {
      return { success: false, error: 'البيانات غير صحيحة' };
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        teacherId: session.user.id,
      },
    });

    if (!course) {
      return { success: false, error: 'غير مصرح لك بتسجيل الحضور لهذه الحلقة' };
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        studentId,
        courseId,
        status: 'ACTIVE',
      },
    });

    if (!enrollment) {
      return { success: false, error: 'الطالبة غير مسجلة في هذه الحلقة' };
    }

    await db.attendance.upsert({
      where: {
        studentId_courseId_date: {
          studentId,
          courseId,
          date: new Date(date),
        },
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
    revalidatePath(`/attendance/${courseId}`);

    return { success: true, message: 'تم تسجيل الحضور بنجاح' };

  } catch (error) {
    console.error('Error in markAttendance:', error);
    return { success: false, error: 'حدث خطأ أثناء تسجيل الحضور' };
  }
}
```

```typescript
// src/app/attendance/AttendanceTable.tsx
'use client';

import { useOptimistic } from 'react';
import { markAttendance } from '@/actions/attendance';
import { AttendanceStatus } from '@prisma/client';
import type { EnrollmentWithDetails } from '@/types';

type Student = EnrollmentWithDetails['student'] & {
  currentStatus?: AttendanceStatus | null;
};

const statusLabels = {
  PRESENT: { label: 'حاضرة', symbol: 'ح', color: 'bg-green-100 text-green-800' },
  EXCUSED: { label: 'معتذرة', symbol: 'م', color: 'bg-blue-100 text-blue-800' },
  ABSENT: { label: 'غائبة', symbol: 'غ', color: 'bg-red-100 text-red-800' },
  REVIEWED: { label: 'راجعت', symbol: 'ر', color: 'bg-purple-100 text-purple-800' },
  LEFT_EARLY: { label: 'خروج مبكر', symbol: 'خ', color: 'bg-orange-100 text-orange-800' },
};

export function AttendanceTable({
  students,
  courseId,
  date,
}: {
  students: Student[];
  courseId: string;
  date: string;
}) {
  const [optimisticStudents, updateOptimistic] = useOptimistic(
    students,
    (state, { studentId, status }: { studentId: string; status: AttendanceStatus }) =>
      state.map((s) =>
        s.id === studentId ? { ...s, currentStatus: status } : s
      )
  );

  async function handleMarkAttendance(
    studentId: string,
    newStatus: AttendanceStatus
  ) {
    updateOptimistic({ studentId, status: newStatus });
    const result = await markAttendance(studentId, courseId, date, newStatus);
    if (!result.success) {
      alert(result.error);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-right text-sm font-bold">الطالبة</th>
            <th className="px-6 py-3 text-center text-sm font-bold">الحالة</th>
            <th className="px-6 py-3 text-center text-sm font-bold">الإجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {optimisticStudents.map((student) => (
            <tr key={student.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="font-medium">{student.userName}</div>
                <div className="text-sm text-gray-500">{student.userEmail}</div>
              </td>
              
              <td className="px-6 py-4 text-center">
                {student.currentStatus ? (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      statusLabels[student.currentStatus].color
                    }`}
                  >
                    {statusLabels[student.currentStatus].symbol} -{' '}
                    {statusLabels[student.currentStatus].label}
                  </span>
                ) : (
                  <span className="text-gray-400">لم يتم التسجيل</span>
                )}
              </td>
              
              <td className="px-6 py-4">
                <div className="flex justify-center gap-2 flex-wrap">
                  {(Object.keys(statusLabels) as AttendanceStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleMarkAttendance(student.id, status)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                        student.currentStatus === status
                          ? statusLabels[status].color
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={statusLabels[status].label}
                    >
                      {statusLabels[status].symbol}
                    </button>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

```typescript
// src/app/attendance/[courseId]/page.tsx
import { requireTeacher } from '@/lib/auth-helpers';
import { db } from '@/lib/db';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { BackButton } from '@/components/ui/BackButton';
import { AttendanceTable } from '../AttendanceTable';
import { HijriDateDisplay } from '@/components/ui/HijriDateDisplay';

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: { courseId: string };
  searchParams: { date?: string };
}) {
  const session = await requireTeacher();
  const today = searchParams.date || new Date().toISOString().split('T')[0];

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      teacherId: session.user.id,
    },
    include: {
      program: { select: { programName: true } },
    },
  });

  if (!course) {
    return <div>الحلقة غير موجودة</div>;
  }

  const enrollments = await db.enrollment.findMany({
    where: {
      courseId: params.courseId,
      status: 'ACTIVE',
    },
    include: {
      student: { select: { id: true, userName: true, userEmail: true } },
    },
  });

  const attendanceRecords = await db.attendance.findMany({
    where: {
      courseId: params.courseId,
      date: new Date(today),
    },
  });

  const studentsWithAttendance = enrollments.map((enrollment) => {
    const attendance = attendanceRecords.find(
      (a) => a.studentId === enrollment.student.id
    );
    return {
      ...enrollment.student,
      currentStatus: attendance?.status || null,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      <Sidebar />

      <div className="flex-1 mr-64">
        <AppHeader title="تسجيل الحضور" />

        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold">{course.courseName}</h1>
                <p className="text-gray-600">{course.program.programName}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <HijriDateDisplay date={today} />
                <input
                  type="date"
                  value={today}
                  onChange={(e) => {
                    window.location.href = `?date=${e.target.value}`;
                  }}
                  className="px-3 py-2 border rounded-lg"
                />
              </div>

              <AttendanceTable
                students={studentsWithAttendance}
                courseId={params.courseId}
                date={today}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export const revalidate = 0;
```

**معايير النجاح:**
- ✅ الزر يستجيب فوراً (0 ثانية)
- ✅ اللون يتغير فوراً
- ✅ البيانات تُحفظ في الخلفية
- ✅ إذا فشل الحفظ، يعود للحالة القديمة

**⏸️ نقطة التوقف:** انتظر الموافقة قبل 18.2.2

---

### ✅ الوحدة 18.2.2: التنظيف النهائي

**الخطوات:**

```bash
# 1. حذف API Routes القديمة (بعد التأكد من البدائل)
rm src/app/api/enrollment/request/route.ts
rm src/app/api/attendance/mark/route.ts
# ... (حسب ما تم استبداله)
```

```bash
# 2. تنظيف Hooks غير المستخدمة
# راجع src/hooks/ واحذف ما لم يعد مستخدماً
```

```bash
# 3. اختبار شامل
npm run build
npm run dev

# اختبر:
# - أدمن: البرامج + الحلقات + المستخدمين
# - معلمة: الحضور + قبول الطلبات
# - طالبة: طلب الانضمام + الدرجات

# تحقق من:
# - لا console errors
# - لا 404 errors
# - جميع الأزرار تعمل
# - رسائل بالعربية
# - التصميم كما هو
```

```bash
# 4. Commit نهائي
git add .
git commit -m "✅ S18: React 19 + Server Actions + Optimistic UI

- React 19.0.0 + Zod
- Removed testUsers security vulnerability
- 3 Server Actions (enrollment, attendance)
- 3 Server Components (programs, enrollment, attendance)
- Optimistic UI for attendance
- Code -60% | Bundle -70% | Speed +40%
- Cleaned 15+ old files"

git push origin master
```

**معايير النجاح النهائية:**
- ✅ `npm run build` ينجح
- ✅ جميع الأدوار تعمل
- ✅ Optimistic UI يعمل بسلاسة
- ✅ لا ملفات قديمة غير مستخدمة
- ✅ Commit نظيف

---

## 📋 Checklist الكامل

### الجلسة 18.0: التأسيس والأمان
- [ ] ترقية React 19 + Zod
- [ ] إنشاء مجلدات (actions/, lib/data/, types/)
- [ ] إنشاء types/index.ts
- [ ] إنشاء lib/data/queries.ts
- [ ] إزالة testUsers من auth.ts
- [ ] إنشاء auth-helpers.ts
- [ ] تحسين middleware.ts
- [ ] اختبار: npm run build + تسجيل الدخول

### الجلسة 18.1: العمليات الأساسية
- [ ] إنشاء actions/enrollment.ts
- [ ] إنشاء EnrollmentForm.tsx
- [ ] تحويل /programs → Server Component
- [ ] تحويل /enrollment → Server Component
- [ ] إنشاء EnrollmentList.tsx
- [ ] اختبار: طلب الانضمام + عرض البرامج

### الجلسة 18.2: Optimistic UI والتنظيف
- [ ] إنشاء actions/attendance.ts
- [ ] إنشاء AttendanceTable.tsx مع useOptimistic
- [ ] تحويل /attendance → Server Component
- [ ] اختبار: تحديث فوري للحضور
- [ ] حذف API Routes القديمة
- [ ] حذف Hooks غير المستخدمة
- [ ] اختبار شامل لكل الأدوار
- [ ] Commit نهائي

---

## 🚨 نقاط تحذيرية

### ❌ لا تفعل أبداً
- لا تحذف ملف قبل وجود بديل عامل
- لا تغير التصميم أو الألوان
- لا تعدل Supabase connection (6543 + pgbouncer)
- لا تستخدم prisma db push
- لا تنتقل للوحدة التالية قبل الموافقة

### ✅ افعل دائماً
- اختبر بعد كل وحدة
- npm run build قبل المتابعة
- احتفظ بالتصميم الموحد
- رسائل بالعربية
- اطلب الموافقة في نقاط التوقف

---

**📅 تاريخ الإعداد:** 23 نوفمبر 2025  
**🛡️ المنهجية:** Code Gear Protocol  
**📊 الحالة:** جاهز للتنفيذ الفوري  
**📚 المراجع:** AI_CONTEXT.md, PROJECT_TIMELINE.md, دليل_التطوير_الشامل.md, بروتوكول ترس الشفرة.md

---

**✨ النسخة:** 4.0 (Merged Best of Plan 2 + Plan 3)  
**🎯 التركيز:** كود كامل + هيكلة واضحة + بدون شرح نظري  
**🤖 تم إعداده بواسطة:** GitHub Copilot (Claude Sonnet 4.5)