import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";

const patchSchema = z.object({ isActive: z.boolean() });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("ADMIN");
    const body = await req.json();
    const { isActive } = patchSchema.parse(body);
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive },
      select: { id: true, isActive: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole("ADMIN");
    if (admin.id === params.id) {
      return NextResponse.json(
        { error: "لا يمكنك حذف حسابك الخاص" },
        { status: 400 }
      );
    }
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
