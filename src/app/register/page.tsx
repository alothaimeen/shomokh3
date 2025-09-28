'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    userEmail: '',
    password: '',
    confirmPassword: '',
    studentName: '',
    qualification: '',
    nationality: '',
    studentPhone: '',
    memorizedAmount: '',
    memorizationPlan: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      setLoading(false);
      return;
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    // التحقق من صحة البريد الإلكتروني
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.userEmail)) {
      setError('البريد الإلكتروني غير صحيح');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/students/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'فشل في التسجيل');
      }

      const result = await response.json();
      setSuccess(true);

      setTimeout(() => {
        router.push('/login?message=تم التسجيل بنجاح');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء التسجيل');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-900 mb-4">تم التسجيل بنجاح!</h1>
          <p className="text-gray-600 mb-4">سيتم توجيهك لصفحة تسجيل الدخول قريباً...</p>
          <div className="w-full bg-green-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            تسجيل طالبة جديدة
          </h1>
          <p className="text-gray-600">
            منصة شموخ التعليمية v3
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* البريد الإلكتروني */}
          <div>
            <label htmlFor="userEmail" className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني (اسم المستخدم) *
            </label>
            <input
              type="email"
              id="userEmail"
              name="userEmail"
              required
              value={formData.userEmail}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: fatima@example.com"
            />
          </div>

          {/* كلمة المرور */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              كلمة المرور *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6 أحرف على الأقل"
              minLength={6}
            />
          </div>

          {/* تأكيد كلمة المرور */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              تأكيد كلمة المرور *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أعد كتابة كلمة المرور"
              minLength={6}
            />
          </div>

          {/* اسم الطالبة الثلاثي */}
          <div>
            <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
              اسم الطالبة الثلاثي *
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              required
              value={formData.studentName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: فاطمة أحمد محمد"
            />
          </div>

          {/* المؤهل الدراسي */}
          <div>
            <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
              المؤهل الدراسي *
            </label>
            <select
              id="qualification"
              name="qualification"
              required
              value={formData.qualification}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر المؤهل الدراسي</option>
              <option value="ابتدائي">ابتدائي</option>
              <option value="متوسط">متوسط</option>
              <option value="ثانوي">ثانوي</option>
              <option value="دبلوم">دبلوم</option>
              <option value="بكالوريوس">بكالوريوس</option>
              <option value="ماجستير">ماجستير</option>
              <option value="دكتوراه">دكتوراه</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          {/* الجنسية */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-2">
              الجنسية *
            </label>
            <select
              id="nationality"
              name="nationality"
              required
              value={formData.nationality}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر الجنسية</option>
              <option value="سعودي">سعودي</option>
              <option value="مصري">مصري</option>
              <option value="سوري">سوري</option>
              <option value="فلسطيني">فلسطيني</option>
              <option value="أردني">أردني</option>
              <option value="لبناني">لبناني</option>
              <option value="عراقي">عراقي</option>
              <option value="يمني">يمني</option>
              <option value="كويتي">كويتي</option>
              <option value="إماراتي">إماراتي</option>
              <option value="قطري">قطري</option>
              <option value="بحريني">بحريني</option>
              <option value="عماني">عماني</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          {/* رقم التواصل */}
          <div>
            <label htmlFor="studentPhone" className="block text-sm font-medium text-gray-700 mb-2">
              رقم التواصل *
            </label>
            <input
              type="tel"
              id="studentPhone"
              name="studentPhone"
              required
              value={formData.studentPhone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: 0501234567"
            />
          </div>

          {/* مقدار الحفظ */}
          <div>
            <label htmlFor="memorizedAmount" className="block text-sm font-medium text-gray-700 mb-2">
              مقدار الحفظ الحالي *
            </label>
            <select
              id="memorizedAmount"
              name="memorizedAmount"
              required
              value={formData.memorizedAmount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر مقدار الحفظ</option>
              <option value="لا يوجد">لا يوجد</option>
              <option value="جزء عم">جزء عم</option>
              <option value="جزء تبارك">جزء تبارك</option>
              <option value="جزءان">جزءان</option>
              <option value="ثلاثة أجزاء">ثلاثة أجزاء</option>
              <option value="خمسة أجزاء">خمسة أجزاء</option>
              <option value="عشرة أجزاء">عشرة أجزاء</option>
              <option value="خمسة عشر جزءاً">خمسة عشر جزءاً</option>
              <option value="عشرون جزءاً">عشرون جزءاً</option>
              <option value="القرآن كاملاً">القرآن كاملاً</option>
              <option value="أخرى">أخرى</option>
            </select>
          </div>

          {/* خطة الحفظ */}
          <div>
            <label htmlFor="memorizationPlan" className="block text-sm font-medium text-gray-700 mb-2">
              خطة الحفظ المرغوبة
            </label>
            <select
              id="memorizationPlan"
              name="memorizationPlan"
              value={formData.memorizationPlan}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">اختر خطة الحفظ</option>
              <option value="حفظ جديد">حفظ جديد من البداية</option>
              <option value="إكمال الحفظ">إكمال الحفظ الحالي</option>
              <option value="مراجعة وتثبيت">مراجعة وتثبيت</option>
              <option value="حفظ مع تجويد">حفظ مع تجويد</option>
              <option value="تحسين التلاوة">تحسين التلاوة</option>
              <option value="حفظ مكثف">حفظ مكثف</option>
              <option value="حفظ تدريجي">حفظ تدريجي</option>
            </select>
          </div>

          {/* الملاحظات */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أي ملاحظات أو معلومات إضافية..."
            />
          </div>

          {/* أزرار التحكم */}
          <div className="flex space-x-4 space-x-reverse pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/')}
              className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              الرجوع للرئيسية
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            لديك حساب بالفعل؟{' '}
            <button
              onClick={() => router.push('/login')}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}