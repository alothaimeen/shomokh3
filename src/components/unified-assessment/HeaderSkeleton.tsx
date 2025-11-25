export default function HeaderSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
          اختر الحلقة:
        </label>
        <div className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 h-10 animate-pulse"></div>
      </div>
      <div className="mt-4 text-center text-sm text-gray-500">
        جاري تحميل الحلقات...
      </div>
    </div>
  );
}
