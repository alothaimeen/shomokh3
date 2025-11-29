'use client';

interface Problem {
  id: number;
  title: string;
  icon: string;
  oldProblem: string[];
  newSolution: string[];
}

interface ProblemCardProps {
  problem: Problem;
}

export default function ProblemCard({ problem }: ProblemCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{problem.icon}</span>
          <h3 className="text-xl font-bold text-gray-900">{problem.title}</h3>
        </div>
      </div>
      
      {/* Content - Before/After comparison */}
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse">
        {/* Old Problem */}
        <div className="p-6 bg-red-50/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">❌</span>
            <h4 className="font-bold text-red-700">المشكلة في مودل</h4>
          </div>
          <ul className="space-y-3">
            {problem.oldProblem.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-red-400 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* New Solution */}
        <div className="p-6 bg-green-50/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">✅</span>
            <h4 className="font-bold text-green-700">الحل في المنصة الجديدة</h4>
          </div>
          <ul className="space-y-3">
            {problem.newSolution.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
