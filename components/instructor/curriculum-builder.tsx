"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  PlayCircle,
  Loader2,
  GripVertical,
  Video,
  Lock,
  Unlock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatSeconds } from "@/lib/utils";

interface LessonData {
  id: string;
  title: string;
  videoUrl?: string | null;
  duration?: number | null;
  isFree: boolean;
}
interface SectionData {
  id: string;
  title: string;
  lessons: LessonData[];
}

export function CurriculumBuilder({
  courseId,
  initialSections,
}: {
  courseId: string;
  initialSections: SectionData[];
}) {
  const router = useRouter();
  const [sections, setSections] = useState(initialSections);
  const [newSection, setNewSection] = useState("");
  const [addingSection, setAddingSection] = useState(false);
  const [lessonDialog, setLessonDialog] = useState<string | null>(null);

  async function addSection() {
    if (!newSection.trim()) return;
    setAddingSection(true);
    try {
      const res = await fetch(
        `/api/instructor/courses/${courseId}/sections`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newSection }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error();
      setSections((s) => [...s, { ...json.section, lessons: [] }]);
      setNewSection("");
      toast.success("تم إضافة القسم");
    } catch {
      toast.error("تعذّر إضافة القسم");
    } finally {
      setAddingSection(false);
    }
  }

  async function deleteSection(id: string) {
    if (!confirm("حذف القسم وكل دروسه؟")) return;
    try {
      const res = await fetch(`/api/instructor/sections/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setSections((s) => s.filter((sec) => sec.id !== id));
      toast.success("تم حذف القسم");
    } catch {
      toast.error("تعذّر الحذف");
    }
  }

  function onLessonAdded(sectionId: string, lesson: LessonData) {
    setSections((s) =>
      s.map((sec) =>
        sec.id === sectionId
          ? { ...sec, lessons: [...sec.lessons, lesson] }
          : sec
      )
    );
  }

  async function deleteLesson(sectionId: string, lessonId: string) {
    if (!confirm("حذف هذا الدرس؟")) return;
    try {
      const res = await fetch(`/api/instructor/lessons/${lessonId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setSections((s) =>
        s.map((sec) =>
          sec.id === sectionId
            ? { ...sec, lessons: sec.lessons.filter((l) => l.id !== lessonId) }
            : sec
        )
      );
      toast.success("تم حذف الدرس");
    } catch {
      toast.error("تعذّر الحذف");
    }
  }

  return (
    <div className="space-y-4">
      {sections.map((section, idx) => (
        <Card key={section.id} className="overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold">
                {idx + 1}. {section.title}
              </span>
              <span className="text-xs text-muted-foreground">
                ({section.lessons.length} دروس)
              </span>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-400"
              onClick={() => deleteSection(section.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="divide-y divide-border">
            {section.lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <PlayCircle className="h-4 w-4 text-primary-light" />
                  {lesson.title}
                  {lesson.isFree ? (
                    <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {formatSeconds(lesson.duration)}
                  </span>
                  <button
                    onClick={() => deleteLesson(section.id, lesson.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              </div>
            ))}
          </div>

          <div className="p-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setLessonDialog(section.id)}
            >
              <Plus className="h-4 w-4" /> إضافة درس
            </Button>
          </div>
        </Card>
      ))}

      {/* إضافة قسم */}
      <Card className="p-4">
        <Label className="mb-2 block">إضافة قسم جديد</Label>
        <div className="flex gap-2">
          <Input
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="عنوان القسم (مثال: مقدمة)"
            onKeyDown={(e) => e.key === "Enter" && addSection()}
          />
          <Button onClick={addSection} disabled={addingSection} variant="gradient">
            {addingSection ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            إضافة
          </Button>
        </div>
      </Card>

      <LessonDialog
        sectionId={lessonDialog}
        onClose={() => setLessonDialog(null)}
        onAdded={(l) => {
          if (lessonDialog) onLessonAdded(lessonDialog, l);
          router.refresh();
        }}
      />
    </div>
  );
}

function LessonDialog({
  sectionId,
  onClose,
  onAdded,
}: {
  sectionId: string | null;
  onClose: () => void;
  onAdded: (lesson: LessonData) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    videoUrl: "",
    description: "",
    minutes: "",
    isFree: false,
  });

  function reset() {
    setForm({ title: "", videoUrl: "", description: "", minutes: "", isFree: false });
  }

  async function submit() {
    if (!sectionId || !form.title.trim()) {
      toast.error("أدخل عنوان الدرس");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/instructor/sections/${sectionId}/lessons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            videoUrl: form.videoUrl,
            description: form.description,
            duration: form.minutes ? Math.round(Number(form.minutes) * 60) : 0,
            isFree: form.isFree,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error();
      onAdded(json.lesson);
      toast.success("تم إضافة الدرس");
      reset();
      onClose();
    } catch {
      toast.error("تعذّر إضافة الدرس");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={!!sectionId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>إضافة درس جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>عنوان الدرس</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="مثال: ضبط إعدادات الكاميرا"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Video className="h-4 w-4" /> رابط الفيديو
            </Label>
            <Input
              value={form.videoUrl}
              onChange={(e) =>
                setForm((f) => ({ ...f, videoUrl: e.target.value }))
              }
              placeholder="https://... (Cloudinary / YouTube / MP4)"
            />
          </div>
          <div className="space-y-2">
            <Label>المدة (بالدقائق)</Label>
            <Input
              type="number"
              value={form.minutes}
              onChange={(e) =>
                setForm((f) => ({ ...f, minutes: e.target.value }))
              }
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label>وصف الدرس (اختياري)</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="text-sm font-medium">درس مجاني (معاينة)</p>
              <p className="text-xs text-muted-foreground">
                يمكن للزوار مشاهدته قبل التسجيل
              </p>
            </div>
            <Switch
              checked={form.isFree}
              onCheckedChange={(v) => setForm((f) => ({ ...f, isFree: v }))}
            />
          </div>
          <Button
            variant="gradient"
            className="w-full"
            onClick={submit}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            إضافة الدرس
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
