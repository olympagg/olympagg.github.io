import { ParticipationStatus, WinnerDegree } from "@/data/types/base";

import { normalizeRussian } from "./normalize";

const STATUS_MAPPING = [
  [
    {
      status: ParticipationStatus.PRIZE_WINNER,
      winnerDegree: WinnerDegree.THIRD,
    },
    "3",
    "iii",
    "бронз",
    "bronze",
    "трет",
  ],
  [
    {
      status: ParticipationStatus.PRIZE_WINNER,
      winnerDegree: WinnerDegree.SECOND,
    },
    "2",
    "ii",
    "призер",
    "серебр",
    "silver",
    "второ",
  ],
  [
    { status: ParticipationStatus.WINNER, winnerDegree: WinnerDegree.FIRST },
    "1",
    "i",
    "победитель",
    "золот",
    "gold",
    "перво",
  ],
] as const;

export function parseNumber(value: string): number {
  const parsed = parseFloat(value.trim().replace(",", "."));
  return isNaN(parsed) ? 0 : parsed;
}

export function parseStatus(value: string): {
  status: ParticipationStatus;
  winnerDegree: WinnerDegree;
} {
  value = normalizeRussian(value);

  for (const [result, ...substrings] of STATUS_MAPPING) {
    if (substrings.some((s) => value.toLowerCase().includes(s))) {
      return result;
    }
  }

  return {
    status: ParticipationStatus.FINALIST,
    winnerDegree: WinnerDegree.NONE,
  };
}

export function parseGrade(value: string): number {
  return parseInt(value.replace("Олимпиада ", ""), 10);
}
