import { useEffect } from "react";
import { useLocation } from "react-router";

import { ExternalLinkText } from "@/components/shared/external-link";
import { RcsoTrendIcon } from "@/components/shared/rcso-trend-icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataStore } from "@/contexts/data-context";
import type { RcsoOlympiadHistoryEntry } from "@/data/runtime/store";
import { formatAcademicYear, formatRcsoLevel } from "@/lib/format";
import { trackLevelTrend } from "@/lib/rcso";
import { routes } from "@/lib/routes";

export function RcsoTrackHistoryTable({
  olympiadName,
  trackName,
  history,
}: {
  olympiadName: string;
  trackName: string;
  history: RcsoOlympiadHistoryEntry[];
}) {
  const store = useDataStore();
  const { hash } = useLocation();

  // Years in which this specific profile is present, newest first.
  const rows = history
    .flatMap((entry) => {
      const track = entry.olympiad.tracks.find((t) => t.name === trackName);
      return track ? [{ year: entry.year, track }] : [];
    })
    .sort((a, b) => b.year - a.year);

  const highlightYear = /^#y(\d{4})$/.exec(hash)?.[1];

  useEffect(() => {
    if (highlightYear) {
      document
        .getElementById(`rcso-y${highlightYear}`)
        ?.scrollIntoView({ block: "center" });
    }
  }, [highlightYear]);

  const hasResults = rows.some(
    ({ year }) => store.getEventIdByRcso(year, olympiadName, trackName) != null,
  );

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Год</TableHead>
            <TableHead>Предметы</TableHead>
            <TableHead>Уровень</TableHead>
            {hasResults && <TableHead>Результаты</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ year, track }) => {
            const eventId = store.getEventIdByRcso(
              year,
              olympiadName,
              trackName,
            );
            const trend = trackLevelTrend(history, year, trackName, {
              hideNew: true,
            });
            const isHighlighted = highlightYear === String(year);

            return (
              <TableRow
                key={year}
                id={`rcso-y${year}`}
                className={isHighlighted ? "bg-accent" : undefined}
              >
                <TableCell className="font-medium">
                  {formatAcademicYear(year)}
                </TableCell>
                <TableCell className="break-words whitespace-normal text-muted-foreground">
                  {track.subjects.join(", ")}
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
                      <ExternalLinkText to={routes.event(eventId)}>
                        Открыть
                      </ExternalLinkText>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
