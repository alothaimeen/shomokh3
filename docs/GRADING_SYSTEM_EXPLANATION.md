# 📊 نظام احتساب الدرجات في منصة شموخ

هذا المستند يشرح بالتفصيل كيفية احتساب الدرجات للطالبات في منصة شموخ، وكيفية الوصول إلى المجموع النهائي (200 درجة)، بالإضافة إلى نظام النقاط التحفيزية.

---

## 📝 أولاً: الدرجات الأكاديمية (المجموع: 200 درجة)

يتم تقييم الطالبة بناءً على 5 معايير رئيسية:

| المعيار | الدرجة القصوى | النسبة من المجموع |
|:---|:---:|:---:|
| **1. التقييم اليومي** | **50** | 25% |
| **2. التقييم الأسبوعي** | **50** | 25% |
| **3. التقييم الشهري** | **30** | 15% |
| **4. السلوك والمواظبة** | **10** | 5% |
| **5. الاختبار النهائي** | **60** | 30% |
| **المجموع الكلي** | **200** | **100%** |

### 🔍 التفاصيل الحسابية لكل معيار

#### 1. التقييم اليومي (50 درجة)
يتم تقييم الطالبة يومياً لمدة **70 يوماً** دراسياً.
*   **درجة اليوم الواحد:** 10 درجات (5 حفظ + 5 مراجعة).
*   **المجموع الخام:** 70 يوماً × 10 درجات = **700 درجة**.
*   **المعادلة النهائية:** `700 ÷ 14 = 50 درجة`.

#### 2. التقييم الأسبوعي (50 درجة)
يتم تقييم الطالبة أسبوعياً لمدة **10 أسابيع**.
*   **درجة الأسبوع الواحد:** 5 درجات.
*   **المجموع النهائي:** 10 أسابيع × 5 درجات = **50 درجة**.

#### 3. التقييم الشهري (30 درجة)
يتم تقييم الطالبة شهرياً لمدة **3 أشهر**.
*   **درجة الشهر الواحد:** 30 درجة (قرآن وتجويد).
*   **المجموع الخام:** 3 أشهر × 30 درجة = **90 درجة**.
*   **المعادلة النهائية:** `90 ÷ 3 = 30 درجة`.

#### 4. السلوك والمواظبة (10 درجات)
يتم رصد درجة السلوك يومياً لمدة **70 يوماً**.
*   **درجة اليوم الواحد:** 1 درجة.
*   **المجموع الخام:** 70 يوماً × 1 درجة = **70 درجة**.
*   **المعادلة النهائية:** `70 ÷ 7 = 10 درجات`.

#### 5. الاختبار النهائي (60 درجة)
*   **توزيع الدرجات:** 40 قرآن + 20 تجويد = **60 درجة**.

---

## 🌟 ثانياً: النقاط التحفيزية (المجموع: 2450 نقطة)

هذا نظام منفصل عن الدرجات الأكاديمية، يهدف لتحفيز الطالبات على الاجتهاد والانضباط.

| النوع | النقاط اليومية | عدد الأيام | المجموع الكلي |
|:---|:---:|:---:|:---:|
| **1. المهام الذاتية (للطالبة)** | **15** | 70 | **1050** |
| **2. النقاط السلوكية (للمعلمة)** | **20** | 70 | **1400** |
| **المجموع الكلي** | **35** | - | **2450** |

### 🔍 تفاصيل النقاط

#### 1. المهام الذاتية (1050 نقطة)
تقوم الطالبة بتسجيل إنجازها لهذه المهام يومياً:
*   **السماع 5 مرات:** 5 نقاط.
*   **التكرار 10 مرات:** 5 نقاط.
*   **السرد على الرفيقة:** 5 نقاط.
*   **المجموع اليومي:** 15 نقطة.

#### 2. النقاط السلوكية (1400 نقطة)
تقوم المعلمة برصد هذه النقاط للطالبة يومياً:
*   **الحضور المبكر:** 5 نقاط.
*   **الحفظ المتقن:** 5 نقاط.
*   **المشاركة الفعالة:** 5 نقاط.
*   **الالتزام بالوقت:** 5 نقاط.
*   **المجموع اليومي:** 20 نقطة.

---

## 📈 تقدير الدرجات (النسبة المئوية)

يتم حساب النسبة المئوية للدرجات الأكاديمية بقسمة مجموع الطالبة على 2.

| النسبة المئوية | التقدير |
|:---:|:---:|
| **90% - 100%** | **ممتاز** 🟢 |
| **80% - 89%** | **جيد جداً** 🟡 |
| **70% - 79%** | **جيد** 🟠 |
| **60% - 69%** | **مقبول** 🟠 |
| **أقل من 60%** | **ضعيف** 🔴 |

# 🛠️ Grading System - Technical Reference

> **Target Audience:** AI Models & Developers
> **Purpose:** Comprehensive guide to the grading logic, formulas, and code locations.
> **Last Updated:** 2025-11-30

---

## 📐 Core Formulas & Logic

The system uses a **200-point scale** for the final grade.

### 1. Daily Grades (`DailyGrade`)
*   **Source Table:** `daily_grades`
*   **Logic:**
    *   `memorization` (0-5) + `review` (0-5) = **10 points/day**
    *   **Raw Total:** Sum of all records (Target: 70 days × 10 = 700)
    *   **Normalization:** `Raw Total / 14`
    *   **Max Normalized:** `700 / 14 = 50`

### 2. Weekly Grades (`WeeklyGrade`)
*   **Source Table:** `weekly_grades`
*   **Logic:**
    *   `grade` (0-5) = **5 points/week**
    *   **Raw Total:** Sum of all records (Target: 10 weeks × 5 = 50)
    *   **Normalization:** None (Raw Total is used directly)
    *   **Max Total:** **50**

### 3. Monthly Grades (`MonthlyGrade`)
*   **Source Table:** `monthly_grades`
*   **Logic:**
    *   `quranForgetfulness` (0-5) + `quranMajorMistakes` (0-5) + `quranMinorMistakes` (0-5) + `tajweedTheory` (0-15) = **30 points/month**
    *   **Raw Total:** Sum of all records (Target: 3 months × 30 = 90)
    *   **Normalization:** `Raw Total / 3`
    *   **Max Normalized:** `90 / 3 = 30`

### 4. Behavior Grades (`BehaviorGrade`)
*   **Source Table:** `behavior_grades`
*   **Logic:**
    *   `dailyScore` (0-1) = **1 point/day**
    *   **Raw Total:** Sum of all records (Target: 70 days × 1 = 70)
    *   **Normalization:** `Raw Total / 7`
    *   **Max Normalized:** `70 / 7 = 10`

### 5. Final Exam (`FinalExam`)
*   **Source Table:** `final_exams`
*   **Logic:**
    *   `quranTest` (0-40) + `tajweedTest` (0-20) = **60 points**
    *   **Max Total:** **60**

### 6. Final Calculation
```typescript
Overall Total = 
  (Daily Raw / 14) + 
  (Weekly Raw) + 
  (Monthly Raw / 3) + 
  (Behavior Raw / 7) + 
  (Final Exam Total)

// Max Score: 50 + 50 + 30 + 10 + 60 = 200
```

---

## 🌟 Incentive Points System

Separate from the academic grading, used for motivation.

### 1. Daily Tasks (`DailyTask`)
*   **Source Table:** `daily_tasks`
*   **Input:** Student (Self-reported)
*   **Logic:**
    *   `listening5Times` = **5 points**
    *   `repetition10Times` = **5 points**
    *   `recitedToPeer` = **5 points**
    *   **Total per Day:** **15 points**
    *   **Max Total:** 70 days × 15 = **1050 points**

### 2. Behavior Points (`BehaviorPoint`)
*   **Source Table:** `behavior_points`
*   **Input:** Teacher
*   **Logic:**
    *   `earlyAttendance` = **5 points**
    *   `perfectMemorization` = **5 points**
    *   `activeParticipation` = **5 points**
    *   `timeCommitment` = **5 points**
    *   **Total per Day:** **20 points**
    *   **Max Total:** 70 days × 20 = **1400 points**

### Total Incentive Points
```typescript
Total = Daily Tasks (1050) + Behavior Points (1400) = 2450 Points
```

---

## 📂 Code Locations

### 1. Calculation Logic (Primary Source of Truth)
*   **File:** `src/actions/reports.ts`
*   **Function:** `getAcademicReportData` (Academic), `getBehaviorPointsReportData` (Incentive)
*   **Description:** Contains the actual aggregation and normalization logic used in reports.

### 2. Helper Formulas (Reference)
*   **File:** `src/lib/grading-formulas.ts`
*   **Description:** Contains pure functions for calculations. Used by UI components for immediate feedback, but `reports.ts` is the authority for final reports.

### 3. Database Schema
*   **File:** `prisma/schema.prisma`
*   **Models:** `DailyGrade`, `WeeklyGrade`, `MonthlyGrade`, `BehaviorGrade`, `FinalExam`, `DailyTask`, `BehaviorPoint`.

---

## 🔗 Dependencies & Affected Pages

### Pages Displaying Grades
1.  **Academic Reports:** `src/app/(dashboard)/academic-reports/page.tsx`
2.  **Behavior Points Report:** `src/app/(dashboard)/behavior-points-report/page.tsx`
3.  **Student Dashboard:** `src/components/dashboard/StudentDashboard.tsx`

### Pages for Data Entry
1.  **Daily:** `src/app/(dashboard)/daily-grades/page.tsx`
2.  **Weekly:** `src/app/(dashboard)/weekly-grades/page.tsx`
3.  **Monthly:** `src/app/(dashboard)/monthly-grades/page.tsx`
4.  **Behavior (Academic):** `src/app/(dashboard)/behavior-grades/page.tsx`
5.  **Final Exam:** `src/app/(dashboard)/final-exam/page.tsx`
6.  **Tasks (Student):** `src/app/(dashboard)/self-tasks/page.tsx`
7.  **Behavior Points (Teacher):** `src/app/(dashboard)/behavior-points/page.tsx`

---

## ⚠️ Critical Notes

1.  **Normalization Factors:** The divisors (14, 3, 7) are currently hardcoded in `src/actions/reports.ts`.
2.  **Behavior Distinction:**
    *   `BehaviorGrade` = **Academic Grade** (Max 10). Part of the 200 total.
    *   `BehaviorPoint` = **Incentive Points** (Max 1400). Part of the 2450 total.
    *   **DO NOT CONFUSE THEM.**
