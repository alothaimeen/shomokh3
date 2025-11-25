export default function RequestsSkeleton() {
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">طلبات الانضمام</h2>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-1"></div>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full">
            <div className="h-6 w-16 bg-yellow-200 rounded animate-pulse inline-block"></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-24 bg-yellow-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="mt-4 flex gap-2">
              <div className="h-10 w-24 bg-green-200 rounded animate-pulse"></div>
              <div className="h-10 w-24 bg-red-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
        <div className="text-center text-sm text-gray-500 mt-4">
          جاري تحميل الطلبات...
        </div>
      </div>
    </>
  );
}
