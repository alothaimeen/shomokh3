'use client';

interface UnfulfilledRequest {
  icon: string;
  title: string;
  reason: string;
}

interface UnfulfilledRequestsProps {
  requests: UnfulfilledRequest[];
}

export default function UnfulfilledRequests({ requests }: UnfulfilledRequestsProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📋</span>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">طلباتكم التي لم نستطع تنفيذها في مودل</h2>
          <p className="text-gray-600 mt-1">كل هذه الطلبات يمكن تنفيذها في المنصة الجديدة!</p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((request, index) => (
          <div 
            key={index}
            className="group bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-200 hover:border-green-400 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{request.icon}</span>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {request.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {request.reason}
                </p>
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    ✅ متاح الآن
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
