import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/api-utils";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendEmail, emailButton } from "@/lib/email";

export const dynamic = "force-dynamic";

const TOKEN_TTL_MINUTES = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);
    const normalized = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true, name: true, email: true },
    });

    // لا نكشف وجود البريد من عدمه — نرجّع نجاحاً دائماً
    if (user) {
      // أبطل الرموز السابقة لنفس البريد
      await prisma.passwordResetToken.deleteMany({
        where: { email: normalized },
      });

      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: { email: normalized, token, expiresAt },
      });

      const base =
        process.env.AUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
      const link = `${base}/reset-password?token=${token}`;

      await sendEmail({
        to: user.email,
        subject: "إعادة تعيين كلمة المرور — بيت المصوّر",
        html: `
          <p>مرحباً ${user.name}،</p>
          <p>تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك. اضغط الزر التالي لتعيين كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة.</p>
          ${emailButton("إعادة تعيين كلمة المرور", link)}
          <p style="margin-top:16px;font-size:12px;color:#A0A0C0">إن لم تطلب ذلك، تجاهل هذه الرسالة.</p>
        `,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
