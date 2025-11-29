'use client';

interface TechBenefit {
  icon: string;
  title: string;
  description: string;
}

interface TechBenefitsProps {
  title: string;
  intro: string;
  benefits: TechBenefit[];
}

export default function TechBenefits({ title, intro, benefits }: TechBenefitsProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">{intro}</p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, index) => (
          <div 
            key={index}
            className="text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-primary-purple hover:shadow-md transition-all duration-300"
          >
            <span className="text-4xl block mb-4">{benefit.icon}</span>
            <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
            <p className="text-sm text-gray-600">{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
