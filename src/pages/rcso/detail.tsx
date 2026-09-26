import { LinkIcon, ScrollText, Trophy } from "lucide-react";
import { useMemo } from "react";

import { BackButton } from "@/components/shared/back-button";
import { ClickableTableRow } from "@/components/shared/clickable-table-row";
import { ExternalLinkText } from "@/components/shared/external-link";
import { MetaItem, MetaRow } from "@/components/shared/meta-row";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { RcsoTrendIcon } from "@/components/shared/rcso-trend-icon";
import { YearPicker } from "@/components/shared/year-picker";
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
import { useYearParam } from "@/hooks/year-param";
import { formatRcsoLevel, formatSubjects } from "@/lib/format";
import { trackLevelTrend } from "@/lib/rcso";
import { routes, useRcsoOlympiadParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { pluralize } from "@/lib/utils";

export function RcsoOlympiadPage() {
  const { slug } = useRcsoOlympiadParams();
  const store = useDataStore();

  const name = store.getRcsoOlympiadName(slug);
  const history = useMemo(
    () => (name ? store.getRcsoOlympiadHistory(name) : []),
    [store, name],
  );

  const years = history.map((entry) => entry.year);
  const [selectedYear, setYear] = useYearParam(years);

  const entry = history.find((item) => item.year === selectedYear) ?? null;

  const tracks = useMemo(
    () =>
      entry
        ? [...entry.olympiad.tracks].sort((a, b) =>
            a.name.localeCompare(b.name, "ru"),
          )
        : [],
    [entry],
  );

  if (!name || !entry || selectedYear == null) {
    return <NotFoundMessage message="Олимпиада не найдена" />;
  }

  // Official name and site are taken from the most recent catalog year.
  const latest = history[history.length - 1]!.olympiad;

  const hasResults = tracks.some(
    (track) => store.getEventIdByRcso(selectedYear, name, track.name) != null,
  );

  return (
    <div className="space-y-6">
      <title>{pageTitle(name)}</title>
      <BackButton />

      <div>
        <h1 className="flex items-start gap-2 text-2xl font-bold tracking-tight">
          <Trophy className="mt-1 size-6 shrink-0" />
          <span>{name}</span>
        </h1>
        <MetaRow className="mt-2">
          {latest.catalogName !== name && (
            <MetaItem icon={ScrollText}>{latest.catalogName}</MetaItem>
          )}
          {latest.url && (
            <MetaItem
              icon={LinkIcon}
              href={latest.url}
              className="transition-colors hover:text-foreground"
            >
              {latest.url}
            </MetaItem>
          )}
        </MetaRow>

        <YearPicker
          className="mt-3"
          years={years}
          selected={selectedYear}
          onSelect={setYear}
        />
      </div>

      <Separator />

      <div>
        <h2 className="mb-3 text-lg font-semibold">
          {tracks.length}{" "}
          {pluralize(tracks.length, ["профиль", "профиля", "профилей"])}
        </h2>
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Профиль</TableHead>
                <TableHead>Предметы</TableHead>
                <TableHead>Уровень</TableHead>
                {hasResults && <TableHead>Результаты</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map((track) => {
                const eventId = store.getEventIdByRcso(
                  selectedYear,
                  name,
                  track.name,
                );
                const trend = trackLevelTrend(
                  history,
                  selectedYear,
                  track.name,
                );

                return (
                  <ClickableTableRow
                    key={track.name}
                    to={routes.rcsoTrack(name, track.name, selectedYear)}
                  >
                    <TableCell>
                      <div
                        className="max-w-[45vw] truncate sm:max-w-xs"
                        title={track.name}
                      >
                        {track.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span title={track.subjects.join(", ")}>
                        {formatSubjects(track.subjects)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center">
                        {formatRcsoLevel(track.level)}
                        <RcsoTrendIcon trend={trend} />
                      </span>
                    </TableCell>
                    {hasResults && (
                      <TableCell>
                        {eventId && (
                          <ExternalLinkText
                            to={routes.event(eventId)}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            Открыть
                          </ExternalLinkText>
                        )}
                      </TableCell>
                    )}
                  </ClickableTableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
