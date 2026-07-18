import {
  normalizeFullName,
  normalizeRegion,
  normalizeTeam,
} from "@/data/build/parsers/utils/normalize";
import {
  parseNumber,
  parseGrade,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import type { ParticipationParser, Team } from "@/data/types/base";

import {
  parseTrack,
  ProdTeamCriteriaType,
  type ProdParticipation,
  type ProdTeamCriteriaValue,
} from "../../types/prod";

import { loadExcel, type WorkbookWrapper } from "./utils/excel";

const PARTICIPANT_COLUMN_NAMES = [
  "fullName",
  "region",
  "grade",
  "soloScore",
  "teamScore",
  "score",
  "status",
  "track",
  "team",
] as const;
type ParticipantColumnName = (typeof PARTICIPANT_COLUMN_NAMES)[number];
type ParticipantRow = Record<ParticipantColumnName, string>;

const PROD25_TEAM_CRITERIA_MAPPING = {
  backend1: {
    type: ProdTeamCriteriaType.BACKEND,
    name: "Архитектурные решения",
  },
  backend2: { type: ProdTeamCriteriaType.BACKEND, name: "Организация CI/CD" },
  backend3: {
    type: ProdTeamCriteriaType.BACKEND,
    name: "Работоспособность",
  },
  backend4: { type: ProdTeamCriteriaType.BACKEND, name: "Тестирование" },
  backend5: {
    type: ProdTeamCriteriaType.BACKEND,
    name: "Общее впечатление",
  },
  ui1: { type: ProdTeamCriteriaType.UI, name: "Навигация и UX" },
  ui2: { type: ProdTeamCriteriaType.UI, name: "Адаптивность" },
  ui3: { type: ProdTeamCriteriaType.UI, name: "Визуальная привлекательность" },
  ui4: { type: ProdTeamCriteriaType.UI, name: "Работоспособность" },
  ui5: { type: ProdTeamCriteriaType.UI, name: "Общее впечатление" },
  product1: { type: ProdTeamCriteriaType.PRODUCT, name: "Полнота функционала" },
  product2: {
    type: ProdTeamCriteriaType.PRODUCT,
    name: "Проработанность бизнес-сценариев",
  },
  product3: {
    type: ProdTeamCriteriaType.PRODUCT,
    name: "Презентация бизнес-ценности",
  },
  product4: {
    type: ProdTeamCriteriaType.PRODUCT,
    name: "Дополнительные функции",
  },
  product5: {
    type: ProdTeamCriteriaType.PRODUCT,
    name: "Общее впечатление",
  },
  product6: {
    type: ProdTeamCriteriaType.PRODUCT,
    name: "Структура презентации",
  },
  product7: {
    type: ProdTeamCriteriaType.PRODUCT,
    name: "Общее впечатление от проекта",
  },
};

const PROD25_TEAM_CRITERIA_COLUMN_NAMES = [
  "team",
  "score",
  "score100",
  "backend1",
  "backend2",
  "backend3",
  "backend4",
  "backend5",
  "ui1",
  "ui2",
  "ui3",
  "ui4",
  "ui5",
  "product1",
  "product2",
  "product3",
  "product4",
  "product5",
  "product6",
  "product7",
] as const;
type Prod25TeamCriteriaColumnName =
  (typeof PROD25_TEAM_CRITERIA_COLUMN_NAMES)[number];
type Prod25TeamCriteriaRow = Record<Prod25TeamCriteriaColumnName, string>;

export class Prod24Parser implements ParticipationParser {
  tableUrl: string;
  participantSheetName = "ВСЕ";
  participantRowsOffset = 2;

  constructor(tableUrl: string) {
    this.tableUrl = tableUrl;
  }

  parseParticipants(workbook: WorkbookWrapper): ProdParticipation[] {
    const participants = workbook.getRows<ParticipantRow>(
      this.participantSheetName,
      PARTICIPANT_COLUMN_NAMES,
      this.participantRowsOffset,
    );

    return participants.map((row) => {
      const { status, winnerDegree } = parseStatus(row.status);

      return {
        type: "prod",
        fullName: normalizeFullName(row.fullName),
        team: normalizeTeam(row.team),
        region: normalizeRegion(row.region),
        studyGrade: parseGrade(row.grade),
        participationGrade: parseGrade(row.grade),
        track: parseTrack(row.track),
        soloScore: parseNumber(row.soloScore),
        teamScore: parseNumber(row.teamScore),
        caseName: undefined,
        teamTaskScores: [],
        score: parseNumber(row.score),
        status,
        winnerDegree,
      };
    });
  }

  async parse(): Promise<ProdParticipation[]> {
    const workbook = await loadExcel(this.tableUrl);
    return this.parseParticipants(workbook);
  }
}

export class Prod25Parser extends Prod24Parser implements ParticipationParser {
  override participantSheetName = "Итог";
  teamCriteriaSheetName = "Командный тур";
  teamCriteriaRowsOffset = 1;

  override async parse(): Promise<ProdParticipation[]> {
    const workbook = await loadExcel(this.tableUrl);
    const participants = this.parseParticipants(workbook);

    const teamCriterias = workbook.getRows<Prod25TeamCriteriaRow>(
      this.teamCriteriaSheetName,
      PROD25_TEAM_CRITERIA_COLUMN_NAMES,
      this.teamCriteriaRowsOffset,
    );

    const teamCriteriasMap = new Map<Team, Prod25TeamCriteriaRow>();
    for (const criteria of teamCriterias) {
      teamCriteriasMap.set(normalizeTeam(criteria.team), criteria);
    }

    return participants.map((participant) => {
      let teamCriteriaValues: ProdTeamCriteriaValue[] = [];

      if (participant.team) {
        const criteria = teamCriteriasMap.get(participant.team);
        if (!criteria) {
          throw new Error(
            `Team criteria not found for team: ${participant.team}`,
          );
        }

        teamCriteriaValues = (
          Object.keys(
            PROD25_TEAM_CRITERIA_MAPPING,
          ) as (keyof typeof PROD25_TEAM_CRITERIA_MAPPING)[]
        ).map((key) => ({
          ...PROD25_TEAM_CRITERIA_MAPPING[key],
          score: parseNumber(criteria[key]),
          maxScore: 2,
        }));
      }

      return {
        ...participant,
        teamTaskScores: teamCriteriaValues,
      };
    });
  }
}
