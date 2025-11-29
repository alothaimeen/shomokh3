'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import ProgressBar from './components/ProgressBar';
import FeatureCard from './components/FeatureCard';
import CurrentWorkSection from './components/CurrentWorkSection';
import UpcomingFeatures from './components/UpcomingFeatures';
import DemoBanner from './components/DemoBanner';
import progressData from '@/data/progress.json';

// Demo credentials for auto-login
const DEMO_ACCOUNTS = {
  ADMIN: { email: 'admin@shamokh.edu', password: 'admin123' },
  TEACHER: { email: 'teacher1@shamokh.edu', password: 'teacher123' },
  STUDENT: { email: 'student1@shamokh.edu', password: 'student123' },
};

export default function ProgressPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  const [demoRole, setDemoRole] = useState<string>('');

  // Handle feature click with auto-login
  const handleFeatureClick = async (link: string, requiredRole: string | null) => {
    // If no login required, just navigate
    if (!requiredRole || link === '/login') {
      router.push(link);
      return;
    }

    // If already logged in as ADMIN, can access everything
    if (session?.user?.role === 'ADMIN') {
      router.push(link);
      return;
    }

    // If already logged in with correct role, navigate
    if (session?.user?.role === requiredRole) {
      router.push(link);
      return;
    }

    // Need to login with different account
    setIsAutoLogging(true);
    try {
      // First, sign out if already logged in with different role
      if (session) {
        await signOut({ redirect: false });
      }

      const account = DEMO_ACCOUNTS[requiredRole as keyof typeof DEMO_ACCOUNTS] || DEMO_ACCOUNTS.ADMIN;
      
      const result = await signIn('credentials', {
        redirect: false,
        email: account.email,
        password: account.password,
      });

      if (result?.ok) {
        setDemoRole(requiredRole);
        setShowDemoBanner(true);
        // Delay to allow session to update
        setTimeout(() => {
          router.push(link);
          router.refresh();
        }, 1000);
      } else {
        console.error('Auto-login failed:', result?.error);
        // Redirect to login with callbackUrl
        router.push(`/login?callbackUrl=${encodeURIComponent(link)}`);
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      router.push(`/login?callbackUrl=${encodeURIComponent(link)}`);
    } finally {
      setIsAutoLogging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/30 via-blue-50/20 to-white">
      {/* Demo Banner */}
      {showDemoBanner && (
        <DemoBanner role={demoRole} onClose={() => setShowDemoBanner(false)} />
      )}

      {/* Header */}
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">ش</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">منصة شموخ</h1>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/why-change"
              className="px-4 py-2 text-primary-purple hover:text-primary-blue transition-colors"
            >
              لماذا نغير؟
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            منصة شموخ الجديدة - رحلة التطوير
          </h1>
          <p className="text-xl text-gray-600">
            مشروع التحديث الكامل لمنصة التحفيظ
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar 
          percentage={progressData.currentProgress.percentage}
          completed={progressData.currentProgress.completed}
          total={progressData.currentProgress.total}
        />

        {/* Loading Overlay */}
        {isAutoLogging && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 text-center">
              <div className="w-12 h-12 border-4 border-primary-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-700">جاري تسجيل الدخول للعرض التجريبي...</p>
            </div>
          </div>
        )}

        {/* Completed Features Section */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">✅</span>
            <h2 className="text-2xl font-bold text-gray-900">ما تم إنجازه</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {progressData.completedFeatures.map((category) => (
              <FeatureCard
                key={category.id}
                category={category.category}
                icon={category.icon}
                features={category.features}
                onFeatureClick={handleFeatureClick}
              />
            ))}
          </div>
        </section>

        {/* Current Work Section */}
        <CurrentWorkSection items={progressData.currentWork} />

        {/* Upcoming Features Section */}
        <UpcomingFeatures features={progressData.upcomingFeatures} />

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-purple to-primary-blue rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">
            هل تريد معرفة المزيد؟
          </h2>
          <p className="text-white/90 mb-6">
            تعرف على الأسباب التي دفعتنا لتطوير منصة جديدة
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/why-change"
              className="px-6 py-3 bg-white text-primary-purple font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              💡 لماذا نغير المنصة؟
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/30"
            >
              🔐 تسجيل الدخول
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold">ش</span>
            </div>
            <span className="text-lg font-semibold">منصة شموخ لتعليم القرآن الكريم</span>
          </div>
          <p className="text-gray-400 mb-4">
            مفتوحة المصدر - مجانية لجميع الجمعيات الإسلامية
          </p>
          <div className="flex justify-center space-x-6 space-x-reverse">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              الرئيسية
            </Link>
            <Link href="/why-change" className="text-gray-400 hover:text-white transition-colors">
              لماذا نغير؟
            </Link>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
              تسجيل الدخول
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-800 text-gray-500">
            <p>&copy; 2025 جمعية شموخ التعليمية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
