import { prisma } from "./prisma";

/**
 * دوال جلب بيانات آمنة للموقع العام — تتعامل مع غياب قاعدة البيانات
 * أثناء البناء بإرجاع قيم افتراضية بدل تعطّل الصفحة.
 */

export async function getFeaturedCourses(limit = 6) {
  try {
    return await prisma.course.findMany({
      where: { isPublished: true, isFeatured: true },
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        instructor: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function getPublishedCourses(opts?: {
  categorySlug?: string;
  search?: string;
}) {
  try {
    return await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(opts?.categorySlug
          ? { category: { slug: opts.categorySlug } }
          : {}),
        ...(opts?.search
          ? { title: { contains: opts.search, mode: "insensitive" } }
          : {}),
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: {
        instructor: { select: { name: true } },
        category: { select: { name: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { courses: true } } },
      orderBy: { name: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getInstructors(limit = 4) {
  try {
    return await prisma.user.findMany({
      where: { role: "INSTRUCTOR", isActive: true },
      take: limit,
      include: { _count: { select: { instructorCourses: true } } },
    });
  } catch {
    return [];
  }
}

export async function getPublicStats() {
  try {
    const [students, courses, instructors, lessons] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.course.count({ where: { isPublished: true } }),
      prisma.user.count({ where: { role: "INSTRUCTOR" } }),
      prisma.lesson.count(),
    ]);
    return { students, courses, instructors, lessons };
  } catch {
    return { students: 0, courses: 0, instructors: 0, lessons: 0 };
  }
}
