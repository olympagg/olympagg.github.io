import { Index } from "flexsearch";

import type {
  EventData,
  PersonData,
  RegionData,
  SchoolData,
  TeamData,
} from "../types";
import type {
  EventId,
  EventMeta,
  FullName,
  Region,
  School,
  Team,
} from "../types/base";

export interface PersonSearchResult {
  type: "person";
  fullName: FullName;
  school: School | null;
}

export interface EventSearchResult {
  type: "event";
  eventId: EventId;
  eventMeta: EventMeta;
}

export interface TeamSearchResult {
  type: "team";
  eventId: EventId;
  eventMeta: EventMeta;
  team: Team;
}

export interface SchoolSearchResult {
  type: "school";
  school: School;
  personCount: number;
}

export interface RegionSearchResult {
  type: "region";
  region: Region;
  personCount: number;
}

export type SearchResult =
  | PersonSearchResult
  | EventSearchResult
  | TeamSearchResult
  | SchoolSearchResult
  | RegionSearchResult;

interface PersonItem {
  fullName: FullName;
  school: School | null;
}

interface EventItem {
  eventId: EventId;
  eventMeta: EventMeta;
}

interface TeamItem {
  eventId: EventId;
  eventMeta: EventMeta;
  team: Team;
}

interface SchoolItem {
  school: School;
  personCount: number;
}

interface RegionItem {
  region: Region;
  personCount: number;
}

export interface SearchIndex {
  personsIndex: Index;
  eventsIndex: Index; // indexes: name + id
  eventsUrlIndex: Index; // indexes: url (full tokenizer for substring matching)
  teamsIndex: Index; // indexes: team + eventName
  schoolsIndex: Index;
  regionsIndex: Index;

  // Backing data arrays
  personsData: PersonItem[];
  eventsData: EventItem[];
  teamsData: TeamItem[];
  schoolsData: SchoolItem[];
  regionsData: RegionItem[];
}

export interface SearchableStore {
  getPersons(): PersonData[];
  getEvents(): EventData[];
  getAllTeams(): TeamData[];
  getSchools(): SchoolData[];
  getRegions(): RegionData[];
  getEvent(id: EventId): EventData | null;
}

const TEXT_ENCODER = { normalize: true } as const;

function makeIndex(tokenize: "forward" | "full", resolution: number): Index {
  return new Index({
    tokenize,
    resolution,
    encoder: TEXT_ENCODER,
    cache: true,
  });
}

export function buildSearchIndex(store: SearchableStore): SearchIndex {
  const personsIndex = makeIndex("forward", 9);
  const eventsIndex = makeIndex("forward", 9);
  const eventsUrlIndex = makeIndex("full", 3);
  const teamsIndex = makeIndex("forward", 9);
  const schoolsIndex = makeIndex("forward", 9);
  const regionsIndex = makeIndex("forward", 9);

  const personsData: PersonItem[] = store.getPersons().map((p) => ({
    fullName: p.fullName,
    school: p.school,
  }));
  for (let i = 0; i < personsData.length; i++) {
    personsIndex.add(i, personsData[i]!.fullName);
  }

  const eventsData: EventItem[] = store.getEvents().map((e) => ({
    eventId: e.id,
    eventMeta: e.meta,
  }));
  for (let i = 0; i < eventsData.length; i++) {
    const { eventMeta, eventId } = eventsData[i]!;
    eventsIndex.add(i, `${eventMeta.name} ${eventId}`);
    eventsUrlIndex.add(i, eventMeta.url);
  }

  const teamsData: TeamItem[] = store.getAllTeams().map((t) => ({
    eventId: t.eventId,
    eventMeta: store.getEvent(t.eventId)!.meta,
    team: t.team,
  }));
  for (let i = 0; i < teamsData.length; i++) {
    const { team, eventMeta } = teamsData[i]!;
    teamsIndex.add(i, `${team} ${eventMeta.name}`);
  }

  const schoolsData: SchoolItem[] = store.getSchools().map((s) => ({
    school: s.school,
    personCount: s.persons.length,
  }));
  for (let i = 0; i < schoolsData.length; i++) {
    schoolsIndex.add(i, schoolsData[i]!.school);
  }

  const regionsData: RegionItem[] = store.getRegions().map((r) => ({
    region: r.region,
    personCount: r.persons.length,
  }));
  for (let i = 0; i < regionsData.length; i++) {
    regionsIndex.add(i, regionsData[i]!.region);
  }

  return {
    personsIndex,
    eventsIndex,
    eventsUrlIndex,
    teamsIndex,
    schoolsIndex,
    regionsIndex,
    personsData,
    eventsData,
    teamsData,
    schoolsData,
    regionsData,
  };
}

export interface SearchLimits {
  events: number;
  persons: number;
  teams: number;
  schools: number;
  regions: number;
}

const LIMITS: SearchLimits = {
  events: 5,
  persons: 8,
  teams: 6,
  schools: 5,
  regions: 5,
};

/** Effectively-unbounded limits for the full search results page. */
export const FULL_LIMITS: SearchLimits = {
  events: 10000,
  persons: 10000,
  teams: 10000,
  schools: 10000,
  regions: 10000,
};

function eventHitIds(
  query: string,
  index: SearchIndex,
  limit: number,
): number[] {
  const hits = new Set<number>(
    index.eventsIndex.search(query, { limit }) as number[],
  );

  if (hits.size < limit) {
    const urlHits = index.eventsUrlIndex.search(query, {
      limit: limit - hits.size,
    }) as number[];
    for (const id of urlHits) {
      hits.add(id);
    }
  }

  return [...hits];
}

export function runSearch(
  query: string,
  index: SearchIndex,
  limits: SearchLimits = LIMITS,
): SearchResult[] {
  const q = query.trim();
  if (q.length < 2) {
    return [];
  }

  const results: SearchResult[] = [];

  for (const id of eventHitIds(q, index, limits.events)) {
    const item = index.eventsData[id]!;
    results.push({
      type: "event",
      eventId: item.eventId,
      eventMeta: item.eventMeta,
    });
  }

  const personHits = index.personsIndex.search(q, {
    limit: limits.persons,
    suggest: true,
  }) as number[];
  for (const id of personHits) {
    const item = index.personsData[id]!;
    results.push({
      type: "person",
      fullName: item.fullName,
      school: item.school,
    });
  }

  const teamHits = index.teamsIndex.search(q, {
    limit: limits.teams,
    suggest: true,
  }) as number[];
  for (const id of teamHits) {
    const item = index.teamsData[id]!;
    results.push({
      type: "team",
      eventId: item.eventId,
      eventMeta: item.eventMeta,
      team: item.team,
    });
  }

  const schoolHits = index.schoolsIndex.search(q, {
    limit: limits.schools,
    suggest: true,
  }) as number[];
  for (const id of schoolHits) {
    const item = index.schoolsData[id]!;
    results.push({
      type: "school",
      school: item.school,
      personCount: item.personCount,
    });
  }

  const regionHits = index.regionsIndex.search(q, {
    limit: limits.regions,
  }) as number[];
  for (const id of regionHits) {
    const item = index.regionsData[id]!;
    results.push({
      type: "region",
      region: item.region,
      personCount: item.personCount,
    });
  }

  return results;
}

export type SearchCounts = Record<SearchResult["type"], number>;

export const EMPTY_COUNTS: SearchCounts = {
  event: 0,
  person: 0,
  team: 0,
  school: 0,
  region: 0,
};

/**
 * Returns the total number of matches per type, ignoring display limits.
 * Lighter than runSearch: it only counts hit IDs without building result objects.
 */
export function searchCounts(query: string, index: SearchIndex): SearchCounts {
  const q = query.trim();
  if (q.length < 2) {
    return { ...EMPTY_COUNTS };
  }

  return {
    event: eventHitIds(q, index, FULL_LIMITS.events).length,
    person: (
      index.personsIndex.search(q, {
        limit: FULL_LIMITS.persons,
        suggest: true,
      }) as number[]
    ).length,
    team: (
      index.teamsIndex.search(q, {
        limit: FULL_LIMITS.teams,
        suggest: true,
      }) as number[]
    ).length,
    school: (
      index.schoolsIndex.search(q, {
        limit: FULL_LIMITS.schools,
        suggest: true,
      }) as number[]
    ).length,
    region: (
      index.regionsIndex.search(q, { limit: FULL_LIMITS.regions }) as number[]
    ).length,
  };
}
