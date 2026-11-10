import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const base = {
  groupName: "Всероссийская олимпиада школьников",
} as const;

const reoEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "reo",
    name: "ВсОШ по экономике",
    maxScore: 96,
    percentileRanking: "participationGrade",
  },
  [
    // NOTE: ocr (too long)
    // {
    //   url: "https://экономика.физтехлицей.рф",
    //   date: new Date("2026-04-21"),
    // },
    {
      url: "https://vseros.hse.ru/econ/2025",
      date: new Date("2025-04-30"),
    },
    {
      url: "https://vseros.hse.ru/econ/2025",
      date: new Date("2023-03-27"),
    },
    {
      url: "https://vseros.hse.ru/econ/2022",
      date: new Date("2022-04-16"),
    },
  ],
);

const rmoEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "rmo",
    name: "ВсОШ по математике",
    maxScore: 56,
    percentileRanking: "participationGrade",
  },
  [
    {
      url: "https://event.cu.ru/bachelor-vseros-math2026",
      date: new Date("2026-04-20"),
    },
    {
      url: "https://math.siriusolymp.ru",
      date: new Date("2025-04-22"),
    },
    // NOTE: ocr (RapidOCR breaks full names on last page)
    // {
    //   url: "https://math.siriusolymp.ru",
    //   date: new Date("2023-04-27"),
    // },
    {
      url: "https://vsoshmath2022.edurm.ru",
      date: new Date("2022-04-23"),
    },
  ],
);

const roaiEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "roai",
    name: "ВсОШ по искусственному интеллекту",
    url: "https://vserosinf.ru/iskusstvennyj-intellekt",
    maxScore: 600,
    percentileRanking: "participationGrade",
  },
  [{ date: new Date("2026-03-28") }],
);

const rocsEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "rocs",
    name: "ВсОШ по информационной безопасности",
    url: "https://vserosinf.ru/informacionnaya-bezopasnost",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { date: new Date("2026-03-28") },
    // NOTE: ocr (lost 10th grade)
    // { date: new Date("2025-04-25") },
    { date: new Date("2023-04-22") },
  ],
);

const roiEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "roi",
    name: "ВсОШ по информатике",
    url: "https://vserosinf.ru/programmirovanie",
    maxScore: 800,
    percentileRanking: true,
  },
  [
    {
      name: "ВсОШ по программированию",
      date: new Date("2026-03-28"),
    },
    { date: new Date("2025-03-30"), percentileRanking: "participationGrade" },
    { date: new Date("2024-04-11") },
    { date: new Date("2023-03-30") },
    { date: new Date("2022-03-30") },
  ],
);

const rphoEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "rpho",
    name: "ВсОШ по физике",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    // NOTE: ocr (too long)
    // {
    //   url: "https://всош-нур.рф/physics",
    //   date: new Date("2026-04-11"),
    // },
    // {
    //   url: "https://vsoshphys2025.edurm.ru",
    //   date: new Date("2025-04-10"),
    // },
    // {
    //   url: "https://phys.siriusolymp.ru",
    //   date: new Date("2024-03-27"),
    // },
    // {
    //   url: "https://physolymp23.spbstu.ru",
    //   date: new Date("2023-04-15"),
    // },
    {
      url: "https://phys.siriusolymp.ru/2022",
      date: new Date("2022-04-07"),
    },
  ],
);

const rroEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "rro",
    name: "ВсОШ по робототехнике",
    url: "https://vserosinf.ru/robototekhnika",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { date: new Date("2026-03-28") },
    { date: new Date("2025-04-25") },
    { date: new Date("2023-04-22") },
  ],
);

const vosEvents: EventMeta[] = [
  ...reoEvents,
  ...rmoEvents,
  ...roaiEvents,
  ...rocsEvents,
  ...roiEvents,
  ...rphoEvents,
  ...rroEvents,
];

export default vosEvents;
