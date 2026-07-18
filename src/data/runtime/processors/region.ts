import type { PersonData, RegionData } from "../../types";
import type { FullName, Region } from "../../types/base";

export function buildRegionData(
  personsData: Map<FullName, PersonData>,
): Map<Region, RegionData> {
  const regions = new Map<Region, RegionData>();

  for (const person of personsData.values()) {
    if (!person.region) {
      continue;
    }

    let regionData = regions.get(person.region);
    if (!regionData) {
      regionData = {
        region: person.region,
        persons: [],
      };
      regions.set(person.region, regionData);
    }

    regionData.persons.push(person);
  }

  return regions;
}
