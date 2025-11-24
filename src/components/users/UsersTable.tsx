'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import UserForm from './UserForm';
import UserActions from './UserActions';

interface User {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  isActive: boolean;
  createdAt: string;
}

interface UsersTableProps {
  users: User[];
  currentUserId: string;
}

export default function UsersTable({ users: initialUsers, currentUserId }: UsersTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
  }

  function openEditModal(user: User) {
    setSelectedUser(user);
    setShowEditModal(true);
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-primary-purple to-primary-blue text-white px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-90"
        >
          + إضافة مستخدم جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">قائمة المستخدمين ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  البريد الإلكتروني
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الدور
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الإنشاء
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.userName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.userEmail}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <UserActions 
                      user={user} 
                      currentUserId={currentUserId}
                      onSuccess={handleSuccess}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-2 space-x-reverse">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                      onClick={() => openEditModal(user)}
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <UserForm
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showEditModal && selectedUser && (
        <UserForm
          mode="edit"
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
