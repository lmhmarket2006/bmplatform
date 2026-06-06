"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle2,
  Loader2,
  Lock,
  PlayCircle,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/shared/file-upload";
import { formatCurrency } from "@/lib/utils";
import type { EnrollmentStatus } from "@prisma/client";

interface EnrollPanelProps {
  courseId: string;
  price: number;
  currency: string;
  isLoggedIn: boolean;
  enrollmentStatus: EnrollmentStatus | null;
}

const payment = {
  bank: process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME,
  account: process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME,
  iban: process.env.NEXT_PUBLIC_PAYMENT_IBAN,
};

export function EnrollPanel({
  courseId,
  price,
  currency,
  isLoggedIn,
  enrollmentStatus,
}: EnrollPanelProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptImage, setReceipt] = useState("");
  const [studentNote, setNote] = useState("");

  async function submitEnroll() {
    setLoading(true);
    try {
      const res = await fetch("/api/student/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, receiptImage, studentNote }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "تعذّر إرسال الطلب");
        return;
      }
      setOpen(false);
      toast.success("تم استلام طلبك! سيتم تفعيل الدورة خلال 24 ساعة");
      router.refresh();
    } catch {
      toast.error("حدث خطأ، حاول مجدداً");
    } finally {
      setLoading(false);
    }
  }

  // ===== حالات مختلفة =====
  if (enrollmentStatus === "ACTIVE" || enrollmentStatus === "COMPLETED") {
    return (
      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={() => router.push(`/student/courses/${courseId}`)}
      >
        <PlayCircle className="h-5 w-5" />
        {enrollmentStatus === "COMPLETED" ? "مراجعة الدورة" : "متابعة التعلّم"}
      </Button>
    );
  }

  if (enrollmentStatus === "PENDING") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
        <Clock className="h-5 w-5" />
        طلبك قيد المراجعة — سيتم التفعيل قريباً
      </div>
    );
  }

  if (enrollmentStatus === "SUSPENDED") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
        <Lock className="h-5 w-5" />
        تم إيقاف وصولك لهذه الدورة، تواصل مع الإدارة
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={() => router.push(`/login?callbackUrl=/courses`)}
      >
        سجّل الدخول للاشتراك
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="gradient"
        size="lg"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        سجّل الآن
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إتمام التسجيل في الدورة</DialogTitle>
            <DialogDescription>
              التفعيل يدوي. حوّل المبلغ ثم أرفق إيصال التحويل وسنفعّل دورتك خلال
              24 ساعة.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  المبلغ المطلوب
                </span>
                <span className="text-xl font-extrabold text-gradient">
                  {price === 0 ? "مجاني" : formatCurrency(price, currency)}
                </span>
              </div>
              <div className="space-y-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  بيانات التحويل البنكي:
                </div>
                <ul className="space-y-1 pr-6 text-foreground">
                  <li>البنك: {payment.bank}</li>
                  <li>المستفيد: {payment.account}</li>
                  <li className="font-mono" dir="ltr">
                    IBAN: {payment.iban}
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt">صورة إيصال التحويل (اختياري)</Label>
              <FileUpload
                value={receiptImage}
                onChange={setReceipt}
                resourceType="image"
                hint="ارفع صورة الإيصال لتسريع التفعيل"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">ملاحظة (اختياري)</Label>
              <Textarea
                id="note"
                placeholder="أي تفاصيل إضافية..."
                value={studentNote}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <Button
              variant="gradient"
              className="w-full"
              onClick={submitEnroll}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              أرسل طلب التسجيل
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
