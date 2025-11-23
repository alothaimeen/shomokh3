# تقرير تحديث منصة شموخ v3 إلى Next.js 15 و React 19

بناءً على المراجعة الشاملة للكود والتوثيقات الحديثة، إليك خطة التحديث والمقترحات التقنية لتحويل المشروع إلى أحدث المعايير.

**المزايا:**
*   🔒 **أمان أعلى:** Next.js يولد معرفات مشفرة للـ Actions ويحمي من CSRF تلقائياً.
*   ⚡ **أداء أفضل:** تقليل عدد الطلبات الشبكية (Network Round-trips).
*   🛠️ **Type Safety:** مشاركة الأنواع (Types) مباشرة بين الخادم والعميل دون الحاجة لـ DTOs.

#### مثال عملي: تقديم طلب التحاق (Enrollment)

**الكود القديم (API Route + Client Fetch):**
```typescript
// src/app/api/enroll/route.ts
export async function POST(req) {
  const body = await req.json();
  // validation & db logic...
}

// Client Component
const handleSubmit = async (data) => {
  await fetch('/api/enroll', { method: 'POST', body: JSON.stringify(data) });
}
```

**الكود الحديث (Server Action):**
```typescript
// src/actions/enrollment.ts
'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const schema = z.object({
  courseId: z.string(),
  message: z.string().optional(),
});

export async function submitEnrollment(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return { message: 'بيانات غير صالحة', errors: parsed.error.flatten() };
  }

  try {
    await prisma.enrollmentRequest.create({
      data: {
        courseId: parsed.data.courseId,
        studentId: 'CURRENT_USER_ID', // Get from session
        message: parsed.data.message,
      },
    });
    
    revalidatePath('/courses'); // تحديث البيانات فوراً
    return { message: 'تم تقديم الطلب بنجاح', success: true };
  } catch (e) {
    return { message: 'حدث خطأ أثناء التقديم' };
  }
}
```

### ب. إدارة النماذج باستخدام `useActionState` (React 19)
بدلاً من إدارة حالات التحميل والأخطاء يدوياً (`useState`, `isLoading`), نستخدم Hook الجديد `useActionState`.

```tsx
// src/components/EnrollmentForm.tsx
'use client'

import { useActionState } from 'react';
import { submitEnrollment } from '@/actions/enrollment';

export function EnrollmentForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(submitEnrollment, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="courseId" value={courseId} />
      
      <textarea name="message" placeholder="رسالة للمعلمة..." />
      
      {state?.errors && <p className="text-red-500">{state.message}</p>}
      
      <button type="submit" disabled={isPending} className="btn-primary">
        {isPending ? 'جاري التقديم...' : 'تقديم طلب التحاق'}
      </button>
    </form>
  );
}
```

### ج. واجهة مستخدم تفاعلية بـ `useOptimistic`
لجعل التطبيق يبدو "فورياً"، نستخدم `useOptimistic` لتحديث الواجهة قبل استجابة الخادم. هذا مثالي لنظام رصد الدرجات أو الحضور.

**مثال: رصد الحضور (Attendance)**

```tsx
// src/components/AttendanceList.tsx
'use client'

import { useOptimistic } from 'react';
import { toggleAttendance } from '@/actions/attendance';

export function AttendanceList({ students }: { students: Student[] }) {
  const [optimisticStudents, setOptimisticStatus] = useOptimistic(
    students,
    (state, { id, status }) => 
      state.map(s => s.id === id ? { ...s, status } : s)
  );

  const handleToggle = async (studentId: string, newStatus: string) => {
    // 1. تحديث فوري للواجهة
    setOptimisticStatus({ id: studentId, status: newStatus });
    
    // 2. إرسال الطلب للخادم
    await toggleAttendance(studentId, newStatus);
  };

  return (
    <ul>
      {optimisticStudents.map(student => (
        <li key={student.id}>
          {student.name} - 
          <button onClick={() => handleToggle(student.id, 'PRESENT')}>
            {student.status === 'PRESENT' ? '✅ حاضر' : '⭕ غائب'}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## 3. خطة الانتقال (Migration Plan)

1.  **إنشاء مجلد `src/actions`:**
    *   نقل منطق قاعدة البيانات من `src/app/api` إلى دوال Server Actions موزعة حسب المجال (مثلاً: `auth.ts`, `grades.ts`, `courses.ts`).

2.  **تحديث مكونات النماذج (Forms):**
    *   تحويل النماذج التي تستخدم `onSubmit` التقليدي إلى استخدام `action` prop و `useActionState`.

3.  **تحسين جلب البيانات (Data Fetching):**
    *   للبيانات الثابتة أو التي لا تتطلب تحديثاً لحظياً، استخدم **React Server Components (RSC)** لجلب البيانات مباشرة من قاعدة البيانات (`await prisma...`) وتمريرها للمكونات.
    *   احتفظ بـ `SWR` فقط للبيانات التي تتطلب تحديثاً دورياً (Polling) أو تفاعلاً معقداً جداً في جانب العميل.

4.  **تفعيل Caching & Revalidation:**
    *   استخدم `revalidatePath` أو `revalidateTag` في Server Actions لتحديث الكاش تلقائياً بعد أي تعديل، مما يلغي الحاجة لإعادة جلب البيانات يدوياً في العميل.

## 4. الخلاصة
تحديث "منصة شموخ" لهذه التقنيات سيجعل الكود **أقل بنسبة 30-40%** (بسبب إزالة الـ API Routes وطبقة الـ Fetching اليدوية)، وسيجعل التطبيق أسرع وأكثر استجابة بفضل Optimistic UI وإلغاء الـ Waterfalls في جلب البيانات.
