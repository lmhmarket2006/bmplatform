import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
import type { EnrollmentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import {
  EnrollmentsTable,
  type EnrollmentRow,
} from "@/components/admin/enrollments-table";
import { cn } from "@/lib/utils";
import { enrollmentStatusLabels } from "@/lib/constants";

export const dynamic = "force-dynamic";

const statuses: (EnrollmentStatus | "ALL")[] = [
  "ALL",
  "PENDING",
  "ACTIVE",
  "SUSPENDED",
  "COMPLETED",
  "CANCELLED",
];

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: { status?: string; q?: string };
}) {
  const status = (searchParams.status as EnrollmentStatus) || undefined;
  const q = searchParams.q?.trim();

  const where: Prisma.EnrollmentWhereInput = {
    ...(status ? { status } : {}),
    ...(q
      ? {
          student: {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          },
        }
      : {}),
  };

  const enrollments = await prisma.enrollment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { name: true, email: true, phone: true } },
      course: { select: { title: true, price: true, currency: true } },
    },
  });

  const rows: EnrollmentRow[] = enrollments.map((e) => ({
    id: e.id,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    receiptImage: e.receiptImage,
    studentNote: e.studentNote,
    paidAmount: e.paidAmount,
    student: e.student,
    course: e.course,
  }));

  return (
    <div>
      <PageHeader
        title="طلبات التسجيل"
        description="راجع الطلبات وفعّل وصول الطلاب للدورات يدوياً"
      />

      {/* فلاتر + بحث */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => {
            const href =
              s === "ALL"
                ? "/admin/enrollments"
                : `/admin/enrollments?status=${s}`;
            const activeChip =
              (s === "ALL" && !status) || status === s;
            return (
              <Link
                key={s}
                href={href}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  activeChip
                    ? "border-transparent bg-brand-gradient text-white"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "ALL" ? "الكل" : enrollmentStatusLabels[s]}
              </Link>
            );
          })}
        </div>
        <form action="/admin/enrollments" className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="بحث بالاسم أو الإيميل..."
            className="h-10 w-full rounded-lg border border-border bg-surface px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring sm:w-64"
          />
        </form>
      </div>

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ClipboardCheck}
                title="لا توجد طلبات"
                description="لم يتم العثور على طلبات تسجيل مطابقة."
              />
            </div>
          ) : (
            <EnrollmentsTable rows={rows} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
