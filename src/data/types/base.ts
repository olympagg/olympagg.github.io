import type { ParsedParticipation } from "@/data/types";
import type { Brand, Digit } from "@/lib/types";

export type FullName = Brand<"FullName", string>;
export type Region = Brand<"Region", string>;
export type City = Brand<"City", string>;
export type School = Brand<"School", string>;
export type Team = Brand<"Team", string>;
export type Slug = Brand<"Slug", string>;

export type EventId = `${string}${Digit}${Digit}`;

export type EventGroupName =
  | "Высшая проба"
  | "Innopolis Open"
  | "Всероссийская олимпиада школьников"
  | "Национальная технологическая олимпиада";

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
  maxScore: number;
}

export interface EventMeta {
  id: EventId;
  name: string;
  groupName?: EventGroupName;
  olympiadLevel?: 1 | 2 | 3;
  url: string;
  date: Date;
  maxScore: number;
  percentileRanking: boolean | "participationGrade" | "track";
}

export interface ParticipationParser {
  parse(): Promise<ParsedParticipation[]>;
}
