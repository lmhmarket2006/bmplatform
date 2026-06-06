import Link from "next/link";
import { Clock, BarChart3, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { levelLabels } from "@/lib/constants";
import { formatCurrency, formatDuration } from "@/lib/utils";
import type { Level } from "@prisma/client";

export interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string | null;
  price: number;
  currency: string;
  level: Level;
  duration?: number | null;
  isFeatured?: boolean;
  instructor?: { name: string } | null;
  category?: { name: string } | null;
  _count?: { sections?: number; enrollments?: number };
}

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10"
    >
      <div className="relative aspect-video overflow-hidden bg-surface">
        {course.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-brand-gradient-soft">
            <PlayCircle className="h-12 w-12 text-primary-light/60" />
          </div>
        )}
        <div className="absolute right-3 top-3 flex gap-2">
          {course.isFeatured && <Badge variant="accent">مميّز</Badge>}
          {course.category && (
            <Badge variant="secondary">{course.category.name}</Badge>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 font-bold leading-snug transition-colors group-hover:text-primary-light">
          {course.title}
        </h3>
        {course.instructor && (
          <p className="mb-4 text-sm text-muted-foreground">
            {course.instructor.name}
          </p>
        )}

        <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BarChart3 className="h-3.5 w-3.5" />
            {levelLabels[course.level]}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDuration(course.duration)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-lg font-extrabold text-gradient">
            {course.price === 0 ? "مجاني" : formatCurrency(course.price, course.currency)}
          </span>
          <span className="text-xs font-medium text-primary-light group-hover:underline">
            عرض التفاصيل ←
          </span>
        </div>
      </div>
    </Link>
  );
}
