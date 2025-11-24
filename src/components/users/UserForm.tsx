'use client';

import { useState } from 'react';
import { createUser, updateUser } from '@/actions/users';

interface User {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isActive: boolean;
  createdAt: string;
}

interface UserFormProps {
  mode: 'add' | 'edit';
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserForm({ mode, user, onClose, onSuccess }: UserFormProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = mode === 'add' 
        ? await createUser(formData)
        : await updateUser(formData);

      if (result.error) {
        alert('❌ خطأ: ' + result.error);
      } else {
        alert(`✅ تم ${mode === 'add' ? 'إضافة' : 'تعديل'} المستخدم بنجاح`);
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('❌ حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          {mode === 'add' ? 'إضافة مستخدم جديد' : 'تعديل المستخدم'}
        </h2>
        <form onSubmit={handleSubmit}>
          {mode === 'edit' && (
            <input type="hidden" name="userId" value={user?.id} />
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              name="userName"
              defaultValue={user?.userName}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              name="userEmail"
              defaultValue={user?.userEmail}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {mode === 'add' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  name="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="اتركها فارغة لاستخدام كلمة المرور الافتراضية"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الدور
                </label>
                <select
                  name="userRole"
                  defaultValue="STUDENT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ADMIN">مدير أعلى</option>
                  <option value="TEACHER">معلمة</option>
                  <option value="STUDENT">طالبة</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'جاري الحفظ...' : mode === 'add' ? 'إضافة' : 'حفظ التعديلات'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
