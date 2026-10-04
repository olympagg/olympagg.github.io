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
import type { RcsoCatalog, RcsoOlympiad, RcsoOrder } from "@/data/types/rcso";
import { getAcademicYear } from "@/lib/academic";
import { encodeSlug } from "@/lib/slug";

export interface RcsoOlympiadHistoryEntry {
  year: number;
  order: RcsoOrder;
  olympiad: RcsoOlympiad;
}

function rcsoEventKey(year: number, name: string, track: string): string {
  return `${year}\0${name}\0${track}`;
}

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

  rcsoCatalogs: RcsoCatalog[];

  private nameIndex: Map<Slug, FullName>;
  private teamIndex: Map<Slug, Team>;
  private schoolIndex: Map<Slug, School>;
  private regionIndex: Map<Slug, Region>;

  private rcsoOlympiadIndex: Map<Slug, string>;
  private rcsoTrackIndex: Map<string, Map<Slug, string>>;
  private rcsoEventIndex: Map<string, EventId>;

  constructor(eventsData: EventData[], rcsoCatalogs: RcsoCatalog[] = []) {
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

    this.rcsoCatalogs = [...rcsoCatalogs].sort((a, b) => a.year - b.year);

    const olympiadNames = new Set<string>();
    const trackNamesByOlympiad = new Map<string, Set<string>>();
    for (const catalog of this.rcsoCatalogs) {
      for (const olympiad of catalog.olympiads) {
        olympiadNames.add(olympiad.name);
        let trackNames = trackNamesByOlympiad.get(olympiad.name);
        if (!trackNames) {
          trackNames = new Set<string>();
          trackNamesByOlympiad.set(olympiad.name, trackNames);
        }
        for (const track of olympiad.tracks) {
          trackNames.add(track.name);
        }
      }
    }
    this.rcsoOlympiadIndex = buildSlugIndex(olympiadNames);
    this.rcsoTrackIndex = new Map();
    for (const [name, trackNames] of trackNamesByOlympiad) {
      this.rcsoTrackIndex.set(name, buildSlugIndex(trackNames));
    }

    this.rcsoEventIndex = new Map();
    for (const event of this.eventsData.values()) {
      const { rcsoName, rcsoTrack } = event.meta;
      if (rcsoName && rcsoTrack) {
        const year = getAcademicYear(event.meta.date);
        this.rcsoEventIndex.set(
          rcsoEventKey(year, rcsoName, rcsoTrack),
          event.id,
        );
      }
    }
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

  getRcsoCatalogs(): RcsoCatalog[] {
    return this.rcsoCatalogs;
  }

  getRcsoCatalog(year: number): RcsoCatalog | null {
    return this.rcsoCatalogs.find((catalog) => catalog.year === year) ?? null;
  }

  getRcsoOlympiadName(slug: Slug): string | null {
    return this.rcsoOlympiadIndex.get(slug) ?? null;
  }

  getRcsoTrackName(olympiadName: string, trackSlug: Slug): string | null {
    return this.rcsoTrackIndex.get(olympiadName)?.get(trackSlug) ?? null;
  }

  getRcsoOlympiadHistory(name: string): RcsoOlympiadHistoryEntry[] {
    const history: RcsoOlympiadHistoryEntry[] = [];
    for (const catalog of this.rcsoCatalogs) {
      const olympiad = catalog.olympiads.find((o) => o.name === name);
      if (olympiad) {
        history.push({ year: catalog.year, order: catalog.order, olympiad });
      }
    }
    return history;
  }

  getEventIdByRcso(
    year: number,
    rcsoName: string,
    rcsoTrack: string,
  ): EventId | null {
    return (
      this.rcsoEventIndex.get(rcsoEventKey(year, rcsoName, rcsoTrack)) ?? null
    );
  }
}
