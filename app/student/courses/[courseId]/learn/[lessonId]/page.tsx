import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, PlayCircle, ArrowRight, Circle } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getEnrollmentAccess } from "@/lib/student-data";
import { LessonPlayer } from "@/components/courses/lesson-player";
import { Progress } from "@/components/ui/progress";
import { cn, formatSeconds } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
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
      sections: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { attachments: true },
          },
        },
      },
    },
  });
  if (!course) notFound();

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const current = allLessons.find((l) => l.id === params.lessonId);
  if (!current) notFound();

  const progress = await prisma.lessonProgress.findMany({
    where: { studentId: user.id, isCompleted: true },
    select: { lessonId: true },
  });
  const doneSet = new Set(progress.map((p) => p.lessonId));

  const total = allLessons.length;
  const done = allLessons.filter((l) => doneSet.has(l.id)).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  const currentIndex = allLessons.findIndex((l) => l.id === current.id);
  const nextLessonId = allLessons[currentIndex + 1]?.id ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* المشغّل */}
      <div className="min-w-0">
        <Link
          href={`/student/courses/${course.id}`}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="h-4 w-4" /> العودة لنظرة عامة
        </Link>
        <LessonPlayer
          lessonId={current.id}
          courseId={course.id}
          title={current.title}
          description={current.description}
          videoUrl={current.videoUrl}
          isCompleted={doneSet.has(current.id)}
          attachments={current.attachments}
          nextLessonId={nextLessonId}
        />
      </div>

      {/* قائمة الدروس */}
      <aside className="lg:sticky lg:top-20 lg:h-fit">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <p className="mb-2 text-sm font-bold">محتوى الدورة</p>
            <Progress value={pct} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {done}/{total} درس مكتمل ({pct}%)
            </p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {course.sections.map((section, idx) => (
              <div key={section.id}>
                <p className="bg-surface px-4 py-2 text-xs font-bold text-muted-foreground">
                  {idx + 1}. {section.title}
                </p>
                <ul>
                  {section.lessons.map((lesson) => {
                    const completed = doneSet.has(lesson.id);
                    const active = lesson.id === current.id;
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`/student/courses/${course.id}/learn/${lesson.id}`}
                          className={cn(
                            "flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors",
                            active
                              ? "bg-brand-gradient-soft font-medium text-foreground"
                              : "text-muted-foreground hover:bg-surface/60"
                          )}
                        >
                          {completed ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                          ) : active ? (
                            <PlayCircle className="h-4 w-4 shrink-0 text-primary-light" />
                          ) : (
                            <Circle className="h-4 w-4 shrink-0 opacity-40" />
                          )}
                          <span className="line-clamp-1 flex-1">
                            {lesson.title}
                          </span>
                          <span className="shrink-0 text-[10px]">
                            {formatSeconds(lesson.duration)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
