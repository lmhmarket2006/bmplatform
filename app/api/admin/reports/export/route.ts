import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { enrollmentStatusLabels } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireRole("ADMIN");
    const enrollments = await prisma.enrollment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true, email: true, phone: true } },
        course: { select: { title: true } },
      },
    });

    const header = [
      "اسم الطالب",
      "البريد",
      "الهاتف",
      "الدورة",
      "الحالة",
      "المبلغ المدفوع",
      "تاريخ الطلب",
    ];

    const rows = enrollments.map((e) =>
      [
        e.student.name,
        e.student.email,
        e.student.phone ?? "",
        e.course.title,
        enrollmentStatusLabels[e.status],
        e.paidAmount ?? "",
        e.createdAt.toISOString().slice(0, 10),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );

    // BOM لدعم العربية في Excel
    const csv = "\uFEFF" + [header.join(","), ...rows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="enrollments-report.csv"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
