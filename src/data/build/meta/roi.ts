import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const roiEvents: EventMeta[] = expand(
  {
    name: "ВсОШ по информатике",
    groupName: "Всероссийская олимпиада школьников",
    url: "https://vserosinf.ru/programmirovanie",
    maxScore: 800,
    percentileRanking: true,
  },
  [
    {
      id: "roi26",
      name: "ВсОШ по программированию",
      date: new Date("2026-03-28"),
    },
    { id: "roi25", date: new Date("2025-03-30") },
    { id: "roi24", date: new Date("2024-04-11") },
    { id: "roi23", date: new Date("2023-03-30") },
    { id: "roi22", date: new Date("2022-03-30") },
  ],
);

export default roiEvents;
