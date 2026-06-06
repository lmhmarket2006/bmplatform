import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { sectionSchema } from "@/lib/validations/course";
import { assertCourseOwner } from "@/lib/course-helpers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await assertCourseOwner(params.id, user.id);
    const body = await req.json();
    const data = sectionSchema.parse(body);

    const count = await prisma.section.count({
      where: { courseId: params.id },
    });

    const section = await prisma.section.create({
      data: {
        title: data.title,
        order: data.order ?? count,
        courseId: params.id,
      },
    });

    return NextResponse.json({ section }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
