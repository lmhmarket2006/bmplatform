import Link from "next/link";
import { Users, BookOpen, ClipboardCheck, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  enrollmentStatusLabels,
  enrollmentStatusVariant,
} from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [students, courses, totalEnrollments, pending, recent] =
    await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: "PENDING" } }),
      prisma.enrollment.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: {
          student: { select: { name: true, email: true } },
          course: { select: { title: true } },
        },
      }),
    ]);

  return (
    <div>
      <PageHeader
        title="لوحة التحكم"
        description="نظرة عامة على أداء المنصة"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="إجمالي الطلاب" value={formatNumber(students)} icon={Users} />
        <StatsCard label="الدورات النشطة" value={formatNumber(courses)} icon={BookOpen} accent="accent" />
        <StatsCard label="إجمالي التسجيلات" value={formatNumber(totalEnrollments)} icon={ClipboardCheck} accent="success" />
        <StatsCard label="في انتظار التفعيل" value={formatNumber(pending)} icon={Clock} accent="warning" />
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>آخر طلبات التسجيل</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/enrollments">عرض الكل</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              لا توجد طلبات بعد
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>الدورة</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <div className="font-medium">{e.student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {e.student.email}
                      </div>
                    </TableCell>
                    <TableCell>{e.course.title}</TableCell>
                    <TableCell>
                      <Badge variant={enrollmentStatusVariant[e.status]}>
                        {enrollmentStatusLabels[e.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
