import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-blue-900 mb-4">
          منصة شموخ التعليمية v3
        </h1>
        <p className="text-gray-600 mb-8">
          منصة بسيطة لتعليم القرآن الكريم
        </p>

        <div className="space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            تسجيل الدخول
          </Link>

          <Link
            href="/dashboard"
            className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            لوحة التحكم
          </Link>

          <Link
            href="/profile"
            className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            الملف الشخصي
          </Link>
        </div>
      </div>
    </div>
  );
}