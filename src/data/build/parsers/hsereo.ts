import { type ParticipationParser } from "@/data/types/base";
import type { IndividualParticipation } from "@/data/types/individual";

import { loadExcel } from "./utils/excel";
import {
  normalizeFullName,
  normalizeRegion,
  normalizeSchool,
} from "./utils/normalize";
import { parseGrade, parseNumber, parseStatus } from "./utils/parse";

const TASK_COLUMNS = [
  "task1",
  "task2",
  "task3",
  "task4",
  "task5",
  "task6",
  "task7",
  "task8",
] as const;

export const REO23_COLUMNS = [
  "lastName",
  "firstName",
  "middleName",
  "participationGrade",
  "studyGrade",
  "region",
  "school",
  ...TASK_COLUMNS,
  "score",
  "status",
] as const;

export const REO25_COLUMNS = [
  "lastName",
  "firstName",
  "middleName",
  "studyGrade",
  "participationGrade",
  "region",
  "school",
  ...TASK_COLUMNS,
  "score",
  "status",
] as const;

type ColumnName = (typeof REO23_COLUMNS | typeof REO25_COLUMNS)[number];
type ParticipantRow = Record<ColumnName, string>;

interface HseReoParserOptions {
  tableUrl: string;
  columns: typeof REO23_COLUMNS | typeof REO25_COLUMNS;
  sheetNames: string[];
  rowsOffset: number;
}

export default class HseReoParser implements ParticipationParser {
  tableUrl: string;
  columns: typeof REO23_COLUMNS | typeof REO25_COLUMNS;
  sheetNames: string[];
  rowsOffset: number;

  constructor(options: HseReoParserOptions) {
    this.tableUrl = options.tableUrl;
    this.columns = options.columns;
    this.sheetNames = options.sheetNames;
    this.rowsOffset = options.rowsOffset;
  }

  parseRow(row: ParticipantRow): IndividualParticipation {
    const fullName = normalizeFullName(
      `${row.lastName} ${row.firstName} ${row.middleName}`,
    );
    const region = row.region ? normalizeRegion(row.region) : undefined;
    const school = row.school ? normalizeSchool(row.school) : undefined;
    const studyGrade = row.studyGrade ? parseGrade(row.studyGrade) : undefined;
    const participationGrade = row.participationGrade
      ? parseGrade(row.participationGrade)
      : undefined;
    const score = parseNumber(row.score);
    const { status } = parseStatus(row.status);

    const taskScores = TASK_COLUMNS.map((column, index) => ({
      name: String(index + 1),
      maxScore: 12,
      score: parseNumber(row[column]),
    }));

    return {
      type: "individual",
      fullName,
      region,
      school,
      studyGrade,
      participationGrade,
      taskScores,
      score,
      status,
    };
  }

  async parse(): Promise<IndividualParticipation[]> {
    const workbook = await loadExcel(this.tableUrl);
    const participations: IndividualParticipation[] = [];

    for (const sheetName of this.sheetNames) {
      const rows = workbook.getRows<ParticipantRow>(
        sheetName,
        [...this.columns],
        this.rowsOffset,
      );

      for (const row of rows) {
        participations.push(this.parseRow(row));
      }
    }

    return participations;
  }
}
