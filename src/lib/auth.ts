import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// البيانات الثابتة للاختبار
const testUsers = [
  {
    id: "admin-1",
    userName: "المدير الأول",
    userEmail: "admin@shamokh.edu",
    password: "admin123",
    userRole: "ADMIN"
  },
  {
    id: "manager-1",
    userName: "المدير الأكاديمي",
    userEmail: "manager1@shamokh.edu",
    password: "manager123",
    userRole: "MANAGER"
  },
  {
    id: "teacher-1",
    userName: "المعلمة سارة",
    userEmail: "teacher1@shamokh.edu",
    password: "teacher123",
    userRole: "TEACHER"
  },
  {
    id: "student-1",
    userName: "الطالبة فاطمة",
    userEmail: "student1@shamokh.edu",
    password: "student123",
    userRole: "STUDENT"
  }
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        userEmail: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.userEmail || !credentials?.password) {
          return null;
        }

        // البحث عن المستخدم في البيانات الثابتة
        const user = testUsers.find(
          (u) => u.userEmail === credentials.userEmail && u.password === credentials.password
        );

        if (user) {
          return {
            id: user.id,
            name: user.userName,
            email: user.userEmail,
            role: user.userRole,
            userRole: user.userRole, // alias for consistency
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.userRole = token.role as string; // alias for consistency
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "shamokh-v3-development-secret",
};