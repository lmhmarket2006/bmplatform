import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Plus, ListTree, Users, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InstructorCoursesPage() {
  let user;
  try {
    user = await requireRole("INSTRUCTOR", "ADMIN");
  } catch {
    redirect("/login?callbackUrl=/instructor/courses");
  }

  const courses = await prisma.course.findMany({
    where: { instructorId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      category: { select: { name: true } },
      _count: { select: { enrollments: true, sections: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="دوراتي"
        description="أنشئ وأدر دوراتك التعليمية"
        action={
          <Button asChild variant="gradient">
            <Link href="/instructor/courses/new">
              <Plus className="h-4 w-4" /> دورة جديدة
            </Link>
          </Button>
        }
      />

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="لا توجد دورات بعد"
          description="ابدأ بإنشاء دورتك الأولى وشارك خبرتك مع الطلاب."
          action={
            <Button asChild variant="gradient">
              <Link href="/instructor/courses/new">إنشاء دورة</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{c.title}</h3>
                    <Badge variant={c.isPublished ? "success" : "warning"}>
                      {c.isPublished ? "منشورة" : "مسودّة"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.category.name} · {c._count.sections} أقسام ·{" "}
                    {c._count.enrollments} طالب ·{" "}
                    {c.price === 0 ? "مجاني" : formatCurrency(c.price, c.currency)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="gradient">
                    <Link href={`/instructor/courses/${c.id}/curriculum`}>
                      <ListTree className="h-4 w-4" /> المنهج
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/instructor/courses/${c.id}`}>
                      <Pencil className="h-4 w-4" /> تعديل
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/instructor/courses/${c.id}/students`}>
                      <Users className="h-4 w-4" /> الطلاب
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
