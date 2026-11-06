import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const prodEvents: EventMeta[] = expandMeta(
  {
    id: "prod",
    name: "Олимпиада по промышленной разработке PROD",
    url: "https://prodcontest.com",
    maxScore: 100,
  },
  [
    { date: new Date("2026-03-18"), percentileRanking: "track" },
    { date: new Date("2025-03-05"), percentileRanking: true },
    { date: new Date("2024-04-04"), percentileRanking: true },
  ],
);

export default prodEvents;
