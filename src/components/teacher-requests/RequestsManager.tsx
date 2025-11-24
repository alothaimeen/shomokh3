'use client';

import { useState, useTransition } from 'react';
import { acceptRequest, rejectRequest, acceptMultipleRequests, rejectMultipleRequests } from '@/actions/enrollment';

interface Student {
  id: string;
  studentNumber: number;
  studentName: string;
  studentPhone: string;
  qualification: string;
  nationality: string;
  memorizedAmount: string;
  paymentStatus: string;
}

interface Course {
  id: string;
  courseName: string;
  programName: string;
}

interface EnrollmentRequest {
  id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string | null;
  createdAt: string;
  student: Student;
  course: Course;
}

interface RequestsManagerProps {
  requests: EnrollmentRequest[];
  pendingCount: number;
}

export default function RequestsManager({ requests, pendingCount }: RequestsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  const requestsByStatus = {
    pending: requests.filter(r => r.status === 'PENDING'),
    accepted: requests.filter(r => r.status === 'ACCEPTED'),
    rejected: requests.filter(r => r.status === 'REJECTED')
  };

  const counts = {
    total: requests.length,
    pending: requestsByStatus.pending.length,
    accepted: requestsByStatus.accepted.length,
    rejected: requestsByStatus.rejected.length
  };

  const handleSingleAction = async (requestId: string, action: 'accept' | 'reject') => {
    startTransition(async () => {
      try {
        const result = action === 'accept' 
          ? await acceptRequest(requestId)
          : await rejectRequest(requestId);

        if (!result.success) {
          setNotification({ type: 'error', message: result.error || 'حدث خطأ' });
        } else {
          setNotification({ type: 'success', message: result.message || 'تمت العملية بنجاح' });
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'خطأ في معالجة الطلب' });
      }
    });
  };

  const handleMultipleAction = async (action: 'accept' | 'reject') => {
    if (selectedRequests.length === 0) return;

    startTransition(async () => {
      try {
        const result = action === 'accept'
          ? await acceptMultipleRequests(selectedRequests)
          : await rejectMultipleRequests(selectedRequests);

        if (!result.success) {
          setNotification({ type: 'error', message: result.error || 'حدث خطأ' });
        } else {
          setNotification({ type: 'success', message: result.message || 'تمت العملية بنجاح' });
          setSelectedRequests([]);
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'خطأ في معالجة الطلبات' });
      }
    });
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    const pendingRequests = requestsByStatus.pending.map(req => req.id);
    setSelectedRequests(
      selectedRequests.length === pendingRequests.length ? [] : pendingRequests
    );
  };

  const filteredRequests = requestsByStatus[activeTab].filter(request =>
    request.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.student.studentNumber.toString().includes(searchTerm) ||
    request.student.studentPhone.includes(searchTerm)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'في الانتظار';
      case 'ACCEPTED': return 'مقبول';
      case 'REJECTED': return 'مرفوض';
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600';
      case 'UNPAID': return 'text-red-600';
      case 'PARTIAL': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'مسدد';
      case 'UNPAID': return 'غير مسدد';
      case 'PARTIAL': return 'مسدد جزئياً';
      default: return status;
    }
  };

  return (
    <>
      {notification && (
        <div className={`mb-6 p-4 rounded-lg ${
          notification.type === 'success'
            ? 'bg-green-100 border border-green-400 text-green-700'
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {notification.message}
        </div>
      )}

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">{counts.total}</div>
          <div className="text-gray-600">إجمالي الطلبات</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{counts.pending}</div>
          <div className="text-gray-600">في الانتظار</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{counts.accepted}</div>
          <div className="text-gray-600">مقبولة</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{counts.rejected}</div>
          <div className="text-gray-600">مرفوضة</div>
        </div>
      </div>

      {/* تبويبات الحالات */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'pending', label: 'في الانتظار', count: counts.pending },
              { key: 'accepted', label: 'مقبولة', count: counts.accepted },
              { key: 'rejected', label: 'مرفوضة', count: counts.rejected },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key as any);
                  setSearchTerm('');
                  setSelectedRequests([]);
                }}
                className={`px-6 py-3 font-medium text-sm border-b-2 ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* شريط البحث والإجراءات الجماعية */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="البحث بالاسم، الرقم، أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {activeTab === 'pending' && counts.pending > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                >
                  {selectedRequests.length === requestsByStatus.pending.length ? 'إلغاء الكل' : 'اختيار الكل'}
                </button>

                {selectedRequests.length > 0 && (
                  <>
                    <button
                      onClick={() => handleMultipleAction('accept')}
                      disabled={isPending}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                    >
                      قبول المحدد ({selectedRequests.length})
                    </button>
                    <button
                      onClick={() => handleMultipleAction('reject')}
                      disabled={isPending}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                    >
                      رفض المحدد ({selectedRequests.length})
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {searchTerm && (
            <div className="mt-2 text-sm text-gray-600">
              عرض {filteredRequests.length} من {requestsByStatus[activeTab].length} نتيجة
              {searchTerm && ` للبحث عن "${searchTerm}"`}
            </div>
          )}
        </div>

        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              لا توجد طلبات {getStatusText(activeTab.toUpperCase())}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">
                        {request.student.studentName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        رقم الطالبة: {request.student.studentNumber}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">الحلقة:</span> {request.course.courseName}</p>
                      <p className="text-sm"><span className="font-medium">البرنامج:</span> {request.course.programName}</p>
                      <p className="text-sm"><span className="font-medium">رقم الهاتف:</span> {request.student.studentPhone}</p>
                      <p className="text-sm">
                        <span className="font-medium">حالة السداد:</span>
                        <span className={getPaymentStatusColor(request.student.paymentStatus)}>
                          {' '}{getPaymentStatusText(request.student.paymentStatus)}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm"><span className="font-medium">المؤهل:</span> {request.student.qualification}</p>
                      <p className="text-sm"><span className="font-medium">الجنسية:</span> {request.student.nationality}</p>
                      <p className="text-sm"><span className="font-medium">مقدار الحفظ:</span> {request.student.memorizedAmount}</p>
                      <p className="text-sm"><span className="font-medium">تاريخ الطلب:</span> {new Date(request.createdAt).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>

                  {request.message && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border">
                      <p className="text-sm font-medium text-gray-700 mb-1">رسالة الطالبة:</p>
                      <p className="text-sm text-gray-600">{request.message}</p>
                    </div>
                  )}

                  {request.status === 'PENDING' && (
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSingleAction(request.id, 'accept')}
                            disabled={isPending}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                          >
                            قبول
                          </button>
                          <button
                            onClick={() => handleSingleAction(request.id, 'reject')}
                            disabled={isPending}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                          >
                            رفض
                          </button>
                        </div>

                        <label className="flex items-center text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={selectedRequests.includes(request.id)}
                            onChange={() => handleSelectRequest(request.id)}
                            className="mr-2"
                          />
                          اختيار للإجراء الجماعي
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
