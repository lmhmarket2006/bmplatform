import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import { resetPasswordSchema } from "@/lib/validations/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "الرابط غير صالح أو منتهي الصلاحية" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email: record.email },
      data: { password: hashed },
    });

    // أبطل كل الرموز لهذا البريد بعد الاستخدام
    await prisma.passwordResetToken.deleteMany({
      where: { email: record.email },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
