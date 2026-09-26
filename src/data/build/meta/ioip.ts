import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const ioipEvents: EventMeta[] = expandMeta(
  {
    id: "ioip",
    name: "ИОИП",
    rcsoName: "Олимпиада школьников по информатике и программированию",
    rcsoTrack: "информатика",
    url: "https://neerc.ifmo.ru/school/ioip",
    percentileRanking: true,
    maxScore: 600,
  },
  [
    {
      date: new Date("2026-04-05"),
    },
    {
      date: new Date("2025-03-23"),
    },
    {
      date: new Date("2024-03-24"),
      maxScore: 500,
    },
    {
      date: new Date("2023-03-26"),
    },
    {
      date: new Date("2022-03-19"),
      maxScore: 500,
    },
  ],
);

export default ioipEvents;
