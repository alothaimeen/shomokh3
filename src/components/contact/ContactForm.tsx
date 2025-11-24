'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('شكراً لتواصلك معنا! سيتم الرد خلال 24-48 ساعة.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
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
  );
}
