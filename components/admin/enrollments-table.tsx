"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  CheckCircle2,
  Ban,
  Loader2,
  Receipt,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  enrollmentStatusLabels,
  enrollmentStatusVariant,
} from "@/lib/constants";
import type { EnrollmentStatus } from "@prisma/client";

export interface EnrollmentRow {
  id: string;
  status: EnrollmentStatus;
  createdAt: string;
  receiptImage?: string | null;
  studentNote?: string | null;
  paidAmount?: number | null;
  student: { name: string; email: string; phone?: string | null };
  course: { title: string; price: number; currency: string };
}

export function EnrollmentsTable({ rows }: { rows: EnrollmentRow[] }) {
  const router = useRouter();
  const [active, setActive] = useState<EnrollmentRow | null>(null);
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  function openActivate(row: EnrollmentRow) {
    setActive(row);
    setPaidAmount(String(row.course.price ?? ""));
    setPaymentMethod("");
    setNotes("");
  }

  async function confirmActivate() {
    if (!active) return;
    setLoading("activate");
    try {
      const res = await fetch(`/api/admin/enrollments/${active.id}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paidAmount: paidAmount ? Number(paidAmount) : undefined,
          paymentMethod,
          notes,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("تم تفعيل تسجيل الطالب وإرسال إشعار له");
      setActive(null);
      router.refresh();
    } catch {
      toast.error("تعذّر تفعيل التسجيل");
    } finally {
      setLoading(null);
    }
  }

  async function suspend(id: string) {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/enrollments/${id}/suspend`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      toast.success("تم إيقاف وصول الطالب");
      router.refresh();
    } catch {
      toast.error("تعذّر إيقاف التسجيل");
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الطالب</TableHead>
            <TableHead>الدورة</TableHead>
            <TableHead>تاريخ الطلب</TableHead>
            <TableHead>الإيصال</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>إجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <div className="font-medium">{row.student.name}</div>
                <div className="text-xs text-muted-foreground">
                  {row.student.email}
                </div>
                {row.student.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {row.student.phone}
                  </div>
                )}
              </TableCell>
              <TableCell>{row.course.title}</TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {format(new Date(row.createdAt), "d MMM yyyy", { locale: ar })}
              </TableCell>
              <TableCell>
                {row.receiptImage ? (
                  <a
                    href={row.receiptImage}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary-light hover:underline"
                  >
                    <Receipt className="h-4 w-4" /> عرض
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant={enrollmentStatusVariant[row.status]}>
                  {enrollmentStatusLabels[row.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {(row.status === "PENDING" ||
                    row.status === "SUSPENDED") && (
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => openActivate(row)}
                    >
                      <CheckCircle2 className="h-4 w-4" /> تفعيل
                    </Button>
                  )}
                  {(row.status === "ACTIVE" || row.status === "PENDING") && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading === row.id}
                      onClick={() => suspend(row.id)}
                    >
                      {loading === row.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Ban className="h-4 w-4" />
                      )}
                      إيقاف
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد تفعيل التسجيل</DialogTitle>
            <DialogDescription>
              سيتم فتح وصول الطالب{" "}
              <span className="font-semibold text-foreground">
                {active?.student.name}
              </span>{" "}
              لدورة{" "}
              <span className="font-semibold text-foreground">
                {active?.course.title}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          {active?.studentNote && (
            <div className="rounded-lg border border-border bg-surface p-3 text-sm">
              <span className="text-muted-foreground">ملاحظة الطالب: </span>
              {active.studentNote}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paid">المبلغ المدفوع</Label>
              <Input
                id="paid"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">طريقة الدفع</Label>
              <Input
                id="method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                placeholder="تحويل بنكي / نقدي..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminNote">ملاحظات (اختياري)</Label>
              <Textarea
                id="adminNote"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي ملاحظات إدارية..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="gradient"
              onClick={confirmActivate}
              disabled={loading === "activate"}
            >
              {loading === "activate" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              تأكيد التفعيل
            </Button>
            <Button variant="outline" onClick={() => setActive(null)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
