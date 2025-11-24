'use client';

import { useState } from 'react';
import { toggleUserStatus, changeUserRole } from '@/actions/users';

interface User {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isActive: boolean;
  createdAt: string;
}

interface UserActionsProps {
  user: User;
  currentUserId: string;
  onSuccess: () => void;
}

export default function UserActions({ user, currentUserId, onSuccess }: UserActionsProps) {
  const [loading, setLoading] = useState(false);

  const roleColors = {
    ADMIN: 'bg-red-100 text-red-800 border-red-300',
    TEACHER: 'bg-green-100 text-green-800 border-green-300',
    STUDENT: 'bg-purple-100 text-purple-800 border-purple-300'
  };

  async function handleToggleStatus() {
    if (!confirm(`هل تريد ${user.isActive ? 'إيقاف' : 'تفعيل'} المستخدم "${user.userName}"؟`)) {
      return;
    }

    setLoading(true);
    try {
      const result = await toggleUserStatus(user.id);
      
      if (result.error) {
        alert('❌ خطأ: ' + result.error);
      } else {
        alert(`✅ تم ${result.user?.isActive ? 'تفعيل' : 'إيقاف'} المستخدم بنجاح`);
        onSuccess();
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('❌ حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  async function handleChangeRole(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    
    if (newRole === user.userRole) return;

    const roleLabels: Record<string, string> = {
      ADMIN: 'مدير أعلى',
      TEACHER: 'معلمة',
      STUDENT: 'طالبة'
    };

    if (!confirm(`هل تريد تغيير دور "${user.userName}" إلى "${roleLabels[newRole]}"؟`)) {
      e.target.value = user.userRole; // إعادة القيمة الأصلية
      return;
    }

    setLoading(true);
    try {
      const result = await changeUserRole(user.id, newRole);
      
      if (result.error) {
        alert('❌ خطأ: ' + result.error);
        e.target.value = user.userRole; // إعادة القيمة الأصلية
      } else {
        alert('✅ تم تغيير الدور بنجاح');
        onSuccess();
      }
    } catch (error) {
      console.error('خطأ:', error);
      alert('❌ حدث خطأ غير متوقع');
      e.target.value = user.userRole; // إعادة القيمة الأصلية
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <select
        value={user.userRole}
        onChange={handleChangeRole}
        disabled={user.id === currentUserId || loading}
        className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer ${
          roleColors[user.userRole as keyof typeof roleColors]
        } ${user.id === currentUserId || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="ADMIN">مدير أعلى</option>
        <option value="TEACHER">معلمة</option>
        <option value="STUDENT">طالبة</option>
      </select>

      <button
        onClick={handleToggleStatus}
        disabled={user.id === currentUserId || loading}
        className={`px-3 py-1 text-xs font-medium rounded-full border cursor-pointer transition-colors ${
          user.isActive
            ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
            : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
        } ${user.id === currentUserId || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {user.isActive ? 'نشط' : 'معطل'}
      </button>
    </>
  );
}
