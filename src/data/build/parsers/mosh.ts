import {
  normalizeFullName,
  normalizeRegion,
} from "@/data/build/parsers/utils/normalize";
import {
  parseGrade,
  parseNumber,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import type { ParticipationParser } from "@/data/types/base";
import type { IndividualParticipation } from "@/data/types/individual";

import { loadHtml, parseHtmlTableRows } from "./utils/html";

const TASKS = [
  { name: "A", maxScore: 100 },
  { name: "B1", maxScore: 60 },
  { name: "B2", maxScore: 40 },
  { name: "C", maxScore: 100 },
  { name: "D1", maxScore: 40 },
  { name: "D2", maxScore: 60 },
  { name: "E", maxScore: 100 },
] as const;

export default class MoshParser implements ParticipationParser {
  pageUrl: string;
  rowsOffset = 1;

  constructor(pageUrl: string) {
    this.pageUrl = pageUrl;
  }

  async parse(): Promise<IndividualParticipation[]> {
    const $ = await loadHtml(this.pageUrl);

    const rows = parseHtmlTableRows($('table[data-sheets-root="1"] tr')).slice(
      this.rowsOffset,
    );

    return rows.map(({ cells }) => {
      const parts = cells[1]!.split(", ");
      if (parts.length < 3) {
        throw new Error(`Expected ${cells[1]!} to have 3 parts`);
      }

      return {
        type: "individual",
        fullName: normalizeFullName(parts[0]!),
        region: normalizeRegion(parts[1]!),
        participationGrade: parseGrade(parts[2]!),
        taskScores: TASKS.map((task, i) => ({
          ...task,
          score: parseNumber(cells[2 + i]!),
        })),
        score: parseNumber(cells[cells.length - 2]!),
        ...parseStatus(cells[cells.length - 1]!),
      };
    });
  }
}
