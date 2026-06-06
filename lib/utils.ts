import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("ar-EG").format(num);
}

/** صياغة المدة بالدقائق إلى صيغة عربية مقروءة */
export function formatDuration(minutes?: number | null) {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h && m) return `${h} س ${m} د`;
  if (h) return `${h} ساعة`;
  return `${m} دقيقة`;
}

/** صياغة الثواني إلى mm:ss */
export function formatSeconds(totalSeconds?: number | null) {
  if (!totalSeconds && totalSeconds !== 0) return "00:00";
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function slugify(text: string) {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[\u0621-\u064A]+/g, (m) => m) // keep arabic
    .replace(/\s+/g, "-")
    .replace(/[^\u0621-\u064A\w-]+/g, "")
    .replace(/-+/g, "-");
}

export function getInitials(name?: string | null) {
  if (!name) return "؟";
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("");
}
