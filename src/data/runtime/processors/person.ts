import { median } from "simple-statistics";

import type {
  EventData,
  Participation,
  ParticipationHint,
  PersonData,
  TeamData,
} from "@/data/types";
import type { EventId, FullName, Team } from "@/data/types/base";
import { getAcademicYearEnd } from "@/lib/academic";
import { MAX_SCHOOL_GRADE, MIN_TEAMMATE_COUNT } from "@/lib/constants";
import { groupBy, range, sorted } from "@/lib/utils";

const HINT_GRADES_SPAN = 2;
const HINT_EVENT_TYPES = new Set([
  "ntoai",
  "ntoar",
  "ntoarch",
  "ntoats",
  "ntoavia",
  "ntobdml",
  "ntobio",
  "ntobsec",
  "ntocity",
  "ntofly",
  "ntofme",
  "ntoge",
  "ntoich",
  "ntoies",
  "ntomat",
  "ntoncog",
  "ntonucl",
  "ntoqeng",
  "ntourb",
  "ntovr",
  "ntowrls",
  "reo",
  "rmo",
  "rocs",
  "rpho",
  "rro",
]);

function getEventType(eventId: EventId) {
  return eventId.slice(0, -2);
}

function findGraduationYear(
  eventsData: Map<EventId, EventData>,
  participations: Participation[],
) {
  // Prioritize studyGrade over participationGrade
  for (const field of ["studyGrade", "participationGrade"] as const) {
    for (const participation of participations) {
      if (participation[field]) {
        const grade = participation[field];

        const eventDate = eventsData.get(participation.eventId)!.meta.date;
        const eventYear = getAcademicYearEnd(eventDate);

        return eventYear + (MAX_SCHOOL_GRADE - grade);
      }
    }
  }

  return null;
}

interface HintSource {
  latest: EventData;
  years: Set<number>;
}

function buildHintSources(
  eventsData: Map<EventId, EventData>,
): Map<string, HintSource> {
  const hintSources = new Map<string, HintSource>();
  const eventsByType = groupBy(eventsData.values(), (e) => getEventType(e.id));

  for (const [type, events] of eventsByType) {
    if (HINT_EVENT_TYPES.has(type)) {
      hintSources.set(type, {
        latest: sorted(events, (e) => e.id).at(-1)!,
        years: new Set(events.map((e) => e.meta.date.getFullYear())),
      });
    }
  }

  return hintSources;
}

function findParticipationHints(
  hintSources: Map<string, HintSource>,
  participations: Participation[],
  graduationYear: number | null,
): ParticipationHint[] {
  if (graduationYear == null) {
    return [];
  }

  const today = new Date();
  const types = new Set(participations.map((p) => getEventType(p.eventId)));

  return [...types].flatMap((type) => {
    const source = hintSources.get(type);
    if (!source) {
      return [];
    }

    return range(graduationYear - HINT_GRADES_SPAN, graduationYear + 1)
      .filter((year) => !source.years.has(year))
      .map((year) => {
        const date = new Date(source.latest.meta.date);
        date.setFullYear(year);
        return { name: source.latest.meta.name, date };
      })
      .filter((hint) => hint.date <= today);
  });
}

function findTeammates(
  participations: Participation[],
  teamsData: Map<EventId, Map<Team, TeamData>>,
  eventsData: Map<EventId, EventData>,
) {
  const teammates = new Map<FullName, { count: number; lastDate: Date }>();

  for (const participation of participations) {
    const team = participation.team;
    if (!team) {
      continue;
    }

    const teamData = teamsData.get(participation.eventId)!.get(team)!;
    const date = eventsData.get(participation.eventId)!.meta.date;

    for (const teammate of teamData.participations) {
      if (teammate.fullName === participation.fullName) {
        continue;
      }

      if (!teammates.has(teammate.fullName)) {
        teammates.set(teammate.fullName, { count: 0, lastDate: date });
      }

      const entry = teammates.get(teammate.fullName)!;
      entry.count += 1;
      if (date > entry.lastDate) {
        entry.lastDate = date;
      }
    }
  }

  return [...teammates.entries()]
    .filter(([, { count }]) => count >= MIN_TEAMMATE_COUNT)
    .sort(
      ([nameA, a], [nameB, b]) =>
        b.count - a.count ||
        b.lastDate.getTime() - a.lastDate.getTime() ||
        nameA.localeCompare(nameB),
    )
    .map(([fullName, { count }]) => ({ fullName, count }));
}

export function buildPersonData(
  eventsData: Map<EventId, EventData>,
  teamsData: Map<EventId, Map<Team, TeamData>>,
): Map<FullName, PersonData> {
  const allParticipations = eventsData
    .values()
    .flatMap((event) => event.participations);

  const personParticipations = new Map<FullName, Participation[]>();
  for (const participation of allParticipations) {
    const participations = personParticipations.get(participation.fullName);
    if (participations) {
      participations.push(participation);
    } else {
      personParticipations.set(participation.fullName, [participation]);
    }
  }

  const hintSources = buildHintSources(eventsData);

  const persons = new Map<FullName, PersonData>();
  for (const [fullName, participations] of personParticipations.entries()) {
    const graduationYear = findGraduationYear(eventsData, participations);

    const school = participations.find((p) => p.school)?.school ?? null;
    const region = participations.find((p) => p.region)?.region ?? null;

    const medianScoreRate = median(
      participations.map(
        (p) => p.score / eventsData.get(p.eventId)!.meta.maxScore,
      ),
    );

    const percentiles = participations
      .map((p) => p.percentile)
      .filter((p): p is number => p !== undefined);
    const medianPercentile =
      percentiles.length > 0 ? median(percentiles) : null;

    const zScores = participations
      .map((p) => p.zScore)
      .filter((s): s is number => s !== undefined);
    const medianZScore = zScores.length > 0 ? median(zScores) : null;

    const favoriteTeammates = findTeammates(
      participations,
      teamsData,
      eventsData,
    );

    persons.set(fullName, {
      fullName,
      school,
      region,
      graduationYear,
      medianScoreRate,
      medianPercentile,
      medianZScore,
      favoriteTeammates,
      participations,
      participationHints: findParticipationHints(
        hintSources,
        participations,
        graduationYear,
      ),
    });
  }

  return persons;
}
