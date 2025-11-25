export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* Spinner متحرك */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-purple border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        {/* نص التحميل */}
        <p className="text-lg font-medium text-gray-700">
          جاري التحميل...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          يرجى الانتظار
        </p>
      </div>
    </div>
  );
}
