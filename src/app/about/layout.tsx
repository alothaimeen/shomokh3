import Link from 'next/link';

export default function PublicPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Public Header */}
      <header className="w-full bg-white shadow-sm py-4">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">ش</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">أكاديمية شموخ</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 space-x-reverse">
            <Link href="/about" className="text-gray-600 hover:text-primary-purple transition-colors">
              عن الجمعية
            </Link>
            <Link href="/about/achievements" className="text-gray-600 hover:text-primary-purple transition-colors">
              إنجازاتنا
            </Link>
            <Link href="/about/contact" className="text-gray-600 hover:text-primary-purple transition-colors">
              تواصل معنا
            </Link>
          </nav>
          <Link
            href="/login"
            className="px-4 py-2 bg-gradient-to-r from-primary-purple to-primary-blue text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            تسجيل الدخول
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-3 space-x-reverse mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-purple to-primary-blue rounded-full flex items-center justify-center">
              <span className="text-white font-bold">ش</span>
            </div>
            <span className="text-lg font-semibold">جمعية شموخ التعليمية</span>
          </div>
          <p className="text-gray-400 mb-4">
            مفتوحة المصدر - مجانية لجميع الجمعيات الإسلامية
          </p>
          <div className="flex justify-center space-x-6 space-x-reverse">
            <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
              عن الجمعية
            </Link>
            <Link href="/about/achievements" className="text-gray-400 hover:text-white transition-colors">
              إنجازاتنا
            </Link>
            <Link href="/about/contact" className="text-gray-400 hover:text-white transition-colors">
              تواصل معنا
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
