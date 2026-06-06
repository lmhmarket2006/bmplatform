import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { enrollSchema } from "@/lib/validations/course";
import { createNotificationForMany } from "@/lib/notifications";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = enrollSchema.parse(body);

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { id: true, title: true, isPublished: true },
    });
    if (!course || !course.isPublished) {
      return NextResponse.json({ error: "الدورة غير متاحة" }, { status: 404 });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: user.id, courseId: course.id },
      },
    });

    if (existing && existing.status !== "CANCELLED") {
      return NextResponse.json(
        { error: "لديك طلب أو تسجيل سابق في هذه الدورة" },
        { status: 409 }
      );
    }

    const enrollment = existing
      ? await prisma.enrollment.update({
          where: { id: existing.id },
          data: {
            status: "PENDING",
            receiptImage: data.receiptImage || null,
            studentNote: data.studentNote || null,
          },
        })
      : await prisma.enrollment.create({
          data: {
            studentId: user.id,
            courseId: course.id,
            status: "PENDING",
            receiptImage: data.receiptImage || null,
            studentNote: data.studentNote || null,
          },
        });

    // إشعار كل الأدمن بطلب جديد
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true },
    });
    await createNotificationForMany(
      admins.map((a) => a.id),
      {
        title: "طلب تسجيل جديد",
        message: `طلب الطالب ${user.name} التسجيل في دورة "${course.title}".`,
        type: "ENROLLMENT_REQUEST",
        link: "/admin/enrollments?status=PENDING",
        email: true,
      }
    );

    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
