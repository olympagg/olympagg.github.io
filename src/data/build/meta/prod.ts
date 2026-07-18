import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const prodEvents: EventMeta[] = expand(
  {
    name: "Олимпиада по промышленной разработке PROD",
    url: "https://prodcontest.com",
    maxScore: 100,
  },
  [
    { id: "prod26", date: new Date("2026-03-18"), percentileRanking: "track" },
    { id: "prod25", date: new Date("2025-03-05"), percentileRanking: true },
    { id: "prod24", date: new Date("2024-04-04"), percentileRanking: true },
  ],
);

export default prodEvents;
