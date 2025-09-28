import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">ش</span>
            </div>
            <h1 className="text-xl font-bold text-blue-900">منصة شموخ التعليمية</h1>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-blue-900 mb-6">
            منصة شموخ التعليمية v3
          </h2>
          <p className="text-xl text-gray-700 mb-4">
            منصة متكاملة لتعليم القرآن الكريم وإدارة الحلقات القرآنية
          </p>
          <p className="text-lg text-gray-600 mb-8">
            تعلمي القرآن الكريم، تابعي تقدمك، وانضمي لمجتمع من الطالبات المتميزات
          </p>

          <div className="flex justify-center space-x-4 space-x-reverse">
            <Link
              href="/register"
              className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              تسجيل طالبة جديدة
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-2xl">📖</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">تعليم متقن</h3>
            <p className="text-gray-600">
              برامج تعليمية متخصصة في حفظ القرآن الكريم وأحكام التجويد
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">متابعة التقدم</h3>
            <p className="text-gray-600">
              نظام شامل لمتابعة الحضور والدرجات والنقاط التحفيزية
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">بيئة تفاعلية</h3>
            <p className="text-gray-600">
              انضمي لحلقات قرآنية مع معلمات مؤهلات وزميلات متحمسات
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg p-8 shadow-md">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">طالبة مسجلة</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">معلمة متخصصة</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">30+</div>
              <div className="text-gray-600">برنامج تعليمي</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-600 mb-2">1000+</div>
              <div className="text-gray-600">جلسة مكتملة</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            هل أنت مستعدة لبدء رحلتك القرآنية؟
          </h3>
          <p className="text-gray-600 mb-8">
            انضمي إلينا اليوم وابدئي رحلة تعلم القرآن الكريم مع أفضل المعلمات
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white text-lg font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            ابدئي الآن - تسجيل مجاني
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">ش</span>
            </div>
            <span className="text-lg font-semibold">منصة شموخ التعليمية v3</span>
          </div>
          <p className="text-gray-400 mb-4">
            منصة مفتوحة المصدر لتعليم القرآن الكريم - مجانية لجميع الجمعيات
          </p>
          <div className="flex justify-center space-x-6 space-x-reverse">
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              حول المنصة
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
              اتصل بنا
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              سياسة الخصوصية
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500">
            <p>&copy; 2025 منصة شموخ التعليمية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}