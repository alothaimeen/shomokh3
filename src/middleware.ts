import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // إذا لم يكن هناك token، السماح للـ NextAuth بالتعامل
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const userRole = token.role as string;

    // قواعد الوصول حسب الدور
    const rolePermissions = {
      ADMIN: ['/dashboard', '/admin', '/manager', '/teacher', '/student', '/programs', '/students', '/attendance', '/attendance-report', '/my-attendance'], // يمكنه الوصول لكل شيء
      MANAGER: ['/dashboard', '/manager', '/teacher', '/programs', '/students', '/attendance', '/attendance-report'], // لا يمكنه الوصول للـ admin
      TEACHER: ['/dashboard', '/teacher', '/programs', '/students', '/attendance'], // يمكنه الوصول للداشبورد والمعلمات والبرامج والطالبات والحضور
      STUDENT: ['/dashboard', '/student', '/profile', '/programs', '/my-attendance'], // يمكنه الوصول لسجل حضوره
    };

    // التحقق من الصلاحية
    const allowedPaths = rolePermissions[userRole as keyof typeof rolePermissions] || [];

    // التحقق إذا كان المسار مسموح للدور الحالي
    const hasAccess = allowedPaths.some(allowedPath =>
      path.startsWith(allowedPath) || path === '/' || path === '/api/auth'
    );

    if (!hasAccess) {
      // إعادة توجيه للداشبورد المناسب
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // حماية جميع المسارات عدا الصفحة الرئيسية، تسجيل الدخول، والملفات الثابتة
    '/((?!api/auth|_next/static|_next/image|favicon.ico|login|$).*)',
  ],
};