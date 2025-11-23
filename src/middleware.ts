import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const path = req.nextUrl.pathname;
      
      if (path === '/' || path === '/login') return true;
      if (!token) return false;
      
      if (path.startsWith('/teacher') || path.startsWith('/attendance') || path.startsWith('/enrolled-students') || path.startsWith('/teacher-requests')) {
        return token.role === 'TEACHER' || token.role === 'ADMIN';
      }
      
      if (path.startsWith('/student') || path.startsWith('/enrollment') || path.startsWith('/my-attendance') || path.startsWith('/my-grades') || path.startsWith('/daily-tasks')) {
        return token.role === 'STUDENT';
      }
      
      if (path.startsWith('/programs') || path.startsWith('/users')) {
        return token.role === 'ADMIN';
      }
      
      return true;
    },
  },
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};