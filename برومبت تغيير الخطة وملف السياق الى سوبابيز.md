# إصلاح قاعدة البيانات - منصة شموخ v3

## السياق:
- **المشكلة:** قاعدة البيانات غير مشغلة (خادم معطل)
- **الحل:** ربط بـ Supabase وتشغيل النظام بالكامل
- **الهدف:** تحويل جميع APIs من البيانات الاحتياطية لقاعدة البيانات الحقيقية

## بيانات Supabase (ستوفرها لاحقاً):
- Project URL: `[URL]`
- Anon Key: `[KEY]`
- Service Role Key: `[KEY]`

## المطلوب:

### المرحلة 1: إعداد الاتصال بـ Supabase
1. **تحديث `.env.local`:**
```env
   DATABASE_URL="postgresql://[connection_string]"
   NEXT_PUBLIC_SUPABASE_URL="[project_url]"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[anon_key]"
   SUPABASE_SERVICE_ROLE_KEY="[service_key]"

اختبار الاتصال:

bash   npx prisma db push
   npx prisma generate
المرحلة 2: إنشاء جميع الجداول المطلوبة
بناءً على الجلسات 1-10، إنشاء:
الجداول الأساسية:

User (مع الأدوار الأربعة: ADMIN, MANAGER, TEACHER, STUDENT)
Program (البرامج التعليمية)
Course (الحلقات مع المستويات)
Student (بيانات الطالبات الشاملة حسب الجلسة 6)

جداول العمليات:

EnrollmentRequest (طلبات الانضمام - الجلسة 7)
Enrollment (التسجيل النهائي - الجلسة 9)
Attendance (الحضور اليومي - الجلسة 10)
Grade (الدرجات - مُعد للجلسة 11)
DailyTask (المهام اليومية - مُعد للجلسة 15)

المرحلة 3: زرع البيانات الأولية
javascript// المستخدمون الأربعة التجريبيون
const testUsers = [
  { userEmail: "admin@shamokh.edu", userName: "المدير الأول", userRole: "ADMIN" },
  { userEmail: "manager@shamokh.edu", userName: "المدير التنفيذي", userRole: "MANAGER" },
  { userEmail: "teacher1@shamokh.edu", userName: "المعلمة سارة", userRole: "TEACHER" },
  { userEmail: "student1@shamokh.edu", userName: "الطالبة فاطمة", userRole: "STUDENT" }
];

// بيانات تجريبية للبرامج والحلقات
// طالبات تجريبية
// ربط البيانات
المرحلة 4: تحديث جميع APIs المتأثرة
إزالة البيانات الاحتياطية من:
APIs التسجيل:

/api/enrollment/available-courses → قراءة من قاعدة البيانات
/api/enrollment/request → حفظ في EnrollmentRequest
/api/enrollment/teacher-requests → قراءة من EnrollmentRequest
/api/enrollment/manage-request → تحديث EnrollmentRequest + إنشاء Enrollment
/api/enrollment/enrolled-students → قراءة من Enrollment

APIs الحضور:

/api/attendance/today → قراءة/كتابة في Attendance
/api/attendance/update → حفظ في Attendance
/api/attendance/course/[courseId] → قراءة من Attendance

APIs أخرى:

/api/grades/my-grades → قراءة من Grade (مُعد للمستقبل)
/api/tasks/* → مُعد للجلسة 15

المرحلة 5: الاختبار الشامل

اختبار العمليات الكاملة:

طالبة تقدم طلب انضمام
معلمة توافق على الطلب
طالبة تظهر في قائمة المسجلات
معلمة تسجل حضور الطالبة
البيانات محفوظة ومسترجعة صحيحة


اختبار البناء:

bash   npm run build
   npm start
معايير النجاح:

✅ Supabase متصل ويعمل
✅ جميع الجداول مُنشأة وتحتوي على بيانات تجريبية
✅ لا توجد بيانات احتياطية - كل الـ APIs تتصل بقاعدة البيانات
✅ العمليات الكاملة تعمل (طلب انضمام → قبول → تسجيل حضور)
✅ npm run build ينجح بدون أخطاء
✅ المشروع جاهز للجلسة 11 (التقييم اليومي)

ملاحظات مهمة:

لا تغيير في التصميم - فقط تشغيل ما هو موجود
احتفظ بالـ schema الحالي - هو صحيح ومدروس
اختبر كل API فردياً بعد التحديث
Commit بعد كل مرحلة تعمل بنجاح