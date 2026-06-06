import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { lessonSchema } from "@/lib/validations/course";
import {
  assertLessonOwner,
  recalcCourseDuration,
} from "@/lib/course-helpers";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const lesson = await assertLessonOwner(params.id, user.id);
    const body = await req.json();
    const data = lessonSchema.partial().parse(body);

    const updated = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description || null }
          : {}),
        ...(data.videoUrl !== undefined
          ? { videoUrl: data.videoUrl || null }
          : {}),
        ...(data.duration !== undefined ? { duration: data.duration } : {}),
        ...(data.isFree !== undefined ? { isFree: data.isFree } : {}),
      },
    });

    await recalcCourseDuration(lesson.section.course.id);

    return NextResponse.json({ lesson: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const lesson = await assertLessonOwner(params.id, user.id);
    await prisma.lesson.delete({ where: { id: params.id } });
    await recalcCourseDuration(lesson.section.course.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
