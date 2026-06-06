"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    (e.target as HTMLFormElement).reset();
    toast.success("تم استلام رسالتك، سنتواصل معك قريباً");
  }

  return (
    <div className="container py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold md:text-4xl">تواصل معنا</h1>
        <p className="mt-3 text-muted-foreground">
          لديك سؤال أو استفسار؟ يسعدنا تواصلك معنا
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
        <div className="space-y-4">
          {[
            { icon: Mail, label: "البريد الإلكتروني", value: "info@baitalmusawwir.com" },
            { icon: Phone, label: "الهاتف", value: "920000000" },
            { icon: MapPin, label: "العنوان", value: "الرياض، المملكة العربية السعودية" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-gradient-soft text-primary-light">
                <item.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-semibold">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name">الاسم</Label>
            <Input id="name" required placeholder="اسمك الكامل" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" required placeholder="you@example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">رسالتك</Label>
            <Textarea id="message" required placeholder="اكتب رسالتك هنا..." className="min-h-[120px]" />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            إرسال الرسالة
          </Button>
        </form>
      </div>
    </div>
  );
}
