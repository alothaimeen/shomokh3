'use client';

interface DemoBannerProps {
  role: string;
  onClose: () => void;
}

export default function DemoBanner({ role, onClose }: DemoBannerProps) {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'مدير';
      case 'TEACHER':
        return 'معلمة';
      case 'STUDENT':
        return 'طالبة';
      default:
        return role;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary-purple to-primary-blue text-white py-3 px-4 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <span className="text-sm md:text-base">
            أنت الآن في وضع التجربة - تم تسجيل دخولك كـ <strong>{getRoleLabel(role)}</strong> للاطلاع على الميزات
          </span>
        </div>
        <button 
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors p-1"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
