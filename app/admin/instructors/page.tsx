import { GraduationCap } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { AddUserDialog } from "@/components/admin/add-user-dialog";
import { UserRowActions } from "@/components/admin/user-row-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export default async function AdminInstructorsPage() {
  const instructors = await prisma.user.findMany({
    where: { role: "INSTRUCTOR" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { instructorCourses: true } } },
  });

  return (
    <div>
      <PageHeader
        title="إدارة المدربين"
        description={`${instructors.length} مدرّب`}
        action={<AddUserDialog role="INSTRUCTOR" label="إضافة مدرّب" />}
      />

      <Card>
        <CardContent className="p-0">
          {instructors.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={GraduationCap}
                title="لا يوجد مدربون"
                description="أضف مدرّباً ليبدأ بإنشاء الدورات."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المدرّب</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>عدد الدورات</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {instructors.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {i.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {i.phone || "—"}
                    </TableCell>
                    <TableCell>{i._count.instructorCourses}</TableCell>
                    <TableCell>
                      <Badge variant={i.isActive ? "success" : "destructive"}>
                        {i.isActive ? "نشط" : "موقوف"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UserRowActions id={i.id} isActive={i.isActive} />
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
