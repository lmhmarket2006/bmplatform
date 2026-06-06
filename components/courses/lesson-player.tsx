"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Gauge, FileDown, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Attachment {
  id: string;
  name: string;
  url: string;
}

interface LessonPlayerProps {
  lessonId: string;
  courseId: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  isCompleted: boolean;
  attachments: Attachment[];
  nextLessonId?: string | null;
}

function getYouTubeEmbed(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function LessonPlayer({
  lessonId,
  courseId,
  title,
  description,
  videoUrl,
  isCompleted,
  attachments,
  nextLessonId,
}: LessonPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [completed, setCompleted] = useState(isCompleted);
  const [loading, setLoading] = useState(false);
  const [speed, setSpeed] = useState("1");

  const youtube = videoUrl ? getYouTubeEmbed(videoUrl) : null;

  function changeSpeed(v: string) {
    setSpeed(v);
    if (videoRef.current) videoRef.current.playbackRate = Number(v);
  }

  async function markComplete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/student/lessons/${lessonId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "تعذّر تحديث التقدّم");
        return;
      }
      setCompleted(true);
      router.refresh();
      if (json.progress?.courseCompleted) {
        toast.success("مبروك! أكملت الدورة وحصلت على شهادتك 🎓");
        router.push("/student/certificates");
      } else {
        toast.success("أحسنت! تم احتساب الدرس");
        if (nextLessonId) {
          router.push(`/student/courses/${courseId}/learn/${nextLessonId}`);
        }
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* الفيديو */}
      <div className="overflow-hidden rounded-xl border border-border bg-black">
        {youtube ? (
          <div className="aspect-video">
            <iframe
              src={youtube}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          </div>
        ) : videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            controlsList="nodownload"
            className="aspect-video w-full"
          />
        ) : (
          <div className="grid aspect-video place-items-center text-muted-foreground">
            <div className="text-center">
              <Video className="mx-auto mb-2 h-12 w-12 opacity-40" />
              لا يوجد فيديو لهذا الدرس بعد
            </div>
          </div>
        )}
      </div>

      {/* أدوات التحكم */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          {!youtube && videoUrl && (
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-muted-foreground" />
              <Select value={speed} onValueChange={changeSpeed}>
                <SelectTrigger className="h-9 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["0.75", "1", "1.25", "1.5", "2"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant={completed ? "outline" : "gradient"}
            onClick={markComplete}
            disabled={loading || completed}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {completed ? "تم إكمال الدرس" : "أتممت هذا الدرس"}
          </Button>
        </div>
      </div>

      {description && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-2 font-bold">عن الدرس</h3>
          <p className="whitespace-pre-line text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 font-bold">المرفقات</h3>
          <ul className="space-y-2">
            {attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-primary-light hover:underline"
                >
                  <FileDown className="h-4 w-4" /> {a.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
