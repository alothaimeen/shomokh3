export default function GradesSkeleton() {
  return (
    <>
      {/* ملخص الدرجات */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">ملخص الدرجات</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* درجاتي بالتفصيل */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex gap-2 mb-4 border-b">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-200 rounded-t animate-pulse"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-gray-500">
          جاري تحميل الدرجات...
        </div>
      </div>
    </>
  );
}
