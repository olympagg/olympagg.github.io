import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const rphoEvents: EventMeta[] = expand(
  {
    name: "ВсОШ по физике",
    groupName: "Всероссийская олимпиада школьников",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    {
      id: "rpho26",
      url: "https://всош-нур.рф/physics",
      date: new Date("2025-04-11"),
    },
    // {
    //   id: "rpho25",
    //   url: "https://vsoshphys2025.edurm.ru",
    //   date: new Date("2025-04-10"),
    // },
    // {
    //   id: "rpho24",
    //   url: "https://phys.siriusolymp.ru",
    //   date: new Date("2024-03-27"),
    // },
    // {
    //   id: "rpho23",
    //   url: "https://physolymp23.spbstu.ru",
    //   date: new Date("2023-04-15"),
    // },
    {
      id: "rpho22",
      url: "https://phys.siriusolymp.ru/2022",
      date: new Date("2022-04-07"),
    },
  ],
);

export default rphoEvents;
