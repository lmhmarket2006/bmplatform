import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { assertSectionOwner } from "@/lib/course-helpers";

const schema = z.object({ orderedIds: z.array(z.string()).min(1) });

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireRole("INSTRUCTOR", "ADMIN");
    await assertSectionOwner(params.id, user.id);
    const { orderedIds } = schema.parse(await req.json());

    const lessons = await prisma.lesson.findMany({
      where: { sectionId: params.id },
      select: { id: true },
    });
    const valid = new Set(lessons.map((l) => l.id));
    if (!orderedIds.every((id) => valid.has(id))) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.lesson.update({ where: { id }, data: { order: index } })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
