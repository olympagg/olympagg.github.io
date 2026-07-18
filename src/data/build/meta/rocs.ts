import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const rocsEvents: EventMeta[] = expand(
  {
    name: "ВсОШ по информационной безопасности",
    groupName: "Всероссийская олимпиада школьников",
    url: "https://vserosinf.ru/informacionnaya-bezopasnost",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { id: "rocs26", date: new Date("2026-03-28") },
    { id: "rocs25", date: new Date("2025-04-25") },
    { id: "rocs23", date: new Date("2023-04-22") },
  ],
);

export default rocsEvents;
