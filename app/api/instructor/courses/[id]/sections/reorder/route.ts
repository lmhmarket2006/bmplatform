import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { assertCourseOwner } from "@/lib/course-helpers";

const schema = z.object({ orderedIds: z.array(z.string()).min(1) });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await assertCourseOwner(params.id, user.id);
    const { orderedIds } = schema.parse(await req.json());

    // تأكّد أن كل الأقسام تتبع هذه الدورة
    const sections = await prisma.section.findMany({
      where: { courseId: params.id },
      select: { id: true },
    });
    const valid = new Set(sections.map((s) => s.id));
    if (!orderedIds.every((id) => valid.has(id))) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.section.update({ where: { id }, data: { order: index } })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
