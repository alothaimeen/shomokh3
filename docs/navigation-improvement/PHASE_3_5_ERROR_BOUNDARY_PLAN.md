# 📋 المرحلة 3.5: إضافة Error Boundary

**المتطلبات السابقة:** ✅ المرحلة 1 مكتملة (المرحلة 2 اختيارية)  
**الهدف:** التعامل مع أخطاء التحميل بطريقة احترافية  
**النتيجة المتوقعة:** رسالة خطأ واضحة + زر إعادة المحاولة  
**الوقت المتوقع:** 10-15 دقيقة  
**الصعوبة:** ⭐⭐ سهلة

---

## 📊 التحليل الأولي

### لماذا نحتاج Error Boundary؟

**بدون error.tsx:**
```
خطأ في تحميل البيانات
  ↓
التطبيق يتعطل (crash)
  ↓
شاشة بيضاء أو رسالة خطأ تقنية
  ↓
المستخدم محتار ❌
```

**مع error.tsx:**
```
خطأ في تحميل البيانات
  ↓
error.tsx يظهر تلقائياً
  ↓
رسالة واضحة بالعربية
  ↓
زر "إعادة المحاولة" يعمل
  ↓
المستخدم يفهم ويحاول مرة أخرى ✅
```

### أمثلة على الأخطاء المحتملة
- ❌ فشل الاتصال بقاعدة البيانات
- ❌ خطأ في Server Component
- ❌ مشكلة في الشبكة
- ❌ Session انتهت صلاحيتها
- ❌ خطأ في استعلام Prisma

---

## 📝 خطة التنفيذ التفصيلية

### الخطوة 1: إنشاء ملف error.tsx
**الهدف:** إنشاء Error Boundary احترافي مع دعم RTL

#### 1.1 إنشاء الملف
**المسار:** `c:\Users\memm2\Documents\programming\shomokh3\src\app\(dashboard)\error.tsx`

**المحتوى الكامل:**
```tsx
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // تسجيل الخطأ في console للمطورين
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center">
        {/* أيقونة الخطأ */}
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* رسالة الخطأ */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          عذراً، حدث خطأ ما
        </h2>
        <p className="text-gray-600 mb-6">
          حدث خطأ أثناء تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
        </p>

        {/* تفاصيل الخطأ (للمطورين فقط في Development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-right">
            <p className="text-sm text-red-800 font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-red-600 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {/* زر إعادة المحاولة */}
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            إعادة المحاولة
          </button>

          {/* زر العودة للرئيسية */}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Link>
        </div>

        {/* نصيحة إضافية */}
        <p className="text-sm text-gray-500 mt-6">
          إذا استمرت المشكلة، يرجى التواصل مع الدعم الفني
        </p>
      </div>
    </div>
  );
}
```

---

### الخطوة 2: فهم المكونات

#### 2.1 لماذا 'use client'؟
```tsx
'use client';  // ✅ إلزامي!
```

**السبب:**
- error.tsx يحتاج `reset()` function
- `reset()` يستخدم React hooks
- Hooks تعمل فقط في Client Components
- بدون `'use client'` → خطأ في Build

---

#### 2.2 Props المطلوبة
```tsx
interface ErrorProps {
  error: Error & { digest?: string };  // معلومات الخطأ
  reset: () => void;                   // دالة إعادة المحاولة
}
```

**error:**
- `error.message` - رسالة الخطأ
- `error.digest` - معرّف فريد للخطأ (Next.js 15)
- `error.stack` - stack trace (للمطورين)

**reset:**
- دالة من Next.js
- تُعيد تحميل الصفحة
- تُستدعى عند الضغط على "إعادة المحاولة"

---

#### 2.3 useEffect للتسجيل
```tsx
useEffect(() => {
  console.error('Dashboard Error:', error);
}, [error]);
```

**الفائدة:**
- تسجيل الخطأ في console
- مفيد للمطورين في debugging
- يمكن إرسال الخطأ لخدمة monitoring (Sentry, LogRocket)

---

### الخطوة 3: تخصيص التصميم

#### 3.1 النسخة البسيطة (موصى به)
```tsx
'use client';

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          حدث خطأ ما
        </h2>
        <p className="text-gray-600 mb-6">
          يرجى المحاولة مرة أخرى
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-primary-purple text-white rounded-lg hover:opacity-90"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
```

---

#### 3.2 النسخة المتقدمة (مع تفاصيل)
```tsx
'use client';

import { useEffect, useState } from 'react';

export default function DashboardError({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full">
        {/* رسالة الخطأ */}
        <div className="bg-red-50 border-r-4 border-red-500 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-2">
            ⚠️ حدث خطأ غير متوقع
          </h2>
          <p className="text-red-700">
            نعتذر عن الإزعاج. حدث خطأ أثناء معالجة طلبك.
          </p>
        </div>

        {/* تفاصيل الخطأ (قابلة للطي) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-600 hover:text-gray-800 mb-2"
            >
              {showDetails ? '▼' : '◀'} عرض التفاصيل التقنية
            </button>
            {showDetails && (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-40 text-right">
                {error.message}
              </pre>
            )}
          </div>
        )}

        {/* الإجراءات */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 font-medium"
          >
            🔄 إعادة المحاولة
          </button>
          
          <a
            href="/dashboard"
            className="block w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center font-medium"
          >
            🏠 العودة للوحة التحكم
          </a>
        </div>

        {/* نصائح */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">
            💡 نصائح للحل:
          </p>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside text-right">
            <li>تحقق من اتصالك بالإنترنت</li>
            <li>حاول تحديث الصفحة</li>
            <li>إذا استمرت المشكلة، اتصل بالدعم الفني</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

### الخطوة 4: اختبار Error Boundary

#### 4.1 إنشاء خطأ متعمد (للاختبار فقط)
**في أي صفحة داخل (dashboard):**

```tsx
// src/app/(dashboard)/students/page.tsx
export default async function StudentsPage() {
  // 🧪 اختبار Error Boundary
  if (process.env.NODE_ENV === 'development') {
    // throw new Error('اختبار Error Boundary');
  }
  
  // ... باقي الكود
}
```

**ملاحظة:** احذف هذا السطر بعد الاختبار!

---

#### 4.2 اختبار في المتصفح
```bash
npm run dev
```

**الاختبارات:**

1. **تفعيل الخطأ:**
   - فك التعليق عن `throw new Error(...)`
   - انتقل لصفحة `/students`
   - **تحقق:** error.tsx يظهر بدلاً من crash

2. **زر إعادة المحاولة:**
   - اضغط على "إعادة المحاولة"
   - **تحقق:** الصفحة تُعاد تحميلها
   - **تحقق:** الخطأ يظهر مرة أخرى (لأنه متعمد)

3. **زر العودة للرئيسية:**
   - اضغط على "العودة للرئيسية"
   - **تحقق:** التوجيه إلى `/dashboard`
   - **تحقق:** Dashboard يعمل بشكل طبيعي

4. **Sidebar ثابت:**
   - **تحقق:** Sidebar يبقى ثابت حتى عند ظهور error.tsx
   - **تحقق:** يمكن التنقل لصفحات أخرى من Sidebar

---

#### 4.3 اختبار Build
```bash
npm run build
```

**النتيجة المتوقعة:**
- ✅ Build ينجح
- ✅ لا TypeScript errors
- ✅ warning عن `'use client'` (طبيعي)

---

### الخطوة 5: تخصيص حسب نوع الخطأ (متقدم)

#### 5.1 التعامل مع أخطاء محددة
```tsx
'use client';

export default function DashboardError({ error, reset }: ErrorProps) {
  // تحديد نوع الخطأ
  const isAuthError = error.message.includes('Unauthorized') || 
                      error.message.includes('Session');
  const isNetworkError = error.message.includes('fetch') || 
                         error.message.includes('network');
  const isDatabaseError = error.message.includes('Prisma') || 
                          error.message.includes('database');

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center">
        {/* رسالة مخصصة حسب نوع الخطأ */}
        {isAuthError && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              انتهت صلاحية الجلسة
            </h2>
            <p className="text-gray-600 mb-6">
              يرجى تسجيل الدخول مرة أخرى
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-primary-purple text-white rounded-lg"
            >
              تسجيل الدخول
            </a>
          </>
        )}

        {isNetworkError && (
          <>
            <h2 className="text-2xl font-bold text-orange-600 mb-3">
              مشكلة في الاتصال
            </h2>
            <p className="text-gray-600 mb-6">
              تحقق من اتصالك بالإنترنت وحاول مرة أخرى
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary-purple text-white rounded-lg"
            >
              إعادة المحاولة
            </button>
          </>
        )}

        {isDatabaseError && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              خطأ في قاعدة البيانات
            </h2>
            <p className="text-gray-600 mb-6">
              نعمل على حل المشكلة. يرجى المحاولة لاحقاً
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-primary-purple text-white rounded-lg"
            >
              العودة للرئيسية
            </a>
          </>
        )}

        {/* خطأ عام */}
        {!isAuthError && !isNetworkError && !isDatabaseError && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-3">
              حدث خطأ ما
            </h2>
            <p className="text-gray-600 mb-6">
              يرجى المحاولة مرة أخرى
            </p>
            <button
              onClick={reset}
              className="px-6 py-3 bg-primary-purple text-white rounded-lg"
            >
              إعادة المحاولة
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 📊 الهيكل النهائي

```
src/app/(dashboard)/
├── layout.tsx              # ✅ المرحلة 1
├── loading.tsx             # ✅ المرحلة 2 (اختياري)
├── error.tsx               # 🆕 المرحلة 3.5
│
├── dashboard/
│   └── page.tsx
│
├── students/
│   ├── page.tsx
│   └── error.tsx           # 🆕 اختياري (مخصص)
│
└── [باقي الصفحات...]
```

---

## ✅ معايير النجاح

### Build
- [ ] `npm run build` ينجح
- [ ] لا TypeScript errors
- [ ] `'use client'` موجود في أول سطر

### Browser
- [ ] error.tsx يظهر عند حدوث خطأ
- [ ] رسالة الخطأ واضحة بالعربية
- [ ] زر "إعادة المحاولة" يعمل
- [ ] زر "العودة للرئيسية" يعمل
- [ ] Sidebar يبقى ثابت

### UX
- [ ] التصميم متناسق مع باقي التطبيق
- [ ] الرسالة واضحة وغير تقنية
- [ ] المستخدم يعرف ماذا يفعل
- [ ] لا crash للتطبيق

---

## 🔧 استكشاف الأخطاء

### المشكلة: "use client" directive missing
**الحل:**
```tsx
'use client';  // ✅ يجب أن يكون في السطر الأول

import ...
```

### المشكلة: reset() لا يعمل
**الحل:**
- تأكد من `'use client'` موجود
- تأكد من `onClick={reset}` (ليس `onClick={reset()}`)
- تحقق من console للأخطاء

### المشكلة: error.tsx لا يظهر
**الحل:**
- تأكد من المسار: `src/app/(dashboard)/error.tsx`
- تأكد من اسم الملف: `error.tsx` (ليس `Error.tsx`)
- أعد تشغيل `npm run dev`

---

## 📋 Checklist

### قبل البدء
- [ ] المرحلة 1 مكتملة
- [ ] `npm run dev` يعمل
- [ ] Git working directory نظيف

### التنفيذ
- [ ] أنشأت `(dashboard)/error.tsx`
- [ ] أضفت `'use client'` في السطر الأول
- [ ] أضفت رسالة خطأ بالعربية
- [ ] أضفت زر "إعادة المحاولة"
- [ ] أضفت زر "العودة للرئيسية"

### الاختبار
- [ ] اختبرت بخطأ متعمد
- [ ] زر "إعادة المحاولة" يعمل
- [ ] زر "العودة للرئيسية" يعمل
- [ ] Sidebar ثابت
- [ ] `npm run build` ينجح

### الإنهاء
- [ ] حذفت الخطأ المتعمد
- [ ] Commit التغييرات
- [ ] حدّثت `PROJECT_TIMELINE.md`

---

## 🎯 النتيجة النهائية

### قبل المرحلة 3.5
```
خطأ في تحميل البيانات
  ↓
التطبيق يتعطل
  ↓
شاشة بيضاء أو رسالة تقنية
  ↓
المستخدم محتار ❌
```

### بعد المرحلة 3.5
```
خطأ في تحميل البيانات
  ↓
error.tsx يظهر تلقائياً
  ↓
رسالة واضحة: "حدث خطأ ما"
  ↓
زر "إعادة المحاولة" + "العودة للرئيسية"
  ↓
المستخدم يفهم ويتصرف ✅
```

**تحسين:** تجربة مستخدم احترافية حتى عند الأخطاء! 🛡️

---

## 📚 مراجع

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

---

**✅ جاهز للتنفيذ!**

المرحلة 3.5 مهمة للاحترافية - لا تتخطاها! 🛡️
