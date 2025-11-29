import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;

      // Public routes
      if (path === '/' || 
          path === '/login' || 
          path === '/progress' || 
          path === '/why-change' ||
          path.startsWith('/about') ||
          path.startsWith('/register')) return true;

      // No token = unauthorized
      if (!token) {
        console.log(`🛡️ Middleware - No token for path: ${path}`);
        return false;
      }

      // ADMIN-only routes (most restrictive first)
      if (path.startsWith('/programs') ||
          path.startsWith('/users') ||
          path.startsWith('/students') ||
          path.startsWith('/teacher-requests') ||
          path.startsWith('/site-settings') ||
          path.startsWith('/admin')) {
        const isAuthorized = token.role === 'ADMIN';
        console.log(`🛡️ Middleware - Admin-only path: ${path}`, {
          tokenRole: token.role,
          isAuthorized
        });
        return isAuthorized;
      }

      // TEACHER or ADMIN routes
      if (path.startsWith('/teacher') ||
          path.startsWith('/attendance') ||
          path.startsWith('/enrolled-students') ||
          path.startsWith('/daily-grades') ||
          path.startsWith('/weekly-grades') ||
          path.startsWith('/monthly-grades') ||
          path.startsWith('/behavior-points') ||
          path.startsWith('/behavior-grades') ||
          path.startsWith('/final-exam') ||
          path.startsWith('/unified-assessment') ||
          path.startsWith('/academic-reports') ||
          path.startsWith('/attendance-report') ||
          path.startsWith('/behavior-points-report')) {
        return token.role === 'TEACHER' || token.role === 'ADMIN';
      }

      // STUDENT-only routes
      if (path.startsWith('/student') ||
          path.startsWith('/enrollment') ||
          path.startsWith('/my-attendance') ||
          path.startsWith('/my-grades') ||
          path.startsWith('/daily-tasks')) {
        return token.role === 'STUDENT';
      }
      
      // Dashboard and other routes
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};