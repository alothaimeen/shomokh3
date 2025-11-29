'use client';

interface UpcomingFeature {
  id: number;
  title: string;
  icon: string;
  description: string;
  priority: string;
}

interface UpcomingFeaturesProps {
  features: UpcomingFeature[];
}

export default function UpcomingFeatures({ features }: UpcomingFeaturesProps) {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">أولوية عالية</span>;
      case 'medium':
        return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">أولوية متوسطة</span>;
      case 'low':
        return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">اختياري</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">⏳</span>
        <h2 className="text-2xl font-bold text-gray-900">المراحل القادمة</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div 
            key={feature.id}
            className="group bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200 hover:border-primary-purple hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{feature.icon}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 group-hover:text-primary-purple transition-colors">
                    {feature.title}
                  </h4>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
                <div className="mt-3">
                  {getPriorityBadge(feature.priority)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
