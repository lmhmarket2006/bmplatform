import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { CourseRowActions } from "@/components/admin/course-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { levelLabels } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      instructor: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  return (
    <div>
      <PageHeader
        title="إدارة الدورات"
        description={`${courses.length} دورة`}
      />

      <Card>
        <CardContent className="p-0">
          {courses.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={BookOpen}
                title="لا توجد دورات"
                description="ستظهر الدورات هنا بعد أن ينشئها المدربون."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الدورة</TableHead>
                  <TableHead>المدرّب</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الطلاب</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {levelLabels[c.level]}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.instructor.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{c.category.name}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {c.price === 0 ? "مجاني" : formatCurrency(c.price, c.currency)}
                    </TableCell>
                    <TableCell>{c._count.enrollments}</TableCell>
                    <TableCell>
                      <CourseRowActions
                        id={c.id}
                        isPublished={c.isPublished}
                        isFeatured={c.isFeatured}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
