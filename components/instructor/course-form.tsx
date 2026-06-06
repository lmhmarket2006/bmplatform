"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { z } from "zod";
import { courseSchema, type CourseInput } from "@/lib/validations/course";

type CourseFormValues = z.input<typeof courseSchema>;
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseFormProps {
  categories: { id: string; name: string }[];
  courseId?: string;
  defaultValues?: Partial<CourseInput>;
}

export function CourseForm({
  categories,
  courseId,
  defaultValues,
}: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues, unknown, CourseInput>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      level: "BEGINNER",
      currency: "SAR",
      language: "ar",
      price: 0,
      ...defaultValues,
    },
  });

  const level = watch("level");
  const categoryId = watch("categoryId");

  async function onSubmit(data: CourseInput) {
    setLoading(true);
    try {
      const url = courseId
        ? `/api/instructor/courses/${courseId}`
        : "/api/instructor/courses";
      const res = await fetch(url, {
        method: courseId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "تعذّر الحفظ");
        return;
      }
      toast.success(courseId ? "تم تحديث الدورة" : "تم إنشاء الدورة");
      const id = courseId || json.course.id;
      router.push(`/instructor/courses/${id}/curriculum`);
      router.refresh();
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-5">
      <div className="space-y-2">
        <Label>عنوان الدورة</Label>
        <Input placeholder="مثال: أساسيات التصوير الفوتوغرافي" {...register("title")} />
        {errors.title && (
          <p className="text-xs text-red-400">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>وصف الدورة</Label>
        <Textarea
          className="min-h-[120px]"
          placeholder="اشرح ماذا سيتعلّم الطالب في هذه الدورة..."
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-400">{errors.description.message}</p>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>الفئة</Label>
          <Select
            value={categoryId}
            onValueChange={(v) => setValue("categoryId", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر الفئة" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoryId && (
            <p className="text-xs text-red-400">{errors.categoryId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>المستوى</Label>
          <Select
            value={level}
            onValueChange={(v) => setValue("level", v as CourseInput["level"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BEGINNER">مبتدئ</SelectItem>
              <SelectItem value="INTERMEDIATE">متوسط</SelectItem>
              <SelectItem value="ADVANCED">متقدّم</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>السعر (ريال)</Label>
          <Input type="number" step="0.01" {...register("price")} />
          {errors.price && (
            <p className="text-xs text-red-400">{errors.price.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>رابط الصورة المصغّرة</Label>
          <Input placeholder="https://..." {...register("thumbnail")} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>رابط فيديو المقدمة (اختياري)</Label>
        <Input placeholder="https://..." {...register("previewVideo")} />
      </div>

      <Button type="submit" variant="gradient" size="lg" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {courseId ? "حفظ ومتابعة للمنهج" : "إنشاء والمتابعة للمنهج"}
      </Button>
    </form>
  );
}
