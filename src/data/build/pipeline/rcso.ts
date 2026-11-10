import type { EventMeta } from "@/data/types/base";
import type { RcsoCatalog, RcsoLevel } from "@/data/types/rcso";
import { getAcademicYear } from "@/lib/academic";

export type RcsoLevelIndex = Map<number, Map<string, Map<string, RcsoLevel>>>;

export function buildRcsoLevelIndex(catalogs: RcsoCatalog[]): RcsoLevelIndex {
  const index: RcsoLevelIndex = new Map();

  for (const catalog of catalogs) {
    const byName = new Map<string, Map<string, RcsoLevel>>();
    index.set(catalog.year, byName);

    for (const olympiad of catalog.olympiads) {
      const byTrack = new Map<string, RcsoLevel>();
      byName.set(olympiad.name, byTrack);

      for (const track of olympiad.tracks) {
        byTrack.set(track.name, track.level);
      }
    }
  }

  return index;
}

export function resolveRcsoLevel(
  index: RcsoLevelIndex,
  meta: EventMeta,
): RcsoLevel {
  const year = getAcademicYear(meta.date);
  const level = index.get(year)?.get(meta.rcsoName!)?.get(meta.rcsoTrack!);

  if (level === undefined) {
    throw new Error(
      `${meta.id}: no RCSO level for "${meta.rcsoName}" / "${meta.rcsoTrack}" in catalog of ${year}`,
    );
  }

  return level;
}
