import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const hseinfEvents: EventMeta[] = expand(
  {
    name: "Высшая проба по информатике",
    groupName: "Высшая проба",
    olympiadLevel: 1,
    url: "https://olymp.hse.ru/mmo/it",
    maxScore: 500,
    percentileRanking: "participationGrade",
  },
  [
    { id: "hseinf26", date: new Date("2026-02-16") },
    { id: "hseinf25", date: new Date("2025-02-17") },
    { id: "hseinf24", date: new Date("2024-02-09") },
  ],
);

const hsemathEvents: EventMeta[] = expand(
  {
    name: "Высшая проба по математике",
    groupName: "Высшая проба",
    olympiadLevel: 1,
    url: "https://olymp.hse.ru/mmo/math",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { id: "hsemath26", date: new Date("2026-02-10") },
    { id: "hsemath25", date: new Date("2025-02-10") },
    { id: "hsemath24", date: new Date("2024-02-08") },
  ],
);

const hsedevEvents: EventMeta[] = expand(
  {
    name: "Высшая проба по промышленному программированию",
    groupName: "Высшая проба",
    olympiadLevel: 2,
    url: "https://olymp.hse.ru/mmo/devcode",
    percentileRanking: "participationGrade",
  },
  [
    {
      id: "hsedev26",
      date: new Date("2026-02-08"),
      maxScore: 1100,
    },
    {
      id: "hsedev25",
      date: new Date("2025-02-08"),
      maxScore: 100,
      olympiadLevel: undefined,
    },
  ],
);

const hseeconEvents: EventMeta[] = expand(
  {
    name: "Высшая проба по экономике",
    groupName: "Высшая проба",
    url: "https://olymp.hse.ru/mmo/eco",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { id: "hseecon26", date: new Date("2026-02-08"), olympiadLevel: 1 },
    { id: "hseecon25", date: new Date("2025-02-07"), olympiadLevel: 2 },
    { id: "hseecon24", date: new Date("2024-02-12"), olympiadLevel: 2 },
  ],
);

const hsephysEvents: EventMeta[] = expand(
  {
    name: "Высшая проба по физике",
    groupName: "Высшая проба",
    olympiadLevel: 2,
    url: "https://olymp.hse.ru/mmo/physics",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { id: "hsephys26", date: new Date("2026-02-06") },
    { id: "hsephys25", date: new Date("2025-02-13") },
    { id: "hsephys24", date: new Date("2024-02-15") },
  ],
);

const hselawEvents: EventMeta[] = expand(
  {
    name: "Высшая проба по праву",
    groupName: "Высшая проба",
    olympiadLevel: 1,
    url: "https://olymp.hse.ru/mmo/law",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { id: "hselaw26", date: new Date("2026-02-16") },
    { id: "hselaw25", date: new Date("2025-02-14") },
    { id: "hselaw24", date: new Date("2024-02-11") },
  ],
);

const hseEvents: EventMeta[] = [
  ...hseinfEvents,
  ...hsemathEvents,
  ...hsedevEvents,
  ...hseeconEvents,
  ...hsephysEvents,
  ...hselawEvents,
];

export default hseEvents;
