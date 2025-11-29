import { getPublicStats } from '@/actions/public-settings';

export default async function StatsSection() {
  const stats = await getPublicStats();

  return (
    <div className="bg-white rounded-lg p-8 shadow-md">
      <div className="grid md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-3xl font-bold text-primary-purple mb-2">
            {stats.studentsCount.toLocaleString('ar-SA')}+
          </div>
          <div className="text-gray-600">طالبة</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-primary-blue mb-2">
            {stats.teachersCount.toLocaleString('ar-SA')}+
          </div>
          <div className="text-gray-600">معلمة</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.coursesCount.toLocaleString('ar-SA')}+
          </div>
          <div className="text-gray-600">حلقة قرآنية</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.facesCompleted.toLocaleString('ar-SA')}
          </div>
          <div className="text-gray-600">وجه منجز</div>
        </div>
      </div>
    </div>
  );
}
