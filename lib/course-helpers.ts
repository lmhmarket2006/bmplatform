import { prisma } from "./prisma";
import { AuthError } from "./auth-helpers";
import { slugify } from "./utils";

/** يتحقق أن الدورة مملوكة للمدرّب، أو يرمي خطأ. */
export async function assertCourseOwner(courseId: string, userId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  });
  if (!course) throw new AuthError("الدورة غير موجودة", 404);
  if (course.instructorId !== userId) {
    throw new AuthError("غير مصرّح: هذه ليست دورتك", 403);
  }
  return course;
}

/** يتحقق أن القسم يتبع دورة مملوكة للمدرّب. */
export async function assertSectionOwner(sectionId: string, userId: string) {
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    select: { id: true, courseId: true, course: { select: { instructorId: true } } },
  });
  if (!section) throw new AuthError("القسم غير موجود", 404);
  if (section.course.instructorId !== userId) {
    throw new AuthError("غير مصرّح", 403);
  }
  return section;
}

/** يتحقق أن الدرس يتبع دورة مملوكة للمدرّب. */
export async function assertLessonOwner(lessonId: string, userId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      sectionId: true,
      section: { select: { course: { select: { instructorId: true, id: true } } } },
    },
  });
  if (!lesson) throw new AuthError("الدرس غير موجود", 404);
  if (lesson.section.course.instructorId !== userId) {
    throw new AuthError("غير مصرّح", 403);
  }
  return lesson;
}

/** يولّد slug فريداً للدورة. */
export async function generateUniqueSlug(title: string) {
  const base = slugify(title) || "course";
  let slug = base;
  let i = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

/** يعيد حساب مدة الدورة (بالدقائق) من مجموع مدد الدروس (بالثواني). */
export async function recalcCourseDuration(courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { section: { courseId } },
    select: { duration: true },
  });
  const totalSeconds = lessons.reduce((s, l) => s + (l.duration ?? 0), 0);
  await prisma.course.update({
    where: { id: courseId },
    data: { duration: Math.round(totalSeconds / 60) },
  });
}
