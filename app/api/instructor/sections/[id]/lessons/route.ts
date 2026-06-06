import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { lessonSchema } from "@/lib/validations/course";
import {
  assertSectionOwner,
  recalcCourseDuration,
} from "@/lib/course-helpers";
import { createNotificationForMany } from "@/lib/notifications";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const section = await assertSectionOwner(params.id, user.id);
    const body = await req.json();
    const data = lessonSchema.parse(body);

    const count = await prisma.lesson.count({
      where: { sectionId: params.id },
    });

    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description || null,
        videoUrl: data.videoUrl || null,
        duration: data.duration ?? null,
        isFree: data.isFree ?? false,
        order: data.order ?? count,
        sectionId: params.id,
      },
    });

    await recalcCourseDuration(section.courseId);

    // إشعار الطلاب المسجّلين بدرس جديد
    const enrolled = await prisma.enrollment.findMany({
      where: { courseId: section.courseId, status: "ACTIVE" },
      select: { studentId: true },
    });
    await createNotificationForMany(
      enrolled.map((e) => e.studentId),
      {
        title: "درس جديد متاح",
        message: `تمت إضافة درس "${data.title}" إلى إحدى دوراتك.`,
        type: "NEW_LESSON",
        link: `/student/courses/${section.courseId}`,
        email: true,
      }
    );

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
