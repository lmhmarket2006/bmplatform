"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Globe, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublishButton({
  courseId,
  isPublished,
}: {
  courseId: string;
  isPublished: boolean;
}) {
  const router = useRouter();
  const [published, setPublished] = useState(isPublished);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/instructor/courses/${courseId}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !published }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "تعذّر التحديث");
        return;
      }
      setPublished(!published);
      toast.success(!published ? "تم نشر الدورة" : "تم إلغاء النشر");
      router.refresh();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={published ? "outline" : "gradient"}
      onClick={toggle}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : published ? (
        <EyeOff className="h-4 w-4" />
      ) : (
        <Globe className="h-4 w-4" />
      )}
      {published ? "إلغاء النشر" : "نشر الدورة"}
    </Button>
  );
}
