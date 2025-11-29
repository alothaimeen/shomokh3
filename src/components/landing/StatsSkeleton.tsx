export default function StatsSkeleton() {
  return (
    <div className="bg-white rounded-lg p-8 shadow-md animate-pulse">
      <div className="grid md:grid-cols-4 gap-8 text-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-9 bg-gray-200 rounded-lg w-24 mx-auto mb-2"></div>
            <div className="h-5 bg-gray-100 rounded w-16 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
