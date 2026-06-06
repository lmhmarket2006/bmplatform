import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CourseForm } from "@/components/instructor/course-form";

export const dynamic = "force-dynamic";

export default async function NewCoursePage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="إنشاء دورة جديدة"
        description="ابدأ بالمعلومات الأساسية ثم أضف المنهج والدروس"
      />
      <CourseForm categories={categories} />
    </div>
  );
}
