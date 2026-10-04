import {
  ExternalLink,
  FilePen,
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
import { MetaItem, MetaRow } from "@/components/shared/meta-row";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { ScoreDistributionChart } from "@/components/shared/score-distribution-chart";
import { StatCard } from "@/components/shared/stat-card";
import { TaskScoreTable } from "@/components/shared/task-score-table";
import { useDataStore } from "@/contexts/data-context";
import type { EventData, Participation } from "@/data/types";
import { ParticipationStatus, WinnerDegree } from "@/data/types/base";
import {
  extractFirstName,
  formatShortName,
  formatTrackName,
  formatWinnerDegree,
  normalizeWinnerDegree,
  STATUS_LABELS,
} from "@/lib/format";
import { formatGroupContext } from "@/lib/group";
import { routes, useParticipationParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { cn, formatNumber, formatOptionalNumber } from "@/lib/utils";

function getPercentileLabel(
  event: EventData,
  participation: Participation,
): string {
  const context = formatGroupContext(
    event.meta.percentileRanking,
    participation,
  );
  return context ? `Перцентиль ${context}` : "Перцентиль";
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

const STATUS_META: Record<
  ParticipationStatus,
  { icon: LucideIcon; className: string; label: string }
> = {
  [ParticipationStatus.WINNER]: {
    icon: Trophy,
    className: "text-gold",
    label: STATUS_LABELS[ParticipationStatus.WINNER],
  },
  [ParticipationStatus.PRIZE_WINNER]: {
    icon: Medal,
    className: "text-silver",
    label: STATUS_LABELS[ParticipationStatus.PRIZE_WINNER],
  },
  [ParticipationStatus.FINALIST]: {
    icon: Info,
    className: "text-foreground",
    label: STATUS_LABELS[ParticipationStatus.FINALIST],
  },
};

const DEGREE_TEXT_COLORS: Record<
  Exclude<WinnerDegree, WinnerDegree.NONE>,
  string
> = {
  [WinnerDegree.FIRST]: "text-gold",
  [WinnerDegree.SECOND]: "text-silver",
  [WinnerDegree.THIRD]: "text-bronze",
};

function StatusLabel({
  status,
  winnerDegree,
}: {
  status: ParticipationStatus;
  winnerDegree?: WinnerDegree;
}) {
  const { icon, className, label } = STATUS_META[status];
  const degree = normalizeWinnerDegree(winnerDegree);
  const color = degree ? DEGREE_TEXT_COLORS[degree] : className;

  return (
    <MetaItem icon={icon} className={cn("font-medium", color)}>
      {formatWinnerDegree(degree) ?? label}
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
  const trackItem = track ? (
    <MetaItem icon={Route} className="font-medium text-foreground">
      {formatTrackName(track)}
    </MetaItem>
  ) : null;
  const workItem = participation.workUrl ? (
    <MetaItem
      icon={FilePen}
      href={participation.workUrl}
      className="transition-colors hover:text-foreground"
    >
      Решение задач
      <ExternalLink className="ml-1 inline size-3 align-[-0.1em] text-muted-foreground" />
    </MetaItem>
  ) : null;

  const contextItemCount = [region, school, gradeLabel].filter(Boolean).length;
  const resultItemCount =
    1 +
    Number(teamItem != null) +
    Number(trackItem != null) +
    Number(workItem != null);
  const splitMetaRows = contextItemCount > 1 && resultItemCount > 1;

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

      {splitMetaRows ? (
        <div className="space-y-1.5">
          <MetaRow>{contextItems}</MetaRow>
          <MetaRow>
            {statusItem}
            {teamItem}
            {trackItem}
            {workItem}
          </MetaRow>
        </div>
      ) : (
        <MetaRow>
          {contextItems}
          {statusItem}
          {teamItem}
          {trackItem}
          {workItem}
        </MetaRow>
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

      <ScoreDistributionChart event={event} participation={participation} />
    </div>
  );
}
