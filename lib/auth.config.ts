import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * إعداد آمن للـ Edge (يُستخدم في middleware) — بدون Prisma أو bcrypt.
 * مزوّد الاعتماد الحقيقي يُضاف في lib/auth.ts.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
