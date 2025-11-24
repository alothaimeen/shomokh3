import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      
      if (path === '/' || path === '/login') return true;
      if (!token) return false;
      
      if (path.startsWith('/teacher') || path.startsWith('/attendance') || path.startsWith('/enrolled-students')) {
        return token.role === 'TEACHER' || token.role === 'ADMIN';
      }
      
      if (path.startsWith('/student') || path.startsWith('/enrollment') || path.startsWith('/my-attendance') || path.startsWith('/my-grades') || path.startsWith('/daily-tasks')) {
        return token.role === 'STUDENT';
      }
      
      if (path.startsWith('/programs') || path.startsWith('/users') || path.startsWith('/students') || path.startsWith('/teacher-requests') || path.startsWith('/academic-reports')) {
        return token.role === 'ADMIN';
      }
      
      if (path.startsWith('/daily-grades') || path.startsWith('/weekly-grades') || path.startsWith('/monthly-grades') || path.startsWith('/behavior-points') || path.startsWith('/behavior-grades') || path.startsWith('/final-exam') || path.startsWith('/unified-assessment')) {
        return token.role === 'TEACHER' || token.role === 'ADMIN';
      }
      
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};