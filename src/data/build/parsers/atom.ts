import { normalizeFullName } from "@/data/build/parsers/utils/normalize";
import { parseNumber, parseStatus } from "@/data/build/parsers/utils/parse";
import { WinnerDegree } from "@/data/types/base";
import type { ParticipationParser } from "@/data/types/base";
import type { IndividualParticipation } from "@/data/types/individual";

import { loadHtml } from "./utils/html";

export default class AtomParser implements ParticipationParser {
  url: string;

  constructor(subject: "phys" | "math", year: number) {
    this.url = `https://olymp.mephi.ru/rosatom/winners/scan_${subject}_${year}`;
  }

  async parse(): Promise<IndividualParticipation[]> {
    const $ = await loadHtml(this.url);
    const rows = $("table tr");
    if (rows.length < 2) {
      throw new Error(`No Rosatom results table at ${this.url}`);
    }

    const participations: IndividualParticipation[] = [];
    let grade: number | undefined;

    rows.slice(1).each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length === 1) {
        const match = /^(\d{1,2})\s*класс$/.exec(cells.first().text().trim());
        if (!match) {
          throw new Error(`Unexpected Rosatom grade row at ${this.url}`);
        }
        grade = parseNumber(match[1]!);
        return;
      }

      if (cells.length !== 3 && cells.length !== 4) {
        throw new Error(
          `Unexpected Rosatom row with ${cells.length} cells at ${this.url}`,
        );
      }

      const rowGrade =
        cells.length === 4 ? parseNumber(cells.eq(1).text()) : grade;
      const scoreText = cells
        .eq(cells.length - 2)
        .text()
        .trim();
      const result = parseStatus(cells.last().text());
      const link = cells.first().find("a[href]").first();

      if (
        !rowGrade ||
        rowGrade < 7 ||
        rowGrade > 11 ||
        !/^\d+(?:[.,]\d+)?$/.test(scoreText) ||
        result.winnerDegree === WinnerDegree.NONE ||
        !link.length
      ) {
        throw new Error(
          `Invalid Rosatom result row at ${this.url}: ${$(row).text()}`,
        );
      }

      participations.push({
        type: "individual",
        fullName: normalizeFullName(link.text()),
        studyGrade: rowGrade,
        participationGrade: rowGrade,
        taskScores: [],
        score: parseNumber(scoreText),
        ...result,
        workUrl: new URL(link.attr("href")!, this.url).href,
      });
    });

    return participations;
  }
}
