import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const innoEvents: EventMeta[] = expandMeta(
  {
    id: "innoinf",
    name: "Innopolis Open по информатике",
    groupName: "Innopolis Open",
    rcsoName: "Innopolis Open",
    rcsoTrack: "информатика",
    url: "https://dovuz.innopolis.university/pre-olympiads/innopolis-open/informatics",
    percentileRanking: true,
    maxScore: 500,
  },
  [
    {
      date: new Date("2026-02-14"),
      maxScore: 600,
    },
    {
      date: new Date("2025-02-15"),
    },
    {
      date: new Date("2024-02-17"),
    },
    {
      date: new Date("2023-02-11"),
    },
    {
      date: new Date("2022-02-20"),
    },
  ],
);

export default innoEvents;
