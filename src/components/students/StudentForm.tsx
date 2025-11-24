'use client';

import { useState } from 'react';
import { createStudent, updateStudent } from '@/actions/students';

interface Student {
  id: string;
  studentNumber: number;
  studentName: string;
  qualification: string;
  nationality: string;
  studentPhone: string;
  memorizedAmount: string;
  paymentStatus: string;
  memorizationPlan: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
}

interface StudentFormProps {
  mode: 'add' | 'edit';
  student?: Student;
  onClose: () => void;
  onSuccess: () => void;
}

export default function StudentForm({ mode, student, onClose, onSuccess }: StudentFormProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = mode === 'add' 
        ? await createStudent(formData)
        : await updateStudent(formData);

      if (result.error) {
        alert('❌ خطأ: ' + result.error);
      } else {
        alert(`✅ تم ${mode === 'add' ? 'إضافة' : 'تعديل'} الطالبة بنجاح`);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4">
        <h2 className="text-2xl font-bold mb-4">
          {mode === 'add' ? 'إضافة طالبة جديدة' : 'تعديل بيانات الطالبة'}
        </h2>
        <form onSubmit={handleSubmit}>
          {mode === 'edit' && (
            <input type="hidden" name="studentId" value={student?.id} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                name="studentName"
                defaultValue={student?.studentName}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المؤهل العلمي *
              </label>
              <input
                type="text"
                name="qualification"
                defaultValue={student?.qualification}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الجنسية *
              </label>
              <input
                type="text"
                name="nationality"
                defaultValue={student?.nationality}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                name="studentPhone"
                defaultValue={student?.studentPhone}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المقدار المحفوظ
              </label>
              <input
                type="text"
                name="memorizedAmount"
                defaultValue={student?.memorizedAmount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة الدفع
              </label>
              <select
                name="paymentStatus"
                defaultValue={student?.paymentStatus || 'UNPAID'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="PAID">مدفوعة</option>
                <option value="PARTIAL">جزئية</option>
                <option value="UNPAID">غير مدفوعة</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              خطة الحفظ
            </label>
            <textarea
              name="memorizationPlan"
              defaultValue={student?.memorizationPlan || ''}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات
            </label>
            <textarea
              name="notes"
              defaultValue={student?.notes || ''}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
