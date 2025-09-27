import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // إذا لم يكن هناك token
    if (!token) {
      // للـ API requests، نرجع JSON error بدلاً من redirect
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'غير مصادق عليه' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const userRole = token.role as string;

    // قواعد الوصول حسب الدور
    const rolePermissions = {
      ADMIN: ['/dashboard', '/users', '/programs', '/students', '/attendance', '/attendance-report', '/academic-reports', '/reports', '/enrolled-students', '/teacher-requests', '/enrollment', '/my-attendance', '/my-grades', '/daily-tasks', '/profile'], // يمكنه الوصول لكل شيء
      MANAGER: ['/dashboard', '/programs', '/students', '/attendance', '/attendance-report', '/academic-reports', '/enrolled-students', '/teacher-requests', '/profile'], // لا يمكنه الوصول لإدارة المستخدمين
      TEACHER: ['/dashboard', '/programs', '/students', '/attendance', '/teacher-requests', '/enrolled-students', '/profile'], // يمكنه إدارة حلقاته وطالباته
      STUDENT: ['/dashboard', '/enrollment', '/programs', '/my-attendance', '/my-grades', '/daily-tasks', '/profile'], // يمكنه طلب الانضمام ومشاهدة حضوره ودرجاته ومهامه
    };

    // التحقق من الصلاحية
    const allowedPaths = rolePermissions[userRole as keyof typeof rolePermissions] || [];

    // التحقق إذا كان المسار مسموح للدور الحالي
    const hasAccess = allowedPaths.some(allowedPath =>
      path.startsWith(allowedPath) || path === '/' || path === '/api/auth' || path.startsWith('/api/attendance') || path.startsWith('/api/enrollment') || path.startsWith('/api/grades') || path.startsWith('/api/tasks')
    );

    if (!hasAccess) {
      // للـ API requests، نرجع JSON error بدلاً من redirect
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'غير مصرح لك بالوصول' },
          { status: 403 }
        );
      }
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