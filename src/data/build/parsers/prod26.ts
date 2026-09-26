import {
  normalizeCity,
  normalizeFullName,
  normalizeTeam,
} from "@/data/build/parsers/utils/normalize";
import {
  parseNumber,
  parseGrade,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import type { ParticipationParser } from "@/data/types/base";
import {
  parseCriteriaType,
  parseTrack,
  type ProdParticipation,
  type ProdTeamCriteriaType,
  type ProdTeamCriteriaValue,
} from "@/data/types/prod";

import { loadHtml } from "./utils/html";

const PARTICIPANT_COLUMN_NAMES = [
  "fullName",
  "city",
  "grade",
  "track",
  "soloScore",
  "team",
  "teamScore",
  "score",
  "status",
] as const;
type ParticipantColumnName = (typeof PARTICIPANT_COLUMN_NAMES)[number];
type ParticipantRow = Record<ParticipantColumnName, string>;

export default class Prod26Parser implements ParticipationParser {
  tableUrl: string;
  participantSheetId = "sheet-0";
  teamCriteriaSheetId = "sheet-5";
  rowsOffset = 2;

  constructor(tableUrl: string) {
    this.tableUrl = tableUrl;
  }

  async readSheet<T>(
    sheetId: string,
    header: readonly string[] | "asArray",
    rowsOffset: number,
  ): Promise<T[]> {
    const $ = await loadHtml(this.tableUrl);
    const rows = $(`#${sheetId} tr`).toArray().slice(rowsOffset);

    return rows.map((tr) => {
      const cells = $(tr)
        .find("td")
        .toArray()
        .map((td) => $(td).text().trim());

      if (header === "asArray") {
        return cells as T;
      }

      const obj: Record<string, string> = {};

      for (let i = 0; i < header.length; i++) {
        const value = cells[i];
        if (typeof value === "undefined") {
          throw new Error(`No such column: ${header[i]}`);
        }

        obj[header[i]!] = value;
      }

      return obj as T;
    });
  }

  async getTeamCriterias(): Promise<
    { type: ProdTeamCriteriaType; name: string; maxScore: number }[]
  > {
    const teamCriteriaRows = await this.readSheet<string[]>(
      this.teamCriteriaSheetId,
      "asArray",
      this.rowsOffset - 1,
    );

    return teamCriteriaRows[0]!.slice(5).map((criteriaString) => {
      const [typeString, name] = criteriaString.split(" | ");
      return {
        type: parseCriteriaType(typeString!),
        name: name!,
        maxScore: 4,
      };
    });
  }

  async parse(): Promise<ProdParticipation[]> {
    const [participants, teamCriteriaRows] = await Promise.all([
      this.readSheet<ParticipantRow>(
        this.participantSheetId,
        PARTICIPANT_COLUMN_NAMES,
        this.rowsOffset,
      ),
      this.readSheet<string[]>(
        this.teamCriteriaSheetId,
        "asArray",
        this.rowsOffset,
      ),
    ]);

    const teamCriterias = await this.getTeamCriterias();

    const teamMapping = new Map<
      string,
      {
        caseName: string;
        teamTaskScores: ProdTeamCriteriaValue[];
      }
    >();
    for (const criteria of teamCriteriaRows) {
      const [team, caseName, tracks, _score100, _score, ...criteriaValues] =
        criteria;

      const criteriaTypes = tracks!.split(", ").map(parseCriteriaType);
      const teamCriteriaValues = criteriaValues
        .map((criteriaValue, index) => ({
          ...teamCriterias[index]!,
          score: parseNumber(criteriaValue),
        }))
        .filter((criteria) => criteriaTypes.includes(criteria.type));

      teamMapping.set(team!, {
        caseName: caseName!,
        teamTaskScores: teamCriteriaValues,
      });
    }

    return participants.map((row) => {
      const { status, winnerDegree } = parseStatus(row.status);
      const teamAttributes = teamMapping.get(row.team) ?? {
        caseName: undefined,
        teamTaskScores: [],
      };
      const fullName = normalizeFullName(row.fullName);

      return {
        type: "prod",
        fullName,
        team: normalizeTeam(row.team),
        city: normalizeCity(row.city),
        studyGrade: parseGrade(row.grade),
        participationGrade: parseGrade(row.grade),
        track: parseTrack(row.track),
        soloScore: parseNumber(row.soloScore),
        teamScore: parseNumber(row.teamScore),
        ...teamAttributes,
        score: parseNumber(row.score),
        status,
        winnerDegree,
      };
    });
  }
}
