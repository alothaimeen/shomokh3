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
