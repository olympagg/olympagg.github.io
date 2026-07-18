import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const reoEvents: EventMeta[] = expand(
  {
    name: "ВсОШ по экономике",
    groupName: "Всероссийская олимпиада школьников",
    maxScore: 96,
    percentileRanking: "participationGrade",
  },
  [
    {
      id: "reo26",
      url: "https://экономика.физтехлицей.рф",
      date: new Date("2026-04-21"),
    },
    {
      id: "reo25",
      url: "https://vseros.hse.ru/econ/2025",
      date: new Date("2025-04-30"),
    },
    {
      id: "reo23",
      url: "https://vseros.hse.ru/econ/2025",
      date: new Date("2023-03-27"),
    },
    {
      id: "reo22",
      url: "https://vseros.hse.ru/econ/2022",
      date: new Date("2022-04-16"),
    },
  ],
);

export default reoEvents;
