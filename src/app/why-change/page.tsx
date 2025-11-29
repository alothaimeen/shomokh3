'use client';

import Link from 'next/link';
import ProblemCard from './components/ProblemCard';
import UnfulfilledRequests from './components/UnfulfilledRequests';
import BenefitsList from './components/BenefitsList';
import TechBenefits from './components/TechBenefits';
import ExpertQuotes from './components/ExpertQuotes';
import Conclusion from './components/Conclusion';
import problemsData from '@/data/problems.json';

export default function WhyChangePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-white">
      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">ش</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">منصة شموخ</h1>
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            تسجيل الدخول
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            لماذا نطور المنصة؟
          </h1>
          <p className="text-xl text-gray-600">
            رحلتنا من مودل إلى منصة شموخ الجديدة
          </p>
        </div>

        {/* Introduction Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {problemsData.introduction.title}
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            {problemsData.introduction.description}
          </p>
        </div>

        {/* Problems Section */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🔍</span>
            <h2 className="text-2xl font-bold text-gray-900">المشاكل التي واجهتنا والحلول</h2>
          </div>
          
          <div className="space-y-6">
            {problemsData.problems.map((problem) => (
              <ProblemCard key={problem.id} problem={problem} />
            ))}
          </div>
        </section>

        {/* Unfulfilled Requests Section */}
        <UnfulfilledRequests requests={problemsData.unfulfilledRequests} />

        {/* Future Benefits Section */}
        <BenefitsList benefits={problemsData.futureBenefits} />

        {/* Tech Benefits Section */}
        <TechBenefits 
          title={problemsData.techBenefits.title}
          intro={problemsData.techBenefits.intro}
          benefits={problemsData.techBenefits.benefits}
        />

        {/* Expert Quotes Section */}
        <ExpertQuotes quotes={problemsData.expertQuotes} />

        {/* Conclusion Section */}
        <Conclusion 
          title={problemsData.conclusion.title}
          intro={problemsData.conclusion.intro}
          points={problemsData.conclusion.points}
        />

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            هل تريد رؤية ما أنجزناه؟
          </h2>
          <p className="text-white/90 mb-6">
            شاهد التقدم الفعلي في المشروع والميزات المكتملة
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/progress"
              className="px-6 py-3 bg-white text-primary-purple font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              📊 ماذا أنجزنا؟
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/30"
            >
              🔐 تسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            📞 لديك سؤال أو استفسار؟
          </h2>
          <p className="text-gray-600 mb-6">
            نحن هنا للإجابة على جميع استفساراتكم
          </p>
          <Link
            href="/about/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-purple to-primary-blue text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            <span>تواصل معنا</span>
            <span>←</span>
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
            <span className="text-lg font-semibold">منصة شموخ لتعليم القرآن الكريم</span>
          </div>
          <p className="text-gray-400 mb-4">
            مفتوحة المصدر - مجانية لجميع الجمعيات الإسلامية
          </p>
          <div className="flex justify-center space-x-6 space-x-reverse">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              الرئيسية
            </Link>
            <Link href="/progress" className="text-gray-400 hover:text-white transition-colors">
              ماذا أنجزنا؟
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              تسجيل الدخول
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
