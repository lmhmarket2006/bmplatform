import { Download, TrendingUp, Award } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const topCourses = await prisma.course.findMany({
    take: 8,
    orderBy: { enrollments: { _count: "desc" } },
    include: { _count: { select: { enrollments: true } } },
  });

  const max = Math.max(1, ...topCourses.map((c) => c._count.enrollments));

  const completed = await prisma.enrollment.count({
    where: { status: "COMPLETED" },
  });
  const active = await prisma.enrollment.count({ where: { status: "ACTIVE" } });

  return (
    <div>
      <PageHeader
        title="التقارير"
        description="نظرة تحليلية على أداء المنصة"
        action={
          <Button asChild variant="gradient">
            <a href="/api/admin/reports/export">
              <Download className="h-4 w-4" /> تصدير CSV
            </a>
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <Award className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{completed}</p>
              <p className="text-sm text-muted-foreground">دورات مكتملة</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary-light">
              <TrendingUp className="h-6 w-6" />
            </span>
            <div>
              <p className="text-2xl font-extrabold">{active}</p>
              <p className="text-sm text-muted-foreground">تسجيلات نشطة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أكثر الدورات تسجيلاً</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topCourses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لا توجد بيانات بعد
            </p>
          ) : (
            topCourses.map((c) => (
              <div key={c.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium">{c.title}</span>
                  <span className="text-muted-foreground">
                    {c._count.enrollments} تسجيل
                  </span>
                </div>
                <Progress value={(c._count.enrollments / max) * 100} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
