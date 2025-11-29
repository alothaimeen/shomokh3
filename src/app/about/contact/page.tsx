import Link from 'next/link';
import { Mail, Globe, CreditCard, Phone, MapPin, MessageCircle } from 'lucide-react';
import { getContactContent } from '@/actions/public-settings';

export default async function ContactPage() {
  const content = await getContactContent();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link href="/" className="hover:text-primary-purple">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/about" className="hover:text-primary-purple">عن الجمعية</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">{content.contactTitle}</span>
      </nav>

      {/* Page Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{content.contactTitle}</h1>
        <p className="text-lg text-gray-600">نسعد بتواصلكم معنا للاستفسارات والدعم</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="space-y-6">
          {/* Email */}
          {content.contactEmail && (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-3 rounded-lg">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">البريد الإلكتروني</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">للاستفسارات والدعم الفني</p>
              <a href={`mailto:${content.contactEmail}`} className="text-primary-purple font-semibold hover:underline">
                {content.contactEmail}
              </a>
            </div>
          )}

          {/* Phone */}
          {content.contactPhone && (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-gradient-to-r from-primary-blue to-primary-purple p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">رقم الهاتف</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">للتواصل المباشر</p>
              <a href={`tel:${content.contactPhone}`} className="text-primary-blue font-semibold hover:underline" dir="ltr">
                {content.contactPhone}
              </a>
            </div>
          )}

          {/* WhatsApp */}
          {content.contactWhatsapp && (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">واتساب</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">للمراسلة السريعة</p>
              <a 
                href={`https://wa.me/${content.contactWhatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 font-semibold hover:underline"
                dir="ltr"
              >
                {content.contactWhatsapp}
              </a>
            </div>
          )}

          {/* Address */}
          {content.contactAddress && (
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-3 rounded-lg">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">العنوان</h3>
              </div>
              <p className="text-gray-700">{content.contactAddress}</p>
            </div>
          )}

          {/* Website */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-gradient-to-r from-primary-blue to-primary-purple p-3 rounded-lg">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">الموقع الإلكتروني</h3>
            </div>
            <p className="text-gray-600 text-sm mb-2">تابعونا على موقعنا الرسمي</p>
            <a 
              href="https://shomokh.alothaimeen.xyz" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-blue font-semibold hover:underline"
            >
              shomokh.alothaimeen.xyz
            </a>
          </div>
        </div>

        {/* Financial Support Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 rounded-lg shadow-md p-6 border-r-4 border-primary-purple">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-3 rounded-lg">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">الدعم المالي</h3>
            </div>
            <p className="text-gray-700 mb-4">
              يمكنكم دعم الجمعية من خلال التبرع على الحساب البنكي. كل تبرع يساهم في تعليم القرآن الكريم للطالبات.
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-1">رقم الآيبان</p>
              <p className="text-primary-purple font-bold text-lg" dir="ltr">SA00 0000 0000 0000 0000 0000</p>
            </div>
            <p className="text-sm text-gray-600">باسم: جمعية شموخ التعليمية</p>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">روابط سريعة</h3>
            <div className="space-y-3">
              <Link 
                href="/about" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary-purple transition-colors"
              >
                <span>←</span>
                <span>عن الجمعية</span>
              </Link>
              <Link 
                href="/about/achievements" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary-purple transition-colors"
              >
                <span>←</span>
                <span>إنجازاتنا</span>
              </Link>
              <Link 
                href="/register" 
                className="flex items-center gap-2 text-gray-600 hover:text-primary-purple transition-colors"
              >
                <span>←</span>
                <span>التسجيل كطالبة</span>
              </Link>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg p-6 text-center">
            <h3 className="text-xl font-bold mb-2">هل تريدين الانضمام؟</h3>
            <p className="text-sm opacity-90 mb-4">سجلي الآن وابدئي رحلتك مع القرآن الكريم</p>
            <Link 
              href="/register" 
              className="inline-block px-6 py-3 bg-white text-primary-purple font-semibold rounded-lg hover:shadow-lg transition-shadow"
            >
              التسجيل الآن
            </Link>
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
