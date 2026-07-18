import {
  BarChart3,
  GraduationCap,
  MapPinned,
  School,
  User,
  Users,
} from "lucide-react";
import { Link } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { ClickableTableRow } from "@/components/shared/clickable-table-row";
import { ExternalLinkText } from "@/components/shared/external-link";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
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
import { getGraduationLabel } from "@/lib/academic";
import { extractFirstName } from "@/lib/format";
import { routes, usePersonParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import {
  formatNumber,
  formatOptionalNumber,
  formatPercent,
  pluralize,
} from "@/lib/utils";

export function PersonPage() {
  const { slug } = usePersonParams();
  const store = useDataStore();

  const person = store.getPersonBySlug(slug);
  if (!person) {
    return <NotFoundMessage message="Участник не найден" />;
  }

  const graduationLabel = getGraduationLabel(person.graduationYear);
  const hasTeams = person.participations.some((p) => p.team);
  const firstName = extractFirstName(person.fullName);

  return (
    <div className="space-y-6">
      <title>{pageTitle(person.fullName)}</title>
      <BackButton />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <User className="size-6 shrink-0" />
          {person.fullName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          {person.region && (
            <Link
              to={routes.region(person.region)}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <MapPinned className="size-3.5" />
              {person.region}
            </Link>
          )}
          {person.school && (
            <Link
              to={routes.school(person.school)}
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <School className="size-3.5" />
              {person.school}
            </Link>
          )}
          {graduationLabel && (
            <span className="flex items-center gap-1.5">
              <GraduationCap className="size-3.5" />
              {graduationLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <StatCard
          icon={BarChart3}
          help="Медиана доли набранных баллов от теоретического максимума"
          title={
            <>
              <span className="sm:hidden">Результат</span>
              <span className="hidden sm:inline">Медианный результат</span>
            </>
          }
        >
          {formatPercent(person.medianScoreRate * 100)}
        </StatCard>
        <StatCard
          help={
            <>
              Медиана доли участников, набравших меньше баллов, чем {firstName}
            </>
          }
          title={
            <>
              <span className="sm:hidden">Перцентиль</span>
              <span className="hidden sm:inline">Медианный перцентиль</span>
            </>
          }
        >
          {person.medianPercentile == null
            ? "—"
            : formatPercent(person.medianPercentile)}
        </StatCard>
        <StatCard
          help="Медиана нормализованного балла участия; 0 — среднее, +1 — 68%; +2 — 95%"
          title={
            <>
              <span className="sm:hidden">Z-score</span>
              <span className="hidden sm:inline">Медианный Z-score</span>
            </>
          }
        >
          {formatOptionalNumber(person.medianZScore)}
        </StatCard>
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Участия</h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Мероприятие</TableHead>
                {hasTeams && <TableHead>Команда</TableHead>}
                <TableHead className="text-right">Балл</TableHead>
                <TableHead className="text-right">Перцентиль</TableHead>
                <TableHead className="w-28">Статус</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {person.participations.map((participation) => {
                const event = store.getEvent(participation.eventId)!;
                const team = participation.team;

                return (
                  <ClickableTableRow
                    key={participation.eventId}
                    to={routes.participation(
                      participation.eventId,
                      person.fullName,
                    )}
                  >
                    <TableCell>
                      <div className="text-primary">
                        {event.meta.name}{" "}
                        <span className="text-sm whitespace-nowrap text-muted-foreground/60">
                          {event.meta.date.getFullYear()}
                        </span>
                      </div>
                    </TableCell>
                    {hasTeams && (
                      <TableCell className="text-muted-foreground">
                        {team ? (
                          <ExternalLinkText
                            to={routes.team(participation.eventId, team)}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            className="text-muted-foreground hover:text-foreground hover:opacity-75"
                          >
                            {team}
                          </ExternalLinkText>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-right font-mono">
                      {formatNumber(participation.score)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {participation.percentile == null
                        ? "—"
                        : formatPercent(participation.percentile)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={participation.status}
                        winnerDegree={participation.winnerDegree}
                      />
                    </TableCell>
                  </ClickableTableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {person.favoriteTeammates.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <Users className="size-5" />
            Тиммейты
          </h2>
          <Card className="gap-0 py-3">
            <CardContent className="py-0">
              <div className="divide-y divide-border">
                {person.favoriteTeammates.map((teammate) => (
                  <div
                    key={teammate.fullName}
                    className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
                  >
                    <ExternalLinkText
                      to={routes.person(teammate.fullName)}
                      className="text-sm"
                    >
                      {teammate.fullName}
                    </ExternalLinkText>
                    <span className="text-xs text-muted-foreground">
                      {teammate.count}{" "}
                      {pluralize(teammate.count, [
                        "совместное мероприятие",
                        "совместных мероприятия",
                        "совместных мероприятий",
                      ])}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
