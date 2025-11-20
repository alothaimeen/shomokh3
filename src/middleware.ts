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
      ADMIN: ['/dashboard', '/users', '/programs', '/students', '/attendance', '/attendance-report', '/student-attendance', '/academic-reports', '/reports', '/enrolled-students', '/teacher-requests', '/enrollment', '/my-attendance', '/my-grades', '/daily-tasks', '/daily-grades', '/weekly-grades', '/monthly-grades', '/final-exam', '/behavior-grades', '/behavior-points', '/unified-assessment', '/settings', '/profile'], // يمكنه الوصول لكل شيء
      TEACHER: ['/dashboard', '/teacher', '/programs', '/students', '/attendance', '/attendance-report', '/student-attendance', '/academic-reports', '/teacher-requests', '/enrolled-students', '/daily-grades', '/weekly-grades', '/monthly-grades', '/final-exam', '/behavior-grades', '/behavior-points', '/unified-assessment', '/settings', '/profile'], // يمكنه إدارة حلقاته وطالباته
      STUDENT: ['/dashboard', '/enrollment', '/programs', '/my-attendance', '/my-grades', '/daily-tasks', '/unified-assessment', '/settings', '/profile'], // يمكنه طلب الانضمام ومشاهدة حضوره ودرجاته ومهامه
    };

    // التحقق من الصلاحية
    const allowedPaths = rolePermissions[userRole as keyof typeof rolePermissions] || [];

    // التحقق إذا كان المسار مسموح للدور الحالي
    const hasAccess = allowedPaths.some(allowedPath =>
      path.startsWith(allowedPath) || path === '/' || path === '/api/auth' || path.startsWith('/api/attendance') || path.startsWith('/api/enrollment') || path.startsWith('/api/grades') || path.startsWith('/api/tasks') || path.startsWith('/api/points') || path.startsWith('/api/dashboard') || path.startsWith('/api/programs') || path.startsWith('/api/students') || path.startsWith('/api/users') || path.startsWith('/api/courses')
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
    // حماية جميع المسارات عدا الصفحة الرئيسية، تسجيل الدخول، التسجيل، صفحات "عن الجمعية"، والملفات الثابتة
    '/((?!api/auth|api/students/register|_next/static|_next/image|favicon.ico|login|register|about|$).*)',
  ],
};