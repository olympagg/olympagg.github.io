import { type ParticipationParser, type TaskScore } from "@/data/types/base";
import type { IndividualParticipation } from "@/data/types/individual";

import {
  normalizeFullName,
  normalizeRegion,
  normalizeSchool,
} from "./utils/normalize";
import { parseGrade, parseNumber, parseStatus } from "./utils/parse";
import { loadPdfText, parseTableRows, PDF_PAGE_SEPARATOR } from "./utils/pdf";

const NUMERIC_RE = /^\d+$/;
const PAGE_GRADE_REGEX = /(9|10|11) класс/;

const TASK_COLUMNS = ([1, 2, 3, 4, 5, 6, 7, 8] as const).map(
  (index) => `task${index}` as const,
);

export const DEFAULT_PARTICIPANT_COLUMNS = [
  "index",
  "fullName",
  "region",
  "school",
  "studyGrade",
  "score",
  "status",
] as const;

export const NAME_SPLITTED_PARTICIPANT_COLUMNS = [
  "index",
  "lastName",
  "firstName",
  "middleName",
  "region",
  "school",
  "studyGrade",
  "score",
  "status",
] as const;

export const RMO23_PARTICIPANT_COLUMNS = [
  "index",
  "fullName",
  "studyGrade",
  "region",
  "school",
  "score",
  "status",
] as const;

export const RMO22_PARTICIPANT_COLUMNS = [
  "index",
  "lastName",
  "firstName",
  "middleName",
  "school",
  "region",
  ...TASK_COLUMNS,
  "score",
  "status",
] as const;

export const REO22_PARTICIPANT_COLUMNS = [
  "index",
  "fullName",
  "region",
  "studyGrade",
  "score",
  "status",
] as const;

type AnyParticipantColumns =
  | typeof DEFAULT_PARTICIPANT_COLUMNS
  | typeof NAME_SPLITTED_PARTICIPANT_COLUMNS
  | typeof RMO23_PARTICIPANT_COLUMNS
  | typeof RMO22_PARTICIPANT_COLUMNS
  | typeof REO22_PARTICIPANT_COLUMNS;
type ParticipantColumnName = AnyParticipantColumns[number];
type ParticipantRow = Partial<Record<ParticipantColumnName, string>>;
type ParticipantRowWithOffset = Record<ParticipantColumnName, string> & {
  rowOffset: number;
};

type VosParserMode = "ocr" | "extract";

interface VosParserOptions {
  url: string;
  columns?: AnyParticipantColumns;
  trackName?: string;
  maxTaskScore?: number;
  pages?: number[];
  mode: VosParserMode;
  ignoreRanksForGrades?: number[];
}

export default class VosParser implements ParticipationParser {
  url: string;
  columns: AnyParticipantColumns;
  trackName?: string;
  maxTaskScore?: number;
  pages?: number[];
  mode: VosParserMode;
  ignoreRanksForGrades: number[];

  constructor(options: VosParserOptions) {
    this.url = options.url;
    this.columns = options.columns ?? DEFAULT_PARTICIPANT_COLUMNS;
    this.trackName = options.trackName;
    this.maxTaskScore = options.maxTaskScore;
    this.pages = options.pages;
    this.mode = options.mode;
    this.ignoreRanksForGrades = options.ignoreRanksForGrades ?? [];
  }

  parseMatch(
    row: ParticipantRow,
  ): IndividualParticipation & { position: number } {
    const inputFullName =
      row.fullName ?? `${row.lastName} ${row.firstName} ${row.middleName}`;
    const fullName = normalizeFullName(inputFullName);
    const region = row.region ? normalizeRegion(row.region) : undefined;
    const school = row.school ? normalizeSchool(row.school) : undefined;
    const studyGrade =
      row.studyGrade && !row.studyGrade.includes("курс")
        ? parseGrade(row.studyGrade)
        : undefined;
    const score = parseNumber(row.score!);
    const { status } = parseStatus(row.status!);

    const taskScores = new Array<TaskScore>();

    for (const [index, task] of TASK_COLUMNS.entries()) {
      if (task in row) {
        if (!this.maxTaskScore) {
          throw new Error("Results contains tasks but maxTaskScore is not set");
        }

        taskScores.push({
          name: String(index + 1),
          score: parseNumber(row[task]!),
          maxScore: this.maxTaskScore,
        });
      }
    }

    return {
      type: "individual" as const,
      fullName,
      region,
      school,
      studyGrade,
      taskScores,
      score,
      status,
      position: parseNumber(row.index!),
    };
  }

  mergeCrossPageRows(
    text: string,
    rows: ParticipantRowWithOffset[],
  ): ParticipantRowWithOffset[] {
    const indexColumn = this.columns[0];
    const merged = new Array<ParticipantRowWithOffset>();

    for (const [i, row] of rows.entries()) {
      const head = merged[merged.length - 1];
      const next = rows[i + 1];
      const isContinuation =
        head &&
        next &&
        !row[indexColumn] &&
        Number(next[indexColumn]) === Number(head[indexColumn]) + 1 &&
        text.slice(head.rowOffset, row.rowOffset).includes(PDF_PAGE_SEPARATOR);

      if (!isContinuation) {
        merged.push(row);
        continue;
      }

      for (const column of this.columns) {
        if (!row[column]) {
          continue;
        }

        head[column] = head[column]
          ? `${head[column]} ${row[column]}`
          : row[column];
      }
    }

    return merged;
  }

  async parse(): Promise<IndividualParticipation[]> {
    const text = await loadPdfText({
      url: this.url,
      mode: this.mode,
      pages: this.pages,
    });
    const rows = this.mergeCrossPageRows(
      text,
      parseTableRows(text, this.columns) as ParticipantRowWithOffset[],
    );

    const participations = new Array<
      IndividualParticipation & { position: number }
    >();

    let lastIndex = 0;
    let participationGrade = 0;
    let ourTrackName = false;

    for (const entry of rows) {
      if (
        !NUMERIC_RE.test(entry.index) ||
        NUMERIC_RE.test(entry.fullName || entry.firstName)
      ) {
        continue;
      }

      const participation = this.parseMatch(entry);

      if (participation.position === 1) {
        const substring = text.substring(lastIndex, entry.rowOffset);

        const participationGradeMatch = PAGE_GRADE_REGEX.exec(substring);
        if (participationGradeMatch) {
          participationGrade = parseInt(participationGradeMatch[1]!);
        }

        if (this.trackName) {
          ourTrackName = substring.includes(this.trackName);
        }
      }

      if (!participationGrade) {
        console.log("First row", JSON.stringify(entry));
        throw new Error(`Could not parse first participation grade`);
      }

      if (!this.trackName || ourTrackName) {
        if (
          participation.position !== 1 &&
          participation.position - 1 !==
            participations[participations.length - 1]!.position &&
          !this.ignoreRanksForGrades.includes(participationGrade)
        ) {
          console.log(
            "Previous row",
            JSON.stringify(participations[participations.length - 1]),
          );
          console.log("Current row", JSON.stringify(participation));

          throw new Error(
            `Missed participation before pos ${participation.position} in grade ${participationGrade}`,
          );
        }

        participations.push({
          ...participation,
          participationGrade,
        });
      }

      lastIndex = entry.rowOffset;
    }

    return participations;
  }
}
