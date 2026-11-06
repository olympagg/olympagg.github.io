import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const atommathEvents: EventMeta[] = expandMeta(
  {
    id: "atommath",
    name: "Росатом по математике",
    groupName: "Росатом",
    rcsoName: "Росатом",
    rcsoTrack: "математика",
    url: "https://olymp.mephi.ru/rosatom",
    maxScore: 18,
    percentileRanking: false,
  },
  [
    { date: new Date("2026-02-08"), maxScore: 15 },
    { date: new Date("2025-02-09") },
    { date: new Date("2024-02-17") },
    { date: new Date("2023-03-04"), maxScore: 12 },
    { date: new Date("2022-03-13"), maxScore: 12, rcsoName: undefined },
  ],
);

const atomphysEvents: EventMeta[] = expandMeta(
  {
    id: "atomphys",
    name: "Росатом по физике",
    groupName: "Росатом",
    rcsoName: "Росатом",
    rcsoTrack: "физика",
    url: "https://olymp.mephi.ru/rosatom",
    maxScore: 25,
    percentileRanking: false,
  },
  [
    { date: new Date("2026-02-07") },
    { date: new Date("2025-02-08") },
    { date: new Date("2024-02-18") },
    { date: new Date("2023-03-05") },
    { date: new Date("2022-03-12"), maxScore: 10, rcsoName: undefined },
  ],
);

const atomEvents = [...atommathEvents, ...atomphysEvents];

export default atomEvents;
