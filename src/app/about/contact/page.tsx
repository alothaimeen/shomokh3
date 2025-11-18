'use client';

import { useState } from 'react';
import Sidebar from '@/components/shared/Sidebar';
import AppHeader from '@/components/shared/AppHeader';
import BackButton from '@/components/shared/BackButton';
import { Mail, Phone, Globe, CreditCard } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Future implementation: send to API
    alert('شكراً لتواصلك معنا! سيتم الرد خلال 24-48 ساعة.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">نموذج التواصل</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                    placeholder="اكتبي اسمك"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    الموضوع
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent"
                    placeholder="موضوع الرسالة"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    الرسالة
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-purple focus:border-transparent resize-none"
                    placeholder="اكتبي رسالتك هنا..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-purple to-primary-blue text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  إرسال
                </button>

                <p className="text-sm text-gray-500 text-center">
                  سيتم الرد خلال 24-48 ساعة
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
