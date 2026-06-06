import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-helpers";
import { handleApiError } from "@/lib/api-utils";
import { issueCertificateIfNeeded } from "@/lib/certificate";
import { createNotification } from "@/lib/notifications";

const bodySchema = z.object({
  isCompleted: z.boolean().default(true),
  watchedSeconds: z.number().int().min(0).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const data = bodySchema.parse(body);

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      select: { id: true, section: { select: { courseId: true } } },
    });
    if (!lesson) {
      return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
    }
    const courseId = lesson.section.courseId;

    // التحقق من التفعيل
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId: user.id, courseId },
      },
    });
    if (
      !enrollment ||
      (enrollment.status !== "ACTIVE" && enrollment.status !== "COMPLETED")
    ) {
      return NextResponse.json(
        { error: "ليس لديك وصول مفعّل لهذه الدورة" },
        { status: 403 }
      );
    }

    await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: { studentId: user.id, lessonId: lesson.id },
      },
      create: {
        studentId: user.id,
        lessonId: lesson.id,
        isCompleted: data.isCompleted,
        watchedSeconds: data.watchedSeconds ?? 0,
        completedAt: data.isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: data.isCompleted,
        ...(data.watchedSeconds !== undefined
          ? { watchedSeconds: data.watchedSeconds }
          : {}),
        completedAt: data.isCompleted ? new Date() : null,
      },
    });

    // حساب التقدّم الكلي
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({ where: { section: { courseId } } }),
      prisma.lessonProgress.count({
        where: {
          studentId: user.id,
          isCompleted: true,
          lesson: { section: { courseId } },
        },
      }),
    ]);

    let courseCompleted = false;
    if (totalLessons > 0 && completedLessons >= totalLessons) {
      courseCompleted = true;
      if (enrollment.status !== "COMPLETED") {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: "COMPLETED", completedAt: new Date() },
        });
        const course = await prisma.course.findUnique({
          where: { id: courseId },
          select: { title: true },
        });
        await issueCertificateIfNeeded(user.id, courseId);
        await createNotification({
          userId: user.id,
          title: "مبروك! أكملت الدورة 🎓",
          message: `لقد أكملت دورة "${course?.title}" وحصلت على شهادتك.`,
          type: "COURSE_COMPLETED",
          link: "/student/certificates",
        });
      }
    }

    return NextResponse.json({
      progress: { totalLessons, completedLessons, courseCompleted },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
