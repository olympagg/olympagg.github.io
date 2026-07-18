import type {
  FullName,
  ParticipationStatus,
  Region,
  School,
  TaskScore,
  Team,
  WinnerDegree,
} from "@/data/types/base";

export enum DanoTeamCriteriaType {
  TASK = "task",
  ANALYSIS = "analysis",
  RESULTS = "results", // 2024, 2025
  PRESENTATION = "presentation", // 2022, 2023, 2025
}

export interface DanoTeamCriteria {
  type: DanoTeamCriteriaType;
  name: string;
  maxScore: number;
}

export interface DanoTeamCriteriaValue extends DanoTeamCriteria {
  score: number;
}

export interface DanoParticipation {
  type: "dano";

  fullName: FullName;
  team: Team;

  isMale?: boolean;
  region?: Region;
  city?: string;

  studyGrade: number;
  participationGrade: number;
  school: School;

  soloScore: number;
  soloTaskScores: TaskScore[];
  soloWorkUrl?: string;

  teamScore: number;
  teamTaskScores: DanoTeamCriteriaValue[];
  teamPresentationUrl?: string;

  score: number;
  status: ParticipationStatus;
  winnerDegree: WinnerDegree;
}
