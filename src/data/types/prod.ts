import type {
  City,
  FullName,
  ParticipationStatus,
  Region,
  Team,
  WinnerDegree,
} from "@/data/types/base";

export enum ProdTrack {
  BACKEND = "backend",
  FRONTEND = "frontend",
  MOBILE = "mobile",
  MLOPS = "mlops",
}

export enum ProdTeamCriteriaType {
  PRODUCT = "product",
  BACKEND = "backend",
  UI = "ui", // only 2025; merged frontend and mobile
  FRONTEND = "frontend",
  MOBILE = "mobile",
  MLOPS = "mlops",
}

export interface ProdTeamCriteria {
  type: ProdTeamCriteriaType;
  name: string;
  maxScore: number;
}

export interface ProdTeamCriteriaValue extends ProdTeamCriteria {
  score: number;
}

export interface ProdParticipation {
  type: "prod";

  fullName: FullName;
  team?: Team;

  region?: Region;
  city?: City;

  studyGrade: number;
  participationGrade: number;

  track: ProdTrack;
  soloScore: number;
  soloWorkUrl?: string;

  caseName?: string;
  teamScore: number;
  teamTaskScores: ProdTeamCriteriaValue[];
  teamWorkUrl?: string;
  teamPresentationUrl?: string;

  score: number;
  status: ParticipationStatus;
  winnerDegree: WinnerDegree;
}

const TRACK_MAPPING: Record<string, ProdTrack> = {
  бэкенд: ProdTrack.BACKEND,
  "бэкенд разработка": ProdTrack.BACKEND,

  фронтенд: ProdTrack.FRONTEND,
  "фронтенд разработка": ProdTrack.FRONTEND,

  мобилка: ProdTrack.MOBILE,
  "мобильная разработка": ProdTrack.MOBILE,

  "mlops-инжиниринг": ProdTrack.MLOPS,
};

export function parseTrack(value: string): ProdTrack {
  const key = value.toLowerCase();
  if (TRACK_MAPPING[key]) {
    return TRACK_MAPPING[key];
  }

  throw new Error(`Unknown track: ${value}`);
}

const CRITERIA_TYPE_MAPPING: Record<string, ProdTeamCriteriaType> = {
  Product: ProdTeamCriteriaType.PRODUCT,
  Backend: ProdTeamCriteriaType.BACKEND,
  Frontend: ProdTeamCriteriaType.FRONTEND,
  Mobile: ProdTeamCriteriaType.MOBILE,
  ML: ProdTeamCriteriaType.MLOPS,
};

export function parseCriteriaType(value: string): ProdTeamCriteriaType {
  if (CRITERIA_TYPE_MAPPING[value]) {
    return CRITERIA_TYPE_MAPPING[value];
  }

  throw new Error(`Unknown criteria type: ${value}`);
}
