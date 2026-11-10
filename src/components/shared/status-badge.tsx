import { Badge } from "@/components/ui/badge";
import { ParticipationStatus, WinnerDegree } from "@/data/types/base";
import {
  formatWinnerDegree,
  normalizeWinnerDegree,
  STATUS_LABELS,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_CLASSNAMES: Record<ParticipationStatus, string> = {
  [ParticipationStatus.WINNER]: "bg-gold/20 text-gold border-gold/30",
  [ParticipationStatus.PRIZE_WINNER]:
    "bg-silver/20 text-silver border-silver/30",
  [ParticipationStatus.FINALIST]:
    "bg-muted text-muted-foreground border-border",
};

const DEGREE_CLASSNAMES: Record<
  Exclude<WinnerDegree, WinnerDegree.NONE>,
  string
> = {
  [WinnerDegree.FIRST]: "bg-gold/20 text-gold border-gold/30",
  [WinnerDegree.SECOND]: "bg-silver/20 text-silver border-silver/30",
  [WinnerDegree.THIRD]: "bg-bronze/20 text-bronze border-bronze/30",
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
  if (status === ParticipationStatus.FINALIST && !finalistAsBadge) {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {STATUS_LABELS[status]}
      </span>
    );
  }

  const degree = normalizeWinnerDegree(winnerDegree);
  const badgeClassName = degree
    ? DEGREE_CLASSNAMES[degree]
    : STATUS_CLASSNAMES[status];

  return (
    <Badge variant="outline" className={cn(badgeClassName, className)}>
      {formatWinnerDegree(degree) ?? STATUS_LABELS[status]}
    </Badge>
  );
}
