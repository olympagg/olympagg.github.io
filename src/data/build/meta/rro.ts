import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const rroEvents: EventMeta[] = expand(
  {
    name: "ВсОШ по робототехнике",
    groupName: "Всероссийская олимпиада школьников",
    url: "https://vserosinf.ru/robototekhnika",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { id: "rro26", date: new Date("2026-03-28") },
    { id: "rro25", date: new Date("2025-04-25") },
    { id: "rro23", date: new Date("2023-04-22") },
  ],
);

export default rroEvents;
