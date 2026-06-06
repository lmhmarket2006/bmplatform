import { prisma } from "./prisma";

export interface StudentCourseSummary {
  enrollmentId: string;
  status: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail: string | null;
    instructorName: string;
  };
  totalLessons: number;
  completedLessons: number;
  progress: number;
  firstLessonId: string | null;
  nextLessonId: string | null;
}

/** يعيد دورات الطالب المفعّلة/المكتملة مع نسب التقدّم. */
export async function getStudentCourses(
  userId: string
): Promise<StudentCourseSummary[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: userId, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: { updatedAt: "desc" },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          sections: {
            orderBy: { order: "asc" },
            include: { lessons: { orderBy: { order: "asc" } } },
          },
        },
      },
    },
  });

  const completed = await prisma.lessonProgress.findMany({
    where: { studentId: userId, isCompleted: true },
    select: { lessonId: true },
  });
  const completedSet = new Set(completed.map((c) => c.lessonId));

  return enrollments.map((e) => {
    const lessons = e.course.sections.flatMap((s) => s.lessons);
    const total = lessons.length;
    const done = lessons.filter((l) => completedSet.has(l.id)).length;
    const next = lessons.find((l) => !completedSet.has(l.id));
    return {
      enrollmentId: e.id,
      status: e.status,
      course: {
        id: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        thumbnail: e.course.thumbnail,
        instructorName: e.course.instructor.name,
      },
      totalLessons: total,
      completedLessons: done,
      progress: total > 0 ? Math.round((done / total) * 100) : 0,
      firstLessonId: lessons[0]?.id ?? null,
      nextLessonId: next?.id ?? lessons[0]?.id ?? null,
    };
  });
}

/** يتحقق من وصول الطالب المفعّل لدورة. */
export async function getEnrollmentAccess(userId: string, courseId: string) {
  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: userId, courseId } },
    select: { status: true },
  });
  return enrollment?.status === "ACTIVE" || enrollment?.status === "COMPLETED";
}
