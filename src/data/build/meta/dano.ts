import type { EventMeta } from "@/data/types/base";
import { expand } from "@/lib/utils";

const danoEvents: EventMeta[] = expand(
  {
    name: "Национальная олимпиада по анализу данных DANO",
    olympiadLevel: 3,
    url: "https://dano.hse.ru",
    maxScore: 100,
    percentileRanking: "participationGrade",
  },
  [
    { id: "dano25", date: new Date("2025-12-17") },
    { id: "dano24", date: new Date("2024-12-18") },
    { id: "dano23", date: new Date("2023-12-21") },
    { id: "dano22", date: new Date("2022-12-22"), olympiadLevel: undefined },
  ],
);

export default danoEvents;
