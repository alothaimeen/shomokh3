import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import { Mail, Globe, CreditCard } from 'lucide-react';
import ContactForm from '@/components/contact/ContactForm';

export default function ContactPage() {

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 lg:mr-72">
        <AppHeader title="تواصل معنا" />
        <main className="p-6 space-y-6">
          <BackButton />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-6">
              {/* Email */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-3 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">البريد الإلكتروني</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">للاستفسارات والدعم الفني</p>
                <p className="text-primary-purple font-semibold">info@shamokh.edu</p>
              </div>

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

              {/* Financial Support */}
              <div className="bg-gradient-to-r from-primary-purple/10 to-primary-blue/10 rounded-lg shadow-md p-6 border-r-4 border-primary-purple">
                <div className="flex items-center gap-4 mb-3">
                  <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-3 rounded-lg">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">الدعم المالي</h3>
                </div>
                <p className="text-gray-700 mb-3">يمكنكم دعم الجمعية من خلال التبرع على الحساب البنكي</p>
                <div className="bg-white rounded-lg p-4 mb-2">
                  <p className="text-sm text-gray-600 mb-1">رقم الآيبان</p>
                  <p className="text-primary-purple font-bold text-lg" dir="ltr">SA00 0000 0000 0000 0000 0000</p>
                </div>
                <p className="text-sm text-gray-600">باسم: جمعية شموخ التعليمية</p>
              </div>
            </div>

            {/* Contact Form */}
            <ContactForm />
          </div>
        </main>
      </div>
    </div>
  );
}
