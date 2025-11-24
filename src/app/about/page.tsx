import Link from 'next/link';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import { Target, Eye, Heart, TrendingUp, Users } from 'lucide-react';

export default function AboutPage() {
  const values = [
    { icon: <Heart size={32} />, title: 'الإخلاص', description: 'تحري الإخلاص لله في جميع الأقوال والأعمال' },
    { icon: <Target size={32} />, title: 'الإتقان', description: 'الاهتمام بالجودة في العمل والإنجاز' },
    { icon: <TrendingUp size={32} />, title: 'التطوير', description: 'السعي المستمر للتحسين والتطوير' },
    { icon: <Users size={32} />, title: 'التعاون', description: 'العمل بروح الفريق الواحد' },
    { icon: <Eye size={32} />, title: 'الشفافية', description: 'الوضوح والمصداقية في التعامل' },
  ];

  const goals = [
    'تعليم القرآن الكريم وفق المنهج النبوي',
    'غرس محبة القرآن في قلوب الطالبات',
    'إتقان التلاوة والحفظ وفق أحكام التجويد',
    'تربية جيل قرآني متميز',
    'نشر الوعي بأهمية حفظ القرآن',
    'توفير بيئة تعليمية محفزة',
    'بناء شراكات مع المؤسسات التعليمية',
    'تدريب معلمات مؤهلات',
    'تطوير أساليب التعليم عن بعد',
    'خدمة المجتمع من خلال القرآن',
    'تحقيق التميز في التعليم القرآني',
    'دعم الأسر في تربية أبنائهن',
    'إنشاء مراكز قرآنية نموذجية',
    'المساهمة في التنمية المجتمعية',
  ];

  const programs = [
    { title: 'البرامج القرآنية', description: 'تعليم وحفظ القرآن الكريم بإتقان' },
    { title: 'البرامج التربوية', description: 'غرس القيم والأخلاق الإسلامية' },
    { title: 'البرامج التدريبية', description: 'تأهيل المعلمات والمشرفات' },
    { title: 'البرامج الاجتماعية', description: 'خدمة المجتمع ودعم الأسر' },
    { title: 'البرامج الإلكترونية', description: 'التعليم عن بعد بأحدث التقنيات' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:mr-72">
        <AppHeader title="عن الجمعية" />
        
        <main className="p-6 space-y-6">
          <BackButton />

          {/* الرؤية والرسالة */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-purple">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="text-primary-purple" size={32} />
                <h2 className="text-2xl font-bold text-gray-900">رؤيتنا</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                جمعية رائدة لتعليم مستمر، بأساليب مبتكرة
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-primary-blue">
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-primary-blue" size={32} />
                <h2 className="text-2xl font-bold text-gray-900">رسالتنا</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                تعليم القرآن الكريم وتحفيظه، وترسيخ القيم والأخلاق الإسلامية في نفوس الطالبات، من خلال بيئة تعليمية محفزة، ومعلمات مؤهلات، وبرامج تربوية متميزة
              </p>
            </div>
          </div>

          {/* القيم */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">قيمنا</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {values.map((value, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-gradient-to-br from-primary-purple/5 to-primary-blue/5 hover:shadow-md transition-all">
                  <div className="flex justify-center mb-3 text-primary-purple">
                    {value.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* الأهداف الاستراتيجية */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">أهدافنا الاستراتيجية</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-primary-purple/5 hover:to-primary-blue/5 transition-all">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{goal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* مسارات العمل */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">مسارات العمل</h2>
            <div className="grid md:grid-cols-5 gap-4">
              {programs.map((program, index) => (
                <div key={index} className="p-4 rounded-lg border-2 border-gray-200 hover:border-primary-purple hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-purple to-primary-blue flex items-center justify-center text-white font-bold text-xl mb-3">
                    {index + 1}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{program.title}</h3>
                  <p className="text-sm text-gray-600">{program.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* روابط إضافية */}
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/about/achievements" className="bg-gradient-to-r from-primary-purple to-primary-blue text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              <h3 className="text-xl font-bold mb-2">إنجازاتنا</h3>
              <p className="text-sm opacity-90">اطلعي على إحصائياتنا وإنجازاتنا</p>
            </Link>
            <Link href="/about/contact" className="bg-gradient-to-r from-primary-blue to-primary-purple text-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all text-center">
              <h3 className="text-xl font-bold mb-2">تواصل معنا</h3>
              <p className="text-sm opacity-90">للاستفسارات والدعم</p>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
