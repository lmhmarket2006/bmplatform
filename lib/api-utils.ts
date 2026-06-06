import { NextResponse } from "next/server";
import { AuthError } from "./auth-helpers";
import { ZodError } from "zod";

/** غلاف موحّد لمعالجة الأخطاء في مسارات الـ API. */
export function handleApiError(error: unknown) {
  console.error("[API ERROR]", error);

  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "بيانات غير صالحة", issues: error.flatten() },
      { status: 422 }
    );
  }

  return NextResponse.json(
    { error: "حدث خطأ في الخادم، حاول لاحقاً" },
    { status: 500 }
  );
}
