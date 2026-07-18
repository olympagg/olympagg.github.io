import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { CalendarDays, ChevronsUp, LinkIcon, Trophy } from "lucide-react";
import { useNavigate } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { DataTable } from "@/components/shared/data-table";
import { ExternalLinkText } from "@/components/shared/external-link";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { SortableHeader } from "@/components/shared/sortable-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Separator } from "@/components/ui/separator";
import { useDataStore } from "@/contexts/data-context";
import type { Participation } from "@/data/types";
import { ParticipationStatus, WinnerDegree } from "@/data/types/base";
import type { EventId, Team } from "@/data/types/base";
import { formatRcsoLevel } from "@/lib/format";
import { routes, useEventParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { formatDate, formatNumber, pluralize } from "@/lib/utils";

const STATUS_ORDER: Record<string, number> = {
  [ParticipationStatus.WINNER]: 0,
  [ParticipationStatus.PRIZE_WINNER]: 1,
  [ParticipationStatus.FINALIST]: 2,
};

const WINNER_DEGREE_ORDER: Record<string, number> = {
  [WinnerDegree.FIRST]: 0,
  [WinnerDegree.SECOND]: 1,
  [WinnerDegree.THIRD]: 2,
  [WinnerDegree.NONE]: 3,
};

function statusSortValue(p: Participation): number {
  const base = STATUS_ORDER[p.status] ?? 10;
  const degree = p.winnerDegree
    ? (WINNER_DEGREE_ORDER[p.winnerDegree] ?? 10) * 0.1
    : 1;
  return base + degree;
}

const columnHelper = createColumnHelper<Participation>();

function buildColumns(hasTeams: boolean, hasGrades: boolean, eventId: EventId) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous accessor value types
  const cols: ColumnDef<Participation, any>[] = [
    columnHelper.accessor("rank", {
      header: ({ column }) => (
        <SortableHeader column={column}>#</SortableHeader>
      ),
      cell: (info) => (
        <span className="text-muted-foreground">{info.getValue()}</span>
      ),
      sortingFn: "basic" as const,
    }),
    columnHelper.accessor("fullName", {
      header: ({ column }) => (
        <SortableHeader column={column}>ФИО</SortableHeader>
      ),
      cell: (info) => info.getValue() as string,
      sortingFn: (a, b) =>
        a.original.fullName.localeCompare(b.original.fullName),
    }),
  ];

  if (hasTeams) {
    cols.push(
      columnHelper.accessor("team", {
        header: ({ column }) => (
          <SortableHeader column={column}>Команда</SortableHeader>
        ),
        cell: (info) => {
          const team = info.getValue() as Team | undefined;
          return team ? (
            <ExternalLinkText
              to={routes.team(eventId, team)}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="text-muted-foreground hover:text-foreground hover:opacity-75"
            >
              {team}
            </ExternalLinkText>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          );
        },
        sortingFn: (a, b) => {
          const teamA = a.original.team;
          const teamB = b.original.team;
          if (!teamA && !teamB) {
            return 0;
          }
          if (!teamA) {
            return 1;
          }
          if (!teamB) {
            return -1;
          }
          return teamA.localeCompare(teamB);
        },
      }),
    );
  }

  if (hasGrades) {
    cols.push(
      columnHelper.accessor("participationGrade", {
        header: ({ column }) => (
          <SortableHeader column={column}>Класс участия</SortableHeader>
        ),
        cell: (info) => String(info.getValue() ?? "—"),
        sortingFn: "basic" as const,
      }),
    );
  }

  cols.push(
    columnHelper.accessor("score", {
      header: ({ column }) => (
        <SortableHeader column={column}>Балл</SortableHeader>
      ),
      cell: (info) => (
        <span className="font-mono">
          {formatNumber(info.getValue() as number)}
        </span>
      ),
      sortingFn: "basic" as const,
    }),
    columnHelper.accessor("status", {
      id: "status",
      header: ({ column }) => (
        <SortableHeader column={column}>Статус</SortableHeader>
      ),
      cell: (info) => {
        const status = info.getValue() as ParticipationStatus;
        return (
          <StatusBadge
            status={status}
            winnerDegree={info.row.original.winnerDegree}
          />
        );
      },
      sortingFn: (a, b) =>
        statusSortValue(a.original) - statusSortValue(b.original),
    }),
  );

  return cols;
}

export function EventPage() {
  const { eventId } = useEventParams();
  const store = useDataStore();
  const navigate = useNavigate();

  const event = store.getEvent(eventId);
  if (!event) {
    return <NotFoundMessage message="Мероприятие не найдено" />;
  }

  const hasTeams = event.participations.some((p) => p.team);
  const hasGrades = event.participations.some(
    (p) => p.participationGrade != null,
  );
  const allDiplomants =
    event.participations.length > 0 &&
    event.participations.every(
      (p) =>
        p.status === ParticipationStatus.WINNER ||
        p.status === ParticipationStatus.PRIZE_WINNER,
    );

  const columns = buildColumns(hasTeams, hasGrades, eventId);

  return (
    <div className="space-y-6">
      <title>{pageTitle(event.meta.name)}</title>
      <div>
        <BackButton />

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-start gap-2 text-2xl font-bold tracking-tight">
            <Trophy className="mt-1 size-6 shrink-0" />
            <span>
              {event.meta.name}{" "}
              <span className="text-2xl font-normal whitespace-nowrap text-muted-foreground/60">
                {event.meta.date.getFullYear()}
              </span>
            </span>
          </h1>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            {formatDate(event.meta.date)}
          </span>
          <a
            href={event.meta.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <LinkIcon className="size-3.5" />
            {event.meta.url}
          </a>
          {event.meta.olympiadLevel != null && (
            <span className="flex items-center gap-1.5">
              <ChevronsUp className="size-3.5" />
              {formatRcsoLevel(event.meta.olympiadLevel)} уровень РСОШ
            </span>
          )}
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          {event.participations.length}{" "}
          {allDiplomants
            ? pluralize(event.participations.length, [
                "дипломант",
                "дипломанта",
                "дипломантов",
              ])
            : pluralize(event.participations.length, [
                "участник",
                "участника",
                "участников",
              ])}
        </h2>
        <DataTable
          columns={columns}
          data={event.participations}
          onRowClick={(participation) => {
            void navigate(
              routes.participation(eventId, participation.fullName),
            );
          }}
        />
      </div>
    </div>
  );
}
