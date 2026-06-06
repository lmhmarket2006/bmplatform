import { Users } from "lucide-react";
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
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { enrollments: { where: { status: "ACTIVE" } } },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="إدارة الطلاب"
        description={`${students.length} طالب مسجّل`}
        action={<AddUserDialog role="STUDENT" label="إضافة طالب" />}
      />

      <Card>
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="لا يوجد طلاب"
                description="ابدأ بإضافة طالب جديد أو انتظر التسجيلات."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الطالب</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>دورات نشطة</TableHead>
                  <TableHead>تاريخ الانضمام</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.phone || "—"}
                    </TableCell>
                    <TableCell>{s._count.enrollments}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {format(s.createdAt, "d MMM yyyy", { locale: ar })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.isActive ? "success" : "destructive"}>
                        {s.isActive ? "نشط" : "موقوف"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UserRowActions id={s.id} isActive={s.isActive} />
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
