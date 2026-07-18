import type { FullName, ParticipationStatus, Team } from "@/data/types/base";

export interface NTOParticipation {
  type: "nto";

  fullName: FullName;
  studyGrade: number;
  team: Team;

  firstSubjectName: string;
  firstSubjectScore: number;
  secondSubjectName: string;
  secondSubjectScore: number;
  teamScore: number;

  workUrl?: string;
  score: number;
  status: ParticipationStatus;
}
