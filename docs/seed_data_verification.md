# Seed Data Verification

This file contains the data that will be inserted into the database by the simulation script.

## 1. Programs & Circles

### Program 1: تصحيح التلاوة (Correction)
- **Circle 1**: تصحيح جزء عمَّ
    - **Teacher**: ريدى اليوسف (rida@shamokh.edu)
    - **Students**: 30
- **Circle 2**: تصحيح جزء تبارك
    - **Teacher**: رحمة أحمد (rahma@shamokh.edu)
    - **Students**: 30
- **Circle 3**: تصحيح ٥ الأحقاف
    - **Teacher**: وردة الراشد (warda@shamokh.edu)
    - **Students**: 30

### Program 2: المراجعة (Review)
- **Circle 1**: مراجعة المصحف كامل
    - **Teacher**: نجوى الأيوبي (najwa@shamokh.edu)
    - **Students**: 30
- **Circle 2**: مراجعة ٥ من البقرة
    - **Teacher**: أسماء حميد (asma@shamokh.edu)
    - **Students**: 30
- **Circle 3**: مراجعة ١٠ من البقرة
    - **Teacher**: إحسان ضبيط (ihsan@shamokh.edu)
    - **Students**: 30

### Program 3: المراحل العليا (Advanced)
- **Circle 1**: عليا م١
    - **Teacher**: ثريا بكر (thuraya@shamokh.edu)
    - **Students**: 30
- **Circle 2**: عليا م٢
    - **Teacher**: سمية فتوي (sumaya@shamokh.edu)
    - **Students**: 30
- **Circle 3**: عليا م٣
    - **Teacher**: مشاعل رمضان (mashael@shamokh.edu)
    - **Students**: 30

## 2. Totals
- **Programs**: 3
- **Circles**: 9
- **Teachers**: 9
- **Students**: 270

## 3. Timeline
- **Start Date**: 31 August 2025 (8 Rabi Al-Awwal 1447)
- **End Date**: 18 December 2025 (27 Jumada Al-Akhirah 1447)
- **Duration**: 16 Weeks
- **Holidays**:
    - National Day: 23 Sep 2025
    - Extra Holiday: 12 Oct 2025
    - Autumn Break: 23-27 Nov 2025
    - Extra Holidays: 11 Dec, 14 Dec 2025

## 4. Grading Simulation
- **Daily Grades**: Every teaching day (Memorization, Tajweed, Review).
- **Weekly Exams**: Weeks 2, 3, 4, 6, 7, 8, 10, 11, 12, 15.
- **Monthly Exams**: Weeks 5, 9, 14.
- **Final Exam**: Week 16.
- **Behavior Points**: Daily.

## 5. Student Profiles & Grades Logic
The 270 students (30 per circle) will be generated with varied performance levels to simulate a real classroom.

### Performance Distribution
| Profile | Percentage | Count (approx) | Description |
|---------|------------|----------------|-------------|
| **Excellent (ممتازة)** | 20% | ~54 students | High marks (95-100%), full attendance, rare mistakes. |
| **Good (جيدة)** | 50% | ~135 students | Average marks (80-94%), occasional mistakes, good attendance. |
| **Weak (ضعيفة)** | 20% | ~54 students | Low marks (60-79%), frequent mistakes, occasional absence. |
| **Failing (متعثرة)** | 10% | ~27 students | Very low marks (<60%), frequent absence, many mistakes. |

### Grading Rules per Profile
- **Excellent**:
    - Daily: 9.5 - 10
    - Weekly: 4.5 - 5
    - Monthly: 28 - 30
    - Final: 57 - 60
    - Attendance: 98% Present
- **Good**:
    - Daily: 8 - 9.5
    - Weekly: 4 - 4.5
    - Monthly: 24 - 28
    - Final: 48 - 56
    - Attendance: 90% Present
- **Weak**:
    - Daily: 6 - 8
    - Weekly: 3 - 4
    - Monthly: 18 - 24
    - Final: 36 - 48
    - Attendance: 80% Present
- **Failing**:
    - Daily: < 6
    - Weekly: < 3
    - Monthly: < 18
    - Final: < 36
    - Attendance: < 70% Present (Frequent Absence)

### قائمة الطالبات وبيانات الدخول (Student List & Credentials)
تم إنشاء قائمة كاملة بأسماء الطالبات (270 طالبة) مع بيانات الدخول (البريد الإلكتروني وكلمة المرور) وتحديد مستوى كل طالبة.
يمكنك الاطلاع على القائمة الكاملة هنا:
[📂 قائمة الطالبات والدرجات المتوقعة](seed_students_list.md)

**بيانات الدخول الموحدة:**
- **كلمة المرور لجميع الحسابات:** `password123`
- **البريد الإلكتروني:** موضح في القائمة لكل طالبة ومعلمة.
