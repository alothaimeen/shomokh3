import Link from "next/link";
import { Suspense } from "react";
import StatsSection from "@/components/landing/StatsSection";
import StatsSkeleton from "@/components/landing/StatsSkeleton";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-white">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">ش</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">أكاديمية شموخ لتعليم القرآن الكريم عن بعد</h1>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            تسجيل الدخول
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            أكاديمية شموخ لتعليم القرآن الكريم عن بعد
          </h2>
          <p className="text-xl text-gray-700 mb-4">
            جمعية رائدة لتعليم مستمر، بأساليب مبتكرة
          </p>
          <p className="text-lg text-gray-600 mb-8">
            تعلمي القرآن الكريم مع معلمات مجازات، وتابعي تقدمك عبر نظام شامل
          </p>

          <div className="flex flex-col items-center gap-4">
            {/* Primary Actions */}
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Link
                href="/register"
                className="px-8 py-4 bg-gradient-to-r from-primary-purple to-primary-blue text-white text-lg font-semibold rounded-lg hover:shadow-lg transition-shadow"
              >
                انضمي كطالبة
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 border-2 border-primary-purple text-primary-purple text-lg font-semibold rounded-lg hover:bg-primary-purple hover:text-white transition-colors"
              >
                تسجيل دخول
              </Link>
            </div>
            
            {/* Secondary Actions - Progress & Why Change */}
            <div className="flex justify-center space-x-4 space-x-reverse mt-2">
              <Link
                href="/progress"
                className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:border-primary-purple hover:text-primary-purple transition-all"
              >
                <span className="text-xl">📊</span>
                <span>ماذا أنجزنا؟</span>
              </Link>
              <Link
                href="/why-change"
                className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:border-primary-blue hover:text-primary-blue transition-all"
              >
                <span className="text-xl">💡</span>
                <span>لماذا نغير المنصة؟</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">تعليم متقن للقرآن الكريم</h3>
            <p className="text-gray-600">
              معلمات مؤهلات ومجازات في تعليم القرآن الكريم وأحكام التجويد
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">متابعة دقيقة للتقدم</h3>
            <p className="text-gray-600">
              نظام درجات شامل (200 درجة + 2450 نقطة تحفيزية) لمتابعة الأداء
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">بيئة تفاعلية عن بعد</h3>
            <p className="text-gray-600">
              تعليم احترافي عبر الإنترنت مع معلمات متخصصات وزميلات متحمسات
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>

        {/* About Links Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-16">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">
            تعرّفي على جمعية شموخ
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Link
              href="/about"
              className="group bg-gradient-to-br from-primary-purple/5 to-primary-blue/5 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary-purple"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-purple transition-colors">
                عن الجمعية
              </h4>
              <p className="text-gray-600 text-sm">
                رؤيتنا، رسالتنا، وأهدافنا التعليمية
              </p>
            </Link>

            <Link
              href="/about/achievements"
              className="group bg-gradient-to-br from-primary-blue/5 to-primary-purple/5 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary-blue"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-blue to-primary-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-blue transition-colors">
                إنجازاتنا
              </h4>
              <p className="text-gray-600 text-sm">
                مسيرة عطاء متواصل في تعليم القرآن الكريم
              </p>
            </Link>

            <Link
              href="/about/contact"
              className="group bg-gradient-to-br from-primary-purple/5 to-primary-blue/5 rounded-lg p-6 text-center hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-primary-purple"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-purple transition-colors">
                تواصل معنا
              </h4>
              <p className="text-gray-600 text-sm">
                للاستفسارات والدعم والتبرعات
              </p>
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            هل أنتِ مستعدة لبدء رحلتك القرآنية؟
          </h3>
          <p className="text-gray-600 mb-8">
            انضمي إلينا اليوم وابدئي رحلة تعلم القرآن الكريم
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-gradient-to-r from-primary-purple to-primary-blue text-white text-lg font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            ابدئي الآن - انضمي لنا
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold">ش</span>
            </div>
            <span className="text-lg font-semibold">جمعية شموخ التعليمية - أكاديمية لتعليم القرآن الكريم عن بعد</span>
          </div>
          <p className="text-gray-400 mb-4">
            مفتوحة المصدر - مجانية لجميع الجمعيات الإسلامية
          </p>
          <div className="flex justify-center space-x-6 space-x-reverse">
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              عن الجمعية
            </Link>
            <Link href="/about/achievements" className="text-gray-400 hover:text-white transition-colors">
              إنجازاتنا
            </Link>
            <Link href="/progress" className="text-gray-400 hover:text-white transition-colors">
              تقدم المشروع
            </Link>
            <Link href="/why-change" className="text-gray-400 hover:text-white transition-colors">
              لماذا نغير؟
            </Link>
            <Link href="/about/contact" className="text-gray-400 hover:text-white transition-colors">
              تواصل معنا
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500">
            <p>&copy; 2025 جمعية شموخ التعليمية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}