'use client';

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface BenefitsListProps {
  benefits: Benefit[];
}

export default function BenefitsList({ benefits }: BenefitsListProps) {
  return (
    <div className="bg-gradient-to-br from-primary-purple/5 to-primary-blue/5 rounded-2xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">ماذا تعني المنصة الجديدة بالنسبة لنا؟</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="text-center">
              <span className="text-4xl block mb-4">{benefit.icon}</span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
