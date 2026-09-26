import { ChevronsDown, ChevronsUp, Sparkles } from "lucide-react";

import type { RcsoTrend } from "@/lib/rcso";
import { cn } from "@/lib/utils";

const TREND_META = {
  up: {
    Icon: ChevronsUp,
    className: "text-green-600 dark:text-green-500",
    label: "Уровень повышен",
  },
  down: {
    Icon: ChevronsDown,
    className: "text-red-600 dark:text-red-500",
    label: "Уровень понижен",
  },
  new: {
    Icon: Sparkles,
    className: "text-amber-500",
    label: "Новый профиль",
  },
} as const;

export function RcsoTrendIcon({ trend }: { trend: RcsoTrend }) {
  if (trend === null) {
    return null;
  }

  const { Icon, className, label } = TREND_META[trend];
  return (
    <Icon className={cn("ml-2 size-4 shrink-0", className)} role="img">
      <title>{label}</title>
    </Icon>
  );
}
