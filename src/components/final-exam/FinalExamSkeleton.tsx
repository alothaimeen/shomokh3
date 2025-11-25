export default function FinalExamSkeleton() {
  return (
    <>
      {/* Course Selector */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اختر الحلقة
        </label>
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      {/* Exam Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4">
          <h2 className="text-xl font-bold text-white">الاختبار النهائي</h2>
        </div>

        {/* Table Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-gray-700">
            <div className="col-span-1">#</div>
            <div className="col-span-3">اسم الطالبة</div>
            <div className="col-span-2">رقم الجوال</div>
            <div className="col-span-2">الاختبار التحريري</div>
            <div className="col-span-2">الاختبار الشفهي</div>
            <div className="col-span-2">ملاحظات</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5, 6].map((i) => (
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
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
                </div>
                <div className="col-span-2">
                  <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="h-10 w-32 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg opacity-80"></div>
          </div>
        </div>
      </div>
    </>
  );
}
