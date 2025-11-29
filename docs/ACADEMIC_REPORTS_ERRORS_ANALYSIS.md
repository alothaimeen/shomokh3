# 🔍 تحليل شامل لأخطاء نظام التقارير الأكاديمية

> **تاريخ الإعداد:** 29 نوفمبر 2025  
> **الغرض:** توثيق شامل لجميع الأخطاء في صفحات التقارير مع الحلول المطلوبة  
> **المرجع:** الجلسات 11-17 من `ARCHIVE_SESSIONS_13_17.md`

---

## 📋 الفهرس
1. [نظرة عامة على المشكلة](#نظرة-عامة-على-المشكلة)
2. [نظام الدرجات الصحيح](#نظام-الدرجات-الصحيح)
3. [مواقع صفحات التقارير](#مواقع-صفحات-التقارير)
4. [تحليل الأخطاء التفصيلي](#تحليل-الأخطاء-التفصيلي)
5. [الطريقة الصحيحة للعرض](#الطريقة-الصحيحة-للعرض)
6. [برومبت الإصلاح الاحترافي](#برومبت-الإصلاح-الاحترافي)

---

## 🎯 نظرة عامة على المشكلة

### الخطأ الرئيسي المكتشف
صفحة التقارير الأكاديمية `/academic-reports` تعرض **الدرجات الخام (Raw Grades)** بدلاً من **الدرجات المعيارية (Normalized Grades)** وفقاً لنظام التقييم المعتمد في الجلسات 11-17.

### مثال على الخطأ
**العرض الحالي (الخاطئ):**
```
الرقم    اسم الطالبة    الحلقة           اليومية    الأسبوعية    الشهرية    السلوك    الإجمالي    النسبة
1060    مريم الشمري    تصحيح ٥ الأحقاف    700        50          90        70       910        🟢 100%
```

**المشكلة:** 
- الإجمالي = 910 ❌ (هذا مجموع الدرجات الخام)
- النسبة = 100% ✅ (صحيح ولكن مضلل بسبب عرض الدرجات الخام)

**العرض الصحيح (المطلوب):**
```
الرقم    اسم الطالبة    الحلقة           اليومية    الأسبوعية    الشهرية    السلوك    النهائي    الإجمالي    النسبة
1060    مريم الشمري    تصحيح ٥ الأحقاف    50         50          30        10       60        200        🟢 100%
```

---

## 📊 نظام الدرجات الصحيح

### المرجع: الجلسات 11-17  
> **المصدر:** `docs/history/ARCHIVE_SESSIONS_13_17.md` (السطور 305-334)

### الصيغ الرسمية المعتمدة

#### 1️⃣ التقييم اليومي (Daily Grades)
```yaml
الدرجة الخام:
  - memorization (الحفظ): 0-5 نقاط/يوم
  - review (المراجعة): 0-5 نقاط/يوم
  - إجمالي يومي: 10 نقاط/يوم
  - 70 يوم × 10 = 700 درجة خام

الصيغة المعيارية:
  700 ÷ 14 = 50 درجة معيارية
```

#### 2️⃣ التقييم الأسبوعي (Weekly Grades)
```yaml
الدرجة الخام:
  - 10 أسابيع × 5 درجات = 50 درجة

الصيغة المعيارية:
  10 أسابيع × 5 = 50 درجة معيارية
  (لا تحتاج لتحويل - الدرجة الخام = المعيارية)
```

#### 3️⃣ التقييم الشهري (Monthly Grades)
```yaml
الدرجة الخام (كل شهر):
  - quranForgetfulness (نسيان القرآن): 0-5
  - quranMajorMistakes (أخطاء كبيرة): 0-5
  - quranMinorMistakes (أخطاء صغيرة): 0-5
  - tajweedTheory (التجويد): 0-15
  - إجمالي شهري: 30 درجة
  - 3 أشهر × 30 = 90 درجة خام

الصيغة المعيارية:
  90 ÷ 3 = 30 درجة معيارية
```

#### 4️⃣ السلوك والمواظبة (Behavior Points)
```yaml
الدرجة الخام:
  - earlyAttendance (الحضور المبكر): 5 نقاط
  - perfectMemorization (الحفظ المتقن): 5 نقاط
  - activeParticipation (المشاركة): 5 نقاط
  - timeCommitment (الالتزام بالوقت): 5 نقاط
  - إجمالي يومي: 20 نقطة
  - 70 يوم × 1 درجة = 70 درجة خام

الصيغة المعيارية:
  70 ÷ 7 = 10 درجات معيارية
```

> **ملاحظة هامة:** نقاط السلوك (BehaviorPoint) تختلف عن درجات السلوك (BehaviorGrade). 
> - BehaviorPoint = نقاط تحفيزية (max 20 per session) ← للتقرير التحفيزي
> - BehaviorGrade = درجة السلوك (max 1 per day × 70 = 70) ← للتقرير الأكاديمي

#### 5️⃣ الاختبار النهائي (Final Exam)
```yaml
الدرجة الخام والمعيارية:
  - quranTest (اختبار القرآن): 4 مقاطع × 10 = 40 درجة
  - tajweedTest (اختبار التجويد): 20 درجة
  - الإجمالي: 60 درجة
  (لا تحتاج لتحويل - الدرجة الخام = المعيارية)
```

### الدرجة النهائية الإجمالية
```yaml
المجموع الكلي (من 200):
  = اليومية (50) + الأسبوعية (50) + الشهرية (30) + السلوك (10) + النهائي (60)
  = 200 درجة

النسبة المئوية:
  = (الدرجة الإجمالية ÷ 200) × 100
```

---

## 🗺️ مواقع صفحات التقارير

### 1. صفحات التقارير (للجميع: Admin + Teacher + Student)

| الصفحة | المسار | الدور المصرح | الوصف |
|:---:|:---:|:---:|:---|
| **التقارير الأكاديمية** | `/academic-reports` | Admin, Teacher | عرض جميع الدرجات الأكاديمية (يومية، أسبوعية، شهرية، سلوك، نهائي) |
| **تقرير الحضور** | `/attendance-report` | Admin, Teacher | عرض سجلات الحضور (بحسب الطالبة أو التاريخ) |
| **تقرير النقاط التحفيزية** | `/behavior-points-report` | Admin, Teacher | عرض النقاط التحفيزية (max 2450 نقطة) |

### 2. الملفات المعنية بالإصلاح

```
src/
├── actions/
│   └── reports.ts                              # ⚠️ يحتاج لإصلاح شامل
├── app/(dashboard)/
│   ├── academic-reports/
│   │   └── page.tsx                            # ✅ واجهة صحيحة
│   ├── attendance-report/
│   │   └── page.tsx                            # ✅ واجهة صحيحة
│   └── behavior-points-report/
│       └── page.tsx                            # ⚠️ قد تحتاج تحديث
└── components/reports/
    ├── AcademicReportsContent.tsx              # ⚠️ يحتاج تعديل العرض
    ├── AttendanceReportContent.tsx             # ✅ صحيح
    └── BehaviorPointsReportContent.tsx         # ✅ صحيح
```

---

## 🐛 تحليل الأخطاء التفصيلي

### الخطأ 1: عرض الدرجات الخام بدلاً من المعيارية

**الموقع:** `src/actions/reports.ts` → `getAcademicReportData()` (السطور 394-606)

**المشكلة:**
```typescript
// الكود الحالي (الخاطئ) - السطور 566-584
item.overallTotal = parseFloat((
  item.dailyGrades.total +      // ❌ 700 (خام)
  item.weeklyGrades.total +     // ❌ 50 (صحيح بالصدفة)
  item.monthlyGrades.total +    // ❌ 90 (خام)
  item.behaviorGrades.total     // ❌ 70 (خام)
).toFixed(2));                  // = 910 ❌ خطأ فادح!
```

**السبب:**
- الكود يجمع `total` (الدرجة الخام) مباشرة
- لا يوجد تطبيق للصيغ المعيارية `÷14` و `÷3` و `÷7`

**الإصلاح المطلوب:**
```typescript
// الطريقة الصحيحة (المطلوبة)
const normalizedDaily = item.dailyGrades.total / 14;       // 700 ÷ 14 = 50
const normalizedWeekly = item.weeklyGrades.total;          // 50 (لا تحويل)
const normalizedMonthly = item.monthlyGrades.total / 3;    // 90 ÷ 3 = 30
const normalizedBehavior = item.behaviorGrades.total / 7;  // 70 ÷ 7 = 10

item.overallTotal = parseFloat((
  normalizedDaily +
  normalizedWeekly +
  normalizedMonthly +
  normalizedBehavior
).toFixed(2));  // = 140 (بدون الاختبار النهائي)
```

---

### الخطأ 2: عدم إدراج الاختبار النهائي

**الموقع:** `src/actions/reports.ts` → `getAcademicReportData()`

**المشكلة:**
- الكود لا يجلب بيانات `FinalExam` من قاعدة البيانات
- لا يوجد حقل `finalExamGrade` في `AcademicReportItem`
- الإجمالي لا يشمل الـ 60 درجة من الاختبار النهائي

**الجداول المفقودة:**
```typescript
// مفقود من الكود الحالي
db.finalExam.findMany({
  where: whereClause,
  include: {
    student: { select: { id: true, studentNumber: true, studentName: true } },
    course: { select: { id: true, courseName: true } }
  }
})
```

**الإصلاح المطلوب:**
```typescript
export interface AcademicReportItem {
  // ... الحقول الموجودة
  
  // ✅ إضافة حقل جديد
  finalExamGrade: {
    quranTest: number;      // max 40
    tajweedTest: number;    // max 20
    total: number;          // max 60
  };
  
  // تحديث الإجمالي
  overallTotal: number;     // من 200 بدلاً من 150
}
```

---

### الخطأ 3: خلط بين BehaviorPoint و BehaviorGrade

**الموقع:** `src/actions/reports.ts` → السطور 524-538

**المشكلة:**
```typescript
// الكود الحالي
behaviorPoints.forEach(point => {  // ❌ يستخدم BehaviorPoint
  const sessionPoints = 
    (point.earlyAttendance ? 5 : 0) +
    (point.perfectMemorization ? 5 : 0) +
    (point.activeParticipation ? 5 : 0) +
    (point.timeCommitment ? 5 : 0);
  item.behaviorGrades.total += sessionPoints;  // max 20 per session
});
```

**التوضيح:**
- `BehaviorPoint` = نقاط تحفيزية (max 20/جلسة × 70 جلسة = 1400 نقطة) ← للتقرير التحفيزي
- `BehaviorGrade` = درجة السلوك (1 درجة/يوم × 70 يوم = 70 درجة) ← للتقرير الأكاديمي

**الإصلاح المطلوب:**
```typescript
// استخدام BehaviorGrade بدلاً من BehaviorPoint
db.behaviorGrade.findMany({  // ✅ الجدول الصحيح
  where: whereClause,
  include: {
    student: { select: { id: true, studentNumber: true, studentName: true } },
    course: { select: { id: true, courseName: true } }
  }
})

// معالجة الدرجات
behaviorGrades.forEach(grade => {
  const item = studentsMap.get(key);
  if (item) {
    item.behaviorGrades.total += Number(grade.grade) || 0;  // 1 درجة/يوم
    item.behaviorGrades.count++;
  }
});
```

---

### الخطأ 4: عدم وضوح العناوين في الجدول

**الموقع:** `src/components/reports/AcademicReportsContent.tsx`

**المشكلة:**
العناوين الحالية تعرض أرقام مربكة:
```
اليومية: 700    ←  هل هذا صحيح؟ (درجة خام)
الأسبوعية: 50   ←  هل هذا صحيح؟ (معياري بالصدفة)
الشهرية: 90     ←  هل هذا صحيح؟ (درجة خام)
السلوك: 70      ←  هل هذا صحيح؟ (درجة خام)
الإجمالي: 910   ←  ❌ خطأ واضح!
```

**الإصلاح المطلوب:**
```tsx
<th>اليومية (من 50)</th>
<th>الأسبوعية (من 50)</th>
<th>الشهرية (من 30)</th>
<th>السلوك (من 10)</th>
<th>الاختبار النهائي (من 60)</th>
<th>الإجمالي (من 200)</th>
<th>النسبة المئوية</th>
```

**عرض البيانات:**
```tsx
<td>{row.dailyGrades.normalized.toFixed(2)} / 50</td>
<td>{row.weeklyGrades.total.toFixed(2)} / 50</td>
<td>{row.monthlyGrades.normalized.toFixed(2)} / 30</td>
<td>{row.behaviorGrades.normalized.toFixed(2)} / 10</td>
<td>{row.finalExamGrade.total.toFixed(2)} / 60</td>
<td className="font-bold">{row.overallTotal.toFixed(2)} / 200</td>
```

---

### الخطأ 5: عدم وجود Tooltip توضيحي

**المشكلة:**
- لا توجد تلميحات (tooltips) لشرح كيفية حساب كل درجة
- المستخدم (خاصة المعلمة والطالبة) قد لا يفهم الفرق بين الدرجات الخام والمعيارية

**الإصلاح المطلوب:**
```tsx
<th className="group relative">
  اليومية (من 50)
  <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded -top-10 left-0 w-48 z-10">
    💡 الحفظ (0-5) + المراجعة (0-5) = 10 نقاط/يوم
    <br/>
    70 يوم × 10 = 700 درجة خام
    <br/>
    <strong>الصيغة: 700 ÷ 14 = 50 درجة</strong>
  </span>
</th>
```

---

## ✅ الطريقة الصحيحة للعرض

### 1. البنية الكاملة للتقرير الأكاديمي

```typescript
export interface AcademicReportItem {
  // معلومات الطالبة
  studentId: string;
  studentNumber: number;
  studentName: string;
  courseId: string;
  courseName: string;

  // الدرجات اليومية
  dailyGrades: {
    raw: number;          // 700 (مجموع 70 يوم)
    normalized: number;   // 50 (700 ÷ 14)
    count: number;        // عدد الأيام
    average: number;      // متوسط اليوم الواحد
  };

  // الدرجات الأسبوعية
  weeklyGrades: {
    total: number;        // 50 (10 أسابيع × 5)
    count: number;        // 10
    average: number;      // 5
  };

  // الدرجات الشهرية
  monthlyGrades: {
    raw: number;          // 90 (3 أشهر × 30)
    normalized: number;   // 30 (90 ÷ 3)
    count: number;        // 3
    average: number;      // 30
  };

  // السلوك
  behaviorGrades: {
    raw: number;          // 70 (70 يوم × 1)
    normalized: number;   // 10 (70 ÷ 7)
    count: number;        // 70
    average: number;      // 1
  };

  // الاختبار النهائي
  finalExamGrade: {
    quranTest: number;    // 40
    tajweedTest: number;  // 20
    total: number;        // 60
  };

  // الإجمالي
  overallTotal: number;     // من 200
  percentage: number;       // النسبة المئوية
  status: string;           // ممتاز، جيد جداً، إلخ
}
```

### 2. مثال كامل للعرض

**لطالبة حصلت على الدرجة الكاملة:**

| الرقم | الاسم | الحلقة | اليومية | الأسبوعية | الشهرية | السلوك | النهائي | الإجمالي | النسبة |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1060 | مريم الشمري | تصحيح ٥ الأحقاف | 50/50 | 50/50 | 30/30 | 10/10 | 60/60 | **200/200** | 🟢 **100%** |

**الشرح التفصيلي في Card منفصل:**
```
📊 تفاصيل الدرجات لـ مريم الشمري

اليومية (50 درجة):
  الدرجات الخام: 700 نقطة (70 يوم × 10 نقاط/يوم)
  الصيغة المعيارية: 700 ÷ 14 = 50 درجة ✅

الأسبوعية (50 درجة):
  10 أسابيع × 5 درجات = 50 درجة ✅

الشهرية (30 درجة):
  الدرجات الخام: 90 نقطة (3 أشهر × 30 نقطة/شهر)
  الصيغة المعيارية: 90 ÷ 3 = 30 درجة ✅

السلوك (10 درجات):
  الدرجات الخام: 70 نقطة (70 يوم × 1 نقطة/يوم)
  الصيغة المعيارية: 70 ÷ 7 = 10 درجات ✅

الاختبار النهائي (60 درجة):
  اختبار القرآن: 40/40 ✅
  اختبار التجويد: 20/20 ✅

═══════════════════════════════════
الإجمالي النهائي: 200/200 (100%) 🟢
التقدير: ممتاز ⭐⭐⭐
```

---

## 🛠️ برومبت الإصلاح الاحترافي

### المهمة الرئيسية
```
إصلاح نظام التقارير الأكاديمية في `/academic-reports` ليعرض الدرجات المعيارية 
الصحيحة وفقاً لنظام التقييم المعتمد في الجلسات 11-17.
```

---

### المتطلبات التفصيلية

#### Phase 1: إصلاح الحسابات في Backend (Server Action)

**الملف:** `src/actions/reports.ts` → `getAcademicReportData()`

**التعديلات المطلوبة:**

1. **إضافة جلب بيانات الاختبار النهائي:**
```typescript
const [dailyGrades, weeklyGrades, monthlyGrades, behaviorGrades, finalExams] = await Promise.all([
  // ... الاستعلامات الموجودة
  
  // ✅ إضافة جديدة
  db.finalExam.findMany({
    where: whereClause,
    include: {
      student: { select: { id: true, studentNumber: true, studentName: true } },
      course: { select: { id: true, courseName: true } }
    }
  })
]);
```

2. **تحديث واجهة `AcademicReportItem`:**
```typescript
export interface AcademicReportItem {
  // ... الحقول الموجودة
  
  // ✅ تحديث الدرجات لتشمل raw و normalized
  dailyGrades: {
    raw: number;          // الدرجة الخام
    normalized: number;   // الدرجة المعيارية (÷14)
    count: number;
    average: number;
  };
  
  monthlyGrades: {
    raw: number;          // الدرجة الخام
    normalized: number;   // الدرجة المعيارية (÷3)
    count: number;
    average: number;
  };
  
  behaviorGrades: {
    raw: number;          // الدرجة الخام
    normalized: number;   // الدرجة المعيارية (÷7)
    count: number;
    average: number;
  };
  
  // ✅ إضافة حقل جديد
  finalExamGrade: {
    quranTest: number;      // max 40
    tajweedTest: number;    // max 20
    total: number;          // max 60
  };
}
```

3. **استخدام `BehaviorGrade` بدلاً من `BehaviorPoint`:**
```typescript
// ❌ حذف الكود الخاطئ (السطور 446-453)
db.behaviorPoint.findMany({...})

// ✅ استبداله بـ
db.behaviorGrade.findMany({
  where: whereClause,
  include: {
    student: { select: { id: true, studentNumber: true, studentName: true } },
    course: { select: { id: true, courseName: true } }
  }
})

// ✅ معالجة الدرجات
behaviorGrades.forEach(grade => {
  const key = `${grade.studentId}-${grade.courseId}`;
  const item = studentsMap.get(key);
  if (item) {
    item.behaviorGrades.raw += Number(grade.grade) || 0;  // max 70
    item.behaviorGrades.count++;
  }
});
```

4. **تطبيق الصيغ المعيارية:**
```typescript
const report = Array.from(studentsMap.values()).map(item => {
  // ✅ حساب الدرجات المعيارية
  const normalizedDaily = item.dailyGrades.raw / 14;      // 700 ÷ 14 = 50
  const normalizedWeekly = item.weeklyGrades.total;       // 50 (لا تحويل)
  const normalizedMonthly = item.monthlyGrades.raw / 3;   // 90 ÷ 3 = 30
  const normalizedBehavior = item.behaviorGrades.raw / 7; // 70 ÷ 7 = 10
  const finalExamTotal = item.finalExamGrade.total;       // 60
  
  item.dailyGrades.normalized = parseFloat(normalizedDaily.toFixed(2));
  item.monthlyGrades.normalized = parseFloat(normalizedMonthly.toFixed(2));
  item.behaviorGrades.normalized = parseFloat(normalizedBehavior.toFixed(2));
  
  // ✅ حساب الإجمالي الصحيح (من 200)
  item.overallTotal = parseFloat((
    normalizedDaily +
    normalizedWeekly +
    normalizedMonthly +
    normalizedBehavior +
    finalExamTotal
  ).toFixed(2));
  
  // ✅ حساب النسبة المئوية
  item.percentage = Math.min(100, Math.round((item.overallTotal / 200) * 100));
  
  // ✅ تحديد الحالة
  if (item.percentage >= 90) item.status = 'ممتاز';
  else if (item.percentage >= 80) item.status = 'جيد جداً';
  else if (item.percentage >= 70) item.status = 'جيد';
  else if (item.percentage >= 60) item.status = 'مقبول';
  else item.status = 'ضعيف';
  
  return item;
});
```

---

#### Phase 2: تحديث واجهة العرض (Frontend)

**الملف:** `src/components/reports/AcademicReportsContent.tsx`

**التعديلات المطلوبة:**

1. **تحديث عناوين الجدول:**
```tsx
<thead className="bg-gradient-to-r from-primary-purple/10 to-primary-blue/10">
  <tr>
    <th>#</th>
    <th>اسم الطالبة</th>
    <th>الحلقة</th>
    <th>اليومية (من 50)</th>
    <th>الأسبوعية (من 50)</th>
    <th>الشهرية (من 30)</th>
    <th>السلوك (من 10)</th>
    <th>النهائي (من 60)</th>
    <th>الإجمالي (من 200)</th>
    <th>النسبة</th>
  </tr>
</thead>
```

2. **تحديث عرض البيانات:**
```tsx
<tbody>
  {data.map((row, index) => (
    <tr key={row.studentId}>
      <td>{row.studentNumber}</td>
      <td>{row.studentName}</td>
      <td>{row.courseName}</td>
      <td>{row.dailyGrades.normalized.toFixed(2)}</td>
      <td>{row.weeklyGrades.total.toFixed(2)}</td>
      <td>{row.monthlyGrades.normalized.toFixed(2)}</td>
      <td>{row.behaviorGrades.normalized.toFixed(2)}</td>
      <td>{row.finalExamGrade.total.toFixed(2)}</td>
      <td className="font-bold text-lg">
        {row.overallTotal.toFixed(2)}
      </td>
      <td>
        <span className={`
          px-3 py-1 rounded-full text-sm font-semibold
          ${row.percentage >= 90 ? 'bg-green-100 text-green-800' : ''}
          ${row.percentage >= 75 && row.percentage < 90 ? 'bg-yellow-100 text-yellow-800' : ''}
          ${row.percentage < 75 ? 'bg-red-100 text-red-800' : ''}
        `}>
          {row.percentage >= 90 ? '🟢' : row.percentage >= 75 ? '🟡' : '🔴'} {row.percentage}%
        </span>
      </td>
    </tr>
  ))}
</tbody>
```

3. **إضافة Tooltips توضيحية:**
```tsx
// في بداية الملف
import { InfoCircledIcon } from '@radix-ui/react-icons';

// في الجدول
<th className="group relative">
  اليومية (من 50)
  <InfoCircledIcon className="inline-block ml-1 w-4 h-4 text-gray-400 cursor-help" />
  <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl -top-20 left-0 w-64 z-50">
    <p className="mb-1"><strong>الحفظ + المراجعة</strong></p>
    <p>📌 10 نقاط/يوم × 70 يوم = 700 درجة خام</p>
    <p className="mt-2"><strong>الصيغة: 700 ÷ 14 = 50 درجة</strong></p>
  </div>
</th>
```

---

#### Phase 3: إضافة بطاقة توضيحية للصيغ

**الموقع:** أعلى الجدول في `AcademicReportsContent.tsx`

```tsx
<div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl shadow-sm mb-6 border border-purple-200">
  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span className="text-2xl">🧮</span>
    نظام حساب الدرجات الأكاديمية
  </h3>
  
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold text-primary-purple mb-2">📚 اليومية (50 درجة)</h4>
      <p className="text-gray-600">الحفظ (0-5) + المراجعة (0-5) = 10 نقاط/يوم</p>
      <p className="text-xs text-gray-500 mt-1">70 يوم × 10 = 700 → <strong>÷ 14 = 50</strong></p>
    </div>
    
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold text-primary-purple mb-2">📅 الأسبوعية (50 درجة)</h4>
      <p className="text-gray-600">10 أسابيع × 5 درجات = 50 درجة</p>
      <p className="text-xs text-gray-500 mt-1"><strong>لا تحويل</strong></p>
    </div>
    
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold text-primary-purple mb-2">🗓️ الشهرية (30 درجة)</h4>
      <p className="text-gray-600">3 أشهر × 30 نقطة = 90 نقطة</p>
      <p className="text-xs text-gray-500 mt-1">90 → <strong>÷ 3 = 30</strong></p>
    </div>
    
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold text-primary-purple mb-2">⭐ السلوك (10 درجات)</h4>
      <p className="text-gray-600">70 يوم × 1 درجة = 70 درجة</p>
      <p className="text-xs text-gray-500 mt-1">70 → <strong>÷ 7 = 10</strong></p>
    </div>
    
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <h4 className="font-semibold text-primary-purple mb-2">📝 الاختبار النهائي (60 درجة)</h4>
      <p className="text-gray-600">القرآن (40) + التجويد (20) = 60</p>
      <p className="text-xs text-gray-500 mt-1"><strong>لا تحويل</strong></p>
    </div>
    
    <div className="bg-gradient-to-br from-primary-purple to-primary-blue p-4 rounded-lg shadow-md text-white">
      <h4 className="font-bold mb-2">🎯 الإجمالي النهائي</h4>
      <p className="text-2xl font-bold">200 درجة</p>
      <p className="text-xs mt-1 opacity-90">50 + 50 + 30 + 10 + 60 = 200</p>
    </div>
  </div>
</div>
```

---

#### Phase 4: معالجة حالة عدم وجود بيانات الاختبار النهائي

**السيناريو:** قبل نهاية الفصل، لا توجد بيانات للاختبار النهائي بعد.

**الحل:**
```typescript
// في getAcademicReportData()
finalExams.forEach(exam => {
  const key = `${exam.studentId}-${exam.courseId}`;
  const item = studentsMap.get(key);
  if (item) {
    item.finalExamGrade = {
      quranTest: Number(exam.quranTest) || 0,
      tajweedTest: Number(exam.tajweedTest) || 0,
      total: (Number(exam.quranTest) || 0) + (Number(exam.tajweedTest) || 0)
    };
  }
});

// إذا لم يتم العثور على بيانات الاختبار النهائي، قم بتهيئة القيم بـ 0
if (!item.finalExamGrade) {
  item.finalExamGrade = {
    quranTest: 0,
    tajweedTest: 0,
    total: 0
  };
}

// في واجهة العرض
<td>
  {row.finalExamGrade.total > 0 
    ? `${row.finalExamGrade.total.toFixed(2)}` 
    : '⏳ لم يتم بعد'}
</td>
```

---

### خطة التحقق (Verification Plan)

#### 1. اختبار الحسابات (Unit Testing)
```typescript
// إنشاء ملف: src/__tests__/reports.test.ts

describe('Academic Reports Calculations', () => {
  it('should normalize daily grades correctly (700 ÷ 14 = 50)', () => {
    const rawDaily = 700;
    const normalized = rawDaily / 14;
    expect(normalized).toBe(50);
  });
  
  it('should normalize monthly grades correctly (90 ÷ 3 = 30)', () => {
    const rawMonthly = 90;
    const normalized = rawMonthly / 3;
    expect(normalized).toBe(30);
  });
  
  it('should normalize behavior grades correctly (70 ÷ 7 = 10)', () => {
    const rawBehavior = 70;
    const normalized = rawBehavior / 7;
    expect(normalized).toBe(10);
  });
  
  it('should calculate total correctly (50 + 50 + 30 + 10 + 60 = 200)', () => {
    const total = 50 + 50 + 30 + 10 + 60;
    expect(total).toBe(200);
  });
  
  it('should calculate percentage correctly for perfect score', () => {
    const total = 200;
    const percentage = (total / 200) * 100;
    expect(percentage).toBe(100);
  });
});
```

**تشغيل الاختبار:**
```bash
npm test src/__tests__/reports.test.ts
```

#### 2. الاختبار اليدوي (Manual Testing)

**الخطوات:**
1. تسجيل الدخول كـ Admin: `admin@shamokh.edu / admin123`
2. الانتقال إلى `/academic-reports`
3. التحقق من طالبة بدرجة كاملة (مثل مريم الشمري):
   - ✅ اليومية = 50
   - ✅ الأسبوعية = 50
   - ✅ الشهرية = 30
   - ✅ السلوك = 10
   - ✅ النهائي = 60
   - ✅ الإجمالي = 200
   - ✅ النسبة = 100%

4. تصدير التقرير كـ CSV والتحقق من صحة البيانات

#### 3. اختبار Regression

**التحقق من عدم كسر الصفحات الأخرى:**
- ✅ `/attendance-report` (لا تحتاج تعديل)
- ✅ `/behavior-points-report` (تستخدم BehaviorPoint بشكل صحيح للنقاط التحفيزية)
- ✅ `/teacher` dashboard
- ✅ `/student` dashboard

---

### معايير قبول الإصلاح

| المعيار | الحالة المطلوبة |
|:---|:---:|
| الدرجات المعيارية تظهر بشكل صحيح | ✅ |
| الاختبار النهائي مُدرج في الإجمالي | ✅ |
| الإجمالي من 200 وليس 910 | ✅ |
| استخدام `BehaviorGrade` للتقرير الأكاديمي | ✅ |
| استخدام `BehaviorPoint` للتقرير التحفيزي | ✅ |
| عناوين الجدول واضحة (من X) | ✅ |
| وجود بطاقة توضيحية للصيغ | ✅ |
| Tooltips على العناوين | ✅ |
| حالة "لم يتم بعد" للاختبار النهائي | ✅ |
| Build ناجح بدون أخطاء | ✅ |
| جميع الاختبارات تمر بنجاح | ✅ |

---

### ملاحظات إضافية

#### 1. التعامل مع الطالبات الجدد
```typescript
// إذا كانت الطالبة جديدة ولا توجد بيانات كافية
if (item.dailyGrades.count === 0) {
  item.dailyGrades.normalized = 0;
  item.dailyGrades.average = 0;
}
```

#### 2. عرض تحذير للمديرة
```tsx
{data.some(row => row.finalExamGrade.total === 0) && (
  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
    <p className="text-yellow-800">
      ⚠️ <strong>تنبيه:</strong> بعض الطالبات لم يتم رصد درجات الاختبار النهائي لهن بعد.
    </p>
  </div>
)}
```

#### 3. تسمية منطقية للملفات
```
✅ BehaviorGrade → للتقرير الأكاديمي (درجة السلوك من 10)
✅ BehaviorPoint → للتقرير التحفيزي (نقاط تحفيزية من 1400)
```

---

## 🎯 ملخص الإصلاحات المطلوبة

| # | الإصلاح | الأولوية | الملف |
|:---:|:---|:---:|:---|
| 1 | تطبيق الصيغ المعيارية (÷14, ÷3, ÷7) | 🔴 P0 | `src/actions/reports.ts` |
| 2 | إضافة الاختبار النهائي (60 درجة) | 🔴 P0 | `src/actions/reports.ts` |
| 3 | استخدام `BehaviorGrade` بدلاً من `BehaviorPoint` | 🔴 P0 | `src/actions/reports.ts` |
| 4 | تحديث عناوين الجدول (من X) | 🟡 P1 | `AcademicReportsContent.tsx` |
| 5 | إضافة بطاقة توضيحية للصيغ | 🟡 P1 | `AcademicReportsContent.tsx` |
| 6 | إضافة Tooltips على العناوين | 🟢 P2 | `AcademicReportsContent.tsx` |
| 7 | كتابة Unit Tests | 🟢 P2 | `src/__tests__/reports.test.ts` |

---

## 📎 المراجع

1. **نظام الدرجات الرسمي:** `docs/history/ARCHIVE_SESSIONS_13_17.md` (السطور 305-334)
2. **التصحيحات السابقة:** `PROJECT_TIMELINE.md` → Session 20.4 (السطور 87-90)
3. **الملفات المعنية:**
   - `src/actions/reports.ts`
   - `src/components/reports/AcademicReportsContent.tsx`
   - `src/app/(dashboard)/academic-reports/page.tsx`

---

**تاريخ الإنشاء:** 29 نوفمبر 2025  
**الحالة:** جاهز للتنفيذ  
**التقدير المبدئي:** 3-4 ساعات عمل  

---

**ملاحظة نهائية:** هذا التحليل شامل وجاهز للاستخدام كبرومبت للنموذج اللغوي. يُرجى مراجعة القسم "برومبت الإصلاح الاحترافي" والبدء في التنفيذ مباشرة.
