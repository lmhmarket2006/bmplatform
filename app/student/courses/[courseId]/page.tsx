import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, PlayCircle, Clock } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getEnrollmentAccess } from "@/lib/student-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatSeconds } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentCourseOverview({
  params,
}: {
  params: { courseId: string };
}) {
  let user;
  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const hasAccess = await getEnrollmentAccess(user.id, params.courseId);
  if (!hasAccess) redirect("/student/courses");

  const course = await prisma.course.findUnique({
    where: { id: params.courseId },
    include: {
      instructor: { select: { name: true } },
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!course) notFound();

  const progress = await prisma.lessonProgress.findMany({
    where: { studentId: user.id, isCompleted: true },
    select: { lessonId: true },
  });
  const doneSet = new Set(progress.map((p) => p.lessonId));

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const total = allLessons.length;
  const done = allLessons.filter((l) => doneSet.has(l.id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const nextLesson =
    allLessons.find((l) => !doneSet.has(l.id)) ?? allLessons[0];

  return (
    <div>
      <PageHeader
        title={course.title}
        description={`المدرّب: ${course.instructor.name}`}
        action={
          nextLesson && (
            <Button asChild variant="gradient">
              <Link
                href={`/student/courses/${course.id}/learn/${nextLesson.id}`}
              >
                <PlayCircle className="h-4 w-4" />
                {pct === 0 ? "ابدأ الدورة" : "متابعة"}
              </Link>
            </Button>
          )
        }
      />

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">تقدّمك في الدورة</span>
            <span className="text-muted-foreground">
              {done}/{total} درس ({pct}%)
            </span>
          </div>
          <Progress value={pct} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {course.sections.map((section, idx) => (
          <Card key={section.id} className="overflow-hidden">
            <div className="border-b border-border bg-surface px-5 py-3">
              <h3 className="font-bold">
                {idx + 1}. {section.title}
              </h3>
            </div>
            <ul className="divide-y divide-border">
              {section.lessons.map((lesson) => {
                const completed = doneSet.has(lesson.id);
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/student/courses/${course.id}/learn/${lesson.id}`}
                      className="flex items-center justify-between px-5 py-3 text-sm transition-colors hover:bg-surface/60"
                    >
                      <span className="flex items-center gap-3">
                        {completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-primary-light" />
                        )}
                        {lesson.title}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatSeconds(lesson.duration)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
