import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const innoEvents: EventMeta[] = expand(
  {
    name: "Innopolis Open по информатике",
    groupName: "Innopolis Open",
    olympiadLevel: 2,
    url: "https://dovuz.innopolis.university/pre-olympiads/innopolis-open/informatics",
    percentileRanking: true,
    maxScore: 500,
  },
  [
    {
      id: "innoinf26",
      date: new Date("2026-02-14"),
      maxScore: 600,
    },
    {
      id: "innoinf25",
      date: new Date("2025-02-15"),
    },
    {
      id: "innoinf24",
      olympiadLevel: 1,
      date: new Date("2024-02-17"),
    },
    {
      id: "innoinf23",
      date: new Date("2023-02-11"),
    },
    {
      id: "innoinf22",
      date: new Date("2022-02-20"),
    },
  ],
);

export default innoEvents;
