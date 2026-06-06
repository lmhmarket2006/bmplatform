import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { activateEnrollmentSchema } from "@/lib/validations/course";
import { createNotification } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("ADMIN");
    const body = await req.json().catch(() => ({}));
    const data = activateEnrollmentSchema.parse(body);

    const enrollment = await prisma.enrollment.update({
      where: { id: params.id },
      data: {
        status: "ACTIVE",
        enrolledAt: new Date(),
        paidAmount: data.paidAmount,
        paymentMethod: data.paymentMethod || null,
        notes: data.notes || null,
      },
      include: { course: { select: { title: true, id: true } } },
    });

    await createNotification({
      userId: enrollment.studentId,
      title: "تم تفعيل دورتك 🎉",
      message: `تم تفعيل وصولك لدورة "${enrollment.course.title}". يمكنك البدء بالتعلّم الآن.`,
      type: "ENROLLMENT_APPROVED",
      link: `/student/courses/${enrollment.course.id}`,
    });

    return NextResponse.json({ enrollment });
  } catch (error) {
    return handleApiError(error);
  }
}
