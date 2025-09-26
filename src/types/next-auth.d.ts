import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      userRole: string; // adding alias for consistency
    };
  }

  interface User {
    role: string;
    userRole: string; // adding alias for consistency
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
  }
}