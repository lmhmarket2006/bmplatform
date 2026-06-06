import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CurriculumBuilder } from "@/components/instructor/curriculum-builder";
import { PublishButton } from "@/components/instructor/publish-button";

export const dynamic = "force-dynamic";

export default async function CurriculumPage({
  params,
}: {
  params: { id: string };
}) {
  let user;
  try {
    user = await requireRole("INSTRUCTOR", "ADMIN");
  } catch {
    redirect("/login");
  }

  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: { lessons: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!course) notFound();
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    redirect("/instructor/courses");
  }

  return (
    <div>
      <PageHeader
        title="بناء المنهج"
        description={course.title}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/instructor/courses/${course.id}`}>
                <Pencil className="h-4 w-4" /> معلومات الدورة
              </Link>
            </Button>
            <PublishButton
              courseId={course.id}
              isPublished={course.isPublished}
            />
          </div>
        }
      />

      <CurriculumBuilder
        courseId={course.id}
        initialSections={course.sections.map((s) => ({
          id: s.id,
          title: s.title,
          lessons: s.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            videoUrl: l.videoUrl,
            duration: l.duration,
            isFree: l.isFree,
          })),
        }))}
      />
    </div>
  );
}
