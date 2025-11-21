# برومبت للمحادثة القادمة - إصلاح مشكلة الربط في قاعدة البيانات

## السياق
اقرأ الملفين التاليين لفهم السياق الكامل:
1. **AI_CONTEXT.md** - معلومات المشروع والقواعد التقنية
2. **PROJECT_TIMELINE.md** - تاريخ الجلسات وآخر التحديثات (الجلسة 17.5)

## المشكلة الحرجة المكتشفة

### الأعراض
- المعلمة `teacher1@shamokh.edu` لديها حلقتين في قاعدة البيانات لكن Dashboard تعرض: "لا توجد حلقات مسندة لك حالياً"
- صفحة `/my-attendance` للطالبة تعلق في التحميل
- API `/api/courses/teacher-courses` يعطي `200 OK` لكن `courses: []` (نتيجة فارغة)

### السبب الجذري
**مشكلة Foreign Keys في قاعدة البيانات:**
- قيم `Course.teacherId` لا تطابق `User.id` للمعلمة
- قد توجد نفس المشكلة في `Student.userId`

### ما تم إصلاحه في الجلسة 17.5
تم إصلاح **8 ملفات** لجعل APIs والـ Hooks تبحث بالطريقة الصحيحة:

1. ✅ `src/app/api/grades/my-grades/route.ts` - يبحث الآن بـ `userId` بدلاً من `studentName`
2. ✅ `src/app/api/courses/teacher-courses/route.ts` - يبحث الآن بـ `teacherId` بدلاً من `userEmail`
3. ✅ `src/hooks/useEnrollments.ts` - أضيف `shouldFetch` parameter
4. ✅ `src/hooks/useCourses.ts` - تغيير من `teacherId` string إلى `shouldFetch` boolean
5. ✅ `src/app/dashboard/page.tsx` - استدعاء Hooks بشكل شرطي
6. ✅ `src/app/my-attendance/page.tsx` - تحويل لـ SWR pattern
7. ✅ `src/app/my-grades/page.tsx` - إصلاح syntax error + loading state
8. ✅ `scripts/link-existing-students.js` - تم تشغيله بنجاح

**النتيجة:** APIs تعمل بشكل صحيح الآن، لكن البيانات في قاعدة البيانات غير مرتبطة.

## المطلوب منك

### 1. فحص قاعدة البيانات
```sql
-- التحقق من User.id للمعلمة
SELECT id, userName, userEmail, userRole FROM "User" WHERE userRole = 'TEACHER';

-- التحقق من Course.teacherId
SELECT id, courseName, teacherId FROM "Course";

-- التحقق من Student.userId  
SELECT id, studentName, studentNumber, userId FROM "Student";
```

### 2. إصلاح البيانات
يجب ربط:
- `Course.teacherId` → `User.id` للمعلمة الصحيحة
- `Student.userId` → `User.id` للطالبة الصحيحة

**مهم:** استخدم `prisma.$executeRawUnsafe` كما هو موضح في AI_CONTEXT.md:
```typescript
await prisma.$executeRawUnsafe(`
  UPDATE "Course" 
  SET "teacherId" = '[correct-teacher-user-id]'
  WHERE "id" IN ('[course-id-1]', '[course-id-2]');
`);
```

### 3. اختبار بعد الإصلاح
استخدم **MCP browser tools** للتحقق من:
1. تسجيل دخول المعلمة (`teacher1@shamokh.edu / teacher123`)
2. Dashboard يعرض الحلقتين: "حلقة الفجر" و "حلقة العصر"
3. فتح `/enrolled-students` يعرض الطالبات
4. تسجيل دخول الطالبة (`student1@shamokh.edu / student123`)
5. `/my-attendance` يعرض بيانات الحضور بدون توقف في التحميل

### 4. إكمال Verification Protocol
بعد إصلاح البيانات، أكمل فحص صفحات المعلمة المتبقية:
- `/attendance` - تسجيل الحضور
- `/unified-assessment` - التقييم الموحد
- `/weekly-grades` - الدرجات الأسبوعية
- `/monthly-grades` - الدرجات الشهرية
- `/behavior-points` - درجات السلوك

## معلومات تقنية مهمة

### Database Connection
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:6543/postgres?pgbouncer=true"
```
**⚠️ يجب استخدام port 6543 و pgbouncer=true دائماً**

### Test Accounts
```
teacher1@shamokh.edu / teacher123
student1@shamokh.edu / student123
admin@shamokh.edu / admin123
```

### MCP Browser Commands
```javascript
// Navigate to page
mcp_microsoft_pla_browser_navigate({ url: "http://localhost:3000/login" })

// Take snapshot to see page
mcp_microsoft_pla_browser_snapshot()

// Fill login form
mcp_microsoft_pla_browser_type({ 
  ref: "[email-input-ref]", 
  text: "teacher1@shamokh.edu" 
})
```

## النتيجة المتوقعة

بعد إصلاح قاعدة البيانات:
- ✅ المعلمة تشاهد حلقاتها في Dashboard
- ✅ الطالبة تشاهد بيانات الحضور في `/my-attendance`
- ✅ جميع APIs تعيد بيانات صحيحة
- ✅ لا أخطاء 403 Forbidden
- ✅ لا infinite loading states

## ملاحظات مهمة

1. **لا تستخدم `prisma migrate` أو `prisma db push`** - يسبب تعليق مع PgBouncer
2. **استخدم فقط `$executeRawUnsafe`** لأي تعديلات على Schema أو البيانات
3. **تحقق من `User.id` قبل التحديث** - يجب أن يكون القيمة الصحيحة
4. **اختبر مباشرة بعد كل تحديث** - باستخدام MCP browser tools
5. **حدّث PROJECT_TIMELINE.md** بعد الإصلاح بإضافة قسم "Session 17.6"

---

**ابدأ بفحص قاعدة البيانات وإصلاح قيم teacherId و userId.**
