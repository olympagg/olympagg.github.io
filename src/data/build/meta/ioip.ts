import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const ioipEvents: EventMeta[] = expand(
  {
    name: "ИОИП",
    olympiadLevel: 1,
    url: "https://neerc.ifmo.ru/school/ioip",
    percentileRanking: true,
    maxScore: 600,
  },
  [
    {
      id: "ioip26",
      date: new Date("2026-04-05"),
    },
    {
      id: "ioip25",
      date: new Date("2025-03-23"),
    },
    {
      id: "ioip24",
      date: new Date("2024-03-24"),
      maxScore: 500,
    },
    {
      id: "ioip23",
      date: new Date("2023-03-26"),
    },
    {
      id: "ioip22",
      date: new Date("2022-03-19"),
      maxScore: 500,
    },
  ],
);

export default ioipEvents;
