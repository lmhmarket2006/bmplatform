import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const roleHome: Record<string, string> = {
  ADMIN: "/admin",
  INSTRUCTOR: "/instructor",
  STUDENT: "/student",
};

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;

  const path = nextUrl.pathname;
  const isAdmin = path.startsWith("/admin");
  const isInstructor = path.startsWith("/instructor");
  const isStudent = path.startsWith("/student");
  const isProtected = isAdmin || isInstructor || isStudent;
  const isAuthPage =
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/forgot-password");

  // مستخدم مسجّل يحاول دخول صفحات المصادقة → وجّهه للوحته
  if (isAuthPage && isLoggedIn && role) {
    return NextResponse.redirect(new URL(roleHome[role] ?? "/", nextUrl));
  }

  if (!isProtected) return NextResponse.next();

  // مسار محمي بدون تسجيل دخول → صفحة الدخول
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  // دور خاطئ → وجّهه للوحته الصحيحة
  if (
    (isAdmin && role !== "ADMIN") ||
    (isInstructor && role !== "INSTRUCTOR") ||
    (isStudent && role !== "STUDENT")
  ) {
    return NextResponse.redirect(new URL(roleHome[role!] ?? "/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/instructor/:path*",
    "/student/:path*",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
