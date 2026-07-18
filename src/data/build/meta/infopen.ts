import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const infopenEvents: EventMeta[] = expand(
  {
    name: "Открытая олимпиада по программированию",
    percentileRanking: true,
    maxScore: 800,
  },
  [
    {
      id: "infopen26",
      date: new Date("2026-03-07"),
      url: "https://inf-open.ru/2025-26",
    },
    {
      id: "infopen25",
      date: new Date("2025-03-08"),
      url: "https://inf-open.ru/2024-25",
    },
    {
      id: "infopen24",
      date: new Date("2024-03-09"),
      url: "https://inf-open.ru/2023-24",
    },
    {
      id: "infopen23",
      date: new Date("2023-03-01"),
      url: "https://olympiads.ru/zaoch/2022-23",
    },
    {
      id: "infopen22",
      date: new Date("2022-03-01"),
      url: "https://olympiads.ru/zaoch/2021-22",
    },
  ],
);

export default infopenEvents;
