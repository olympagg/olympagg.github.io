import { mean, standardDeviation } from "simple-statistics";

import cityRegions from "@/data/cityRegions.json";
import fullNameExclusions from "@/data/excludeFullNames.json";
import normalizedRegions from "@/data/normalizedRegions.json";
import normalizedSchools from "@/data/normalizedSchools.json";
import type { EventData, ParsedParticipation } from "@/data/types";
import type {
  EventId,
  EventMeta,
  FullName,
  Region,
  School,
} from "@/data/types/base";
import type { RcsoCatalog } from "@/data/types/rcso";
import { getParticipationGroupKey } from "@/lib/group";
import { buildTypoMapping } from "@/lib/typos";
import { groupBy, round } from "@/lib/utils";

import { calculateDistributions } from "./distribution";
import { buildRcsoLevelIndex, resolveRcsoLevel } from "./rcso";

const cityRegionsMapping: Record<string, string | null> = cityRegions;
const fullNamesToExclude = new Set<string>(fullNameExclusions);
const schoolsMapping: Record<string, string> = normalizedSchools;
const regionMapping: Record<string, string> = normalizedRegions;

function excludeFullNames(participations: ParsedParticipation[]) {
  return participations.map((participation) =>
    fullNamesToExclude.has(participation.fullName ?? "")
      ? { ...participation, fullName: undefined }
      : participation,
  );
}

function normalizeSchools(participations: ParsedParticipation[]) {
  return participations.map((participation) => {
    if (!participation.school) {
      return participation;
    }
    const normalizedSchool = schoolsMapping[participation.school];
    return normalizedSchool
      ? { ...participation, school: normalizedSchool as School }
      : participation;
  });
}

function resolveRegion(participation: ParsedParticipation): Region | undefined {
  let region = participation.region;

  if (!region && participation.city) {
    const fromCity = cityRegionsMapping[participation.city.toLowerCase()];
    if (fromCity) {
      region = fromCity as Region;
    }
  }

  if (region) {
    const normalized = regionMapping[region];
    return (normalized as Region | undefined) ?? region;
  }

  return region;
}

function normalizeRegions(participations: ParsedParticipation[]) {
  return participations.map((participation) => {
    const region = resolveRegion(participation);
    return region ? { ...participation, region } : participation;
  });
}

function calculateRanks(participations: ParsedParticipation[]) {
  const sortedParticipations = participations.toSorted(
    (a, b) => b.score - a.score,
  );

  const ranks = new Array<ParsedParticipation & { rank: number }>();

  for (const [index, participation] of sortedParticipations.entries()) {
    ranks.push({
      ...participation,
      rank:
        participation.score === ranks[ranks.length - 1]?.score
          ? ranks[ranks.length - 1]!.rank
          : index + 1,
    });
  }

  return ranks;
}

interface Percentiles {
  percentile: number;
  zScore?: number;
}

function calculatePercentiles(
  participations: ParsedParticipation[],
  percentileRanking: EventMeta["percentileRanking"],
) {
  const groups = groupBy(participations, (participation) =>
    getParticipationGroupKey(percentileRanking, participation),
  );

  const results = new Array<ParsedParticipation & Percentiles>();

  for (const [_, entries] of groups) {
    const scores = entries.map((item) => item.score);

    const avg = mean(scores);
    const std = scores.length >= 2 ? standardDeviation(scores) : 0;

    const sortedScores = scores.toSorted((a, b) => a - b);

    const firstIndexByScore = new Map<number, number>();
    for (const [index, score] of sortedScores.entries()) {
      if (!firstIndexByScore.has(score)) {
        firstIndexByScore.set(score, index);
      }
    }

    const othersCount = scores.length - 1;

    for (const item of entries) {
      const lowerCount = firstIndexByScore.get(item.score)!;

      const percentile =
        othersCount <= 0 ? 0 : round((lowerCount / othersCount) * 100, 1);

      const zScore = std !== 0 ? round((item.score - avg) / std, 1) : undefined;

      results.push({
        ...item,
        percentile,
        zScore,
      });
    }
  }

  return results;
}

function removeEmptyFullNames<T extends { fullName?: string }>(
  participations: T[],
) {
  return participations.filter((p) => p.fullName) as (T & {
    fullName: string;
  })[];
}

function addEventId<T>(participations: T[], eventId: EventId) {
  return participations.map((participation) => ({
    eventId: eventId,
    ...participation,
  }));
}

export interface ParsedEvent {
  id: EventId;
  meta: EventMeta;
  parsedParticipations: ParsedParticipation[];
}

function expandShortNames(parsedEvents: ParsedEvent[]): void {
  const nameRegions = new Map<FullName, Set<Region>>();

  for (const { parsedParticipations } of parsedEvents) {
    for (const participation of parsedParticipations) {
      if (!participation.fullName) {
        continue;
      }

      let regions = nameRegions.get(participation.fullName);
      if (!regions) {
        regions = new Set();
        nameRegions.set(participation.fullName, regions);
      }

      const region = resolveRegion(participation);
      if (region) {
        regions.add(region);
      }
    }
  }

  const byShortName = new Map<string, FullName[]>();
  for (const name of nameRegions.keys()) {
    const parts = name.split(" ");
    if (parts.length < 2) {
      continue;
    }

    const shortName = `${parts[0]} ${parts[1]}`;
    const group = byShortName.get(shortName);
    if (group) {
      group.push(name);
    } else {
      byShortName.set(shortName, [name]);
    }
  }

  const mapping = new Map<FullName, FullName>();

  for (const group of byShortName.values()) {
    if (group.length < 2) {
      continue;
    }

    for (const shortName of group) {
      const shortRegions = nameRegions.get(shortName)!;

      const candidates = group.filter((candidate) => {
        if (!candidate.startsWith(shortName + " ")) {
          return false;
        }

        const candidateRegions = nameRegions.get(candidate)!;
        if (shortRegions.size > 0 && candidateRegions.size > 0) {
          // Reject different regions
          return candidateRegions.intersection(shortRegions).size > 0;
        }

        return true;
      });

      if (candidates.length === 1) {
        mapping.set(shortName, candidates[0]!);
      }
    }
  }

  for (const { parsedParticipations } of parsedEvents) {
    for (const participation of parsedParticipations) {
      if (participation.fullName && mapping.has(participation.fullName)) {
        participation.fullName = mapping.get(participation.fullName)!;
      }
    }
  }

  console.log(`Expanded ${mapping.size} short names`);
}

function fixTypos(parsedEvents: ParsedEvent[]): void {
  const frequency = new Map<FullName, number>();
  for (const { parsedParticipations } of parsedEvents) {
    for (const { fullName } of parsedParticipations) {
      if (fullName) {
        frequency.set(fullName, (frequency.get(fullName) ?? 0) + 1);
      }
    }
  }

  const mapping = buildTypoMapping(frequency);

  for (const { parsedParticipations } of parsedEvents) {
    for (const participation of parsedParticipations) {
      if (participation.fullName && mapping.has(participation.fullName)) {
        participation.fullName = mapping.get(participation.fullName)!;
      }
    }
  }

  console.log(`Fixed ${mapping.size} typo names`);
}

function buildSingleEvent(event: ParsedEvent): EventData {
  let { parsedParticipations } = event;

  parsedParticipations = excludeFullNames(parsedParticipations);
  parsedParticipations = normalizeSchools(parsedParticipations);
  parsedParticipations = normalizeRegions(parsedParticipations);

  const distributions = event.meta.percentileRanking
    ? calculateDistributions(parsedParticipations, event.meta)
    : undefined;

  if (event.meta.percentileRanking) {
    parsedParticipations = calculatePercentiles(
      parsedParticipations,
      event.meta.percentileRanking,
    );
  }

  const participations = addEventId(
    removeEmptyFullNames(calculateRanks(parsedParticipations)),
    event.id,
  );
  participations.sort((a, b) => {
    if (a.score !== b.score) {
      return b.score - a.score;
    }

    if (
      a.participationGrade &&
      b.participationGrade &&
      a.participationGrade !== b.participationGrade
    ) {
      return b.participationGrade - a.participationGrade;
    }

    return a.fullName.localeCompare(b.fullName);
  });

  return {
    id: event.id,
    meta: event.meta,
    participations,
    distributions,
  };
}

export function buildEventData(
  parsedEvents: ParsedEvent[],
  rcsoCatalogs: RcsoCatalog[],
): Map<EventId, EventData> {
  expandShortNames(parsedEvents);
  fixTypos(parsedEvents);

  parsedEvents.sort((a, b) => {
    const aTime = a.meta.date.getTime();
    const bTime = b.meta.date.getTime();
    if (aTime !== bTime) {
      return bTime - aTime;
    }

    return a.id.localeCompare(b.id);
  });

  const rcsoLevelIndex = buildRcsoLevelIndex(rcsoCatalogs);
  const eventsData = new Map<EventId, EventData>();

  for (const parsedEvent of parsedEvents) {
    if (parsedEvent.meta.rcsoName) {
      parsedEvent.meta = {
        ...parsedEvent.meta,
        rcsoLevel: resolveRcsoLevel(rcsoLevelIndex, parsedEvent.meta),
      };
    }

    const event = buildSingleEvent(parsedEvent);
    eventsData.set(event.id, event);
  }

  return eventsData;
}
