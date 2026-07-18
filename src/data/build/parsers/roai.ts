import {
  normalizeFullName,
  normalizeRegion,
  normalizeSchool,
} from "@/data/build/parsers/utils/normalize";
import type { ParticipationParser } from "@/data/types/base";
import { ParticipationStatus } from "@/data/types/base";

import type { IndividualParticipation } from "../../types/individual";

import { loadJson } from "./utils/json";
import { parseGrade } from "./utils/parse";

interface RoaiData {
  rows: ParticipantRow[];
}

interface ParticipantRow {
  name: string;
  region: string;
  school: string;
  grade: string;
  total: number;
  diploma: string | null;
  dq: boolean;
  m_a: number;
  m_b: number;
  m_c: number;
  m_d: number;
  m_e: number;
  m_f: number;
  a1: number;
  a2: number;
  a3: number;
  b: number;
  c: number;
  d: number;
  e: number;
}

const TASKS: {
  field: keyof ParticipantRow;
  name: string;
  maxScore: number;
}[] = [
  { field: "m_a", name: "Математика A", maxScore: 50 },
  { field: "m_b", name: "Математика B", maxScore: 50 },
  { field: "m_c", name: "Математика C", maxScore: 50 },
  { field: "m_d", name: "Математика D", maxScore: 50 },
  { field: "m_e", name: "Математика E", maxScore: 50 },
  { field: "m_f", name: "Математика F", maxScore: 50 },
  { field: "a1", name: "Практика A1", maxScore: 20 },
  { field: "a2", name: "Практика A2", maxScore: 20 },
  { field: "a3", name: "Практика A3", maxScore: 20 },
  { field: "b", name: "Практика B", maxScore: 60 },
  { field: "c", name: "Практика C", maxScore: 60 },
  { field: "d", name: "Практика D", maxScore: 60 },
  { field: "e", name: "Практика E", maxScore: 60 },
] as const;

export default class RoaiParser implements ParticipationParser {
  dataUrl: string;

  constructor(dataUrl: string) {
    this.dataUrl = dataUrl;
  }

  async parse(): Promise<IndividualParticipation[]> {
    const participants = await loadJson<RoaiData>(this.dataUrl);

    return participants.rows.map((row) => {
      const taskScores = TASKS.map(({ field, name, maxScore }) => ({
        name,
        maxScore,
        score: Number(row[field] ?? 0),
      }));

      let status = ParticipationStatus.FINALIST;
      if (row.diploma === "winner") {
        status = ParticipationStatus.WINNER;
      } else if (row.diploma === "prize") {
        status = ParticipationStatus.PRIZE_WINNER;
      }

      return {
        type: "individual",
        fullName: normalizeFullName(row.name),
        region: normalizeRegion(row.region),
        school: normalizeSchool(row.school),
        participationGrade: parseGrade(row.grade),
        taskScores,
        score: row.total,
        status,
      };
    });
  }
}
