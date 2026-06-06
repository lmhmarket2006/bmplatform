import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { assertCourseOwner } from "@/lib/course-helpers";

const schema = z.object({ isPublished: z.boolean() });

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await assertCourseOwner(params.id, user.id);
    const { isPublished } = schema.parse(await req.json());

    // لا تنشر دورة بلا دروس
    if (isPublished) {
      const lessons = await prisma.lesson.count({
        where: { section: { courseId: params.id } },
      });
      if (lessons === 0) {
        return NextResponse.json(
          { error: "أضف درساً واحداً على الأقل قبل النشر" },
          { status: 400 }
        );
      }
    }

    const course = await prisma.course.update({
      where: { id: params.id },
      data: { isPublished },
      select: { id: true, isPublished: true },
    });
    return NextResponse.json({ course });
  } catch (error) {
    return handleApiError(error);
  }
}
