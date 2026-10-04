import { BarChart2, ExternalLink, Trophy, Users } from "lucide-react";
import React from "react";
import { Link } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { ClickableTableRow } from "@/components/shared/clickable-table-row";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataStore } from "@/contexts/data-context";
import type { Participation } from "@/data/types";
import type {
  DanoTeamCriteriaType,
  DanoTeamCriteriaValue,
} from "@/data/types/dano";
import type {
  ProdTeamCriteriaType,
  ProdTeamCriteriaValue,
} from "@/data/types/prod";
import { formatShortTrackName } from "@/lib/format";
import { routes, useTeamParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { formatNumber } from "@/lib/utils";

const CRITERIA_TYPE_NAMES: Record<
  ProdTeamCriteriaType | DanoTeamCriteriaType,
  string
> = {
  backend: "Бэкенд",
  frontend: "Фронтенд",
  mobile: "Мобилка",
  mlops: "MLOps",
  product: "Продукт",
  ui: "UI/UX",
  task: "Задача",
  analysis: "Анализ",
  results: "Результаты",
  presentation: "Презентация",
};

function formatCriteriaType(type: ProdTeamCriteriaType | DanoTeamCriteriaType) {
  return CRITERIA_TYPE_NAMES[type];
}

function findTeamCriterias(participations: Participation[]) {
  for (const participation of participations) {
    const criterias = participation.teamTaskScores ?? null;
    if (criterias && criterias.length > 0) {
      return criterias;
    }
  }
  return null;
}

interface CriteriaBreakdownProps {
  criterias: (DanoTeamCriteriaValue | ProdTeamCriteriaValue)[];
}

function CriteriaBreakdown({ criterias }: CriteriaBreakdownProps) {
  const blocks = criterias.reduce<
    {
      type: DanoTeamCriteriaType | ProdTeamCriteriaType;
      items: (DanoTeamCriteriaValue | ProdTeamCriteriaValue)[];
    }[]
  >((accumulated, c) => {
    const last = accumulated.at(-1);
    if (last?.type === c.type) {
      last.items.push(c);
    } else {
      accumulated.push({ type: c.type, items: [c] });
    }
    return accumulated;
  }, []);

  return (
    <>
      <Separator />
      <div>
        <h2 className="mb-3 text-lg font-semibold">Разбивка по критериям</h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Блок</TableHead>
                <TableHead>Название</TableHead>
                <TableHead className="w-20 text-right">Балл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => {
                const blockSum = block.items.reduce(
                  (acc, c) => acc + c.score,
                  0,
                );
                const blockMax = block.items.reduce(
                  (acc, c) => acc + c.maxScore,
                  0,
                );
                return (
                  <React.Fragment key={block.type}>
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-semibold">
                        {formatCriteriaType(block.type)}
                      </TableCell>
                      <TableCell className="font-semibold text-muted-foreground">
                        Сумма за блок
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatNumber(blockSum)}
                        <span className="text-muted-foreground">
                          /{formatNumber(blockMax)}
                        </span>
                      </TableCell>
                    </TableRow>
                    {block.items.map((criteria, idx) => (
                      <TableRow
                        key={`${criteria.type}-${criteria.name}-${idx}`}
                      >
                        <TableCell className="text-muted-foreground" />
                        <TableCell className="text-muted-foreground">
                          {criteria.name}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatNumber(criteria.score)}
                          <span className="text-muted-foreground">
                            /{formatNumber(criteria.maxScore)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

export function TeamPage() {
  const { eventId, slug } = useTeamParams();
  const store = useDataStore();

  const teamData = store.getTeamBySlug(eventId, slug);
  const event = store.getEvent(eventId);
  if (!teamData || !event) {
    return <NotFoundMessage message="Команда не найдена" />;
  }

  const firstParticipation = teamData.participations[0];
  const teamScoreRaw = firstParticipation
    ? (firstParticipation.teamScore ?? firstParticipation.score)
    : 0;
  const totalTeams = store.getTeams(eventId)?.length ?? 0;
  const criterias = findTeamCriterias(teamData.participations);
  const hasRegions = teamData.participations.some((p) => p.region);
  const hasTracks = teamData.participations.some((p) => p.track ?? null);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <title>{pageTitle(`${teamData.team} на ${event.meta.name}`)}</title>
      <BackButton />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <Users className="mr-2 inline-block size-6 align-[-0.15em]" />
            {teamData.team}
          </h1>
          <p className="mt-1 text-muted-foreground">
            <Link
              to={routes.event(teamData.eventId)}
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

        <div className="flex shrink-0 flex-col items-stretch gap-3 rounded-lg border bg-card px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="size-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{formatNumber(teamScoreRaw)}</p>
              <p className="text-xs text-muted-foreground">Балл команды</p>
            </div>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
          <div className="h-px w-full bg-border sm:hidden" />
          <div className="flex items-center gap-2">
            <Trophy className="size-5 text-amber-400" />
            <div>
              <p className="text-2xl font-bold">
                {teamData.rank}
                <span className="text-base font-normal text-muted-foreground">
                  /{totalTeams}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Место</p>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Участники команды</h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ФИО</TableHead>
                {hasRegions && <TableHead>Регион</TableHead>}
                {hasTracks && <TableHead>Трек</TableHead>}
                <TableHead className="w-20 text-right">Балл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamData.participations.map((participation) => {
                const track = participation.track ?? null;
                const region = participation.region;

                return (
                  <ClickableTableRow
                    key={participation.fullName}
                    to={routes.participation(
                      teamData.eventId,
                      participation.fullName,
                    )}
                  >
                    <TableCell>{participation.fullName}</TableCell>
                    {hasRegions && (
                      <TableCell className="text-muted-foreground">
                        {region ?? "—"}
                      </TableCell>
                    )}
                    {hasTracks && (
                      <TableCell>
                        {track ? formatShortTrackName(track) : "—"}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-mono">
                      {formatNumber(participation.score)}
                    </TableCell>
                  </ClickableTableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {criterias && criterias.length > 0 && (
        <CriteriaBreakdown criterias={criterias} />
      )}
    </div>
  );
}
