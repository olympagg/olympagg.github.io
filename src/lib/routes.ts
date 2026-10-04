import { useParams } from "react-router";

import type {
  EventId,
  FullName,
  Region,
  School,
  Slug,
  Team,
} from "@/data/types/base";
import { encodeSlug } from "@/lib/slug";

export const routes = {
  home: () => "/",
  search: (q?: string) =>
    q?.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : "/search",
  event: (eventId: EventId) => `/event/${eventId}`,
  participation: (eventId: EventId, fullName: FullName) =>
    `/event/${eventId}/participant/${encodeSlug(fullName)}`,
  team: (eventId: EventId, team: Team) =>
    `/event/${eventId}/team/${encodeSlug(team)}`,
  person: (fullName: FullName) => `/person/${encodeSlug(fullName)}`,
  school: (school: School) => `/school/${encodeSlug(school)}`,
  region: (region: Region) => `/region/${encodeSlug(region)}`,
  rcso: (year?: number) => (year != null ? `/rcso?year=${year}` : "/rcso"),
  rcsoOlympiad: (name: string, year?: number) => {
    const base = `/rcso/${encodeSlug(name)}`;
    return year != null ? `${base}?year=${year}` : base;
  },
  rcsoTrack: (name: string, track: string, year?: number) => {
    const base = `/rcso/${encodeSlug(name)}/${encodeSlug(track)}`;
    return year != null ? `${base}#y${year}` : base;
  },
} as const;

export function useEventParams(): { eventId: EventId } {
  const { eventId = "" } = useParams();
  return { eventId: eventId as EventId };
}

export function useParticipationParams(): { eventId: EventId; slug: Slug } {
  const { eventId = "", slug = "" } = useParams();
  return { eventId: eventId as EventId, slug: slug as Slug };
}

export function useTeamParams(): { eventId: EventId; slug: Slug } {
  const { eventId = "", slug = "" } = useParams();
  return { eventId: eventId as EventId, slug: slug as Slug };
}

export function usePersonParams(): { slug: Slug } {
  const { slug = "" } = useParams();
  return { slug: slug as Slug };
}

export function useSchoolParams(): { slug: Slug } {
  const { slug = "" } = useParams();
  return { slug: slug as Slug };
}

export function useRegionParams(): { slug: Slug } {
  const { slug = "" } = useParams();
  return { slug: slug as Slug };
}

export function useRcsoOlympiadParams(): { slug: Slug } {
  const { olympiadSlug = "" } = useParams();
  return { slug: olympiadSlug as Slug };
}

export function useRcsoTrackParams(): { olympiadSlug: Slug; trackSlug: Slug } {
  const { olympiadSlug = "", trackSlug = "" } = useParams();
  return {
    olympiadSlug: olympiadSlug as Slug,
    trackSlug: trackSlug as Slug,
  };
}
