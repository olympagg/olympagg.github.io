import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const base = {
  groupName: "Высшая проба",
  rcsoName: "Высшая проба",
  maxScore: 100,
  percentileRanking: "participationGrade",
} as const;

const hsebusEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hsebus",
    name: "Высшая проба по основам бизнеса",
    rcsoTrack: "основы бизнеса",
    url: "https://olymp.hse.ru/mmo/business",
  },
  [
    { date: new Date("2026-02-09") },
    { date: new Date("2025-02-06") },
    { date: new Date("2024-02-15") },
    { date: new Date("2023-02-17") },
    { date: new Date("2022-02-02") },
  ],
);

const hsedevEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hsedev",
    name: "Высшая проба по промышленному программированию",
    rcsoTrack: "промышленное программирование",
    url: "https://olymp.hse.ru/mmo/devcode",
  },
  [
    {
      date: new Date("2026-02-08"),
      maxScore: 1100,
    },
    {
      date: new Date("2025-02-08"),
      maxScore: 100,
      rcsoName: undefined,
    },
  ],
);

const hseengEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hseeng",
    name: "Высшая проба по инженерным наукам",
    rcsoTrack: "инженерные науки",
    url: "https://olymp.hse.ru/mmo/electronics",
  },
  [
    { date: new Date("2026-02-15") },
    { date: new Date("2025-02-09") },
    { date: new Date("2024-02-13") },
    { date: new Date("2023-02-11") },
    { date: new Date("2022-02-01") },
  ],
);

const hsedsgnEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hsedsgn",
    name: "Высшая проба по дизайну",
    rcsoTrack: "дизайн",
    url: "https://olymp.hse.ru/mmo/design",
  },
  [
    { date: new Date("2026-02-13") },
    { date: new Date("2025-02-07") },
    { date: new Date("2024-02-09") },
    { date: new Date("2023-02-18") },
    { date: new Date("2022-02-01") },
  ],
);

const hseeconEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hseecon",
    name: "Высшая проба по экономике",
    rcsoTrack: "экономика",
    url: "https://olymp.hse.ru/mmo/eco",
  },
  [
    { date: new Date("2026-02-08") },
    { date: new Date("2025-02-07") },
    { date: new Date("2024-02-12") },
    { date: new Date("2023-02-16") },
    { date: new Date("2022-01-29") },
  ],
);

const hsefinEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hsefin",
    name: "Высшая проба по финансовой грамотности",
    rcsoTrack: "финансовая грамотность",
    url: "https://olymp.hse.ru/mmo/finance",
  },
  [
    { date: new Date("2026-02-14") },
    { date: new Date("2025-02-09") },
    { date: new Date("2024-02-13") },
    { date: new Date("2023-02-15") },
    { date: new Date("2022-02-05") },
  ],
);

const hseinfEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hseinf",
    name: "Высшая проба по информатике",
    rcsoTrack: "информатика",
    url: "https://olymp.hse.ru/mmo/it",
    maxScore: 500,
  },
  [
    { date: new Date("2026-02-16") },
    { date: new Date("2025-02-17") },
    { date: new Date("2024-02-09") },
    { date: new Date("2023-02-17") },
    { date: new Date("2022-02-06") },
  ],
);

const hselawEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hselaw",
    name: "Высшая проба по праву",
    rcsoTrack: "право",
    url: "https://olymp.hse.ru/mmo/law",
  },
  [
    { date: new Date("2026-02-16") },
    { date: new Date("2025-02-14") },
    { date: new Date("2024-02-11") },
    { date: new Date("2023-02-14") },
    { date: new Date("2022-02-04") },
  ],
);

const hsemathEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hsemath",
    name: "Высшая проба по математике",
    rcsoTrack: "математика",
    url: "https://olymp.hse.ru/mmo/math",
  },
  [
    { date: new Date("2026-02-10") },
    { date: new Date("2025-02-10") },
    { date: new Date("2024-02-08") },
    { date: new Date("2023-02-18") },
    { date: new Date("2022-01-31") },
  ],
);

const hsephysEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hsephys",
    name: "Высшая проба по физике",
    rcsoTrack: "физика",
    url: "https://olymp.hse.ru/mmo/physics",
  },
  [
    { date: new Date("2026-02-06") },
    { date: new Date("2025-02-13") },
    { date: new Date("2024-02-15") },
    { date: new Date("2023-02-10") },
    { date: new Date("2022-01-30") },
  ],
);

const hsesocstEvents: EventMeta[] = expandMeta(
  {
    ...base,
    id: "hsesocst",
    name: "Высшая проба по обществознанию",
    rcsoTrack: "обществознание",
    url: "https://olymp.hse.ru/mmo/soc",
  },
  [
    { date: new Date("2026-02-07") },
    { date: new Date("2025-02-08") },
    { date: new Date("2024-02-10") },
    { date: new Date("2023-02-19") },
    { date: new Date("2022-01-29") },
  ],
);

const hseEvents: EventMeta[] = [
  ...hsebusEvents,
  ...hsedevEvents,
  ...hseengEvents,
  ...hsedsgnEvents,
  ...hseeconEvents,
  ...hsefinEvents,
  ...hseinfEvents,
  ...hselawEvents,
  ...hsemathEvents,
  ...hsephysEvents,
  ...hsesocstEvents,
];

export default hseEvents;
