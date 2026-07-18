import { Badge } from "@/components/ui/badge";
import { ParticipationStatus, type WinnerDegree } from "@/data/types/base";
import { formatWinnerDegree } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<
  ParticipationStatus,
  { label: string; className: string }
> = {
  [ParticipationStatus.WINNER]: {
    label: "Победитель",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  [ParticipationStatus.PRIZE_WINNER]: {
    label: "Призер",
    className: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
  [ParticipationStatus.FINALIST]: {
    label: "Участник",
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function StatusBadge({
  status,
  winnerDegree,
  className,
  finalistAsBadge,
}: {
  status: ParticipationStatus;
  winnerDegree?: WinnerDegree;
  className?: string;
  finalistAsBadge?: true;
}) {
  const config = STATUS_CONFIG[status];

  if (status === ParticipationStatus.FINALIST && !finalistAsBadge) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {config.label}
      </span>
    );
  }

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {formatWinnerDegree(winnerDegree) ?? config.label}
    </Badge>
  );
}
