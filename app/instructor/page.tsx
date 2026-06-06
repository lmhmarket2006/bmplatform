import { redirect } from "next/navigation";
import { BookOpen, Users, PlayCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const dynamic = "force-dynamic";

export default async function InstructorDashboard() {
  let user;
  try {
    user = await requireRole("INSTRUCTOR", "ADMIN");
  } catch {
    redirect("/login?callbackUrl=/instructor");
  }

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    include: {
      _count: {
        select: {
          enrollments: { where: { status: { in: ["ACTIVE", "COMPLETED"] } } },
        },
      },
      sections: { include: { _count: { select: { lessons: true } } } },
    },
  });

  const totalStudents = courses.reduce(
    (s, c) => s + c._count.enrollments,
    0
  );
  const totalLessons = courses.reduce(
    (s, c) => s + c.sections.reduce((a, sec) => a + sec._count.lessons, 0),
    0
  );

  return (
    <div>
      <PageHeader
        title={`أهلاً، ${user.name}`}
        description="نظرة عامة على دوراتك وطلابك"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatsCard label="دوراتي" value={courses.length} icon={BookOpen} />
        <StatsCard label="إجمالي طلابي" value={totalStudents} icon={Users} accent="accent" />
        <StatsCard label="الدروس المنشورة" value={totalLessons} icon={PlayCircle} accent="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>دوراتي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courses.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              لم تنشئ أي دورة بعد.
            </p>
          ) : (
            courses.map((c) => {
              const lessons = c.sections.reduce(
                (a, s) => a + s._count.lessons,
                0
              );
              return (
                <div key={c.id} className="rounded-lg border border-border p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-semibold">{c.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {c._count.enrollments} طالب · {lessons} درس
                    </span>
                  </div>
                  <Progress
                    value={c.isPublished ? 100 : 40}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.isPublished ? "منشورة" : "مسودّة (غير منشورة)"}
                  </p>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
