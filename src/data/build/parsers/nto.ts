import { loadHtml, parseHtmlTableRows } from "@/data/build/parsers/utils/html";
import {
  normalizeFullName,
  normalizeTeam,
} from "@/data/build/parsers/utils/normalize";
import {
  parseGrade,
  parseNumber,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import { loadPdfText, parseTableRows } from "@/data/build/parsers/utils/pdf";
import type { FullName, ParticipationParser } from "@/data/types/base";
import type { NTOParticipation } from "@/data/types/nto";
import { range } from "@/lib/utils";

const PARTICIPATION_COLUMNS = [
  "fullName",
  "studyGrade",
  "team",
  "firstSubject",
  "secondSubject",
  "teamScore",
  "score",
  "status",
] as const;

function toAbsoluteUrl(baseUrl: string, href: string): string {
  return new URL(href, baseUrl).toString();
}

export default class NtoParser implements ParticipationParser {
  year: number;
  resultsPageUrl: string;
  profileName: string;
  pagesRange = range(2, 5);

  constructor(year: number, profileName: string) {
    this.year = year;
    this.profileName = profileName;
    this.resultsPageUrl = `https://ntcontest.ru/about/results/results${year}/`;
  }

  async getWorkLinks(): Promise<Map<FullName, string>> {
    const $ = await loadHtml(this.resultsPageUrl);

    const headers = $("h2").toArray();
    const profileHeader = headers.find(
      (header) => $(header).text().trim() === this.profileName.toUpperCase(),
    );

    if (!profileHeader) {
      throw new Error(
        `Could not find profile section for "${this.profileName}" on ${this.resultsPageUrl}`,
      );
    }

    const section = $(profileHeader).nextUntil("h2");

    const links = new Map<FullName, string>();
    const profileTables = section.filter("table").slice(0, 2).toArray();

    for (const table of profileTables) {
      for (const { cells, rowElement } of parseHtmlTableRows(
        $(table).find("tr"),
      )) {
        if (cells.length === 0) {
          continue;
        }

        const fullName = normalizeFullName(cells[0]!);
        if (!fullName) {
          continue;
        }

        const href = $(rowElement).find("a[href]").first().attr("href");
        if (!href) {
          continue;
        }

        links.set(fullName, toAbsoluteUrl(this.resultsPageUrl, href));
      }
    }

    return links;
  }

  async getParticipations(url: string): Promise<NTOParticipation[]> {
    const rows = parseTableRows(
      await loadPdfText({ url, mode: "ocr", pages: this.pagesRange }),
      PARTICIPATION_COLUMNS,
    );
    const header = rows[0]!;

    const firstSubjectName = header.firstSubject.split(" ").at(-1)!;
    const secondSubjectName = header.secondSubject.split(" ").at(-1)!;

    const participations = new Array<NTOParticipation>();

    for (const row of rows.slice(1)) {
      participations.push({
        type: "nto",
        fullName: normalizeFullName(row.fullName),
        studyGrade: parseGrade(row.studyGrade),
        team: normalizeTeam(row.team),
        firstSubjectName,
        firstSubjectScore: parseNumber(row.firstSubject),
        secondSubjectName,
        secondSubjectScore: parseNumber(row.secondSubject),
        teamScore: parseNumber(row.teamScore),
        score: parseNumber(row.score),
        status: parseStatus(row.status).status,
      });
    }

    return participations;
  }

  async parse(): Promise<NTOParticipation[]> {
    const workLinks = await this.getWorkLinks();

    if (workLinks.size === 0) {
      throw new Error(
        `No work links parsed for "${this.profileName}" in ${this.year}`,
      );
    }

    const firstUrl = workLinks.values().next().value!;
    const participations = await this.getParticipations(firstUrl);

    return participations.map((participation) => {
      return {
        ...participation,
        workUrl: workLinks.get(participation.fullName),
      };
    });
  }
}
