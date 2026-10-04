import type {
  FullName,
  ParticipationStatus,
  Region,
  School,
  TaskScore,
  WinnerDegree,
} from "@/data/types/base";

export interface IndividualParticipation {
  type: "individual";

  fullName?: FullName;
  region?: Region;
  city?: string;

  school?: School;
  studyGrade?: number;
  participationGrade?: number;

  taskScores: TaskScore[];
  score: number;
  workUrl?: string;

  status: ParticipationStatus;
  winnerDegree?: WinnerDegree;
}
