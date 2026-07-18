import {
  normalizeCity,
  normalizeFullName,
  normalizeRegion,
  normalizeSchool,
} from "@/data/build/parsers/utils/normalize";
import { parseNumber, parseStatus } from "@/data/build/parsers/utils/parse";
import type { ParticipationParser } from "@/data/types/base";
import type { IndividualParticipation } from "@/data/types/individual";

import { loadHtml, parseHtmlTableRows } from "./utils/html";

const TASK_COUNT = 8;
const TASK_MAX_SCORE = 100;

export interface InfopenParserOptions {
  url: string;
  tableSelector?: string;
  nameColumnsCount?: 1 | 2 | 3;
  hasParticipationGrade?: boolean;
  hasSchool?: boolean;
  hasRegion?: boolean;
}

export default class InfopenParser implements ParticipationParser {
  url: string;
  tableSelector: string;
  nameColumnsCount: 1 | 2 | 3;
  hasParticipationGrade: boolean;
  hasSchool: boolean;
  hasRegion: boolean;

  constructor(options: InfopenParserOptions) {
    this.url = options.url;
    this.tableSelector = options.tableSelector ?? "table.table-striped";
    this.nameColumnsCount = options.nameColumnsCount ?? 1;
    this.hasParticipationGrade = options.hasParticipationGrade ?? true;
    this.hasSchool = options.hasSchool ?? false;
    this.hasRegion = options.hasRegion ?? false;
  }

  async parse(): Promise<IndividualParticipation[]> {
    const $ = await loadHtml(this.url);

    let columns = 1 + this.nameColumnsCount;
    const gradeIndex = columns++;
    const participationGradeIndex = this.hasParticipationGrade ? columns++ : -1;
    const schoolIndex = this.hasSchool ? columns++ : -1;
    const regionIndex = this.hasRegion ? columns++ : -1;
    const cityIndex = columns++;
    const taskStartIndex = columns;
    columns += TASK_COUNT;
    const totalIndex = columns++;
    const diplomaIndex = columns;

    const $table = $(this.tableSelector).first();
    if (!$table.length) {
      throw new Error(
        `No table matching "${this.tableSelector}" found at ${this.url}`,
      );
    }

    const headerCells = $table
      .find("tr")
      .first()
      .find("th, td")
      .toArray()
      .map((el) => $(el).text().trim());

    if (headerCells.length < taskStartIndex + TASK_COUNT) {
      throw new Error(
        `Expected at least ${taskStartIndex + TASK_COUNT} header columns, got ${headerCells.length} at ${this.url}`,
      );
    }

    const taskNames = headerCells.slice(
      taskStartIndex,
      taskStartIndex + TASK_COUNT,
    );

    const rows = parseHtmlTableRows($table.find("tbody tr")).filter(
      ({ cells }) => cells.length > diplomaIndex,
    );

    return rows.map(({ cells }) => {
      const nameParts = Array.from(
        { length: this.nameColumnsCount },
        (_, i) => cells[1 + i]!,
      ).filter(Boolean);

      return {
        type: "individual",
        fullName: normalizeFullName(nameParts.join(" ")),
        studyGrade: parseNumber(cells[gradeIndex]!),
        participationGrade:
          participationGradeIndex >= 0
            ? parseNumber(cells[participationGradeIndex]!)
            : undefined,
        school:
          schoolIndex >= 0 ? normalizeSchool(cells[schoolIndex]!) : undefined,
        region:
          regionIndex >= 0 ? normalizeRegion(cells[regionIndex]!) : undefined,
        city: normalizeCity(cells[cityIndex]!),
        taskScores: taskNames.map((name, i) => ({
          name,
          maxScore: TASK_MAX_SCORE,
          score: parseNumber(cells[taskStartIndex + i]!),
        })),
        score: parseNumber(cells[totalIndex]!),
        ...parseStatus(cells[diplomaIndex]!),
      };
    });
  }
}
