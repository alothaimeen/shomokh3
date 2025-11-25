# 🚀 المرحلة 1: مرجع سريع

## الأوامر الأساسية (نسخ ولصق)

### 1. إنشاء Route Group
```powershell
New-Item -ItemType Directory -Path "c:\Users\memm2\Documents\programming\shomokh3\src\app\(dashboard)"
```

### 2. نقل جميع الصفحات (أمر واحد)
```powershell
cd c:\Users\memm2\Documents\programming\shomokh3

# Admin Pages
git mv src/app/dashboard src/app/(dashboard)/dashboard
git mv src/app/students src/app/(dashboard)/students
git mv src/app/users src/app/(dashboard)/users
git mv src/app/teacher-requests src/app/(dashboard)/teacher-requests
git mv src/app/academic-reports src/app/(dashboard)/academic-reports

# Teacher Pages
git mv src/app/attendance src/app/(dashboard)/attendance
git mv src/app/unified-assessment src/app/(dashboard)/unified-assessment
git mv src/app/daily-grades src/app/(dashboard)/daily-grades
git mv src/app/weekly-grades src/app/(dashboard)/weekly-grades
git mv src/app/monthly-grades src/app/(dashboard)/monthly-grades
git mv src/app/behavior-grades src/app/(dashboard)/behavior-grades
git mv src/app/behavior-points src/app/(dashboard)/behavior-points
git mv src/app/final-exam src/app/(dashboard)/final-exam
git mv src/app/enrolled-students src/app/(dashboard)/enrolled-students
git mv src/app/teacher src/app/(dashboard)/teacher

# Student Pages
git mv src/app/enrollment src/app/(dashboard)/enrollment
git mv src/app/my-attendance src/app/(dashboard)/my-attendance
git mv src/app/my-grades src/app/(dashboard)/my-grades
git mv src/app/daily-tasks src/app/(dashboard)/daily-tasks

# Shared Pages
git mv src/app/settings src/app/(dashboard)/settings

# Additional Pages (if protected)
git mv src/app/programs src/app/(dashboard)/programs
git mv src/app/attendance-report src/app/(dashboard)/attendance-report
git mv src/app/student-attendance src/app/(dashboard)/student-attendance
```

### 3. اختبار Build
```powershell
npm run build
```

### 4. اختبار محلي
```powershell
npm run dev
```

### 5. Commit
```powershell
git add .
git commit -m "feat(navigation): implement route groups for instant sidebar navigation"
```

---

## نموذج Layout المشترك

**الملف:** `src/app/(dashboard)/layout.tsx`

```tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 lg:mr-72">
        {children}
      </main>
    </div>
  );
}
```

---

## نموذج تنظيف الصفحة

### قبل:
```tsx
import Sidebar from '@/components/shared/Sidebar';

export default async function Page() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="العنوان" />
        <div className="p-8">
          {/* المحتوى */}
        </div>
      </div>
    </div>
  );
}
```

### بعد:
```tsx
// حذف: import Sidebar

export default async function Page() {
  return (
    <>
      <AppHeader title="العنوان" />
      <div className="p-8">
        {/* المحتوى */}
      </div>
    </>
  );
}
```

---

## قائمة التحقق السريعة

- [ ] أنشأت `(dashboard)` folder
- [ ] أنشأت `(dashboard)/layout.tsx`
- [ ] نقلت 20+ صفحة بـ `git mv`
- [ ] نظفت كل صفحة (حذف Sidebar + wrappers)
- [ ] `npm run build` ينجح
- [ ] اختبرت في المتصفح
- [ ] Sidebar ثابت عند التنقل
- [ ] Commit

---

## الصفحات المستهدفة (20)

### Admin (5)
- dashboard
- students
- users
- teacher-requests
- academic-reports

### Teacher (10)
- attendance
- unified-assessment
- daily-grades
- weekly-grades
- monthly-grades
- behavior-grades
- behavior-points
- final-exam
- enrolled-students
- teacher

### Student (4)
- enrollment
- my-attendance
- my-grades
- daily-tasks

### Shared (1)
- settings

---

## الصفحات التي لا تُنقل

- `/` (page.tsx)
- `/login`
- `/register`
- `/about/*`
- `/reports`
- `/profile`

---

## أسئلة شائعة

**س: هل URLs ستتغير؟**  
ج: لا، `/dashboard` يبقى `/dashboard`

**س: هل الروابط القديمة ستعمل؟**  
ج: نعم، 100% backward compatible

**س: هل أحتاج تعديل middleware؟**  
ج: لا، Route Groups غير مرئية للـ middleware

**س: ماذا لو فشل Build؟**  
ج: تحقق من syntax errors و imports

**س: كيف أتأكد أن Sidebar ثابت؟**  
ج: انقر على روابط مختلفة - يجب ألا يُعاد تحميله

---

## النتيجة المتوقعة

- ⚡ تحسين سرعة التنقل من 4 ثوانٍ إلى < 50ms
- ✅ Sidebar ثابت (لا وميض)
- ✅ تجربة مستخدم سلسة
- ✅ لا Layout Shift
- ✅ URLs لم تتغير
