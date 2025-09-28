import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

// البيانات الثابتة للاختبار (احتياطية)
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

        try {
          // محاولة الاتصال بقاعدة البيانات Supabase أولاً
          if (process.env.DATABASE_URL) {
            console.log('🔍 Searching for user in Supabase:', credentials.userEmail);

            const user = await prisma.user.findUnique({
              where: {
                userEmail: credentials.userEmail.toLowerCase(),
                isActive: true
              }
            });

            if (user) {
              console.log('✅ User found in database:', user.userEmail);

              // التحقق من كلمة المرور المشفرة
              const isPasswordValid = await bcrypt.compare(credentials.password, user.passwordHash);

              if (isPasswordValid) {
                console.log('✅ Password verified for user:', user.userEmail);
                return {
                  id: user.id,
                  name: user.userName,
                  email: user.userEmail,
                  role: user.userRole,
                  userRole: user.userRole,
                };
              } else {
                console.log('❌ Invalid password for user:', user.userEmail);
              }
            } else {
              console.log('❌ User not found in database:', credentials.userEmail);
            }
          }
        } catch (error) {
          console.error('🚨 Database error during login:', error);
          // في حالة فشل قاعدة البيانات، استخدم البيانات الاحتياطية
        }

        // البحث في البيانات الثابتة كـ fallback
        console.log('🔄 Falling back to test users for:', credentials.userEmail);
        const testUser = testUsers.find(
          (u) => u.userEmail === credentials.userEmail && u.password === credentials.password
        );

        if (testUser) {
          console.log('✅ Test user found:', testUser.userEmail);
          return {
            id: testUser.id,
            name: testUser.userName,
            email: testUser.userEmail,
            role: testUser.userRole,
            userRole: testUser.userRole,
          };
        }

        console.log('❌ Authentication failed for:', credentials.userEmail);
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