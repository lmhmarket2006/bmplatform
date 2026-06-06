import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, PlayCircle, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getStudentCourses } from "@/lib/student-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { enrollmentStatusLabels } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function StudentCoursesPage() {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login?callbackUrl=/student/courses");
  }

  const [courses, pending] = await Promise.all([
    getStudentCourses(user.id),
    prisma.enrollment.findMany({
      where: { studentId: user.id, status: { in: ["PENDING", "SUSPENDED"] } },
      include: { course: { select: { title: true, slug: true } } },
    }),
  ]);

  return (
    <div>
      <PageHeader title="دوراتي" description="جميع دوراتك المسجّلة" />

      {/* طلبات قيد الانتظار */}
      {pending.length > 0 && (
        <div className="mb-6 space-y-2">
          {pending.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
            >
              <span className="flex items-center gap-2 text-amber-400">
                <Clock className="h-4 w-4" />
                {p.course.title}
              </span>
              <Badge variant="warning">
                {enrollmentStatusLabels[p.status]}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا توجد دورات مفعّلة"
          description="تصفّح الدورات وسجّل فيها لتبدأ التعلّم."
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
              </div>
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
                <Button asChild variant="gradient" size="sm" className="mt-3 w-full">
                  <Link href={`/student/courses/${c.course.id}`}>
                    عرض الدورة
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
