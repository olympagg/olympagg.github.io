import type { RcsoDiploma } from "@/data/types/rcso";

const DIPLOMA_ORIGIN = "https://diploma.rsr-olymp.ru";
const STORAGE_PATH = "/files/rsosh-diplomas-static/compiled-storage-";

const MIN_BIRTH_YEAR = 1990;
const BIRTH_PART_LENGTHS = [2, 2, 4] as const;

export interface DiplomaStorageYear {
  catalogYear: number;
  storageYear: number;
}

export interface ParsedDiplomaTitle {
  number: number;
  catalogName: string;
  subject: string;
  level: number;
  degree: number;
}

// Diplomas for the N/N+1 school year live in storage N+1 and are published
// after the olympiad season ends, so a year is queried only from June 1st.
export function diplomaStorageYears(
  catalogYears: number[],
  now: Date,
): DiplomaStorageYear[] {
  return catalogYears
    .map((catalogYear) => ({ catalogYear, storageYear: catalogYear + 1 }))
    .filter(({ storageYear }) => now >= new Date(storageYear, 5, 1));
}

export function normalizeFullName(fullName: string): string {
  return fullName.replace(/\s+/g, " ").trim();
}

export function isValidFullName(fullName: string): boolean {
  return /^\p{L}[\p{L}'’-]*( \p{L}[\p{L}'’-]*)+$/u.test(
    normalizeFullName(fullName),
  );
}

// Mirrors `search_name` from diploma.rsr-olymp.ru/{year}/diploma.js.
export function buildPersonKey(fullName: string, birthIso: string): string {
  const name = normalizeFullName(fullName)
    .toLowerCase()
    .replace(/(([- ]|^)[^ ])/g, (s) => s.toUpperCase());
  return `${name} ${birthIso}`.replace(/ +/g, " ");
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function codesUrl(storageYear: number, personHash: string): string {
  return `${DIPLOMA_ORIGIN}${STORAGE_PATH}${storageYear}/by-person-released/${personHash}/codes.js`;
}

export function pdfUrl(storageYear: number, code: string): string {
  return `${DIPLOMA_ORIGIN}${STORAGE_PATH}${storageYear}/by-code/${code}/color.pdf`;
}

export function formatDiplomaCode(code: string): string {
  return code.replace(/^(\d{3})(\d{4})(\d+)$/, "$1 $2-$3");
}

export function parseDiplomaTitle(oa: string): ParsedDiplomaTitle | null {
  const match =
    /^№(\d+)\. "(.+)" \("(.+)"\), (\d) уровень\. Диплом (\d) степени\.?$/.exec(
      oa.trim(),
    );
  if (!match) {
    return null;
  }

  const [, number, catalogName, subject, level, degree] = match;
  return {
    number: Number(number),
    catalogName: catalogName!,
    subject: subject!,
    level: Number(level),
    degree: Number(degree),
  };
}

function toText(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

// The payload is produced by third-party code, so keep only the known fields.
export function parseDiplomas(data: unknown): RcsoDiploma[] | null {
  if (!Array.isArray(data)) {
    return null;
  }

  const diplomas: RcsoDiploma[] = [];
  for (const item of data as unknown[]) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const code = toText(record.code);
    const oa = toText(record.oa);
    if (!code || !/^\d+$/.test(code) || !oa) {
      continue;
    }
    diplomas.push({
      code,
      oa,
      name: toText(record.name) ?? "",
      form: toText(record.form) ?? "",
    });
  }
  // Items present but none recognised means the format changed upstream;
  // report it as an error rather than "no diplomas".
  return data.length > 0 && diplomas.length === 0 ? null : diplomas;
}

// Turns free typing into "дд.мм.гггг": dots are inserted automatically, and a
// separator typed after a single digit pads it ("1.1.2008" → "01.01.2008").
export function formatBirthInput(raw: string): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (iso) {
    return `${iso[3]!}.${iso[2]!}.${iso[1]!}`;
  }

  const parts = ["", "", ""];
  let index = 0;

  for (const char of raw) {
    if (index >= parts.length) {
      break;
    }
    const maxLength = BIRTH_PART_LENGTHS[index]!;

    if (/\d/.test(char)) {
      parts[index] = `${parts[index]!}${char}`;
      if (parts[index]!.length === maxLength) {
        index += 1;
      }
    } else if (/[.,/\- ]/.test(char) && index < 2 && parts[index]) {
      parts[index] = parts[index]!.padStart(maxLength, "0");
      index += 1;
    }
  }

  const filled = parts.filter(Boolean);
  const text = filled.join(".");
  const lastFilled = filled.length - 1;
  const lastComplete =
    lastFilled >= 0 &&
    lastFilled < 2 &&
    filled[lastFilled]!.length === BIRTH_PART_LENGTHS[lastFilled];

  // The dot after a complete day or month is added right away.
  return lastComplete ? `${text}.` : text;
}

export function parseBirth(text: string): string | null {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(text.trim());
  if (!match) {
    return null;
  }

  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(Date.UTC(year, month - 1, day));

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  if (!isRealDate || year < MIN_BIRTH_YEAR || year > new Date().getFullYear()) {
    return null;
  }

  return `${yyyy}-${mm}-${dd}`;
}
