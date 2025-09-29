'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  message?: string;
  createdAt: string;
  student: Student;
  course: Course;
}

interface RequestsData {
  requests: EnrollmentRequest[];
  requestsByStatus: {
    pending: EnrollmentRequest[];
    accepted: EnrollmentRequest[];
    rejected: EnrollmentRequest[];
  };
  counts: {
    pending: number;
    accepted: number;
    rejected: number;
    total: number;
  };
}

export default function TeacherRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [preSelectedCourse, setPreSelectedCourse] = useState<string>('');
  const [requestsData, setRequestsData] = useState<RequestsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // التحقق من وجود courseId في URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const courseIdFromUrl = urlParams.get('courseId');
    if (courseIdFromUrl) {
      setPreSelectedCourse(courseIdFromUrl);
    }
  }, []);

  const fetchTeacherRequests = useCallback(async () => {
    try {
      const url = preSelectedCourse
        ? `/api/enrollment/teacher-requests?courseId=${preSelectedCourse}`
        : '/api/enrollment/teacher-requests';
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setRequestsData(data);
        setSelectedRequests([]); // إعادة تعيين الاختيارات
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في جلب البيانات'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setLoading(false);
    }
  }, [preSelectedCourse]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.userRole !== 'TEACHER') {
      router.push('/dashboard');
      return;
    }

    fetchTeacherRequests();
  }, [session, status, router, fetchTeacherRequests]);

  // إعادة جلب البيانات عند تغيير الحلقة المختارة
  useEffect(() => {
    if (session && status === 'authenticated') {
      fetchTeacherRequests();
    }
  }, [preSelectedCourse, session, status, fetchTeacherRequests]);

  const handleSingleAction = async (requestId: string, action: 'accept' | 'reject') => {
    if (processing) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/enrollment/manage-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: data.message
        });
        fetchTeacherRequests(); // إعادة جلب البيانات
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في معالجة الطلب'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleMultipleAction = async (action: 'accept' | 'reject') => {
    if (processing || selectedRequests.length === 0) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/enrollment/manage-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestIds: selectedRequests,
          action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          type: 'success',
          message: data.message
        });
        if (data.errors && data.errors.length > 0) {
          // عرض الأخطاء أيضاً
          setTimeout(() => {
            setNotification({
              type: 'error',
              message: `أخطاء: ${data.errors.join(', ')}`
            });
          }, 3000);
        }
        fetchTeacherRequests(); // إعادة جلب البيانات
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'خطأ في معالجة الطلبات'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'خطأ في الاتصال بالخادم'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId)
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    if (!requestsData) return;

    const pendingRequests = requestsData.requestsByStatus.pending.map(req => req.id);
    setSelectedRequests(
      selectedRequests.length === pendingRequests.length ? [] : pendingRequests
    );
  };

  const filteredRequests = requestsData
    ? requestsData.requestsByStatus[activeTab].filter(request =>
        request.student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.student.studentNumber.toString().includes(searchTerm) ||
        request.student.studentPhone.includes(searchTerm)
      )
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'في الانتظار';
      case 'ACCEPTED':
        return 'مقبول';
      case 'REJECTED':
        return 'مرفوض';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600';
      case 'UNPAID':
        return 'text-red-600';
      case 'PARTIAL':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'مسدد';
      case 'UNPAID':
        return 'غير مسدد';
      case 'PARTIAL':
        return 'مسدد جزئياً';
      default:
        return status;
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!requestsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">خطأ في تحميل البيانات</div>
      </div>
    );
  }

  const currentRequests = filteredRequests;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">طلبات الانضمام للحلقات</h1>
            {preSelectedCourse && (
              <Link
                href="/teacher"
                className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                ← العودة لاختيار الحلقة
              </Link>
            )}
          </div>
          <p className="text-gray-600">إدارة طلبات الطالبات للانضمام لحلقاتك</p>
        </div>

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
            <div className="text-2xl font-bold text-gray-800">{requestsData.counts.total}</div>
            <div className="text-gray-600">إجمالي الطلبات</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{requestsData.counts.pending}</div>
            <div className="text-gray-600">في الانتظار</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{requestsData.counts.accepted}</div>
            <div className="text-gray-600">مقبولة</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{requestsData.counts.rejected}</div>
            <div className="text-gray-600">مرفوضة</div>
          </div>
        </div>

        {/* تبويبات الحالات */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {[
                { key: 'pending', label: 'في الانتظار', count: requestsData.counts.pending },
                { key: 'accepted', label: 'مقبولة', count: requestsData.counts.accepted },
                { key: 'rejected', label: 'مرفوضة', count: requestsData.counts.rejected },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key as any);
                    setSearchTerm(''); // إعادة تعيين البحث عند تغيير التبويب
                    setSelectedRequests([]); // إعادة تعيين الاختيارات
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

              {/* إجراءات جماعية للطلبات في الانتظار فقط */}
              {activeTab === 'pending' && requestsData.counts.pending > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100"
                  >
                    {selectedRequests.length === requestsData.requestsByStatus.pending.length ? 'إلغاء الكل' : 'اختيار الكل'}
                  </button>

                  {selectedRequests.length > 0 && (
                    <>
                      <button
                        onClick={() => handleMultipleAction('accept')}
                        disabled={processing}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                      >
                        قبول المحدد ({selectedRequests.length})
                      </button>
                      <button
                        onClick={() => handleMultipleAction('reject')}
                        disabled={processing}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                      >
                        رفض المحدد ({selectedRequests.length})
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* عرض عدد النتائج */}
            <div className="mt-2 text-sm text-gray-600">
              {searchTerm && (
                <span>
                  عرض {currentRequests.length} من {requestsData.requestsByStatus[activeTab].length} نتيجة
                  {searchTerm && ` للبحث عن "${searchTerm}"`}
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {currentRequests.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                لا توجد طلبات {getStatusText(activeTab.toUpperCase())}
              </div>
            ) : (
              <div className="space-y-4">
                {currentRequests.map((request) => (
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

                    {/* إجراءات للطلبات في الانتظار */}
                    {request.status === 'PENDING' && (
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSingleAction(request.id, 'accept')}
                              disabled={processing}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                            >
                              قبول
                            </button>
                            <button
                              onClick={() => handleSingleAction(request.id, 'reject')}
                              disabled={processing}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm rounded font-medium"
                            >
                              رفض
                            </button>
                          </div>

                          {/* checkbox للاختيار الجماعي */}
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

        {/* العودة للوحة التحكم */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
          >
            العودة للوحة التحكم
          </button>
        </div>
      </div>
    </div>
  );
}