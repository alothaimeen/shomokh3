export default function StudentsSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-10 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        جاري تحميل بيانات الطالبات...
      </div>
    </div>
  );
}
