import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";

const profileSchema = z.object({
  name: z.string().min(3, "الاسم قصير جداً").optional(),
  phone: z.string().optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
  password: z.string().min(6).optional().or(z.literal("")),
});

export async function PATCH(req: Request) {
  try {
    const sessionUser = await requireUser();
    const body = await req.json();
    const data = profileSchema.parse(body);

    const updateData: Record<string, unknown> = {};
    if (data.name) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.bio !== undefined) updateData.bio = data.bio || null;
    if (data.avatar !== undefined) updateData.avatar = data.avatar || null;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.update({
      where: { id: sessionUser.id },
      data: updateData,
      select: { id: true, name: true, phone: true, bio: true, avatar: true },
    });

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
