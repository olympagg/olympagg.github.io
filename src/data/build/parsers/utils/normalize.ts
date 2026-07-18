import type { City, FullName, Region, School, Team } from "@/data/types/base";

export function normalizeRussian(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u0305\u0307-\u036f]/g, "") // strip all combining marks except U+0306 (й)
    .replace(/ё/g, "е")
    .replace(/Ё/g, "Е")
    .normalize("NFC")
    .replace(/й/g, "й")
    .replace(/Й/g, "й");
}

const LATIN_TO_CYRILLIC: Record<string, string> = {
  a: "а",
  e: "е",
  l: "л",
  o: "о",
  p: "р",
  c: "с",
  x: "х",
  y: "у",
  і: "и", // cyrillic to cyrillic
  A: "А",
  B: "В",
  C: "С",
  E: "Е",
  L: "л",
  H: "Н",
  K: "К",
  M: "М",
  O: "О",
  P: "Р",
  T: "Т",
  X: "Х",
  Y: "У",
  І: "и", // cyrillic to cyrillic
};

const CYRILLIC = `[а-яА-Я]`;
const LATIN = `[a-zA-Z]`;
const CHAR = `[a-zA-Zа-яА-Я]`;
const MIXED_PATTERN = `${CHAR}*(?:${CYRILLIC}${LATIN}|${LATIN}${CYRILLIC})${CHAR}*`;
const MIXED_REGEX = new RegExp(MIXED_PATTERN, "g");
// Non-global copy for `.test()`: calling `.test()` on the global regex would
// advance its lastIndex and corrupt the outer `.replace()` iteration below.
const MIXED_REGEX_TEST = new RegExp(MIXED_PATTERN);

export function normalizeOcr(value: string): string {
  return normalizeRussian(value).replace(MIXED_REGEX, (word) => {
    const fixed = word
      .replace(/[a-zA-Z]/g, (char) => LATIN_TO_CYRILLIC[char] ?? char)
      .replace("sh", "ш");

    // If substitution didn't resolve the mixed-script token, leave it as-is.
    return MIXED_REGEX_TEST.test(fixed) ? word : fixed;
  });
}

export function normalizeCell(value: string): string {
  return normalizeRussian(value)
    .replace(/«/g, "")
    .replace(/»/g, "")
    .replace(/"/g, "")
    .replace(/№/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeFullName(name: string): FullName {
  return normalizeCell(name)
    .replace(/ -/g, "")
    .replace(/\d\S*$/, "") as FullName;
}

export function makeFullNameKey(fullName: string): string {
  return normalizeFullName(fullName).split(" ").sort().join("_");
}

export function normalizeRegion(region: string): Region {
  return normalizeCell(region).replace("г.", "").trim() as Region;
}

export function normalizeCity(city: string): City {
  return normalizeCell(normalizeOcr(city))
    .replace(/^(г|город|пгт)[.\s]\s*/i, "")
    .replace(/\s+г\.?$/i, "")
    .trim() as City;
}

export function normalizeSchool(school: string): School {
  if (school === "-") {
    return "" as School;
  }

  return normalizeCell(school) as School;
}

export function normalizeTeam(team: string): Team {
  if (team === "-") {
    return "" as Team;
  }

  return normalizeCell(team) as Team;
}

export function makeTeamKey(team: string): string {
  return normalizeTeam(team).toLowerCase();
}
