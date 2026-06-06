"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2, X, Image as ImageIcon, Video } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const cloudinaryEnabled = Boolean(CLOUD_NAME && UPLOAD_PRESET);

type ResourceType = "image" | "video" | "auto";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  resourceType?: ResourceType;
  /** نص يظهر داخل منطقة الرفع */
  hint?: string;
  className?: string;
}

/**
 * مكوّن رفع وسائط مباشر إلى Cloudinary (رفع غير موقّع عبر المتصفح).
 * يعمل للصور والفيديو. إن لم تُضبط مفاتيح Cloudinary يعرض حقل لصق رابط فقط.
 */
export function FileUpload({
  value,
  onChange,
  resourceType = "image",
  hint,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const accept =
    resourceType === "video"
      ? "video/*"
      : resourceType === "image"
        ? "image/*"
        : "image/*,video/*";

  function pickFile() {
    inputRef.current?.click();
  }

  function uploadToCloudinary(file: File) {
    if (!cloudinaryEnabled) return;
    setUploading(true);
    setProgress(0);

    const endpointType = resourceType === "auto" ? "auto" : resourceType;
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpointType}/upload`;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET as string);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          onChange(res.secure_url as string);
          toast.success("تم رفع الملف بنجاح");
        } catch {
          toast.error("تعذّر قراءة استجابة الرفع");
        }
      } else {
        toast.error("فشل رفع الملف، تحقّق من إعدادات Cloudinary");
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      toast.error("فشل الاتصال بخدمة الرفع");
    };

    xhr.send(formData);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadToCloudinary(file);
    e.target.value = "";
  }

  const isVideo = resourceType === "video";

  return (
    <div className={cn("space-y-2", className)}>
      {/* معاينة الملف الحالي */}
      {value && !uploading && (
        <div className="relative overflow-hidden rounded-lg border border-border bg-surface">
          {isVideo ? (
            <div className="flex items-center gap-2 p-3 text-sm">
              <Video className="h-4 w-4 text-primary-light" />
              <span className="truncate text-muted-foreground" dir="ltr">
                {value}
              </span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="معاينة"
              className="h-36 w-full object-cover"
            />
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label="إزالة"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {cloudinaryEnabled && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            onClick={pickFile}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface px-4 py-6 text-center transition-colors hover:border-primary-light/60 hover:bg-secondary/40 disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary-light" />
                <span className="text-sm text-muted-foreground">
                  جارٍ الرفع… {progress}%
                </span>
                <span className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full bg-brand-gradient transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </span>
              </>
            ) : (
              <>
                {isVideo ? (
                  <Video className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                )}
                <span className="text-sm font-medium">
                  {isVideo ? "ارفع ملف فيديو" : "ارفع صورة"}
                </span>
                {hint && (
                  <span className="text-xs text-muted-foreground">{hint}</span>
                )}
              </>
            )}
          </button>
        </>
      )}

      {/* حقل لصق الرابط — يعمل دائماً (بديل أو إضافي) */}
      <div className="flex items-center gap-2">
        <Input
          dir="ltr"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {!cloudinaryEnabled && (
          <span className="shrink-0 text-muted-foreground">
            {isVideo ? <Video className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </span>
        )}
      </div>
      {!cloudinaryEnabled && (
        <p className="text-xs text-muted-foreground">
          لتفعيل الرفع المباشر اضبط مفاتيح Cloudinary، أو ألصق رابط الملف هنا.
        </p>
      )}
    </div>
  );
}
