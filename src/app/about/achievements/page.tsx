import Link from 'next/link';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';
import { getAchievementsContent } from '@/actions/public-settings';

export default async function AchievementsPage() {
  const content = await getAchievementsContent();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/" className="hover:text-primary-purple">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/about" className="hover:text-primary-purple">عن الجمعية</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{content.achievementsTitle}</span>
      </nav>

      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.achievementsTitle}</h1>
        <p className="text-lg text-gray-600">{content.achievementsText}</p>
      </div>

      {/* Overall Statistics */}
      <div className="bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">إحصائيات شاملة منذ التأسيس (1442هـ)</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-3" />
            <p className="text-4xl font-bold mb-2">{content.studentsCount.toLocaleString('ar-SA')}+</p>
            <p className="text-lg">طالبة</p>
            <p className="text-sm opacity-90">إجمالي المسجلات</p>
          </div>
          <div className="text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-3" />
            <p className="text-4xl font-bold mb-2">{content.facesCompleted.toLocaleString('ar-SA')}</p>
            <p className="text-lg">وجه منجز</p>
            <p className="text-sm opacity-90">خلال 3 سنوات</p>
          </div>
          <div className="text-center">
            <Award className="w-12 h-12 mx-auto mb-3" />
            <p className="text-4xl font-bold mb-2">60+</p>
            <p className="text-lg">معلمة مؤهلة</p>
            <p className="text-sm opacity-90">آخر إحصائية 1443هـ</p>
          </div>
        </div>
      </div>

      {/* Year by Year Statistics */}
      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800">إنجازاتنا عبر السنوات</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Year 1442 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-purple hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary-purple">السنة 1442هـ</h3>
              <TrendingUp className="w-6 h-6 text-primary-purple" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">عدد الطالبات</span>
                <span className="text-xl font-bold text-primary-purple">5,617</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">الأوجه المنجزة</span>
                <span className="text-xl font-bold text-primary-purple">1,180,417</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">الحلقات القرآنية</span>
                <span className="text-xl font-bold text-primary-purple">59</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">عدد المعلمات</span>
                <span className="text-xl font-bold text-primary-purple">60</span>
              </div>
            </div>
          </div>

          {/* Year 1443 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-primary-blue hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-primary-blue">السنة 1443هـ</h3>
              <TrendingUp className="w-6 h-6 text-primary-blue" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">عدد الطالبات</span>
                <span className="text-xl font-bold text-primary-blue">3,262</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">الأوجه المنجزة</span>
                <span className="text-xl font-bold text-primary-blue">659,410</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">الحلقات القرآنية</span>
                <span className="text-xl font-bold text-primary-blue">59</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">عدد المعلمات</span>
                <span className="text-xl font-bold text-primary-blue">60</span>
              </div>
            </div>
          </div>

          {/* Year 1444 */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-400 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-purple-600">السنة 1444هـ</h3>
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">عدد الطالبات</span>
                <span className="text-xl font-bold text-purple-600">2,754</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-600">الأوجه المنجزة</span>
                <span className="text-xl font-bold text-purple-600">235,806</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">الإحصائية الكاملة متاحة في الملف التعريفي</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">توزيع البرامج التعليمية</h3>
        <p className="text-gray-600 mb-4">
          تشمل برامجنا: الإقراء، المراجعة والخاتمات، تصحيح التلاوة، المتون العلمية، التدبر، برامج الأمهات، المراحل العليا، الابتدائي، التمهيدي والروضة
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-primary-purple" />
              <div>
                <p className="font-bold text-gray-800">9 برامج متنوعة</p>
                <p className="text-sm text-gray-600">تغطي جميع الفئات العمرية</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-primary-blue" />
              <div>
                <p className="font-bold text-gray-800">معلمات مجازات</p>
                <p className="text-sm text-gray-600">تعليم احترافي عن بعد</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center">
        <Link 
          href="/about" 
          className="inline-flex items-center gap-2 text-primary-purple hover:underline"
        >
          ← العودة إلى صفحة عن الجمعية
        </Link>
      </div>
    </div>
  );
}
