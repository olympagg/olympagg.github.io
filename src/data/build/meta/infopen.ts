import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const infopenEvents: EventMeta[] = expandMeta(
  {
    id: "infopen",
    name: "Открытая олимпиада по программированию",
    rcsoName: "Открытая олимпиада школьников по программированию",
    rcsoTrack: "информатика",
    percentileRanking: true,
    maxScore: 800,
  },
  [
    {
      date: new Date("2026-03-07"),
      url: "https://inf-open.ru/2025-26",
      percentileRanking: "participationGrade",
    },
    {
      date: new Date("2025-03-08"),
      url: "https://inf-open.ru/2024-25",
    },
    {
      date: new Date("2024-03-09"),
      url: "https://inf-open.ru/2023-24",
    },
    {
      date: new Date("2023-03-01"),
      url: "https://olympiads.ru/zaoch/2022-23",
    },
    {
      date: new Date("2022-03-01"),
      url: "https://olympiads.ru/zaoch/2021-22",
    },
  ],
);

export default infopenEvents;
