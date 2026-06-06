import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { courseSchema } from "@/lib/validations/course";
import { assertCourseOwner } from "@/lib/course-helpers";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await assertCourseOwner(params.id, user.id);
    const body = await req.json();
    const data = courseSchema.partial().parse(body);

    const course = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined
          ? { description: data.description }
          : {}),
        ...(data.categoryId !== undefined
          ? { categoryId: data.categoryId }
          : {}),
        ...(data.level !== undefined ? { level: data.level } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.thumbnail !== undefined
          ? { thumbnail: data.thumbnail || null }
          : {}),
        ...(data.previewVideo !== undefined
          ? { previewVideo: data.previewVideo || null }
          : {}),
      },
      select: { id: true },
    });

    return NextResponse.json({ course });
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
    await assertCourseOwner(params.id, user.id);
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
