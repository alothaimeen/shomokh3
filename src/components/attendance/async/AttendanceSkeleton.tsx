export default function AttendanceSkeleton() {
  return (
    <>
      {/* Course Selector Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
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

      {/* Course Info Skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="h-6 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>

      {/* Attendance Table Skeleton */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue p-4">
          <div className="grid grid-cols-12 gap-4 text-white font-semibold">
            <div className="col-span-1">#</div>
            <div className="col-span-3">اسم الطالبة</div>
            <div className="col-span-2">رقم الجوال</div>
            <div className="col-span-4">الحالة</div>
            <div className="col-span-2">ملاحظات</div>
          </div>
        </div>

        {/* Table Body Skeleton */}
        <div className="divide-y divide-gray-200">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-4">
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* # */}
                <div className="col-span-1">
                  <div className="h-6 w-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* اسم الطالبة */}
                <div className="col-span-3">
                  <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                {/* رقم الجوال */}
                <div className="col-span-2">
                  <div className="h-5 w-full bg-gray-100 rounded animate-pulse"></div>
                </div>
                
                {/* الحالة - أزرار ملونة (جاهزة) */}
                <div className="col-span-4">
                  <div className="flex gap-2 justify-center">
                    <button 
                      disabled
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-100 text-green-700 opacity-70 cursor-not-allowed"
                    >
                      ح
                    </button>
                    <button 
                      disabled
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 opacity-70 cursor-not-allowed"
                    >
                      م
                    </button>
                    <button 
                      disabled
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-100 text-red-700 opacity-70 cursor-not-allowed"
                    >
                      غ
                    </button>
                    <button 
                      disabled
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 opacity-70 cursor-not-allowed"
                    >
                      ر
                    </button>
                    <button 
                      disabled
                      className="px-3 py-1.5 rounded-lg text-sm font-medium bg-orange-100 text-orange-700 opacity-70 cursor-not-allowed"
                    >
                      خ
                    </button>
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

        {/* Save Button Skeleton */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <div className="h-10 w-32 bg-gradient-to-r from-primary-purple to-primary-blue rounded-lg opacity-80"></div>
          </div>
        </div>
      </div>
    </>
  );
}
