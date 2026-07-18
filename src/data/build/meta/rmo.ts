import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const rmoEvents: EventMeta[] = expand(
  {
    name: "ВсОШ по математике",
    groupName: "Всероссийская олимпиада школьников",
    maxScore: 56,
    percentileRanking: "participationGrade",
  },
  [
    {
      id: "rmo26",
      url: "https://event.cu.ru/bachelor-vseros-math2026",
      date: new Date("2026-04-20"),
    },
    {
      id: "rmo25",
      url: "https://math.siriusolymp.ru",
      date: new Date("2025-04-22"),
    },
    {
      id: "rmo23",
      url: "https://math.siriusolymp.ru",
      date: new Date("2023-04-27"),
    },
    {
      id: "rmo22",
      url: "https://vsoshmath2022.edurm.ru",
      date: new Date("2022-04-23"),
    },
  ],
);

export default rmoEvents;
