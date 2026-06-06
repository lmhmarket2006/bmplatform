import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";

const patchSchema = z.object({
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("ADMIN");
    const body = await req.json();
    const data = patchSchema.parse(body);
    const course = await prisma.course.update({
      where: { id: params.id },
      data,
      select: { id: true, isPublished: true, isFeatured: true },
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
    await requireRole("ADMIN");
    await prisma.course.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
