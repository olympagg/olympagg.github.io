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

const TASK_MAX_SCORE = 100;

interface ParticipantMatchGroups {
  fullName?: string;
  region?: string;
  city?: string;
  school?: string;
  studyGrade?: string;
}

// Иванов Иван Иванович (Тюменская область)
export const PARTICIPANT_NAME_CITY_BRACES =
  /^(?<fullName>.+?)\s*\((?<city>[^()]+)\)$/;

// Иванов Иван Иванович, 11, Тюменская область
export const PARTICIPANT_NAME_GRADE_REGION =
  /^(?<fullName>.+?),\s*(?<studyGrade>\d+),\s*(?<region>.+)$/;

// Иванов Иван, 11, Россия, Тюмень
export const PARTICIPANT_NAME_GRADE_CITY =
  /^(?<fullName>.+?),\s*(?<studyGrade>\d+),\s*(?<city>.+)$/;

// Иванов Иван, 11
// Иванов Иван
export const PARTICIPANT_NAME_GRADE =
  /^(?<fullName>.+?)(?:,\s*(?<studyGrade>\d+))?$/;

// Иванов Иван Иванович, Тюменская область
// Иванов Иван Иванович,   (trailing comma, no region)
export const PARTICIPANT_NAME_REGION =
  /^(?<fullName>.+?)(?:,\s*(?<region>.+?))?(?:,\s*)?$/;

interface PcmsParserOptions {
  url: string;
  participantRegex: RegExp;
}

export default class PcmsParser implements ParticipationParser {
  url: string;
  participantRegex: RegExp;

  constructor(options: PcmsParserOptions) {
    this.url = options.url;
    this.participantRegex = options.participantRegex;
  }

  parseParticipant(
    value: string,
  ): Pick<
    IndividualParticipation,
    "fullName" | "region" | "city" | "school" | "studyGrade"
  > {
    const match = this.participantRegex.exec(value.trim());
    const fullName = match?.groups?.fullName;
    if (!fullName) {
      throw new Error(`Failed to parse PCMS participant ${value}`);
    }

    const groups = match.groups as ParticipantMatchGroups;

    return {
      fullName: normalizeFullName(fullName),
      region: groups.region
        ? normalizeRegion(groups.region.split(",").at(-1)!)
        : undefined,
      city: groups.city
        ? normalizeCity(groups.city.split(",").at(-1)!)
        : undefined,
      school: groups.school ? normalizeSchool(groups.school) : undefined,
      studyGrade: groups.studyGrade
        ? parseNumber(groups.studyGrade)
        : undefined,
    };
  }

  async parse(): Promise<IndividualParticipation[]> {
    const $ = await loadHtml(this.url);

    const tasks = $("table.standings th.problem")
      .toArray()
      .map((th) => {
        const letter = $(th).text().trim();
        const title = $(th).attr("title");
        if (!title) {
          throw new Error(`PCMS task header missing title: ${letter}`);
        }
        return `${letter} · ${title}`;
      });

    const taskStartIndex = 2;
    const scoreIndex = taskStartIndex + tasks.length;
    const statusIndex = scoreIndex + 1;
    const expectedLength = statusIndex + 1;

    const rows = parseHtmlTableRows($("table.standings tbody tr"));

    return rows.map(({ cells }) => {
      if (cells.length < expectedLength) {
        throw new Error(
          `PCMS row: expected ${expectedLength} cells, got ${cells.length}: ${cells.join(" | ")}`,
        );
      }

      const participantCell = cells[1]!;
      const statusText = cells[statusIndex]!;

      const participant = participantCell.startsWith("ioip")
        ? { fullName: undefined }
        : this.parseParticipant(participantCell);

      return {
        type: "individual",
        ...participant,
        taskScores: tasks.map((task, index) => ({
          name: task,
          maxScore: TASK_MAX_SCORE,
          score: parseNumber(cells[taskStartIndex + index]!),
        })),
        score: parseNumber(cells[scoreIndex]!),
        ...parseStatus(statusText),
      };
    });
  }
}
