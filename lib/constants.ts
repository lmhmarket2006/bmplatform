import type { EnrollmentStatus, Level, Role } from "@prisma/client";

export const roleLabels: Record<Role, string> = {
  ADMIN: "مدير",
  INSTRUCTOR: "مدرّب",
  STUDENT: "طالب",
};

export const levelLabels: Record<Level, string> = {
  BEGINNER: "مبتدئ",
  INTERMEDIATE: "متوسط",
  ADVANCED: "متقدّم",
};

export const enrollmentStatusLabels: Record<EnrollmentStatus, string> = {
  PENDING: "في انتظار التفعيل",
  ACTIVE: "مفعّل",
  COMPLETED: "مكتمل",
  SUSPENDED: "موقوف",
  CANCELLED: "ملغي",
};

export const enrollmentStatusVariant: Record<
  EnrollmentStatus,
  "default" | "success" | "warning" | "destructive" | "secondary"
> = {
  PENDING: "warning",
  ACTIVE: "success",
  COMPLETED: "default",
  SUSPENDED: "destructive",
  CANCELLED: "secondary",
};

export const SITE = {
  name: "بيت المصوّر",
  tagline: "أكاديمية تعليم التصوير الفوتوغرافي والفيديو",
  description:
    "تعلّم التصوير الفوتوغرافي والفيديو والإضاءة والمونتاج على يد نخبة من المحترفين.",
};
