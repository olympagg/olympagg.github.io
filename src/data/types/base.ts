import type { ParsedParticipation } from "@/data/types";
import type { Brand, Digit } from "@/lib/types";

import type { RcsoLevel } from "./rcso";

export type FullName = Brand<"FullName", string>;
export type Region = Brand<"Region", string>;
export type City = Brand<"City", string>;
export type School = Brand<"School", string>;
export type Team = Brand<"Team", string>;
export type Slug = Brand<"Slug", string>;

export type EventId = `${string}${Digit}${Digit}`;

export type EventGroupName =
  | "Innopolis Open"
  | "Всероссийская олимпиада школьников"
  | "Высшая проба"
  | "Национальная технологическая олимпиада"
  | "Росатом";

export enum ParticipationStatus {
  WINNER = "winner",
  PRIZE_WINNER = "prize_winner",
  FINALIST = "finalist",
}

export enum WinnerDegree {
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  NONE = "none",
}

export interface TaskScore {
  name: string;
  score: number;
  maxScore?: number;
}

export interface EventMeta {
  id: EventId;
  name: string;
  groupName?: EventGroupName;
  rcsoName?: string;
  rcsoTrack?: string;
  rcsoLevel?: RcsoLevel;
  url: string;
  date: Date;
  maxScore: number;
  percentileRanking: boolean | "participationGrade" | "track";
}

export interface ParticipationParser {
  parse(): Promise<ParsedParticipation[]>;
}
