import HseParser from "@/data/build/parsers/hse";
import type { EventId, ParticipationParser } from "@/data/types/base";

const tracks = [
  { id: "hsemath", name: "Математика", years: [2024, 2025, 2026] },
  { id: "hseinf", name: "Информатика", years: [2024, 2025, 2026] },
  { id: "hsedev", name: "Промышленное программирование", years: [2025, 2026] },
  { id: "hseecon", name: "Экономика", years: [2024, 2025, 2026] },
  { id: "hsephys", name: "Физика", years: [2024, 2025, 2026] },
  { id: "hselaw", name: "Право", years: [2024, 2025, 2026] },
] as const;

const passingScores: Record<number, string> = {
  2026: "https://olymp.hse.ru/mirror/pubs/share/1147188776.pdf",
  2025: "https://www.hse.ru/mirror/pubs/share/1032225258.pdf",
  2024: "https://www.hse.ru/data/2024/04/12/2146433407/критерии_2.pdf",
};

const hseParsers: Record<EventId, ParticipationParser> = Object.fromEntries(
  tracks.flatMap((track) =>
    track.years.map((year) => [
      `${track.id}${year % 100}`,
      new HseParser({
        year,
        trackName: track.name,
        passingScoresUrl: passingScores[year]!,
      }),
    ]),
  ),
);

export default hseParsers;
