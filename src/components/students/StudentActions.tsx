'use client';

import { useState } from 'react';
import { toggleStudentStatus, updatePaymentStatus } from '@/actions/students';

interface Student {
  id: string;
  studentNumber: number;
  studentName: string;
  paymentStatus: string;
  isActive: boolean;
}

interface StudentActionsProps {
  student: Student;
  onSuccess: () => void;
}

export default function StudentActions({ student, onSuccess }: StudentActionsProps) {
  const [loading, setLoading] = useState(false);

  const paymentStatusColors = {
    PAID: 'bg-green-100 text-green-800 border-green-300',
    PARTIAL: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    UNPAID: 'bg-red-100 text-red-800 border-red-300'
  };

  const paymentStatusLabels = {
    PAID: 'مدفوعة',
    PARTIAL: 'جزئية',
    UNPAID: 'غير مدفوعة'
  };

  async function handleToggleStatus() {
    if (!confirm(`هل تريد ${student.isActive ? 'تعطيل' : 'تفعيل'} الطالبة "${student.studentName}"؟`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await toggleStudentStatus(student.id);
      
      if (result.error) {
        alert('❌ خطأ: ' + result.error);
      } else {
        alert(`✅ تم ${result.student?.isActive ? 'تفعيل' : 'تعطيل'} الطالبة بنجاح`);
        onSuccess();
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('❌ حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePaymentStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    
    if (newStatus === student.paymentStatus) return;

    if (!confirm(`هل تريد تغيير حالة الدفع إلى "${paymentStatusLabels[newStatus as keyof typeof paymentStatusLabels]}"؟`)) {
      e.target.value = student.paymentStatus;
      return;
    }

    setLoading(true);
    try {
      const result = await updatePaymentStatus(student.id, newStatus);
      
      if (result.error) {
        alert('❌ خطأ: ' + result.error);
        e.target.value = student.paymentStatus;
      } else {
        alert('✅ تم تحديث حالة الدفع بنجاح');
        onSuccess();
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('❌ حدث خطأ غير متوقع');
      e.target.value = student.paymentStatus;
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={student.paymentStatus}
      onChange={handleChangePaymentStatus}
      disabled={loading}
      className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer ${
        paymentStatusColors[student.paymentStatus as keyof typeof paymentStatusColors]
      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <option value="PAID">مدفوعة</option>
      <option value="PARTIAL">جزئية</option>
      <option value="UNPAID">غير مدفوعة</option>
    </select>
  );
}
