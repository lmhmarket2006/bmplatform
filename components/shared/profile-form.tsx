"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ProfileFormProps {
  initial: {
    name: string;
    email: string;
    phone?: string | null;
    bio?: string | null;
    avatar?: string | null;
  };
  showBio?: boolean;
}

export function ProfileForm({ initial, showBio }: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial.name,
    phone: initial.phone ?? "",
    bio: initial.bio ?? "",
    avatar: initial.avatar ?? "",
    password: "",
  });

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("تم حفظ التغييرات");
      setForm((f) => ({ ...f, password: "" }));
      router.refresh();
    } catch {
      toast.error("تعذّر حفظ التغييرات");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>المعلومات الشخصية</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label>الاسم</Label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input value={initial.email} disabled />
          </div>
          <div className="space-y-2">
            <Label>رقم الهاتف</Label>
            <Input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="05xxxxxxxx"
            />
          </div>
          <div className="space-y-2">
            <Label>رابط الصورة الشخصية</Label>
            <Input
              value={form.avatar}
              onChange={(e) => update("avatar", e.target.value)}
              placeholder="https://..."
            />
          </div>
          {showBio && (
            <div className="space-y-2">
              <Label>نبذة تعريفية</Label>
              <Textarea
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="عرّف بنفسك وخبراتك..."
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>كلمة مرور جديدة (اتركها فارغة للإبقاء)</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" variant="gradient" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            حفظ التغييرات
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
