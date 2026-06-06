import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";

const createUserSchema = z.object({
  name: z.string().min(3, "الاسم قصير جداً"),
  email: z.string().email("بريد غير صالح"),
  phone: z.string().optional().or(z.literal("")),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]),
});

export async function POST(req: Request) {
  try {
    await requireRole("ADMIN");
    const body = await req.json();
    const data = createUserSchema.parse(body);

    const email = data.email.toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "البريد مسجّل مسبقاً" },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        phone: data.phone || null,
        password: hashed,
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
