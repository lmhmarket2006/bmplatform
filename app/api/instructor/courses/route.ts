import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { courseSchema } from "@/lib/validations/course";
import { generateUniqueSlug } from "@/lib/course-helpers";

export async function POST(req: Request) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    const body = await req.json();
    const data = courseSchema.parse(body);

    const slug = await generateUniqueSlug(data.title);

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        categoryId: data.categoryId,
        level: data.level,
        price: data.price,
        currency: data.currency || "SAR",
        language: data.language || "ar",
        thumbnail: data.thumbnail || null,
        previewVideo: data.previewVideo || null,
        instructorId: user.id,
      },
      select: { id: true },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
