export default function TeacherCoursesSkeleton() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* معلومات الحلقة Skeleton */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            {/* عنوان الحلقة */}
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            {/* معلومات البرنامج */}
            <div className="h-5 w-48 bg-gray-100 rounded animate-pulse"></div>
          </div>
          
          {/* زر تغيير الحلقة */}
          <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* الطالبات المسجلات */}
          <div className="bg-gradient-to-br from-primary-blue/10 to-primary-blue/5 p-4 rounded-lg text-center border border-primary-blue/20">
            <div className="h-9 w-16 bg-primary-blue/20 rounded animate-pulse mx-auto mb-2"></div>
            <div className="text-gray-600 mt-1">الطالبات المسجلات</div>
          </div>
          
          {/* مستوى الحلقة */}
          <div className="bg-gradient-to-br from-primary-purple/10 to-primary-purple/5 p-4 rounded-lg text-center border border-primary-purple/20">
            <div className="h-9 w-24 bg-primary-purple/20 rounded animate-pulse mx-auto mb-2"></div>
            <div className="text-gray-600 mt-1">مستوى الحلقة</div>
          </div>
          
          {/* البرنامج التعليمي */}
          <div className="bg-gradient-to-br from-secondary-dark/10 to-secondary-dark/5 p-4 rounded-lg text-center border border-secondary-dark/20">
            <div className="h-6 w-32 bg-secondary-dark/20 rounded animate-pulse mx-auto mb-2"></div>
            <div className="text-gray-600 mt-1">البرنامج التعليمي</div>
          </div>
        </div>
      </div>

      {/* الإجراءات السريعة Skeleton */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          إدارة الحلقة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* الحضور والغياب */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">✅</span>
            <span className="font-semibold">الحضور والغياب</span>
          </div>

          {/* التقييم اليومي */}
          <div className="bg-gradient-to-r from-primary-purple to-primary-purple/80 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">📊</span>
            <span className="font-semibold">التقييم اليومي</span>
          </div>

          {/* التقييم الأسبوعي */}
          <div className="bg-gradient-to-r from-primary-blue to-primary-blue/80 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">📅</span>
            <span className="font-semibold">التقييم الأسبوعي</span>
          </div>

          {/* التقييم الشهري */}
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">📆</span>
            <span className="font-semibold">التقييم الشهري</span>
          </div>

          {/* درجات السلوك */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">⭐</span>
            <span className="font-semibold">درجات السلوك</span>
          </div>

          {/* الاختبار النهائي */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">🎓</span>
            <span className="font-semibold">الاختبار النهائي</span>
          </div>

          {/* طلبات الانضمام */}
          <div className="bg-gradient-to-r from-secondary-dark to-secondary-dark/80 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">📋</span>
            <span className="font-semibold">طلبات الانضمام</span>
          </div>

          {/* الطالبات المسجلات */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-4 rounded-lg flex items-center justify-center gap-3 opacity-90">
            <span className="text-2xl">📝</span>
            <span className="font-semibold">الطالبات المسجلات</span>
          </div>
        </div>
      </div>
    </div>
  );
}
