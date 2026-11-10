import type { ParsedParticipation } from "@/data/types";
import type { EventMeta } from "@/data/types/base";
import { formatTrackName } from "@/lib/format";

export function getParticipationGroupKey(
  percentileRanking: EventMeta["percentileRanking"],
  participation: Pick<ParsedParticipation, "participationGrade" | "track">,
): string | null {
  if (!percentileRanking) {
    return null;
  }
  if (percentileRanking === true) {
    return "all";
  }

  const value = participation[percentileRanking];
  if (value == null) {
    throw new Error(
      `percentileRanking is "${percentileRanking}" but participation is missing that field`,
    );
  }

  return String(value);
}

export function formatGroupContext(
  percentileRanking: EventMeta["percentileRanking"],
  participation: Pick<ParsedParticipation, "participationGrade" | "track">,
): string | null {
  if (
    percentileRanking === "participationGrade" &&
    participation.participationGrade != null
  ) {
    return `в ${participation.participationGrade} классе`;
  }

  if (percentileRanking === "track" && participation.track) {
    return `в треке ${formatTrackName(participation.track)}`;
  }

  return null;
}
