import {
  parseGrade,
  parseNumber,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import {
  ParticipationStatus,
  type ParticipationParser,
  type Region,
} from "@/data/types/base";
import type { HSEParticipation } from "@/data/types/hse";

import { fetchBuffer } from "./utils/fetch";
import { normalizeFullName } from "./utils/normalize";
import { loadPdfText, parseTableRows } from "./utils/pdf";

const PASSING_SCORES_GRADES = [
  7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11,
] as const;

const PASSING_SCORES_COLUMNS = [
  "track",
  ...PASSING_SCORES_GRADES.map((_, index) => String(index)),
] as const;

const RESULTS_COLUMNS_2024 = [
  "index",
  "position",
  "workCode",
  "region",
  "score",
] as const;

const WINNERS_COLUMNS_2024 = [
  "index",
  "position",
  "code",
  "fullName",
  "region",
  "score",
] as const;

const RESULTS_COLUMNS = [...RESULTS_COLUMNS_2024, "subject"] as const;

const WINNERS_COLUMNS = [...WINNERS_COLUMNS_2024, "subject"] as const;

const RESULTS_COLUMNS_LEGACY = [
  "index",
  "workCode",
  "region",
  "score",
] as const;

const WINNERS_COLUMNS_LEGACY = [
  "index",
  "code",
  "fullName",
  "region",
  "score",
] as const;

function getTableColumns(year: number) {
  if (year <= 2023) {
    return { results: RESULTS_COLUMNS_LEGACY, winners: WINNERS_COLUMNS_LEGACY };
  }

  if (year === 2024) {
    return { results: RESULTS_COLUMNS_2024, winners: WINNERS_COLUMNS_2024 };
  }

  return { results: RESULTS_COLUMNS, winners: WINNERS_COLUMNS };
}

const NUMERIC_RE = /^\d+$/;

const OLYMPIADS_XML_QUERY = `
<root>
	<query class="TAdmissionYear" fetchall="1">
		<item part="0" name="ID"/>
		<item part="0" name="YearNumber"/>
		<item part="0" name="OlympLearnYear$D"/>
		<item part="0" name="SchoolOlympGen"/>
		<item part="1" name="PublishSchOlympResult" value="1"/>
		<item part="2" name="YearNumber" special="desc"/>
	</query>
	<query class="TRoundComp" fetchall="1">
		<item part="0" name="Name"/>
		<item part="0" name="AdmissionYear"/>
		<item part="1" name="BachRoundType$N" value="brtOlimpic"/>
		<item part="1" name="PublishSchOlympResult" value="1"/>
		<item part="3" name="Name"/>
		<item part="3" name="AdmissionYear"/>
		<item part="2" name="Name"/>
	</query>
	<query class="TRoundComp" fetchall="1">
		<item part="0" name="ID"/>
		<item part="0" name="Master"/>
		<item part="0" name="Name"/>
		<item part="0" name="AdmissionYear"/>
		<item part="0" name="PublFirstStageResult"/>
		<item part="0" name="PublRecomResult"/>
		<item part="0" name="PublSecondStageResult"/>
		<item part="0" name="PublDiplomantsResult"/>
		<item part="1" name="BachRoundType$N" value="brtOlimpic"/>
		<item part="1" name="PublishSchOlympResult" value="1"/>
	</query>
	<query class="TBachRound" fetchall="1">
		<item part="0" name="ID"/>
		<item part="0" name="Name"/>
		<item part="1" name="BachRoundType$N" value="brtOlimpic"/>
		<item part="2" name="Name"/>
	</query>
</root>
`;

interface OlympiadYearInfo {
  ID: number;
  YearNumber: number;
}

interface SubjectAdmission {
  Name: string;
  AdmissionYear: number;
}

interface ResultPublicationInfo {
  ID: number;
  Master: number;
  Name: string;
  AdmissionYear: number;
  PublFirstStageResult: 0 | 1;
  PublRecomResult: 0 | 1;
  PublSecondStageResult: 0 | 1;
  PublDiplomantsResult: 0 | 1;
}

interface GradeInfo {
  ID: number;
  Name: string;
}

type OlympiadsResponse = [
  { data: OlympiadYearInfo[] },
  { data: SubjectAdmission[] },
  { data: ResultPublicationInfo[] },
  { data: GradeInfo[] },
];

type TrackName =
  | "Дизайн"
  | "Инженерные науки"
  | "Информатика"
  | "Математика"
  | "Обществознание"
  | "Основы бизнеса"
  | "Право"
  | "Промышленное программирование"
  | "Физика"
  | "Финансовая грамотность"
  | "Экономика";

export default class HseParser implements ParticipationParser {
  olympiadsUrl = "https://olymp50.hse.ru/hseAnonymous/batch.js";
  resultsUrl =
    "https://olymp52.hse.ru/OLYMPREPORTS/MMO/SecondStage/Results/{resultId}.pdf";
  winnersUrl =
    "https://olymp52.hse.ru/OLYMPREPORTS/MMO/SecondStage/Diplomants/{resultId}.pdf";

  year: number;
  trackName: TrackName;

  passingScoresUrl: string;

  constructor(options: {
    year: number;
    trackName: TrackName;
    passingScoresUrl: string;
  }) {
    this.year = options.year;
    this.trackName = options.trackName;
    this.passingScoresUrl = options.passingScoresUrl;
  }

  async getResultIds(): Promise<Map<number, string>> {
    const params = new URLSearchParams();
    params.append("query", OLYMPIADS_XML_QUERY);
    params.append("dojo.preventCache", String(new Date().getTime()));

    const response = await fetchBuffer(this.olympiadsUrl, {
      method: "POST",
      body: params.toString(),
      headers: {
        "Accept-Encoding": "identity", // disable gzip
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    const responseText = new TextDecoder().decode(response);
    const responseData = JSON.parse(responseText) as OlympiadsResponse;

    const [
      { data: years },
      { data: _trackNames },
      { data: tracks },
      { data: grades },
    ] = responseData;

    const yearId = years.find((year) => year.YearNumber == this.year)?.ID;
    if (!yearId) {
      throw new Error(`Can't find year ID for year ${this.year}`);
    }

    const olympiads = tracks.filter(
      (o) => o.AdmissionYear == yearId && o.Name == this.trackName,
    );
    if (olympiads.length === 0) {
      throw new Error(
        `Can't find olympiads with year ${this.year} and name ${this.trackName}`,
      );
    }

    const resultIds = new Map<number, string>();

    for (const olympiad of olympiads) {
      const grade = grades.find((g) => g.ID == olympiad.Master);
      if (!grade) {
        throw new Error(`Can't find grade for olympiad ${olympiad.ID}`);
      }

      resultIds.set(parseGrade(grade.Name), String(olympiad.ID));
    }

    return resultIds;
  }

  async getPassingScores(): Promise<Map<number, number[]>> {
    const ocrText = await loadPdfText({
      url: this.passingScoresUrl,
      mode: "mixed",
    });
    const rows = parseTableRows(ocrText, PASSING_SCORES_COLUMNS);
    const targetRow = rows.find((row) => row.track === this.trackName);

    if (!targetRow) {
      throw new Error(
        `Can't find passing scores row for track "${this.trackName}"`,
      );
    }

    const result = new Map<number, number[]>();

    for (const [index, grade] of PASSING_SCORES_GRADES.entries()) {
      const score = parseNumber(targetRow[String(index)]!);
      if (score === 0) {
        continue;
      }

      const scores = result.get(grade) ?? [];
      scores.push(score);
      result.set(grade, scores);
    }

    return result;
  }

  async parse(): Promise<HSEParticipation[]> {
    const passingScores = await this.getPassingScores();
    const resultIds = await this.getResultIds();
    const columns = getTableColumns(this.year);

    const participations: HSEParticipation[] = [];

    for (const [grade, resultId] of resultIds.entries()) {
      const gradePassingScores = passingScores.get(grade);
      if (!gradePassingScores || gradePassingScores.length < 3) {
        throw new Error(`Insufficient passing scores for grade ${grade}`);
      }

      const resultsUrl = this.resultsUrl.replace("{resultId}", resultId);
      const rows = parseTableRows(
        await loadPdfText({ url: resultsUrl }),
        columns.results,
      ).filter((row) => NUMERIC_RE.test(row.index));

      const winnersUrl = this.winnersUrl.replace("{resultId}", resultId);
      const winnerRows = parseTableRows(
        await loadPdfText({ url: winnersUrl }),
        columns.winners,
      ).filter((row) => NUMERIC_RE.test(row.index));

      const winners = new Map(
        winnerRows.map((row) => [
          parseNumber(row.index),
          { fullName: normalizeFullName(row.fullName), code: row.code },
        ]),
      );

      const lastIndex = parseNumber(rows.at(-1)?.index ?? "0");
      if (rows.length !== lastIndex) {
        throw new Error(
          `Grade ${grade}: parsed ${rows.length} rows but last sequential index is ${lastIndex}`,
        );
      }

      for (const row of rows) {
        const position = parseNumber(row.index);
        const score = parseNumber(row.score);
        const degree =
          gradePassingScores.findIndex(
            (passingScore) => score >= passingScore,
          ) + 1;
        const { status, winnerDegree } = parseStatus(String(degree));

        const winner = winners.get(position);
        if (status !== ParticipationStatus.FINALIST && !winner) {
          throw new Error(
            `Missing fullName for winner: grade ${grade} pos ${position}`,
          );
        }

        participations.push({
          ...winner,
          type: "hse",
          position,
          region: row.region as Region,
          participationGrade: grade,
          subject: ("subject" in row && row.subject) || undefined,
          score,
          status,
          winnerDegree,
        });
      }
    }

    return participations;
  }
}
