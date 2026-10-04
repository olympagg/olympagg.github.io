import type { RcsoOlympiadHistoryEntry } from "@/data/runtime/store";

export type RcsoTrend = "new" | "up" | "down" | null;

export function trackLevelTrend(
  history: RcsoOlympiadHistoryEntry[],
  year: number,
  trackName: string,
  { hideNew = false }: { hideNew?: boolean } = {},
): RcsoTrend {
  const index = history.findIndex((entry) => entry.year === year);
  if (index <= 0) {
    return null;
  }

  const current = history[index]!.olympiad.tracks.find(
    (track) => track.name === trackName,
  );
  if (!current) {
    return null;
  }

  const previous = history[index - 1]!.olympiad.tracks.find(
    (track) => track.name === trackName,
  );
  if (!previous) {
    return hideNew ? null : "new";
  }

  if (current.level < previous.level) {
    return "up";
  }
  if (current.level > previous.level) {
    return "down";
  }
  return null;
}
