"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // ملاحظة: ربط إرسال البريد الفعلي عبر Nodemailer لاحقاً
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
    toast.success("إذا كان البريد مسجّلاً، ستصلك رسالة الاستعادة");
  }

  return (
    <div>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold">استعادة كلمة المرور</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          أدخل بريدك وسنرسل لك رابط إعادة التعيين
        </p>
      </div>

      {sent ? (
        <div className="rounded-xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-muted-foreground">
            تحقّق من بريدك الإلكتروني واتبع التعليمات لإعادة تعيين كلمة المرور.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" required placeholder="you@example.com" className="pr-10" />
            </div>
          </div>
          <Button type="submit" variant="gradient" size="lg" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            إرسال رابط الاستعادة
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-primary-light hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </p>
    </div>
  );
}
