/**
 * Skeleton للحلقات - تحسين تجربة المستخدم
 */

export default function CoursesLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4">
          <div className="mb-3">
            <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6].map((j) => (
              <div key={j} className="h-10 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
