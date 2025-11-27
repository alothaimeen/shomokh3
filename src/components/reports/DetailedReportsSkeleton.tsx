export function DetailedReportsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Course Selector Skeleton */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-12 bg-gray-200 rounded w-full"></div>
      </div>

      {/* Report Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg shadow-lg p-6 border-2 border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              <div className="mr-4 flex-1">
                <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-40"></div>
              </div>
            </div>
            <div className="h-12 bg-gray-300 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
