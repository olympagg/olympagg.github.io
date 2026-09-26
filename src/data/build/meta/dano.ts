import { expandMeta } from "@/data/build/meta/utils";
import type { EventMeta } from "@/data/types/base";

const danoEvents: EventMeta[] = expandMeta(
  {
    id: "dano",
    name: "Национальная олимпиада по анализу данных DANO",
    rcsoName: "Высшая проба",
    rcsoTrack: "анализ данных",
    url: "https://dano.hse.ru",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { date: new Date("2025-12-17") },
    { date: new Date("2024-12-18") },
    { date: new Date("2023-12-21") },
    { date: new Date("2022-12-22"), rcsoName: undefined },
  ],
);

export default danoEvents;
