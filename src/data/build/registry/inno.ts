import PcmsParser, {
  PARTICIPANT_NAME_GRADE,
  PARTICIPANT_NAME_GRADE_CITY,
  PARTICIPANT_NAME_GRADE_REGION,
} from "@/data/build/parsers/pcms";
import type { EventId, ParticipationParser } from "@/data/types/base";

const innoParsers: Record<EventId, ParticipationParser> = {
  innoinf26: new PcmsParser({
    url: "https://pcms.university.innopolis.ru/results/innopolis/2025-2026/final-main-diplomas.html",
    participantRegex: PARTICIPANT_NAME_GRADE_REGION,
  }),
  innoinf25: new PcmsParser({
    url: "https://pcms.university.innopolis.ru/results/innopolis/2024-2025/final-main-diplomas.html",
    participantRegex: PARTICIPANT_NAME_GRADE_REGION,
  }),
  innoinf24: new PcmsParser({
    url: "https://pcms.university.innopolis.ru/results/innopolis/2023-2024/final-main-diplomas.html",
    participantRegex: PARTICIPANT_NAME_GRADE,
  }),
  innoinf23: new PcmsParser({
    url: "https://pcms.university.innopolis.ru/results/innopolis/2022-2023/final-main-diplomas.html",
    participantRegex: PARTICIPANT_NAME_GRADE,
  }),
  innoinf22: new PcmsParser({
    url: "https://pcms.university.innopolis.ru/results/innopolis/2021-2022/final-main-diplomas.html",
    participantRegex: PARTICIPANT_NAME_GRADE_CITY,
  }),
};

export default innoParsers;
