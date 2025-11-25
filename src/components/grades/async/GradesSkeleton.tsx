export default function GradesSkeleton() {
  return (
    <>
      {/* Course & Date Selector Skeleton */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* الحلقة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحلقة
            </label>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
          
          {/* التاريخ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              التاريخ
            </label>
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Grades Table Skeleton */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4">
          <div className="grid grid-cols-12 gap-4 text-white font-semibold text-sm">
            <div className="col-span-1">#</div>
            <div className="col-span-3">اسم الطالبة</div>
            <div className="col-span-3">الحفظ والتجويد</div>
            <div className="col-span-3">المراجعة والتجويد</div>
            <div className="col-span-2">ملاحظات</div>
          </div>
        </div>

        {/* Body */}
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="p-4 hover:bg-gray-50">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* # */}
                <div className="col-span-1">
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* اسم الطالبة */}
                <div className="col-span-3">
                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* الحفظ والتجويد - أزرار ملونة */}
                <div className="col-span-3">
                  <div className="flex gap-2 justify-center">
                    {['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'].map((label, idx) => (
                      <button
                        key={idx}
                        disabled
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 opacity-70 cursor-not-allowed"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* المراجعة والتجويد - أزرار ملونة */}
                <div className="col-span-3">
                  <div className="flex gap-2 justify-center">
                    {['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف'].map((label, idx) => (
                      <button
                        key={idx}
                        disabled
                        className="px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 opacity-70 cursor-not-allowed"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* ملاحظات */}
                <div className="col-span-2">
                  <div className="h-8 bg-gray-100 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gradient-to-r from-primary-purple to-primary-blue rounded-lg opacity-80"></div>
          </div>
        </div>
      </div>
    </>
  );
}
