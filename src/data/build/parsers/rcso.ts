import type * as cheerio from "cheerio";

import type {
  RcsoCatalog,
  RcsoOlympiad,
  RcsoOrder,
  RcsoTrack,
} from "@/data/types/rcso";

import { loadHtml, parseHtmlTableRows } from "./utils/html";
import { normalizeUrl } from "./utils/normalize";

export const RCSO_ARCHIVE_YEARS = [2021, 2022, 2023, 2024, 2025] as const;

const RCSO_CATALOG_URL = "https://rsr-olymp.ru/archive/{year}";
const ORDER_RE = /от\s+(\d{2})\.(\d{2})\.(\d{4})\s+№\s*(\d+)/;

const NAME_EXCEPTIONS: [string, string][] = [
  ["Формула Единства", "Формула Единства / Третье тысячелетие"],
  ["Казанский", "Межрегиональные предметные олимпиады КФУ"],
  ["академии народного хозяйства", "Олимпиада РАНХиГС"],
  ["Национальной технологической", "Национальная технологическая олимпиада"], // 2021
  ["Строгановская", "Строгановская олимпиада"],
  ["Южно-Российская", "Южно-Российская олимпиада Архитектура и искусство"],
  [
    "Архитектура и искусство",
    "Межрегиональная олимпиада Архитектура и искусство",
  ],
];

const NAME_FILLERS = ["для школьников", "с международным участием"];
const NAME_TAIL = "для учащихся ";
const QUOTED_RE = /«([^«»]*)»/g;

function collapse(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeRcsoName(raw: string): string {
  for (const [substring, replacement] of NAME_EXCEPTIONS) {
    if (raw.includes(substring)) {
      return replacement;
    }
  }

  // Олимпиада «Курчатов» -> Курчатов
  // Олимпиада по музыке для учащихся 8 классов -> Олимпиада по музыке
  const quoted = [...raw.matchAll(QUOTED_RE)].at(-1)?.[1];
  let name = (quoted ?? raw).replace(/\([^()]*\)/g, " ").split(NAME_TAIL)[0]!;

  for (const filler of NAME_FILLERS) {
    name = name.replaceAll(filler, " ");
  }

  return collapse(
    name
      .replaceAll(" имени ", " им. ")
      // В.Е.Татлина -> В.Е. Татлина, И. П. Павлова -> И.П. Павлова
      .replace(/([А-Я])\.\s*([А-Я])\.\s*/g, "$1.$2. ")
      .replace(/\s+-\s*|\s*-\s+/g, " — ")
      .replace(/(?!^)Олимпиад/g, "олимпиад"),
  );
}

function parseOrder($: cheerio.CheerioAPI, year: number): RcsoOrder {
  const anchor = $('a[href*="pravo.gov"]').first();
  const url = anchor.attr("href")?.trim();
  const match = ORDER_RE.exec(collapse(anchor.text()));

  if (!url || !match) {
    throw new Error(`RCSO ${year}: could not parse order line`);
  }

  const [, dd, mm, yyyy, number] = match;
  return {
    date: new Date(`${yyyy}-${mm}-${dd}`),
    number: number!,
    url,
  };
}

function parseTrack(cells: string[], offset: number, year: number): RcsoTrack {
  const name = cells[offset]!;
  const subjects = cells[offset + 1]!.split(/,\s*/)
    .map((subject) => subject.trim())
    .filter(Boolean);
  const levelText = cells[offset + 2]!;
  const level = Number(levelText);

  if (level !== 1 && level !== 2 && level !== 3) {
    throw new Error(
      `RCSO ${year}: unexpected level "${levelText}" for track "${name}"`,
    );
  }

  return { name, subjects, level };
}

async function parseRcsoYear(year: number): Promise<RcsoCatalog> {
  const url = RCSO_CATALOG_URL.replace("{year}", String(year));
  const $ = await loadHtml(url);

  const order = parseOrder($, year);

  const olympiads: RcsoOlympiad[] = [];
  let current: RcsoOlympiad | null = null;

  for (const { cells, rowElement } of parseHtmlTableRows(
    $("table.mainTableInfo tr"),
  )) {
    if (cells.length === 3 && current) {
      current.tracks.push(parseTrack(cells, 0, year));
      continue;
    }

    if (cells.length !== 5) {
      continue;
    }

    const number = Number(cells[0]);
    if (!Number.isFinite(number)) {
      continue;
    }

    // rsr-olymp.ru sometimes packs two space-separated URLs into one href — keep the first.
    const href = $(rowElement)
      .find("a[href]")
      .first()
      .attr("href")
      ?.trim()
      .split(/\s+/)[0];

    current = {
      number,
      name: normalizeRcsoName(cells[1]!),
      catalogName: cells[1]!,
      ...(href ? { url: normalizeUrl(href) } : {}),
      tracks: [parseTrack(cells, 2, year)],
    };
    olympiads.push(current);
  }

  if (olympiads.length === 0) {
    throw new Error(`RCSO ${year}: parsed 0 olympiads`);
  }

  const lastNumber = olympiads[olympiads.length - 1]!.number;
  if (olympiads.length !== lastNumber) {
    throw new Error(
      `RCSO ${year}: catalog length ${olympiads.length} != last olympiad number ${lastNumber}`,
    );
  }

  return { year, order, olympiads };
}

function collapseRenamesByHost(catalogs: RcsoCatalog[]): void {
  const byHost = new Map<string, Map<string, Set<number>>>();

  for (const catalog of catalogs) {
    for (const olympiad of catalog.olympiads) {
      const host = olympiad.url && URL.parse(olympiad.url)?.hostname;
      if (!host) {
        continue;
      }

      const names = byHost.get(host) ?? new Map<string, Set<number>>();
      byHost.set(host, names);

      const years = names.get(olympiad.name) ?? new Set<number>();
      names.set(olympiad.name, years);
      years.add(catalog.year);
    }
  }

  const renames = new Map<string, string>();

  for (const names of byHost.values()) {
    if (names.size < 2) {
      continue;
    }

    const entries = [...names];
    const overlapping = entries.some(([, years], index) =>
      entries
        .slice(index + 1)
        .some(([, other]) => [...years].some((year) => other.has(year))),
    );

    if (overlapping) {
      continue;
    }

    const [latest] = entries.reduce((a, b) =>
      Math.max(...b[1]) > Math.max(...a[1]) ? b : a,
    );

    for (const [name] of entries) {
      if (name === latest) {
        continue;
      }

      const existing = renames.get(name);
      if (existing !== undefined && existing !== latest) {
        throw new Error(
          `RCSO: "${name}" renames to both "${existing}" and "${latest}", resolve it with an exception in NAME_EXCEPTIONS`,
        );
      }

      renames.set(name, latest);
    }
  }

  for (const target of renames.values()) {
    if (renames.has(target)) {
      throw new Error(
        `RCSO: chained rename to "${target}", resolve it with an exception in NAME_EXCEPTIONS`,
      );
    }
  }

  for (const catalog of catalogs) {
    for (const olympiad of catalog.olympiads) {
      olympiad.name = renames.get(olympiad.name) ?? olympiad.name;
    }
  }
}

function normalizeRcsoNames(catalogs: RcsoCatalog[]): RcsoCatalog[] {
  collapseRenamesByHost(catalogs);

  for (const catalog of catalogs) {
    const seen = new Set<string>();
    for (const { name, catalogName } of catalog.olympiads) {
      if (seen.has(name)) {
        throw new Error(
          `Conflict in RCSO ${catalog.year}: "${name}" resolves to several olympiads (last one from "${catalogName}")`,
        );
      }

      seen.add(name);
    }
  }

  return catalogs;
}

export async function parseRcsoCatalogs(): Promise<RcsoCatalog[]> {
  const catalogs: RcsoCatalog[] = [];
  for (const year of RCSO_ARCHIVE_YEARS) {
    catalogs.push(await parseRcsoYear(year));
  }

  return normalizeRcsoNames(catalogs);
}
