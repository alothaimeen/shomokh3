'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Student {
  id: string;
  studentNumber: number;
  studentName: string;
  qualification: string;
  nationality: string;
  studentPhone: string;
  memorizedAmount: string;
  paymentStatus: 'PAID' | 'UNPAID' | 'PARTIAL';
  memorizationPlan?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export default function StudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');

  const [newStudent, setNewStudent] = useState({
    studentName: '',
    qualification: '',
    nationality: '',
    studentPhone: '',
    memorizedAmount: '',
    paymentStatus: 'UNPAID' as 'PAID' | 'UNPAID' | 'PARTIAL',
    memorizationPlan: '',
    notes: ''
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push('/login');
    }
  }, [session, status, router]);

  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (paymentFilter !== 'ALL') params.append('payment', paymentFilter);

      const response = await fetch(`/api/students?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('فشل في جلب الطالبات');
        // بيانات احتياطية في حالة فشل API
        setFallbackStudents();
      }
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      setFallbackStudents();
    }
  }, [searchTerm, paymentFilter]);

  // جلب الطالبات مع البحث والفلترة (useEffect موحد)
  useEffect(() => {
    if (session) {
      fetchStudents();
    }
  }, [session, fetchStudents]);

  const setFallbackStudents = () => {
    const mockStudents: Student[] = [
      {
        id: '1',
        studentNumber: 1,
        studentName: 'فاطمة أحمد محمد',
        qualification: 'ثانوية عامة',
        nationality: 'سعودية',
        studentPhone: '+966501234567',
        memorizedAmount: 'جزء عم كامل',
        paymentStatus: 'PAID',
        memorizationPlan: 'جزء تبارك خلال 3 أشهر',
        notes: 'طالبة متميزة في التلاوة',
        isActive: true,
        createdAt: '2025-01-15'
      },
      {
        id: '2',
        studentNumber: 2,
        studentName: 'عائشة سعد علي',
        qualification: 'بكالوريوس أدب إنجليزي',
        nationality: 'سعودية',
        studentPhone: '+966502345678',
        memorizedAmount: '5 أجزاء من القرآن',
        paymentStatus: 'PARTIAL',
        memorizationPlan: 'إكمال 10 أجزاء خلال العام',
        notes: 'تحتاج مراجعة في التجويد',
        isActive: true,
        createdAt: '2025-01-20'
      },
      {
        id: '3',
        studentNumber: 3,
        studentName: 'خديجة محمد سالم',
        qualification: 'دبلوم إدارة أعمال',
        nationality: 'مصرية',
        studentPhone: '+966503456789',
        memorizedAmount: 'جزءان من القرآن',
        paymentStatus: 'UNPAID',
        memorizationPlan: 'بدء حفظ جزء عم',
        notes: '',
        isActive: true,
        createdAt: '2025-02-01'
      },
      {
        id: '4',
        studentNumber: 4,
        studentName: 'زينب عبدالله يوسف',
        qualification: 'ماجستير دراسات إسلامية',
        nationality: 'أردنية',
        studentPhone: '+966504567890',
        memorizedAmount: '15 جزء من القرآن',
        paymentStatus: 'PAID',
        memorizationPlan: 'إتمام القرآن الكريم كاملاً',
        notes: 'حافظة متقنة، مؤهلة لتكون معلمة',
        isActive: false,
        createdAt: '2025-01-10'
      }
    ];
    setStudents(mockStudents);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userRole = session.user?.userRole;
  const canManageStudents = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'TEACHER';

  const handleAddStudent = async () => {
    if (!newStudent.studentName.trim()) return;

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent)
      });

      if (response.ok) {
        const newStudentData = await response.json();
        setStudents([...students, newStudentData]);
        setNewStudent({
          studentName: '',
          qualification: '',
          nationality: '',
          studentPhone: '',
          memorizedAmount: '',
          paymentStatus: 'UNPAID',
          memorizationPlan: '',
          notes: ''
        });
        setShowAddForm(false);
      } else {
        console.error('فشل في إضافة الطالبة');
        alert('فشل في إضافة الطالبة');
      }
    } catch (error) {
      console.error('خطأ في إضافة الطالبة:', error);
      alert('خطأ في الاتصال');
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent || !editingStudent.studentName.trim()) return;

    try {
      const response = await fetch('/api/students', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: editingStudent.id,
          updateData: {
            studentName: editingStudent.studentName,
            qualification: editingStudent.qualification,
            nationality: editingStudent.nationality,
            studentPhone: editingStudent.studentPhone,
            memorizedAmount: editingStudent.memorizedAmount,
            paymentStatus: editingStudent.paymentStatus,
            memorizationPlan: editingStudent.memorizationPlan,
            notes: editingStudent.notes
          }
        })
      });

      if (response.ok) {
        const updatedStudentData = await response.json();
        setStudents(students.map(student =>
          student.id === editingStudent.id ? updatedStudentData : student
        ));
        setEditingStudent(null);
      } else {
        console.error('فشل في تحديث الطالبة');
        alert('فشل في تحديث الطالبة');
      }
    } catch (error) {
      console.error('خطأ في تحديث الطالبة:', error);
      alert('خطأ في الاتصال');
    }
  };

  const toggleStudentStatus = async (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    try {
      const response = await fetch(`/api/students?id=${studentId}&isActive=${!student.isActive}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setStudents(students.map(s =>
          s.id === studentId
            ? { ...s, isActive: !s.isActive }
            : s
        ));
      } else {
        console.error('فشل في تحديث حالة الطالبة');
        alert('فشل في تحديث حالة الطالبة');
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الطالبة:', error);
      alert('خطأ في الاتصال');
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    const statusMap = {
      'PAID': { label: 'مسدد', color: 'bg-green-100 text-green-800' },
      'UNPAID': { label: 'غير مسدد', color: 'bg-red-100 text-red-800' },
      'PARTIAL': { label: 'مسدد جزئياً', color: 'bg-yellow-100 text-yellow-800' }
    };
    return statusMap[status as keyof typeof statusMap] || statusMap['UNPAID'];
  };

  // فلترة وبحث الطالبات
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentPhone.includes(searchTerm) ||
                         student.studentNumber.toString().includes(searchTerm);

    const matchesPayment = paymentFilter === 'ALL' || student.paymentStatus === paymentFilter;

    return matchesSearch && matchesPayment;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                بيانات الطالبات
              </h1>
              <p className="text-gray-600 mt-1">إدارة بيانات الطالبات المسجلات في المنصة</p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
                لوحة التحكم
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">

          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث في الطالبات
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ابحث بالاسم، رقم الهاتف، أو الرقم التسلسلي"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  فلترة حسب حالة السداد
                </label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">جميع الطالبات</option>
                  <option value="PAID">مسدد</option>
                  <option value="UNPAID">غير مسدد</option>
                  <option value="PARTIAL">مسدد جزئياً</option>
                </select>
              </div>
              {canManageStudents && (
                <div className="flex items-end">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors w-full"
                  >
                    إضافة طالبة جديدة
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Student Form */}
          {showAddForm && canManageStudents && (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-lg font-medium mb-4">إضافة طالبة جديدة</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الطالبة الثلاثي <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newStudent.studentName}
                    onChange={(e) => setNewStudent({...newStudent, studentName: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الاسم الثلاثي كاملاً"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المؤهل الدراسي
                  </label>
                  <input
                    type="text"
                    value={newStudent.qualification}
                    onChange={(e) => setNewStudent({...newStudent, qualification: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثل: ثانوية عامة، بكالوريوس"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنسية
                  </label>
                  <input
                    type="text"
                    value={newStudent.nationality}
                    onChange={(e) => setNewStudent({...newStudent, nationality: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الجنسية"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم التواصل
                  </label>
                  <input
                    type="tel"
                    value={newStudent.studentPhone}
                    onChange={(e) => setNewStudent({...newStudent, studentPhone: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+966501234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مقدار الحفظ
                  </label>
                  <input
                    type="text"
                    value={newStudent.memorizedAmount}
                    onChange={(e) => setNewStudent({...newStudent, memorizedAmount: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثل: جزء عم، 5 أجزاء"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة سداد الرسوم
                  </label>
                  <select
                    value={newStudent.paymentStatus}
                    onChange={(e) => setNewStudent({...newStudent, paymentStatus: e.target.value as 'PAID' | 'UNPAID' | 'PARTIAL'})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UNPAID">غير مسدد</option>
                    <option value="PAID">مسدد</option>
                    <option value="PARTIAL">مسدد جزئياً</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    خطة الحفظ
                  </label>
                  <input
                    type="text"
                    value={newStudent.memorizationPlan}
                    onChange={(e) => setNewStudent({...newStudent, memorizationPlan: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="الخطة المستقبلية للحفظ"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات
                  </label>
                  <textarea
                    value={newStudent.notes}
                    onChange={(e) => setNewStudent({...newStudent, notes: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="ملاحظات إضافية"
                  />
                </div>
                <div className="md:col-span-3 flex gap-2">
                  <button
                    onClick={handleAddStudent}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                  >
                    إضافة الطالبة
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Students List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                قائمة الطالبات ({filteredStudents.length} طالبة)
              </h3>

              {filteredStudents.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  {searchTerm || paymentFilter !== 'ALL' ? 'لا توجد نتائج للبحث المحدد' : 'لا توجد طالبات مسجلات حتى الآن'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">م</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المؤهل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجنسية</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التواصل</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحفظ</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السداد</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        {canManageStudents && (
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className={!student.isActive ? 'bg-gray-100' : ''}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {student.studentNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                              {student.notes && (
                                <div className="text-sm text-gray-500">{student.notes}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.qualification}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {student.nationality}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <a href={`tel:${student.studentPhone}`} className="text-blue-600 hover:text-blue-800">
                              {student.studentPhone}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{student.memorizedAmount}</div>
                            {student.memorizationPlan && (
                              <div className="text-sm text-gray-500">{student.memorizationPlan}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusLabel(student.paymentStatus).color}`}>
                              {getPaymentStatusLabel(student.paymentStatus).label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {student.isActive ? 'نشطة' : 'غير نشطة'}
                            </span>
                          </td>
                          {canManageStudents && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingStudent(student)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  تعديل
                                </button>
                                <button
                                  onClick={() => toggleStudentStatus(student.id)}
                                  className={student.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                                >
                                  {student.isActive ? 'إيقاف' : 'تفعيل'}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Edit Modal */}
      {editingStudent && canManageStudents && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium mb-4">تعديل بيانات الطالبة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الطالبة الثلاثي</label>
                <input
                  type="text"
                  value={editingStudent.studentName}
                  onChange={(e) => setEditingStudent({...editingStudent, studentName: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المؤهل الدراسي</label>
                <input
                  type="text"
                  value={editingStudent.qualification}
                  onChange={(e) => setEditingStudent({...editingStudent, qualification: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الجنسية</label>
                <input
                  type="text"
                  value={editingStudent.nationality}
                  onChange={(e) => setEditingStudent({...editingStudent, nationality: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم التواصل</label>
                <input
                  type="tel"
                  value={editingStudent.studentPhone}
                  onChange={(e) => setEditingStudent({...editingStudent, studentPhone: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">مقدار الحفظ</label>
                <input
                  type="text"
                  value={editingStudent.memorizedAmount}
                  onChange={(e) => setEditingStudent({...editingStudent, memorizedAmount: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">حالة سداد الرسوم</label>
                <select
                  value={editingStudent.paymentStatus}
                  onChange={(e) => setEditingStudent({...editingStudent, paymentStatus: e.target.value as 'PAID' | 'UNPAID' | 'PARTIAL'})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="UNPAID">غير مسدد</option>
                  <option value="PAID">مسدد</option>
                  <option value="PARTIAL">مسدد جزئياً</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">خطة الحفظ</label>
                <input
                  type="text"
                  value={editingStudent.memorizationPlan || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, memorizationPlan: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                <textarea
                  value={editingStudent.notes || ''}
                  onChange={(e) => setEditingStudent({...editingStudent, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={handleUpdateStudent}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                حفظ التعديلات
              </button>
              <button
                onClick={() => setEditingStudent(null)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}