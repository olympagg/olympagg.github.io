import {
  makeFullNameKey,
  makeTeamKey,
  normalizeCity,
  normalizeFullName,
  normalizeRegion,
  normalizeSchool,
  normalizeTeam,
} from "@/data/build/parsers/utils/normalize";
import {
  parseNumber,
  parseGrade,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import type { ParticipationParser, TaskScore } from "@/data/types/base";
import type {
  DanoParticipation,
  DanoTeamCriteria,
  DanoTeamCriteriaValue,
} from "@/data/types/dano";

import { loadExcel } from "./utils/excel";

const PARTICIPANT_COLUMNS = [
  "fullName",
  "team",
  "gender",
  "studyGrade",
  "participationGrade",
  "region",
  "school",
  "soloScore",
  "teamScore",
  "score",
  "status",
] as const;

type ParticipantColumnName = (typeof PARTICIPANT_COLUMNS)[number] | "city";
type ParticipantColumnSpec = ParticipantColumnName | null;
type ParticipantRow = Partial<Record<ParticipantColumnName, string>>;

interface DanoParserOptions {
  tableUrl: string;

  participantsColumns?: ParticipantColumnSpec[];
  omitColumns?: ParticipantColumnName[];
  insertColumns?: {
    after: ParticipantColumnName;
    columns: ParticipantColumnSpec[];
  }[];

  soloTaskMaxScores: number[];
  soloRowsOffset?: number;

  teamCriterias: DanoTeamCriteria[];
  teamRowsOffset?: number;
}

export default class DanoParser implements ParticipationParser {
  tableUrl: string;

  participantsSheetName = "Итоговые результаты";
  participantsRowsOffset = 2;
  participantsColumns: ParticipantColumnSpec[];

  soloSheetName = "Задачный тур";
  soloRowsOffset = 1;
  soloTaskMaxScores: number[];

  teamSheetName = "Проектный тур";
  teamRowsOffset = 5;
  teamCriterias: DanoTeamCriteria[];

  constructor(options: DanoParserOptions) {
    this.tableUrl = options.tableUrl;

    this.participantsColumns = [...PARTICIPANT_COLUMNS];

    if (options.omitColumns?.length) {
      const omit = new Set(options.omitColumns);
      this.participantsColumns = this.participantsColumns.filter(
        (col) => col === null || !omit.has(col),
      );
    }

    for (const { after, columns } of options.insertColumns ?? []) {
      const index = this.participantsColumns.indexOf(after);
      if (index === -1) {
        throw new Error(`Column "${after}" not found for insertColumns`);
      }

      this.participantsColumns.splice(index + 1, 0, ...columns);
    }

    this.soloRowsOffset = options.soloRowsOffset ?? this.soloRowsOffset;
    this.soloTaskMaxScores = options.soloTaskMaxScores;

    this.teamRowsOffset = options.teamRowsOffset ?? this.teamRowsOffset;
    this.teamCriterias = options.teamCriterias;
  }

  async parse(): Promise<DanoParticipation[]> {
    const workbook = await loadExcel(this.tableUrl);

    const participantRows = workbook.getRows<ParticipantRow>(
      this.participantsSheetName,
      this.participantsColumns.map((col, i) => col ?? `_skip_${i}`),
      this.participantsRowsOffset,
    );

    const soloRows = workbook.getRows<string[]>(
      this.soloSheetName,
      "asArray",
      this.soloRowsOffset,
    );

    const soloMapping = new Map<string, TaskScore[]>();
    for (const row of soloRows) {
      const scores = this.soloTaskMaxScores.map((maxScore, i) => ({
        name: String(i + 1),
        score: parseNumber(row[i + 1]!),
        maxScore,
      }));

      const key = makeFullNameKey(row[0]!);
      if (!soloMapping.has(key)) {
        soloMapping.set(key, scores);
      }
    }

    const teamRows = workbook.getRows<string[]>(
      this.teamSheetName,
      "asArray",
      this.teamRowsOffset,
    );

    const teamMapping = new Map<string, DanoTeamCriteriaValue[]>();
    for (const row of teamRows) {
      const criterias = this.teamCriterias.map((criteria, i) => ({
        ...criteria,
        score: parseNumber(row[i + 1]!),
      }));

      teamMapping.set(makeTeamKey(row[0]!), criterias);
    }

    return participantRows.map((row) => {
      const region = row.region === "Не из РФ" ? undefined : row.region;
      const soloScore = parseNumber(row.soloScore!);
      const teamScore = parseNumber(row.teamScore!);
      const { status, winnerDegree } = parseStatus(row.status!);
      const fullName = normalizeFullName(row.fullName!);

      return {
        type: "dano",
        fullName,
        team: normalizeTeam(row.team!),
        // "Mужской" starts with a Latin "M"; artifact of source table
        isMale: row.gender ? row.gender === "Mужской" : undefined,
        region: region ? normalizeRegion(region) : undefined,
        city: row.city ? normalizeCity(row.city) : undefined,
        studyGrade: parseGrade(row.studyGrade!),
        participationGrade: parseGrade(row.participationGrade!),
        school: normalizeSchool(row.school!),
        soloScore,
        soloTaskScores: soloMapping.get(makeFullNameKey(row.fullName!)) ?? [],
        teamScore,
        teamTaskScores: teamMapping.get(makeTeamKey(row.team!)) ?? [],
        score: parseNumber(row.score!),
        status,
        winnerDegree,
      };
    });
  }
}
