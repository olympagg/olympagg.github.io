import { loadHtml, parseHtmlTableRows } from "@/data/build/parsers/utils/html";
import {
  normalizeFullName,
  normalizeTeam,
  normalizeUrl,
} from "@/data/build/parsers/utils/normalize";
import {
  parseGrade,
  parseNumber,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import { loadPdfText, parseTableRows } from "@/data/build/parsers/utils/pdf";
import {
  ParticipationStatus,
  type FullName,
  type ParticipationParser,
} from "@/data/types/base";
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

function parseSubjectName(header: string): string {
  // ntoavia25: "Предмет 1", "Предмет 2"
  const number = /\d/.exec(header)?.[0];
  if (number) {
    return number;
  }

  return (
    header
      .split(" по ")
      .at(-1)!
      .toLowerCase()
      // "Матема тика", "предмету география"
      .replace(/[^а-яё]/g, "")
      // "по предмету информатика"
      .replace(/^предмету/, "")
      // "информатике" -> "информатика", "химии" -> "химия"
      .replace(/е$/, "а")
      .replace(/и$/, "я")
  );
}

function parseNtoStatus(value: string): ParticipationStatus {
  // Some protocols put finalist's rank into the status column
  return /^\d+$/.test(value)
    ? ParticipationStatus.FINALIST
    : parseStatus(value.replace(/\s+/g, "")).status;
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

        links.set(
          fullName,
          normalizeUrl(new URL(href, this.resultsPageUrl).href),
        );
      }
    }

    return links;
  }

  async getParticipations(url: string): Promise<NTOParticipation[]> {
    const text = await loadPdfText({
      url,
      pages: this.pagesRange,
      mode: "mixed",
    });
    const rows = parseTableRows(text, PARTICIPATION_COLUMNS);
    const header = rows[0]!;

    const firstSubjectName = parseSubjectName(header.firstSubject);
    const secondSubjectName = parseSubjectName(header.secondSubject);

    const participations = new Array<NTOParticipation>();

    for (const row of rows.slice(1)) {
      // Protocol templates end with blank rows
      if (!/\p{L}/u.test(row.fullName)) {
        continue;
      }

      // Long name wrapped to the next row
      if (
        PARTICIPATION_COLUMNS.slice(1).every((column) => row[column] === "")
      ) {
        const previous = participations.at(-1)!;
        previous.fullName = normalizeFullName(
          `${previous.fullName} ${row.fullName}`,
        );
        continue;
      }

      const teamScore = parseNumber(row.teamScore);

      participations.push({
        type: "nto",
        fullName: normalizeFullName(row.fullName),
        studyGrade: parseGrade(row.studyGrade),
        team: normalizeTeam(row.team),
        taskScores: [
          {
            name: `Предметный тур (${firstSubjectName})`,
            score: parseNumber(row.firstSubject),
          },
          {
            name: `Предметный тур (${secondSubjectName})`,
            score: parseNumber(row.secondSubject),
          },
          {
            name: "Командный тур",
            score: teamScore,
          },
        ],
        teamScore,
        score: parseNumber(row.score),
        status: parseNtoStatus(row.status),
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
