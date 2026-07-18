import {
  ExternalLink,
  GraduationCap,
  Info,
  type LucideIcon,
  MapPinned,
  Medal,
  Route,
  School,
  Trophy,
  Users,
} from "lucide-react";
import { Link } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { StatCard } from "@/components/shared/stat-card";
import { TaskScoreTable } from "@/components/shared/task-score-table";
import { useDataStore } from "@/contexts/data-context";
import type { EventData, Participation } from "@/data/types";
import { ParticipationStatus, type WinnerDegree } from "@/data/types/base";
import {
  extractFirstName,
  formatShortName,
  formatTrackName,
  formatWinnerDegree,
} from "@/lib/format";
import { routes, useParticipationParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { cn, formatNumber, formatOptionalNumber } from "@/lib/utils";

function getPercentileLabel(
  event: EventData,
  participation: Participation,
): string {
  const { percentileRanking } = event.meta;
  if (
    percentileRanking === "participationGrade" &&
    participation.participationGrade != null
  ) {
    return `Перцентиль в ${participation.participationGrade} классе`;
  }
  if (percentileRanking === "track" && participation.track) {
    return `Перцентиль в треке ${formatTrackName(participation.track)}`;
  }
  return "Перцентиль";
}

function getGradeLabel(
  studyGrade: number | null | undefined,
  participationGrade: number | null | undefined,
): string | null {
  if (
    studyGrade != null &&
    participationGrade != null &&
    studyGrade != participationGrade
  ) {
    return `${studyGrade} класс, участвует за ${participationGrade}`;
  }

  const grade = studyGrade ?? participationGrade;
  return grade != null ? `${grade} класс` : null;
}

const META_ROW =
  "flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground";

const STATUS_META: Record<
  ParticipationStatus,
  { icon: LucideIcon; className: string; label: string }
> = {
  [ParticipationStatus.WINNER]: {
    icon: Trophy,
    className: "text-amber-400",
    label: "Победитель",
  },
  [ParticipationStatus.PRIZE_WINNER]: {
    icon: Medal,
    className: "text-sky-400",
    label: "Призер",
  },
  [ParticipationStatus.FINALIST]: {
    icon: Info,
    className: "text-foreground",
    label: "Участник",
  },
};

function MetaItem({
  icon: Icon,
  to,
  className,
  children,
}: {
  icon: LucideIcon;
  to?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const cls = cn("flex items-center gap-1.5", className);
  const inner = (
    <>
      <Icon className="size-3.5 shrink-0" />
      {children}
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

function StatusLabel({
  status,
  winnerDegree,
}: {
  status: ParticipationStatus;
  winnerDegree?: WinnerDegree;
}) {
  const { icon, className, label } = STATUS_META[status];
  const degree = formatWinnerDegree(winnerDegree);

  return (
    <MetaItem icon={icon} className={cn("font-medium", className)}>
      {degree ?? label}
    </MetaItem>
  );
}

export function ParticipationPage() {
  const { eventId, slug } = useParticipationParams();
  const store = useDataStore();

  const participation = store.getParticipationBySlug(eventId, slug);
  const event = store.getEvent(eventId);

  if (!participation || !event) {
    return <NotFoundMessage message="Участие не найдено" />;
  }

  const { school, region, team, studyGrade, participationGrade } =
    participation;
  const schoolIsLinkable = school != null && store.getSchool(school) != null;
  const regionIsLinkable = region != null && store.getRegion(region) != null;
  const track = participation.track ?? null;
  const gradeLabel = getGradeLabel(studyGrade, participationGrade);
  const firstName = extractFirstName(participation.fullName);

  const statusItem = (
    <StatusLabel
      status={participation.status}
      winnerDegree={participation.winnerDegree}
    />
  );
  const teamItem = team ? (
    <MetaItem
      icon={Users}
      to={routes.team(participation.eventId, team)}
      className="font-medium text-foreground hover:opacity-75"
    >
      {team}
    </MetaItem>
  ) : null;
  const hasContext =
    region != null || school != null || gradeLabel != null || track != null;
  const contextItems = (
    <>
      {region && (
        <MetaItem
          icon={MapPinned}
          to={regionIsLinkable ? routes.region(region) : undefined}
          className={
            regionIsLinkable
              ? "transition-colors hover:text-foreground"
              : undefined
          }
        >
          {region}
        </MetaItem>
      )}
      {school && (
        <MetaItem
          icon={School}
          to={schoolIsLinkable ? routes.school(school) : undefined}
          className={
            schoolIsLinkable
              ? "transition-colors hover:text-foreground"
              : undefined
          }
        >
          {school}
        </MetaItem>
      )}
      {gradeLabel && <MetaItem icon={GraduationCap}>{gradeLabel}</MetaItem>}
      {track && <MetaItem icon={Route}>{formatTrackName(track)}</MetaItem>}
    </>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <title>
        {pageTitle(
          `${formatShortName(participation.fullName)} на ${event.meta.name}`,
        )}
      </title>
      <BackButton />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <Link
            to={routes.person(participation.fullName)}
            className="inline-flex items-center gap-2 hover:opacity-75"
            title="Профиль участника"
          >
            {participation.fullName}
            <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </h1>
        <p className="mt-1 text-muted-foreground">
          <Link
            to={routes.event(participation.eventId)}
            className="text-primary hover:opacity-75"
          >
            {event.meta.name}{" "}
            <span className="inline-flex items-center gap-1 font-normal whitespace-nowrap text-muted-foreground/60">
              {event.meta.date.getFullYear()}
              <ExternalLink className="size-3" />
            </span>
          </Link>
        </p>
      </div>

      {teamItem ? (
        <div className="space-y-1.5">
          {hasContext && <div className={META_ROW}>{contextItems}</div>}
          <div className={META_ROW}>
            {statusItem}
            {teamItem}
          </div>
        </div>
      ) : (
        <div className={META_ROW}>
          {statusItem}
          {contextItems}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard title="Балл">
          {formatNumber(participation.score)}
          <span className="font-medium text-muted-foreground">
            {" "}
            / {formatNumber(event.meta.maxScore)}
          </span>
        </StatCard>
        <StatCard
          title={getPercentileLabel(event, participation)}
          help={<>Доля участников, набравших меньше баллов, чем {firstName}</>}
        >
          {participation.percentile == null
            ? "—"
            : `${formatNumber(participation.percentile)}%`}
        </StatCard>
        <StatCard
          title="Z-score"
          help="Нормализованный балл участия; 0 — среднее, +1 — 68%; +2 — 95%"
        >
          {formatOptionalNumber(participation.zScore)}
        </StatCard>
      </div>

      {participation.taskScores?.length ? (
        <TaskScoreTable
          title="Разбивка по задачам"
          tasks={participation.taskScores}
        />
      ) : participation.soloTaskScores?.length ? (
        <TaskScoreTable
          title="Результаты задачного тура"
          tasks={participation.soloTaskScores}
        />
      ) : null}
    </div>
  );
}
