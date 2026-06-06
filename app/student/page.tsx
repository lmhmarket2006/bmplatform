import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Award, PlayCircle, GraduationCap } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getStudentCourses } from "@/lib/student-data";
import { PageHeader } from "@/components/shared/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function StudentDashboard() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login?callbackUrl=/student");
  }

  const [courses, certificates, pending] = await Promise.all([
    getStudentCourses(user.id),
    prisma.certificate.count({ where: { studentId: user.id } }),
    prisma.enrollment.count({
      where: { studentId: user.id, status: "PENDING" },
    }),
  ]);

  const continueCourse = courses.find(
    (c) => c.status === "ACTIVE" && c.progress < 100
  );

  return (
    <div>
      <PageHeader
        title={`أهلاً، ${user.name} 👋`}
        description="تابع رحلتك التعليمية"
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatsCard label="دوراتي" value={courses.length} icon={BookOpen} />
        <StatsCard label="شهاداتي" value={certificates} icon={Award} accent="success" />
        <StatsCard label="بانتظار التفعيل" value={pending} icon={GraduationCap} accent="warning" />
      </div>

      {/* أكمل من حيث توقفت */}
      {continueCourse && (
        <Card className="mb-8 overflow-hidden border-primary/40 bg-brand-gradient-soft">
          <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-primary-light">أكمل من حيث توقفت</p>
              <h3 className="mt-1 text-xl font-bold">
                {continueCourse.course.title}
              </h3>
              <div className="mt-3 flex items-center gap-3">
                <Progress
                  value={continueCourse.progress}
                  className="w-40"
                />
                <span className="text-sm text-muted-foreground">
                  {continueCourse.progress}%
                </span>
              </div>
            </div>
            <Button asChild variant="gradient" size="lg">
              <Link
                href={`/student/courses/${continueCourse.course.id}/learn/${continueCourse.nextLessonId}`}
              >
                <PlayCircle className="h-5 w-5" /> متابعة التعلّم
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <h2 className="mb-4 text-lg font-bold">دوراتي</h2>
      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لم تسجّل في أي دورة بعد"
          description="تصفّح الدورات المتاحة وابدأ رحلتك التعليمية."
          action={
            <Button asChild variant="gradient">
              <Link href="/courses">تصفّح الدورات</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.enrollmentId} className="overflow-hidden">
              <Link href={`/student/courses/${c.course.id}`}>
                <div className="relative aspect-video bg-brand-gradient-soft">
                  {c.course.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.course.thumbnail}
                      alt={c.course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <PlayCircle className="h-10 w-10 text-primary-light/50" />
                    </div>
                  )}
                  {c.status === "COMPLETED" && (
                    <Badge variant="success" className="absolute right-3 top-3">
                      مكتملة
                    </Badge>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <h3 className="line-clamp-1 font-bold">{c.course.title}</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  {c.course.instructorName}
                </p>
                <Progress value={c.progress} />
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {c.completedLessons}/{c.totalLessons} دروس
                  </span>
                  <span>{c.progress}%</span>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                  <Link
                    href={`/student/courses/${c.course.id}/learn/${c.nextLessonId}`}
                  >
                    {c.progress === 0 ? "ابدأ" : "متابعة"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
