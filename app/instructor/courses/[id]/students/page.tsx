import { notFound, redirect } from "next/navigation";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { enrollmentStatusLabels, enrollmentStatusVariant } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function CourseStudentsPage({
  params,
}: {
  params: { id: string };
}) {
  let user;
  try {
    user = await requireRole("INSTRUCTOR", "ADMIN");
  } catch {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      sections: { include: { _count: { select: { lessons: true } } } },
      enrollments: {
        orderBy: { createdAt: "desc" },
        include: { student: { select: { id: true, name: true, email: true } } },
      },
    },
  });

  if (!course) notFound();
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    redirect("/instructor/courses");
  }

  const totalLessons = course.sections.reduce(
    (s, sec) => s + sec._count.lessons,
    0
  );

  // حساب تقدّم كل طالب
  const progressByStudent = await prisma.lessonProgress.groupBy({
    by: ["studentId"],
    where: {
      isCompleted: true,
      lesson: { section: { courseId: course.id } },
    },
    _count: { _all: true },
  });
  const progressMap = new Map(
    progressByStudent.map((p) => [p.studentId, p._count._all])
  );

  return (
    <div>
      <PageHeader
        title="طلاب الدورة"
        description={`${course.title} · ${course.enrollments.length} مسجّل`}
      />

      <Card>
        <CardContent className="p-0">
          {course.enrollments.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="لا يوجد طلاب بعد"
                description="سيظهر الطلاب هنا بعد تسجيلهم في الدورة."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التقدّم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.enrollments.map((e) => {
                  const done = progressMap.get(e.student.id) ?? 0;
                  const pct =
                    totalLessons > 0
                      ? Math.round((done / totalLessons) * 100)
                      : 0;
                  return (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="font-medium">{e.student.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {e.student.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={enrollmentStatusVariant[e.status]}>
                          {enrollmentStatusLabels[e.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-52">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="flex-1" />
                          <span className="text-xs text-muted-foreground">
                            {pct}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
