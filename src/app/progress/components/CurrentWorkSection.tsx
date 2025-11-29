'use client';

interface CurrentWork {
  title: string;
  description: string;
}

interface CurrentWorkSectionProps {
  items: CurrentWork[];
}

export default function CurrentWorkSection({ items }: CurrentWorkSectionProps) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg border-2 border-blue-200 mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔄</span>
        <h2 className="text-2xl font-bold text-gray-900">ما نعمل عليه حالياً</h2>
      </div>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 bg-white/70 rounded-xl p-4"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{index + 1}</span>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{item.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
