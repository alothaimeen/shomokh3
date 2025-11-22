# 🕵️ تقرير فحص المشروع (Project Inspection Report) - النهائي

**تاريخ الفحص:** 21 نوفمبر 2025
**حالة الفحص:** ✅ مكتمل (شمل جميع صفحات `src/app`)
**المقيم:** AI Agent (Shomokh v3 Context)

---

## 📊 ملخص الحالة العامة

تم فحص 28 صفحة رئيسية في المشروع.
- ✅ **14 صفحة سليمة (Verified & Good):** تتبع التصميم الجديد وتستخدم SWR Hooks.
- 🚨 **2 صفحة بها مشاكل تصميم (Design Issues):** تحتاج إلى إعادة هيكلة (`Sidebar/AppHeader`).
- ⚠️ **8 صفحات بها ديون تقنية (Data Fetching):** تحتاج إلى الترحيل من `fetch` اليدوي إلى `SWR Hooks`.
- ℹ️ **4 صفحات عامة/ثابتة (Static/Public):** سليمة.

---

## 🚨 1. مشاكل التصميم والهيكلة (Critical Design & Layout Issues)

هذه الصفحات لا تتبع الهوية البصرية الجديدة (Unified Design System) أو تفتقد للمكونات الأساسية.

*   **`src/app/student-attendance/page.tsx`**
    *   **المشكلة:** تستخدم تخطيطاً قديماً (`container mx-auto`) بدون `Sidebar`/`AppHeader`.
    *   **الحل:** إعادة بناء الصفحة باستخدام القالب الموحد.

*   **`src/app/profile/page.tsx`**
    *   **المشكلة:** تستخدم هيدر مخصص (Redundant Header) ولا تستخدم `Sidebar`.
    *   **الحل:** دمجها في التصميم الموحد (`Sidebar` + `AppHeader`).

*   **`src/app/reports/page.tsx`**
    *   **المشكلة:** صفحة قديمة "Hub" بتصميم معزول.
    *   **الحل:** تحديث التصميم أو دمج محتوياتها في Dashboard.

---

## ⚠️ 2. ديون تقنية: ترحيل البيانات (SWR Migration Needed)

هذه الصفحات تستخدم التصميم الصحيح ولكنها ما زالت تعتمد على `fetch` و `useEffect` يدوياً، مما يخالف معايير الأداء الجديدة (Session PERF-2).

| الصفحة | البيانات المطلوبة | الإجراء المقترح |
|:---|:---|:---|
| `src/app/attendance/page.tsx` | الحلقات، سجلات الحضور | استخدام `useTeacherCourses`, `useAttendance` |
| `src/app/teacher/page.tsx` | الحلقات | استخدام `useTeacherCourses` |
| `src/app/academic-reports/page.tsx` | الحلقات، التقارير | إنشاء `useReports` hook |
| `src/app/attendance-report/page.tsx` | الحلقات | استخدام `useTeacherCourses` |
| `src/app/behavior-grades/page.tsx` | الحلقات، الدرجات | استخدام `useTeacherCourses` + SWR |
| `src/app/final-exam/page.tsx` | الحلقات، الدرجات | استخدام `useTeacherCourses` + SWR |
| `src/app/programs/page.tsx` | البرامج | استخدام `usePrograms` (موجود في `useCourses.ts`) |
| `src/app/students/page.tsx` | قائمة الطالبات | إنشاء `useStudents` hook |
| `src/app/teacher-requests/page.tsx` | طلبات الانضمام | إنشاء `useTeacherRequests` hook |
| `src/app/users/page.tsx` | المستخدمين | إنشاء `useUsers` hook |

---

## ✅ 3. صفحات سليمة ومحدثة (Verified & Good)

تطبق التصميم الموحد وتستخدم SWR Hooks (أو لا تحتاج لبيانات ديناميكية).

### 🏠 الصفحات العامة
1.  `src/app/page.tsx` (Landing Page)
2.  `src/app/login/page.tsx`
3.  `src/app/register/page.tsx`
4.  `src/app/about/page.tsx`

### 📊 لوحات التحكم والتقييم
5.  `src/app/dashboard/page.tsx`
6.  `src/app/unified-assessment/page.tsx`
7.  `src/app/daily-grades/page.tsx`
8.  `src/app/weekly-grades/page.tsx`
9.  `src/app/monthly-grades/page.tsx`
10. `src/app/behavior-points/page.tsx`
11. `src/app/daily-tasks/page.tsx`

### 👤 صفحات الطالبة
12. `src/app/my-grades/page.tsx`
13. `src/app/my-attendance/page.tsx`
14. `src/app/enrolled-students/page.tsx`
15. `src/app/settings/page.tsx`

---

## 📋 خطة العمل المقترحة (Next Steps)

### المرحلة 1: إصلاح التصميم (Design Fixes) - [أولوية قصوى]
1.  توحيد `src/app/student-attendance/page.tsx`.
2.  توحيد `src/app/profile/page.tsx`.

### المرحلة 2: ترحيل البيانات (Data Migration - Batch 1)
1.  تحويل `attendance/page.tsx` و `teacher/page.tsx` لاستخدام Hooks موجودة.
2.  تحويل `programs/page.tsx` لاستخدام `usePrograms`.

### المرحلة 3: إنشاء Hooks جديدة (New Hooks)
1.  إنشاء `useStudents` لصفحة الطالبات.
2.  إنشاء `useUsers` لصفحة المستخدمين.
3.  إنشاء `useTeacherRequests` لصفحة الطلبات.

### المرحلة 4: استكمال الترحيل (Batch 2)
1.  تحديث باقي الصفحات (`academic-reports`, `final-exam`, `behavior-grades`).