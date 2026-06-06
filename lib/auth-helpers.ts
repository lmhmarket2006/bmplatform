import { auth } from "./auth";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

/** يعيد جلسة المستخدم الحالي (أو null). */
export async function getSession() {
  return auth();
}

/** يعيد المستخدم الكامل من قاعدة البيانات أو null. */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

/** يتحقق من تسجيل الدخول ويعيد المستخدم في الجلسة، أو يرمي خطأ. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("غير مصرّح: يجب تسجيل الدخول", 401);
  }
  return session.user;
}

/** يتحقق من امتلاك المستخدم لأحد الأدوار المطلوبة. */
export async function requireRole(...roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new AuthError("غير مصرّح: صلاحيات غير كافية", 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 403) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
