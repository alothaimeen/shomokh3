# 📋 ملاحظة مهمة: الهوية البصرية

## 🎨 الالتزام بهوية المشروع الحالي

### الألوان الرسمية (من `globals.css` و `tailwind.config.ts`):

```css
/* الألوان الأساسية */
--primary-purple: #8B5CF6;    /* البنفسجي الرئيسي */
--primary-blue: #3B82F6;      /* الأزرق الرئيسي */
--secondary-purple: #A78BFA;  /* البنفسجي الفاتح */
--secondary-blue: #60A5FA;    /* الأزرق الفاتح */

/* التدرجات */
--gradient-primary: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
--gradient-purple: linear-gradient(135deg, #8B5CF6 0%, rgba(139, 92, 246, 0.9) 100%);
--gradient-blue: linear-gradient(135deg, #3B82F6 0%, rgba(59, 130, 246, 0.9) 100%);

/* الخلفيات الخفيفة */
--bg-purple-light: rgba(139, 92, 246, 0.05);
--bg-blue-light: rgba(59, 130, 246, 0.05);
```

### الخط الرسمي:
- **اسم الخط:** Cairo
- **المصدر:** Google Fonts
- **الأوزان:** 400 (عادي)، 600 (متوسط)، 700 (عريض)
- **الاتجاه:** RTL (من اليمين لليسار)
- **الأحرف:** عربي

### أمثلة تطبيقية للمكونات:

#### 1. الأزرار الرئيسية:
```tsx
// زر "ماذا أنجزنا؟"
className="px-8 py-4 bg-gradient-to-br from-primary-purple to-primary-blue text-white text-lg font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
```

#### 2. البطاقات:
```tsx
// بطاقة ميزة مكتملة
className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-primary-purple hover:shadow-lg transition-all duration-300"
```

#### 3. العناوين:
```tsx
// عنوان رئيسي
className="text-4xl font-bold bg-gradient-to-r from-primary-purple to-primary-blue bg-clip-text text-transparent mb-6"

// عنوان قسم
className="text-2xl font-semibold text-gray-800 mb-4"
```

#### 4. شريط التقدم:
```tsx
// الخلفية
className="w-full h-4 bg-gray-200 rounded-full overflow-hidden"

// الملء
className="h-full bg-gradient-to-r from-primary-purple to-primary-blue rounded-full transition-all duration-1000"
style={{ width: '58%' }}
```

#### 5. الروابط:
```tsx
// رابط داخلي لميزة
className="text-primary-blue hover:text-primary-purple font-medium transition-colors underline-offset-4 hover:underline"
```

---

## ⚠️ تذكير مهم للمطور:

1. **لا تستخدم ألوان عشوائية** - استخدم فقط الألوان المحددة أعلاه
2. **لا تستخدم خطوط أخرى** - Cairo فقط
3. **اتبع نفس الأنماط** - راجع صفحات المشروع الحالية للإلهام
4. **حافظ على الاتساق** - نفس الـ padding، margin، border-radius في كل مكان مشابه

---

**✅ النتيجة المتوقعة:**
الصفحتان الجديدتان يجب أن تبدوان كأنهما جزء طبيعي من المنصة الحالية، وليس كإضافة خارجية.
