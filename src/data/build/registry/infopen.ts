import InfopenParser from "@/data/build/parsers/infopen";
import { wayback } from "@/data/build/parsers/utils/archive";
import type { EventId, ParticipationParser } from "@/data/types/base";

const infopenParsers: Record<EventId, ParticipationParser> = {
  infopen26: new InfopenParser({
    url: wayback(
      "https://inf-open.ru/2025-26/final-results/",
      "20260418194412",
    ),
  }),
  infopen25: new InfopenParser({
    url: wayback(
      "https://inf-open.ru/2024-25/final-results/",
      "20250716060500",
    ),
  }),
  // Место | ФИО | Класс | Город | tasks | Итог | Диплом
  infopen24: new InfopenParser({
    url: wayback(
      "https://inf-open.ru/2023-24/final-results/",
      "20250602003255",
    ),
    hasParticipationGrade: false,
  }),
  // Место | Фамилия | Имя | Отчество | Класс | Город | tasks | Итог | Диплом
  infopen23: new InfopenParser({
    url: "https://olympiads.ru/zaoch/2022-23/onsite/standings.shtml",
    tableSelector: "table:last",
    nameColumnsCount: 3,
    hasParticipationGrade: false,
  }),
  // Место | Фамилия | Имя | Класс | Школа | Регион | Город | tasks | Итог | Диплом
  infopen22: new InfopenParser({
    url: "https://olympiads.ru/zaoch/2021-22/onsite/standing.shtml",
    tableSelector: "table:last",
    nameColumnsCount: 2,
    hasParticipationGrade: false,
    hasSchool: true,
    hasRegion: true,
  }),
};

export default infopenParsers;
