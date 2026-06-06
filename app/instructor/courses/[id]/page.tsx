import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ListTree } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { CourseForm } from "@/components/instructor/course-form";

export const dynamic = "force-dynamic";

export default async function EditCoursePage({
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

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!course) notFound();
  if (course.instructorId !== user.id && user.role !== "ADMIN") redirect("/instructor/courses");

  return (
    <div>
      <PageHeader
        title="تعديل الدورة"
        description={course.title}
        action={
          <Button asChild variant="outline">
            <Link href={`/instructor/courses/${course.id}/curriculum`}>
              <ListTree className="h-4 w-4" /> إدارة المنهج
            </Link>
          </Button>
        }
      />
      <CourseForm
        categories={categories}
        courseId={course.id}
        defaultValues={{
          title: course.title,
          description: course.description,
          categoryId: course.categoryId,
          level: course.level,
          price: course.price,
          currency: course.currency,
          language: course.language,
          thumbnail: course.thumbnail ?? "",
          previewVideo: course.previewVideo ?? "",
        }}
      />
    </div>
  );
}
