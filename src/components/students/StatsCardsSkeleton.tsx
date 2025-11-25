export default function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}
