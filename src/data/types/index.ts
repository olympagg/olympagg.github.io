import type { SmartUnion } from "@/lib/types";

import type {
  EventId,
  EventMeta,
  FullName,
  ParticipationStatus,
  Region,
  School,
  Team,
  WinnerDegree,
} from "./base";
import type { DanoParticipation } from "./dano";
import type { HSEParticipation } from "./hse";
import type { IndividualParticipation } from "./individual";
import type { NTOParticipation } from "./nto";
import type { ProdParticipation } from "./prod";
import type { RcsoCatalog } from "./rcso";

export type ParsedParticipation = SmartUnion<
  | DanoParticipation
  | HSEParticipation
  | IndividualParticipation
  | NTOParticipation
  | ProdParticipation
>;

export type Participation = ParsedParticipation & {
  eventId: EventId;
  fullName: FullName;
  percentile?: number;
  zScore?: number;
  rank: number;
};

export interface DistributionPoint {
  score: number;
  density: number;
}

export type ThresholdKey =
  | Exclude<WinnerDegree, WinnerDegree.NONE>
  | Exclude<ParticipationStatus, ParticipationStatus.FINALIST>;
export type StatusThresholds = Partial<Record<ThresholdKey, number>>;

export interface ScoreDistribution {
  curve: DistributionPoint[];
  thresholds: StatusThresholds;
}

export interface EventData {
  id: EventId;
  meta: EventMeta;
  participations: Participation[];
  distributions?: Record<string, ScoreDistribution>;
}

export interface EventBundle {
  events: EventData[];
  rcsoCatalogs: RcsoCatalog[];
}

export interface PersonData {
  fullName: FullName;
  school: School | null;
  region: Region | null;
  graduationYear: number | null;
  medianScoreRate: number;
  medianPercentile: number | null;
  medianZScore: number | null;
  favoriteTeammates: { fullName: FullName; count: number }[];
  participations: Participation[];
}

export interface TeamData {
  eventId: EventId;
  team: Team;
  rank: number;
  participations: Participation[];
}

export interface SchoolData {
  school: School;
  persons: PersonData[];
}

export interface RegionData {
  region: Region;
  persons: PersonData[];
}
