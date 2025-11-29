'use client';

interface ProgressBarProps {
  percentage: number;
  completed: number;
  total: number;
}

export default function ProgressBar({ percentage, completed, total }: ProgressBarProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          التقدم الكلي للمشروع
        </h2>
        <p className="text-gray-600">
          أنجزنا <span className="font-bold text-primary-purple">{completed}</span> من{' '}
          <span className="font-bold text-primary-blue">{total}</span> مرحلة
        </p>
      </div>
      
      <div className="relative">
        {/* Progress bar background */}
        <div className="w-full h-8 bg-gray-100 rounded-full overflow-hidden">
          {/* Progress bar fill */}
          <div 
            className="h-full bg-gradient-to-r from-primary-purple to-primary-blue rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${percentage}%` }}
          >
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
        </div>
        
        {/* Percentage label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-700">
            {percentage}%
          </span>
        </div>
      </div>
      
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="text-center p-4 bg-green-50 rounded-xl">
          <div className="text-3xl font-bold text-green-600">{completed}</div>
          <div className="text-sm text-green-700 mt-1">✅ مرحلة مكتملة</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-xl">
          <div className="text-3xl font-bold text-blue-600">1</div>
          <div className="text-sm text-blue-700 mt-1">🔄 مرحلة حالية</div>
        </div>
        <div className="text-center p-4 bg-orange-50 rounded-xl">
          <div className="text-3xl font-bold text-orange-600">{total - completed - 1}</div>
          <div className="text-sm text-orange-700 mt-1">⏳ مرحلة قادمة</div>
        </div>
      </div>
    </div>
  );
}
