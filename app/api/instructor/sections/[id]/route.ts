import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { assertSectionOwner } from "@/lib/course-helpers";

const patchSchema = z.object({ title: z.string().min(2).optional() });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await assertSectionOwner(params.id, user.id);
    const body = await req.json();
    const data = patchSchema.parse(body);
    const section = await prisma.section.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ section });
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
    await assertSectionOwner(params.id, user.id);
    await prisma.section.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
