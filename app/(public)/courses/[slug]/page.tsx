import { notFound } from "next/navigation";
import {
  Clock,
  BarChart3,
  PlayCircle,
  Lock,
  BookOpen,
  Globe,
  Users,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EnrollPanel } from "@/components/courses/enroll-panel";
import { levelLabels } from "@/lib/constants";
import {
  formatCurrency,
  formatDuration,
  formatSeconds,
  getInitials,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getCourse(slug: string) {
  try {
    return await prisma.course.findFirst({
      where: { slug, isPublished: true },
      include: {
        instructor: { select: { name: true, bio: true } },
        category: { select: { name: true } },
        sections: {
          orderBy: { order: "asc" },
          include: { lessons: { orderBy: { order: "asc" } } },
        },
        _count: { select: { enrollments: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const course = await getCourse(params.slug);
  if (!course) notFound();

  const session = await auth();
  let enrollmentStatus = null;
  if (session?.user?.id) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: session.user.id,
          courseId: course.id,
        },
      },
      select: { status: true },
    });
    enrollmentStatus = enrollment?.status ?? null;
  }

  const totalLessons = course.sections.reduce(
    (sum, s) => sum + s.lessons.length,
    0
  );

  return (
    <div className="bg-surface/30">
      {/* رأس الصفحة */}
      <div className="border-b border-border bg-surface">
        <div className="container grid gap-10 py-12 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{course.category.name}</Badge>
              <Badge variant="secondary">{levelLabels[course.level]}</Badge>
            </div>
            <h1 className="text-3xl font-extrabold md:text-4xl">
              {course.title}
            </h1>
            <p className="max-w-2xl text-muted-foreground">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> {totalLessons} درس
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> {formatDuration(course.duration)}
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" /> {levelLabels[course.level]}
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />{" "}
                {course.language === "ar" ? "العربية" : course.language}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {course._count.enrollments} طالب
              </span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Avatar>
                <AvatarFallback>
                  {getInitials(course.instructor.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">المدرّب</p>
                <p className="font-semibold">{course.instructor.name}</p>
              </div>
            </div>
          </div>

          {/* بطاقة الاشتراك */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-video bg-brand-gradient-soft">
                {course.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <PlayCircle className="h-14 w-14 text-primary-light/50" />
                  </div>
                )}
              </div>
              <div className="space-y-4 p-6">
                <div className="text-center">
                  <span className="text-3xl font-extrabold text-gradient">
                    {course.price === 0
                      ? "مجاني"
                      : formatCurrency(course.price, course.currency)}
                  </span>
                </div>
                <EnrollPanel
                  courseId={course.id}
                  price={course.price}
                  currency={course.currency}
                  isLoggedIn={!!session?.user}
                  enrollmentStatus={enrollmentStatus}
                />
                <ul className="space-y-2 pt-2 text-sm text-muted-foreground">
                  {[
                    "وصول كامل لمحتوى الدورة",
                    "شهادة إتمام معتمدة",
                    "متابعة من المدرّب",
                    "وصول مدى الحياة",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* المنهج */}
      <div className="container py-12">
        <div className="max-w-3xl">
          <h2 className="mb-6 text-2xl font-extrabold">محتوى الدورة</h2>
          {course.sections.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              لم يتم إضافة محتوى بعد.
            </p>
          ) : (
            <div className="space-y-4">
              {course.sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  <div className="flex items-center justify-between bg-surface px-5 py-4">
                    <h3 className="font-bold">
                      {idx + 1}. {section.title}
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {section.lessons.length} دروس
                    </span>
                  </div>
                  <ul className="divide-y divide-border">
                    {section.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between px-5 py-3 text-sm"
                      >
                        <span className="flex items-center gap-3">
                          {lesson.isFree ? (
                            <PlayCircle className="h-4 w-4 text-primary-light" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                          {lesson.title}
                          {lesson.isFree && (
                            <Badge variant="success">معاينة مجانية</Badge>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatSeconds(lesson.duration)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
