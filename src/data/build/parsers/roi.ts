import {
  normalizeFullName,
  normalizeOcr,
  normalizeRegion,
} from "@/data/build/parsers/utils/normalize";
import type { ParticipationParser, TaskScore } from "@/data/types/base";
import { ParticipationStatus } from "@/data/types/base";

import type { IndividualParticipation } from "../../types/individual";

import { loadHtml } from "./utils/html";
import { loadJson } from "./utils/json";
import { parseNumber } from "./utils/parse";

const TASK_NAMES = ["A1", "B1", "C1", "D1", "A2", "B2", "C2", "D2"];

const PASSING_SCORES_KEYWORDS = {
  winner: "Победитель",
  prizeWinner: "Призер",
};

interface ParticipantRow {
  name: string;
  location: string;
  form: number;
  rank: (number | null)[];
  sumRank: number;
  disqual: boolean;
}

function makePassingScoreRe(word: string) {
  return new RegExp(
    String.raw`if\(\s*row\.sumRank\s*>=\s*(\d+)\s*\)\s*\{\s*addTd\("${word}"`,
  );
}

function makePassingScoresRe(word: string) {
  return new RegExp(
    String.raw`if\(\s*row\.sumRank\s*>=\s*\((\{(?:\s*\d{1,2}:\s*\d+,)+\s*\})\[row\.form\]\s*\|\|\s*Infinity\)\s*\)\s*\{\s*addTd\("${word}"`,
  );
}

export default class RoiParser implements ParticipationParser {
  pageUrl = "https://roi.algocode.ru/roi_{year}/";
  dataUrl = "https://roi.algocode.ru/_api/roi_{year}.json";
  year: number;

  constructor(year: number) {
    this.year = year;
  }

  async getPassingScores(): Promise<
    Record<number, { winner: number; prizeWinner: number }>
  > {
    const pageUrl = this.pageUrl.replace("{year}", String(this.year));
    const $ = await loadHtml(pageUrl);
    const scriptSource = $("script").first().text();

    const passingScores = Object.fromEntries(
      Array.from({ length: 11 }, (_, i) => [
        i + 1,
        { winner: Infinity, prizeWinner: Infinity },
      ]),
    );

    for (const field of ["winner", "prizeWinner"] as const) {
      const keyword = PASSING_SCORES_KEYWORDS[field];

      const multiMatch = scriptSource.match(makePassingScoresRe(keyword));
      if (multiMatch) {
        for (const [, grade, passingScore] of multiMatch[1]!.matchAll(
          /(\d{1,2}):\s*(\d+)/g,
        )) {
          passingScores[parseNumber(grade!)]![field] = parseNumber(
            passingScore!,
          );
        }

        continue;
      }

      const singleMatch = scriptSource.match(makePassingScoreRe(keyword));
      if (singleMatch) {
        const passingScore = parseNumber(singleMatch[1]!);
        for (let grade = 1; grade <= 11; grade++) {
          passingScores[grade]![field] = passingScore;
        }

        continue;
      }

      throw new Error(`Could not find passing score for "${keyword}"`);
    }

    return passingScores;
  }

  async parse(): Promise<IndividualParticipation[]> {
    const dataUrl = this.dataUrl.replace("{year}", String(this.year));
    const participants = await loadJson<ParticipantRow[]>(dataUrl);

    const passingScores = await this.getPassingScores();

    return participants.map((row) => {
      const taskScores: TaskScore[] = TASK_NAMES.map((name, i) => ({
        name,
        maxScore: 100,
        score: row.rank[i] ?? 0,
      }));

      let status = ParticipationStatus.FINALIST;

      if (row.sumRank >= passingScores[row.form]!.winner) {
        status = ParticipationStatus.WINNER;
      } else if (row.sumRank >= passingScores[row.form]!.prizeWinner) {
        status = ParticipationStatus.PRIZE_WINNER;
      }

      return {
        type: "individual",
        fullName: normalizeFullName(normalizeOcr(row.name)),
        region: normalizeRegion(row.location),
        studyGrade: row.form,
        taskScores,
        score: row.sumRank,
        status,
      };
    });
  }
}
