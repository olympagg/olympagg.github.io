import type {
  FullName,
  ParticipationStatus,
  TaskScore,
  Team,
} from "@/data/types/base";

export interface NTOParticipation {
  type: "nto";

  fullName: FullName;
  studyGrade: number;
  team: Team;

  taskScores: TaskScore[];
  teamScore: number;

  workUrl?: string;
  score: number;
  status: ParticipationStatus;
}
