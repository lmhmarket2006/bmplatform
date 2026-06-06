import Link from "next/link";
import { Camera } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showText = true,
}: {
  className?: string;
  href?: string;
  showText?: boolean;
}) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-gradient shadow-lg shadow-primary/30">
        <Camera className="h-5 w-5 text-white" />
      </span>
      {showText && (
        <span className="flex flex-col leading-tight">
          <span className="text-lg font-extrabold text-foreground">
            بيت المصوّر
          </span>
          <span className="text-[10px] text-muted-foreground">
            أكاديمية التصوير
          </span>
        </span>
      )}
    </Link>
  );
}
