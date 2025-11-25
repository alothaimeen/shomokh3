export default function StudentsTableSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Search Bar Skeleton */}
      <div className="mb-6 flex gap-4">
        <div className="h-10 flex-1 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-100 rounded animate-pulse"></div>
      </div>
      
      {/* Table Header Skeleton */}
      <div className="grid grid-cols-6 gap-4 mb-4 pb-3 border-b">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
      
      {/* Table Rows Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="grid grid-cols-6 gap-4">
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
