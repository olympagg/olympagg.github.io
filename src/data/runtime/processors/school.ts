import type { PersonData, SchoolData } from "../../types";
import type { FullName, School } from "../../types/base";

export function buildSchoolData(
  personsData: Map<FullName, PersonData>,
): Map<School, SchoolData> {
  const schools = new Map<School, SchoolData>();

  for (const person of personsData.values()) {
    if (!person.school) {
      continue;
    }

    let schoolData = schools.get(person.school);
    if (!schoolData) {
      schoolData = {
        school: person.school,
        persons: [],
      };
      schools.set(person.school, schoolData);
    }

    schoolData.persons.push(person);
  }

  return schools;
}
