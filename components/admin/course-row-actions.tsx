"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export function CourseRowActions({
  id,
  isPublished,
  isFeatured,
}: {
  id: string;
  isPublished: boolean;
  isFeatured: boolean;
}) {
  const router = useRouter();
  const [published, setPublished] = useState(isPublished);
  const [featured, setFeatured] = useState(isFeatured);
  const [loading, setLoading] = useState(false);

  async function patch(data: Record<string, boolean>, onErr: () => void) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("تم التحديث");
    } catch {
      onErr();
      toast.error("تعذّر التحديث");
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm("حذف الدورة وكل محتواها؟ لا يمكن التراجع.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("تم حذف الدورة");
      router.refresh();
    } catch {
      toast.error("تعذّر الحذف");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-xs text-muted-foreground">
        <Switch
          checked={published}
          disabled={loading}
          onCheckedChange={(v) => {
            setPublished(v);
            patch({ isPublished: v }, () => setPublished(!v));
          }}
        />
        منشور
      </label>
      <button
        disabled={loading}
        onClick={() => {
          const v = !featured;
          setFeatured(v);
          patch({ isFeatured: v }, () => setFeatured(!v));
        }}
        className={cn(
          "rounded-lg p-2 transition-colors",
          featured ? "text-accent-light" : "text-muted-foreground"
        )}
        title="تمييز"
      >
        <Star className={cn("h-4 w-4", featured && "fill-current")} />
      </button>
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
    </div>
  );
}
