'use client';

import Link from 'next/link';

interface Feature {
  title: string;
  description: string;
  link: string | null;
  linkType: string | null;
  requiredRole: string | null;
}

interface FeatureCardProps {
  category: string;
  icon: string;
  features: Feature[];
  onFeatureClick: (link: string, requiredRole: string | null) => void;
}

export default function FeatureCard({ category, icon, features, onFeatureClick }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <span className="text-3xl">{icon}</span>
        <h3 className="text-xl font-bold text-gray-900">{category}</h3>
      </div>
      
      {/* Features list */}
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="group"
          >
            <div className="flex items-start gap-3">
              <span className="text-green-500 text-lg mt-0.5">✅</span>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 group-hover:text-primary-purple transition-colors">
                  {feature.title}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {feature.description}
                </p>
                {feature.link && (
                  <button
                    onClick={() => onFeatureClick(feature.link!, feature.requiredRole)}
                    className="inline-flex items-center gap-1 text-sm text-primary-purple hover:text-primary-blue mt-2 transition-colors"
                  >
                    <span>👁️</span>
                    <span>شاهد كيف يعمل</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
