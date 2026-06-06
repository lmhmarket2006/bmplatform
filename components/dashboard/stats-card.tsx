import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: "primary" | "accent" | "success" | "warning";
}

const accentMap = {
  primary: "bg-primary/15 text-primary-light",
  accent: "bg-accent/15 text-accent-light",
  success: "bg-emerald-500/15 text-emerald-400",
  warning: "bg-amber-500/15 text-amber-400",
};

export function StatsCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = "primary",
}: StatsCardProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <span
        className={cn(
          "grid h-12 w-12 shrink-0 place-items-center rounded-xl",
          accentMap[accent]
        )}
      >
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-extrabold">{value}</p>
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  );
}
