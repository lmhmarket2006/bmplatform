"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function UserRowActions({
  id,
  isActive,
  allowDelete = true,
}: {
  id: string;
  isActive: boolean;
  allowDelete?: boolean;
}) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function toggle(next: boolean) {
    setLoading(true);
    setActive(next);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: next }),
      });
      if (!res.ok) throw new Error();
      toast.success(next ? "تم تفعيل الحساب" : "تم إيقاف الحساب");
    } catch {
      setActive(!next);
      toast.error("تعذّر تحديث الحالة");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "تعذّر الحذف");
        return;
      }
      toast.success("تم حذف المستخدم");
      router.refresh();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Switch checked={active} onCheckedChange={toggle} disabled={loading} />
        <Power className="h-4 w-4 text-muted-foreground" />
      </div>
      {allowDelete && (
        <Button
          size="icon"
          variant="ghost"
          onClick={remove}
          disabled={loading}
          className="text-red-400 hover:text-red-300"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
