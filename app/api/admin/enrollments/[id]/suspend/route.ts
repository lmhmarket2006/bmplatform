import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole("ADMIN");
    const enrollment = await prisma.enrollment.update({
      where: { id: params.id },
      data: { status: "SUSPENDED" },
    });
    return NextResponse.json({ enrollment });
  } catch (error) {
    return handleApiError(error);
  }
}
