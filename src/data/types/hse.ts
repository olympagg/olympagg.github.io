import type {
  FullName,
  ParticipationStatus,
  Region,
  WinnerDegree,
} from "@/data/types/base";

export interface HSEParticipation {
  type: "hse";

  fullName?: FullName;
  code?: string;
  position: number;
  region: Region;
  participationGrade: number;
  subject?: string;

  score: number;
  status: ParticipationStatus;
  winnerDegree: WinnerDegree;
}
