'use client';

interface ConclusionProps {
  title: string;
  intro: string;
  points: string[];
}

export default function Conclusion({ title, intro, points }: ConclusionProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-green-200">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">{intro}</p>
      </div>
      
      <div className="bg-green-50 rounded-xl p-6">
        <h3 className="font-bold text-green-800 mb-4 text-lg">المنصة الجديدة:</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {points.map((point, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm"
            >
              <span className="text-green-500 text-xl">✅</span>
              <span className="text-gray-800 font-medium">{point}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
