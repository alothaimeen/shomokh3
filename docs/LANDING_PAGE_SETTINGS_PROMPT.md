# 📋 برومبت: تطوير صفحة الإعدادات لإدارة بيانات الصفحة الرئيسية والصفحات العامة

> **تعليمات مهمة للـ AI:**  
> قبل البدء في تنفيذ هذا البرومبت، يجب عليك قراءة الملفين التاليين بالكامل لمعرفة السياق والمتطلبات:
> 1. **[PROJECT_TIMELINE.md](../PROJECT_TIMELINE.md)** - لفهم الحالة الحالية للمشروع والجلسات المكتملة
> 2. **[AI_RULES.md](../AI_RULES.md)** - للالتزام بالأنماط والقواعد التقنية الصارمة

---

## 🎯 الهدف العام

تحسين الصفحة الرئيسية (Landing Page) والصفحات العامة للمنصة من خلال:
1. إنشاء البنية التحتية (صفحة إعدادات شاملة لإدارة المحتوى)
2. ربط البيانات الإحصائية بقاعدة البيانات بدلاً من البيانات الوهمية
3. تهذيب الصفحات النهائية (إزالة الشريط الجانبي والتأكد من خلو المشاكل)

---

## ⚙️ المشكلة الأولى: إنشاء البنية التحتية (صفحة الإعدادات)

### نظرة عامة
إنشاء صفحة إعدادات متقدمة في لوحة تحكم المدير (`/admin/site-settings`) لإدارة جميع محتوى الصفحات العامة.

هذا هو **الأساس** الذي ستُبنى عليه باقي المهام، لذا يجب البدء به أولاً.

---

---

### 1️⃣ البنية التحتية (Database Schema)

---

#### جدول جديد: `PublicSiteSettings`



```prisma
model PublicSiteSettings {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // إحصائيات الصفحة الرئيسية
  studentsCount     Int      @default(0)
  teachersCount     Int      @default(0)
  coursesCount      Int      @default(0)
  facesCompleted    Int      @default(0)
  
  // عن الجمعية
  aboutTitle        String   @default("عن الجمعية")
  aboutVision       String   @db.Text
  aboutMission      String   @db.Text
  aboutGoals        String   @db.Text
  
  // إنجازاتنا
  achievementsTitle String   @default("إنجازاتنا")
  achievementsText  String   @db.Text
  
  // تواصل معنا
  contactTitle      String   @default("تواصل معنا")
  contactEmail      String   @default("")
  contactPhone      String   @default("")
  contactAddress    String   @default("")
  contactWhatsapp   String   @default("")
  
  // Meta Settings
  isActive          Boolean  @default(true)
  lastEditedBy      String?  @relation("EditedBy", fields: [lastEditedById], references: [id])
  lastEditedById    String?

  @@map("public_site_settings")
}
```

**ملاحظة مهمة:**  
- يجب التأكد من أن هذا الجدول يحتوي على **سجل واحد فقط** (Singleton Pattern)
- استخدام `findFirst()` أو `upsert()` لضمان ذلك

### 2️⃣ Server Actions المطلوبة

#### ملف جديد: `src/actions/public-settings.ts`

```typescript
'use server';

import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * جلب الإحصائيات الحقيقية من قاعدة البيانات
 * للاستخدام كاقتراحات في صفحة الإعدادات
 */
export async function getRealStats() {
  // 🔒 Security: Admin only
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'غير مصرح' };
  }

  const [studentsCount, teachersCount, coursesCount, facesCompleted] = await Promise.all([
    db.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
    db.user.count({ where: { role: 'TEACHER', status: 'ACTIVE' } }),
    db.course.count({ where: { isActive: true } }),
    // حساب الوجوه المنجزة (يحتاج تعديل حسب بنية قاعدة البيانات)
    db.dailyGrade.aggregate({
      _sum: { memorization: true }
    }).then(result => Math.floor((result._sum.memorization || 0) / 10)) // مثال
  ]);

  return {
    success: true,
    data: { studentsCount, teachersCount, coursesCount, facesCompleted }
  };
}

/**
 * جلب إعدادات الموقع الحالية
 */
export async function getSiteSettings() {
  const settings = await db.publicSiteSettings.findFirst({ where: { isActive: true } });
  
  // إذا لم تكن موجودة، إنشاء إعدادات افتراضية
  if (!settings) {
    return await db.publicSiteSettings.create({
      data: {
        studentsCount: 0,
        teachersCount: 0,
        coursesCount: 0,
        facesCompleted: 0,
        aboutVision: 'أضف رؤيتنا هنا',
        aboutMission: 'أضف رسالتنا هنا',
        aboutGoals: 'أضف أهدافنا هنا',
        achievementsText: 'أضف إنجازاتنا هنا',
      }
    });
  }
  
  return settings;
}

/**
 * تحديث إعدادات الموقع
 */
export async function updateSiteSettings(formData: FormData) {
  // 🔒 Security: Admin only
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return { success: false, error: 'غير مصرح' };
  }

  const settings = await db.publicSiteSettings.findFirst({ where: { isActive: true } });

  const data = {
    studentsCount: parseInt(formData.get('studentsCount') as string),
    teachersCount: parseInt(formData.get('teachersCount') as string),
    coursesCount: parseInt(formData.get('coursesCount') as string),
    facesCompleted: parseInt(formData.get('facesCompleted') as string),
    aboutVision: formData.get('aboutVision') as string,
    aboutMission: formData.get('aboutMission') as string,
    aboutGoals: formData.get('aboutGoals') as string,
    achievementsText: formData.get('achievementsText') as string,
    contactEmail: formData.get('contactEmail') as string,
    contactPhone: formData.get('contactPhone') as string,
    contactAddress: formData.get('contactAddress') as string,
    contactWhatsapp: formData.get('contactWhatsapp') as string,
    lastEditedById: session.user.id,
    updatedAt: new Date(),
  };

  if (settings) {
    await db.publicSiteSettings.update({
      where: { id: settings.id },
      data
    });
  } else {
    await db.publicSiteSettings.create({ data });
  }

  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/achievements');
  revalidatePath('/contact');
  revalidatePath('/admin/site-settings');

  return { success: true, message: 'تم حفظ الإعدادات بنجاح' };
}

/**
 * جلب الإحصائيات العامة (للصفحة الرئيسية - Public)
 * مع Cache لساعة واحدة
 */
export async function getPublicStats() {
  const settings = await db.publicSiteSettings.findFirst({ 
    where: { isActive: true }
  });

  if (!settings) {
    return { studentsCount: 0, teachersCount: 0, coursesCount: 0, facesCompleted: 0 };
  }

  return {
    studentsCount: settings.studentsCount,
    teachersCount: settings.teachersCount,
    coursesCount: settings.coursesCount,
    facesCompleted: settings.facesCompleted,
  };
}
```

### 3️⃣ واجهة صفحة الإعدادات

#### الصفحة: `/admin/site-settings`

##### المتطلبات الوظيفية:

**أ. تقسيم الصفحة إلى 4 أقسام (Tabs):**

1. **📊 الإحصائيات** (Statistics Tab)
   - 4 حقول إدخال رقمية:
     - عدد الطالبات
     - عدد المعلمات
     - عدد الحلقات القرآنية
     - عدد الوجوه المنجزة
   - **ميزة الاقتراح الذكي:**
     - أسفل/أعلى كل حقل: سطر صغير يعرض القيمة الحقيقية من قاعدة البيانات
     - مثال: "القيمة الفعلية في قاعدة البيانات: 11,234 طالبة"
     - زر صغير "استخدام القيمة الفعلية" بجانب كل اقتراح

2. **ℹ️ عن الجمعية** (About Tab)
   - عنوان القسم (input)
   - رؤيتنا (textarea كبير، RTL)
   - رسالتنا (textarea كبير، RTL)
   - أهدافنا التعليمية (textarea كبير، RTL)

3. **🏆 إنجازاتنا** (Achievements Tab)
   - عنوان القسم (input)
   - نص الإنجازات (textarea كبير، RTL، يدعم Markdown اختياري)

4. **📞 تواصل معنا** (Contact Tab)
   - عنوان القسم (input)
   - البريد الإلكتروني (email input)
   - رقم الهاتف (tel input)
   - العنوان (textarea)
   - رقم الواتساب (tel input)

##### التصميم والـ UX:

- استخدام **Tabs Component** من shadcn/ui أو تصميم مخصص
- كل حقل يجب أن يكون واضح مع Label + Placeholder
- زر "حفظ التغييرات" في أسفل كل Tab
- Toast notifications عند النجاح/الفشل
- Loading state أثناء الحفظ
- **الاقتراحات الذكية:**
  ```
  [حقل الإدخال: 11,548]
  💡 القيمة الفعلية: 11,234 طالبة [زر: استخدام]
  ```

---

## 📊 المشكلة الثانية: ربط البيانات الإحصائية بقاعدة البيانات

### الوضع الحالي
الصفحة الرئيسية (قبل تسجيل الدخول) تعرض بيانات ثابتة (mockup):

```yaml
البيانات الحالية:
  - 11,548+ طالبة
  - 60+ معلمة
  - 59+ حلقة قرآنية
  - 2,075,633 وجه منجز
```

### المتطلبات
- ربط هذه الأرقام بقاعدة البيانات الفعلية التي تم إنشاؤها في **المشكلة الأولى**
- حساب البيانات ديناميكياً باستخدام الـ Server Actions الجاهزة
- استخدام `getPublicStats()` لجلب الإحصائيات من جدول `PublicSiteSettings`

### التنفيذ

#### الملف: `src/app/page.tsx` أو الصفحة الحالية للـ Landing Page

**المطلوب:**
- استخدام `getPublicStats()` لجلب الإحصائيات
- عرض الأرقام ديناميكياً بدلاً من القيم الثابتة
- استخدام `Suspense` + Skeleton للتحميل السلس

**مثال:**
```tsx
import { Suspense } from 'react';
import StatsSection from '@/components/landing/StatsSection';
import StatsSkeleton from '@/components/landing/StatsSkeleton';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsSection />
      </Suspense>
    </>
  );
}
```

---

## 🚫 المشكلة الثالثة: تهذيب الصفحات النهائية (إزالة الشريط الجانبي)

### الصفحات المتأثرة
الصفحات التالية تحتوي على شريط جانبي غير مرغوب فيه:

1. **عن الجمعية** (`/about`) - رؤيتنا، رسالتنا، وأهدافنا التعليمية
2. **إنجازاتنا** (`/achievements`) - أكثر من 11 ألف طالبة و2 مليون وجه منجز
3. **تواصل معنا** (`/contact`) - للاستفسارات والدعم والتبرعات

### المطلوب
1. **إزالة الـ Sidebar:**
   - التأكد من أن هذه الصفحات **خارج** مجلد `(dashboard)`
   - إنشاء `(public)` route group إذا لزم الأمر
   - استخدام Layout منفصل بدون Sidebar

2. **ربط المحتوى بقاعدة البيانات:**

   - استخدام `getSiteSettings()` لجلب المحتوى من جدول `PublicSiteSettings`
   - عرض المحتوى ديناميكياً بدلاً من النصوص الثابتة

3. **التحقق النهائي:**
   - فتح كل صفحة والتأكد من عدم وجود الشريط الجانبي
   - التأكد من عرض البيانات الصحيحة من قاعدة البيانات
   - الصفحات يجب أن تحتوي فقط على: Header + محتوى الصفحة + Footer

### التنفيذ

#### الملفات المتأثرة:
- `src/app/about/page.tsx`
- `src/app/achievements/page.tsx`
- `src/app/contact/page.tsx`

**هيكل الملفات المقترح:**
```
src/app/
├── (public)/
│   ├── layout.tsx          # Layout خاص بالصفحات العامة (بدون Sidebar)
│   ├── page.tsx            # الصفحة الرئيسية
│   ├── about/page.tsx
│   ├── achievements/page.tsx
│   └── contact/page.tsx
├── (dashboard)/
│   └── ...                 # الصفحات المحمية (بـ Sidebar)
```

---

## ✅ معايير النجاح

### المرحلة 1: البنية التحتية ✅
- [ ] جدول `PublicSiteSettings` تم إنشاؤه في قاعدة البيانات
- [ ] Server Actions الأربعة تعمل بشكل صحيح
- [ ] صفحة `/admin/site-settings` تعمل بكامل وظائفها
- [ ] الاقتراحات الذكية تعرض البيانات الحقيقية
- [ ] زر "استخدام القيمة الفعلية" يعمل
- [ ] المدير يستطيع حفظ جميع الإعدادات

### المرحلة 2: ربط البيانات ✅
- [ ] الصفحة الرئيسية تعرض إحصائيات ديناميكية من `PublicSiteSettings`
- [ ] جميع الصفحات تستجيب للتغييرات (revalidation يعمل)

### المرحلة 3: التهذيب النهائي ✅
- [ ] الصفحات العامة (عن الجمعية، إنجازاتنا، تواصل معنا) **بدون** شريط جانبي
- [ ] جميع الصفحات تعرض المحتوى من قاعدة البيانات

### عام ✅
- [ ] Build ناجح بدون أخطاء
- [ ] الالتزام بـ **Server Actions Pattern** من AI_RULES.md
- [ ] الالتزام بمعايير الأمان (التحقق من الدور = ADMIN)

---

## 🚨 ملاحظات مهمة للتنفيذ

### الأمان (Security)
- **جميع** Server Actions يجب أن تتحقق من أن المستخدم = `ADMIN`
- استخدام `requireRole(['ADMIN'])` من `src/lib/auth-helpers.ts`
- عدم الثقة بالبيانات القادمة من الواجهة الأمامية

### الأداء (Performance)
- `getPublicStats()` يجب أن تستخدم caching مناسب
- استخدام `revalidate: 3600` في Server Component
- Prisma aggregations بدلاً من `findMany()` + حساب يدوي

### التصميم (Design)
- الالتزام بنظام الألوان الموجود في `tailwind.config.ts`
- استخدام `className` المناسبة من Tailwind CSS
- RTL Support لجميع الـ textareas والـ inputs
- Responsive Design (Desktop + Mobile)

### القواعد من AI_RULES.md
- استخدام Server Components (async function)
- استخدام Suspense + Skeleton للبيانات الثقيلة
- استخدام Server Actions للكتابة
- استخدام `revalidatePath()` بعد كل تحديث

---

## 📝 خطوات التنفيذ المقترحة

> **ملاحظة مهمة:** يجب اتباع هذا الترتيب بالضبط - كل مرحلة تعتمد على المرحلة السابقة.

### 🔷 المرحلة 1: البنية التحتية (الأساس)

**الخطوة 1.1 - قاعدة البيانات:**
1. تحديث `schema.prisma` بجدول `PublicSiteSettings`
2. تشغيل `npx prisma generate`
3. إنشاء سجل افتراضي في قاعدة البيانات (seed script اختياري)

**الخطوة 1.2 - Server Actions:**
4. إنشاء `src/actions/public-settings.ts`
5. تنفيذ جميع الـ Actions الأربعة:
   - `getRealStats()` - لجلب البيانات الحقيقية
   - `getSiteSettings()` - لجلب الإعدادات الحالية
   - `updateSiteSettings()` - لحفظ التعديلات
   - `getPublicStats()` - للصفحة الرئيسية (public)

**الخطوة 1.3 - صفحة الإعدادات:**
6. إنشاء `/admin/site-settings/page.tsx`
7. إنشاء المكونات المساعدة:
   - `StatsTab.tsx` - تبويب الإحصائيات
   - `AboutTab.tsx` - تبويب عن الجمعية
   - `AchievementsTab.tsx` - تبويب الإنجازات
   - `ContactTab.tsx` - تبويب التواصل
   - `SmartSuggestion.tsx` - مكون الاقتراحات الذكية

**اختبار المرحلة 1:**
- تأكد من أن صفحة `/admin/site-settings` تفتح بدون أخطاء
- تأكد من إمكانية حفظ واسترجاع البيانات
- تأكد من عمل الاقتراحات الذكية

---

### 🔷 المرحلة 2: ربط البيانات الإحصائية

**الخطوة 2.1 - الصفحة الرئيسية:**
8. تحديث الصفحة الرئيسية (`src/app/page.tsx`)
9. استخدام `getPublicStats()` لجلب الإحصائيات
10. استخدام `Suspense` + Skeleton للتحميل السلس

**اختبار المرحلة 2:**
- افتح الصفحة الرئيسية (قبل تسجيل الدخول)
- تأكد من عرض الإحصائيات الصحيحة من قاعدة البيانات
- غيّر القيم من `/admin/site-settings` وتحقق من التحديث

---

### 🔷 المرحلة 3: التهذيب النهائي

**الخطوة 3.1 - هيكلة المسارات:**
11. إنشاء `(public)` route group إذا لزم الأمر
12. نقل الصفحات العامة خارج `(dashboard)`
13. إنشاء Layout منفصل للصفحات العامة (بدون Sidebar)

**الخطوة 3.2 - ربط المحتوى:**
14. تحديث `/about`, `/achievements`, `/contact`
15. استخدام `getSiteSettings()` لجلب المحتوى
16. عرض المحتوى ديناميكياً

**اختبار المرحلة 3:**
- افتح كل صفحة عامة وتأكد من:
  - ✅ عدم وجود Sidebar
  - ✅ عرض المحتوى الصحيح من قاعدة البيانات
  - ✅ Responsive Design يعمل

---

### 🔷 المرحلة 4: الاختبار الشامل والتحقق النهائي

17. اختبار جميع الوظائف (end-to-end)
18. التحقق من Build (`npm run build`)
19. اختبار الأمان (permissions)
20. اختبار Responsive Design على جميع الأجهزة
21. التأكد من عدم وجود console errors

---

## 🎨 مثال على مكون الاقتراح الذكي

```tsx
// src/components/admin/SmartSuggestion.tsx
'use client';

interface SmartSuggestionProps {
  label: string;
  realValue: number;
  onUse: (value: number) => void;
}

export default function SmartSuggestion({ label, realValue, onUse }: SmartSuggestionProps) {
  return (
    <div className="mt-1 flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">
        💡 {label}: {realValue.toLocaleString('ar-SA')}
      </span>
      <button
        type="button"
        onClick={() => onUse(realValue)}
        className="text-primary hover:underline"
      >
        استخدام
      </button>
    </div>
  );
}
```

---

## 📚 المراجع

- **[AI_RULES.md](../AI_RULES.md)** - القواعد التقنية والأنماط
- **[PROJECT_TIMELINE.md](../PROJECT_TIMELINE.md)** - الجلسات المكتملة
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** - حلول سريعة للأخطاء الشائعة

---

**تاريخ الإنشاء:** 29 نوفمبر 2025  
**النسخة:** 1.0  
**الحالة:** جاهز للتنفيذ ✅
