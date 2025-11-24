'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentForm from './StudentForm';
import StudentActions from './StudentActions';

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

interface StudentsTableProps {
  students: Student[];
  currentSearch?: string;
  currentFilter?: string;
}

export default function StudentsTable({ students: initialStudents, currentSearch = '', currentFilter = 'ALL' }: StudentsTableProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState(currentSearch);
  const [paymentFilter, setPaymentFilter] = useState(currentFilter);
  const router = useRouter();

  function handleSuccess() {
    router.refresh();
  }

  function openEditModal(student: Student) {
    setSelectedStudent(student);
    setShowEditModal(true);
  }

  function handleSearch() {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (paymentFilter !== 'ALL') params.append('payment', paymentFilter);
    router.push(`/students?${params.toString()}`);
  }

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

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            البحث (الاسم، الهاتف، الجنسية)
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="ابحث عن طالبة..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            حالة الدفع
          </label>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">الكل</option>
            <option value="PAID">مدفوعة</option>
            <option value="PARTIAL">جزئية</option>
            <option value="UNPAID">غير مدفوعة</option>
          </select>
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          بحث
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:opacity-90 transition-colors"
        >
          + إضافة طالبة
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">قائمة الطالبات ({initialStudents.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الرقم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المؤهل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الجنسية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الهاتف</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">المحفوظ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">حالة الدفع</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {initialStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                    {student.studentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.qualification}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.nationality}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left" dir="ltr">
                    {student.studentPhone}
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {student.memorizedAmount || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <StudentActions 
                      student={student}
                      onSuccess={handleSuccess}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      student.isActive
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {student.isActive ? 'نشطة' : 'معطلة'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded hover:bg-blue-50"
                      onClick={() => openEditModal(student)}
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
        <StudentForm
          mode="add"
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSuccess}
        />
      )}

      {showEditModal && selectedStudent && (
        <StudentForm
          mode="edit"
          student={selectedStudent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}
