export default function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <div className="text-2xl font-bold text-red-600">
          <div className="h-8 w-12 bg-red-200 rounded animate-pulse"></div>
        </div>
        <div className="text-sm text-red-700">مدراء</div>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <div className="text-2xl font-bold text-green-600">
          <div className="h-8 w-12 bg-green-200 rounded animate-pulse"></div>
        </div>
        <div className="text-sm text-green-700">معلمات</div>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <div className="text-2xl font-bold text-purple-600">
          <div className="h-8 w-12 bg-purple-200 rounded animate-pulse"></div>
        </div>
        <div className="text-sm text-purple-700">طالبات</div>
      </div>
    </div>
  );
}
