export default function EnrolledStudentsSkeleton() {
  return (
    <>
      {/* Course Selector */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر الحلقة
        </label>
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-xl font-bold">الطالبات المسجلات</h2>
            <div className="h-8 w-24 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
            <div className="col-span-1">#</div>
            <div className="col-span-3">الاسم</div>
            <div className="col-span-2">رقم الجوال</div>
            <div className="col-span-2">البريد الإلكتروني</div>
            <div className="col-span-1">العمر</div>
            <div className="col-span-2">تاريخ الانضمام</div>
            <div className="col-span-1">إجراءات</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-1">
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-3">
                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-5 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-5 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1">
                  <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-5 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="col-span-1">
                  <button
                    disabled
                    className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm opacity-70 cursor-not-allowed"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
