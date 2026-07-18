import { useDeferredValue, useMemo } from "react";

import { useDataStore, useSearchIndex } from "@/contexts/data-context";
import { FULL_LIMITS, runSearch } from "@/data/runtime/search";
import type { SearchCounts } from "@/data/runtime/search";
import type {
  EventData,
  PersonData,
  RegionData,
  SchoolData,
} from "@/data/types";
import type { EventId, EventMeta, Team } from "@/data/types/base";

export interface TeamRow {
  team: Team;
  eventId: EventId;
  eventMeta: EventMeta;
  rank: number;
}

export interface FullSearchResults {
  personResults: PersonData[];
  eventResults: EventData[];
  teamResults: TeamRow[];
  schoolResults: SchoolData[];
  regionResults: RegionData[];
  counts: SearchCounts;
  loading: boolean;
}

const EMPTY: Omit<FullSearchResults, "loading"> = {
  personResults: [],
  eventResults: [],
  teamResults: [],
  schoolResults: [],
  regionResults: [],
  counts: { event: 0, person: 0, team: 0, school: 0, region: 0 },
};

export function useFullSearch(query: string): FullSearchResults {
  const store = useDataStore();
  const searchIndex = useSearchIndex();

  const trimmedQuery = query.trim();
  const deferredQuery = useDeferredValue(trimmedQuery);

  const data = useMemo<Omit<FullSearchResults, "loading">>(() => {
    if (deferredQuery.length < 2) {
      return EMPTY;
    }

    const results = runSearch(deferredQuery, searchIndex, FULL_LIMITS);

    const personResults: PersonData[] = [];
    const eventResults: EventData[] = [];
    const teamResults: TeamRow[] = [];
    const schoolResults: SchoolData[] = [];
    const regionResults: RegionData[] = [];

    for (const result of results) {
      switch (result.type) {
        case "person": {
          const person = store.getPerson(result.fullName);
          if (person) {
            personResults.push(person);
          }
          break;
        }
        case "event": {
          const event = store.getEvent(result.eventId);
          if (event) {
            eventResults.push(event);
          }
          break;
        }
        case "team": {
          const team = store.getTeam(result.eventId, result.team);
          if (team) {
            teamResults.push({
              team: result.team,
              eventId: result.eventId,
              eventMeta: result.eventMeta,
              rank: team.rank,
            });
          }
          break;
        }
        case "school": {
          const school = store.getSchool(result.school);
          if (school) {
            schoolResults.push(school);
          }
          break;
        }
        case "region": {
          const region = store.getRegion(result.region);
          if (region) {
            regionResults.push(region);
          }
          break;
        }
      }
    }

    return {
      personResults,
      eventResults,
      teamResults,
      schoolResults,
      regionResults,
      counts: {
        person: personResults.length,
        event: eventResults.length,
        team: teamResults.length,
        school: schoolResults.length,
        region: regionResults.length,
      },
    };
  }, [store, searchIndex, deferredQuery]);

  return {
    ...data,
    loading: trimmedQuery !== deferredQuery,
  };
}
