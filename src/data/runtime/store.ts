import { buildParticipationsData } from "@/data/runtime/processors/participations";
import { buildPersonData } from "@/data/runtime/processors/person";
import { buildRegionData } from "@/data/runtime/processors/region";
import { buildSchoolData } from "@/data/runtime/processors/school";
import { buildTeamData } from "@/data/runtime/processors/team";
import type {
  EventData,
  Participation,
  PersonData,
  RegionData,
  SchoolData,
  TeamData,
} from "@/data/types";
import type {
  EventId,
  FullName,
  Region,
  School,
  Slug,
  Team,
} from "@/data/types/base";
import { encodeSlug } from "@/lib/slug";

function buildSlugIndex<K extends string>(keys: Iterable<K>): Map<Slug, K> {
  const index = new Map<Slug, K>();

  for (const key of keys) {
    const component = encodeSlug(key);
    const existing = index.get(component);
    if (existing !== undefined && existing !== key) {
      throw new Error(
        `slug collision: "${key}" vs "${existing}" -> ${component}`,
      );
    }

    index.set(component, key);
  }

  return index;
}

export class DataStore {
  eventsData: Map<EventId, EventData>;
  participationsData: Map<EventId, Map<FullName, Participation>>;
  teamsData: Map<EventId, Map<Team, TeamData>>;
  personsData: Map<FullName, PersonData>;
  regionsData: Map<Region, RegionData>;
  schoolsData: Map<School, SchoolData>;

  private nameIndex: Map<Slug, FullName>;
  private teamIndex: Map<Slug, Team>;
  private schoolIndex: Map<Slug, School>;
  private regionIndex: Map<Slug, Region>;

  constructor(eventsData: EventData[]) {
    this.eventsData = new Map(eventsData.map((event) => [event.id, event]));
    this.participationsData = buildParticipationsData(this.eventsData);
    this.teamsData = buildTeamData(this.eventsData);
    this.personsData = buildPersonData(this.eventsData, this.teamsData);
    this.regionsData = buildRegionData(this.personsData);
    this.schoolsData = buildSchoolData(this.personsData);

    this.nameIndex = buildSlugIndex(this.personsData.keys());
    const teamNames = new Set<Team>();
    for (const eventTeams of this.teamsData.values()) {
      for (const team of eventTeams.keys()) {
        teamNames.add(team);
      }
    }
    this.teamIndex = buildSlugIndex(teamNames);
    this.schoolIndex = buildSlugIndex(this.schoolsData.keys());
    this.regionIndex = buildSlugIndex(this.regionsData.keys());
  }

  getEvents(): EventData[] {
    return [...this.eventsData.values()];
  }

  getEvent(eventId: EventId): EventData | null {
    return this.eventsData.get(eventId) ?? null;
  }

  getParticipation(eventId: EventId, fullName: FullName): Participation | null {
    return this.participationsData.get(eventId)?.get(fullName) ?? null;
  }

  getParticipationBySlug(eventId: EventId, slug: Slug): Participation | null {
    const fullName = this.nameIndex.get(slug);
    return fullName ? this.getParticipation(eventId, fullName) : null;
  }

  getTeams(eventId: EventId): TeamData[] | null {
    const teams = this.teamsData.get(eventId);
    return teams ? [...teams.values()] : null;
  }

  getTeam(eventId: EventId, team: Team): TeamData | null {
    return this.teamsData.get(eventId)?.get(team) ?? null;
  }

  getTeamBySlug(eventId: EventId, slug: Slug): TeamData | null {
    const team = this.teamIndex.get(slug);
    return team ? this.getTeam(eventId, team) : null;
  }

  getPersons(): PersonData[] {
    return [...this.personsData.values()];
  }

  getPerson(fullName: FullName): PersonData | null {
    return this.personsData.get(fullName) ?? null;
  }

  getPersonBySlug(slug: Slug): PersonData | null {
    const fullName = this.nameIndex.get(slug);
    return fullName ? this.getPerson(fullName) : null;
  }

  getRegions(): RegionData[] {
    return [...this.regionsData.values()];
  }

  getRegion(region: Region): RegionData | null {
    return this.regionsData.get(region) ?? null;
  }

  getRegionBySlug(slug: Slug): RegionData | null {
    const region = this.regionIndex.get(slug);
    return region ? this.getRegion(region) : null;
  }

  getSchool(school: School): SchoolData | null {
    return this.schoolsData.get(school) ?? null;
  }

  getSchoolBySlug(slug: Slug): SchoolData | null {
    const school = this.schoolIndex.get(slug);
    return school ? this.getSchool(school) : null;
  }

  getSchools(): SchoolData[] {
    return [...this.schoolsData.values()];
  }

  getAllTeams(): TeamData[] {
    const teams: TeamData[] = [];
    for (const eventTeams of this.teamsData.values()) {
      for (const team of eventTeams.values()) {
        teams.push(team);
      }
    }
    return teams;
  }
}
