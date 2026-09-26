import {
  parseGrade,
  parseNumber,
  parseStatus,
} from "@/data/build/parsers/utils/parse";
import {
  ParticipationStatus,
  type FullName,
  type ParticipationParser,
  type Region,
} from "@/data/types/base";
import type { HSEParticipation } from "@/data/types/hse";

import { fetchBuffer } from "./utils/fetch";
import { normalizeFullName, normalizeRussian } from "./utils/normalize";
import { loadPdfText, parseTableRows } from "./utils/pdf";

const PASSING_SCORES_GRADES = [
  7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 11, 11, 11,
] as const;

const PASSING_SCORES_COLUMNS = [
  "track",
  ...PASSING_SCORES_GRADES.map((_, index) => String(index)),
] as const;

const RESULTS_COLUMNS = [
  "index",
  "position",
  "workCode",
  "region",
  "score",
] as const;

const WINNERS_COLUMNS = [
  "index",
  "position",
  "code",
  "fullName",
  "region",
  "score",
] as const;

// 2023 and earlier do not have position
const LEGACY_FORMAT_LAST_YEAR = 2023;

const LEGACY_RESULTS_COLUMNS = [
  "index",
  "workCode",
  "region",
  "score",
] as const;

const LEGACY_WINNERS_COLUMNS = [
  "index",
  "code",
  "fullName",
  "region",
  "score",
] as const;

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
  | "Основы бизнеса"
  | "Промышленное программирование"
  | "Инженерные науки"
  | "Дизайн"
  | "Экономика"
  | "Финансовая грамотность"
  | "Информатика"
  | "Право"
  | "Математика"
  | "Физика"
  | "Обществознание";

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
      mode: "ocr",
    });
    const rows = parseTableRows(ocrText, PASSING_SCORES_COLUMNS);
    const targetRow = rows.find(
      (row) => normalizeRussian(row.track ?? "").trim() === this.trackName,
    );

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

    const participations: HSEParticipation[] = [];

    for (const [grade, resultId] of resultIds.entries()) {
      const gradePassingScores = passingScores.get(grade);
      if (!gradePassingScores || gradePassingScores.length < 3) {
        throw new Error(`Insufficient passing scores for grade ${grade}`);
      }

      const resultsUrl = this.resultsUrl.replace("{resultId}", resultId);
      const resultsText = await loadPdfText({ url: resultsUrl });
      const resultsColumns =
        this.year <= LEGACY_FORMAT_LAST_YEAR
          ? LEGACY_RESULTS_COLUMNS
          : RESULTS_COLUMNS;

      const matches = parseTableRows(resultsText, resultsColumns).filter(
        (row) => !isNaN(Number(row.index)) && row.index.trim() !== "",
      );

      for (const row of matches) {
        const position = parseNumber(row.index);
        const score = parseNumber(row.score);
        const region = normalizeRussian(row.region).trim() as Region;

        const winnerDegree =
          score >= gradePassingScores[0]!
            ? "1"
            : score >= gradePassingScores[1]!
              ? "2"
              : score >= gradePassingScores[2]!
                ? "3"
                : "none";

        participations.push({
          type: "hse",
          position,
          region,
          participationGrade: grade,
          score,
          ...parseStatus(winnerDegree),
        });
      }

      const parsedCount = matches.length;
      const lastIndex = parseNumber(matches.at(-1)?.index ?? "0");
      if (parsedCount !== lastIndex) {
        throw new Error(
          `Grade ${grade}: parsed ${parsedCount} rows but last sequential index is ${lastIndex}`,
        );
      }
    }

    const winnersMapping = new Map<
      string,
      { fullName: FullName; code: string }
    >();

    for (const [grade, resultId] of resultIds.entries()) {
      const winnersUrl = this.winnersUrl.replace("{resultId}", resultId);
      const winnersText = await loadPdfText({ url: winnersUrl });
      const winnersColumns =
        this.year <= LEGACY_FORMAT_LAST_YEAR
          ? LEGACY_WINNERS_COLUMNS
          : WINNERS_COLUMNS;

      const rows = parseTableRows(winnersText, winnersColumns);

      for (const row of rows) {
        if (!NUMERIC_RE.test(row.index)) {
          continue;
        }

        const position = parseNumber(row.index);
        winnersMapping.set(`${grade} ${position}`, {
          fullName: normalizeFullName(row.fullName.trim()),
          code: row.code.trim(),
        });
      }
    }

    for (const participation of participations) {
      const key = `${participation.participationGrade} ${participation.position}`;
      if (
        participation.status !== ParticipationStatus.FINALIST &&
        !winnersMapping.has(key)
      ) {
        throw new Error(
          `Missing fullName for winner: grade ${participation.participationGrade} pos ${participation.position}`,
        );
      }
    }

    return participations.map((participation) => ({
      ...winnersMapping.get(
        `${participation.participationGrade} ${participation.position}`,
      ),
      ...participation,
    }));
  }
}
