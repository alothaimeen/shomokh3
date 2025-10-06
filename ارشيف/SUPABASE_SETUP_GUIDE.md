# 🚀 دليل الربط مع Supabase - منصة شموخ v3

## الخطوات المطلوبة للربط مع Supabase

### المرحلة 1: إعداد مشروع Supabase

1. **إنشاء حساب Supabase:**
   - اذهب إلى [supabase.com](https://supabase.com)
   - أنشئ حساب جديد أو سجل دخول
   - انقر على "New Project"

2. **إعداد المشروع:**
   - اختر اسم المشروع: `shamokh-v3`
   - اختر كلمة مرور قوية لقاعدة البيانات
   - اختر المنطقة الأقرب لك
   - انقر على "Create new project"

3. **الحصول على بيانات الاتصال:**
   ```
   Project URL: https://[PROJECT_REF].supabase.co
   Anon Key: [ANON_KEY]
   Service Role Key: [SERVICE_ROLE_KEY]
   Database Password: [كلمة المرور التي اخترتها]
   ```

### المرحلة 2: تحديث ملف .env

1. **افتح ملف `.env`**
2. **استبدل الأسطر المعلقة بالقيم الحقيقية:**

```bash
# احذف هذا السطر أو علق عليه
# DATABASE_URL="prisma+postgres://localhost:51213/..."

# أضف هذا السطر مع بياناتك الحقيقية
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# أضف بيانات Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[ANON_KEY]"
SUPABASE_SERVICE_ROLE_KEY="[SERVICE_ROLE_KEY]"
```

### المرحلة 3: إنشاء الجداول في Supabase

1. **تشغيل Prisma لإنشاء الجداول:**
```bash
npx prisma generate
npx prisma db push
```

2. **إذا نجحت العملية، ستظهر رسالة مثل:**
```
✅ Your database is now in sync with your schema.
```

### المرحلة 4: زرع البيانات الأولية

1. **تشغيل سكريبت البيانات الأولية:**
```bash
node scripts/setup-database.js
```

2. **التحقق من نجاح العملية:**
   - اذهب إلى Supabase Dashboard
   - انقر على "Table Editor"
   - تأكد من وجود الجداول والبيانات

### المرحلة 5: اختبار الاتصال

1. **تشغيل التطبيق:**
```bash
npm run dev
```

2. **اختبار APIs:**
   - اذهب إلى `http://localhost:3000/api/enrollment/available-courses`
   - يجب أن ترى البيانات من قاعدة البيانات وليس البيانات الاحتياطية

### المرحلة 6: إعداد Row Level Security (RLS)

**في Supabase Dashboard:**

1. **انقر على "Authentication" → "Policies"**
2. **لكل جدول، أضف السياسات التالية:**

```sql
-- للجدول users
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- للجدول students
CREATE POLICY "Students can view own data" ON students
  FOR SELECT USING (auth.uid()::text = id);

-- للجدول courses
CREATE POLICY "Anyone can view active courses" ON courses
  FOR SELECT USING (is_active = true);

-- للجدول enrollments
CREATE POLICY "Users can view own enrollments" ON enrollments
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT id FROM users WHERE email = auth.email()
    )
  );
```

### ملاحظات مهمة:

✅ **تأكد من:**
- استخدام connection pooling مع Supabase (`pgbouncer=true`)
- حفظ بيانات الاتصال في مكان آمن
- عدم مشاركة Service Role Key مع أحد

❌ **تجنب:**
- استخدام Service Role Key في الكود العام
- تشغيل `prisma db push` في بيئة الإنتاج بدون نسخ احتياطية
- تفعيل RLS بدون سياسات مناسبة

### استكشاف الأخطاء:

#### خطأ الاتصال:
```
Error: P1001: Can't reach database server
```
**الحل:** تأكد من صحة رابط قاعدة البيانات وكلمة المرور

#### خطأ الصلاحيات:
```
Error: P3009: migrate found failed migration
```
**الحل:** احذف ملف `prisma/migrations` واستخدم `prisma db push`

#### بطء في الاستجابة:
**الحل:** استخدم connection pooling وقلل عدد الاستعلامات

### الخطوة التالية:
بعد إكمال هذه الخطوات، ستكون قاعدة البيانات جاهزة ويمكن المتابعة لتحديث APIs!