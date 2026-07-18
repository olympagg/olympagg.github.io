import type { EventId, ParticipationParser } from "@/data/types/base";

import PcmsParser, {
  PARTICIPANT_NAME_CITY_BRACES,
  PARTICIPANT_NAME_REGION,
} from "../parsers/pcms";

const ioipParsers: Record<EventId, ParticipationParser> = {
  ioip26: new PcmsParser({
    url: "https://neerc.ifmo.ru/school/ioip/standings-2026.html",
    participantRegex: PARTICIPANT_NAME_CITY_BRACES,
  }),
  ioip25: new PcmsParser({
    url: "https://neerc.ifmo.ru/school/ioip/standings-2025.html",
    participantRegex: PARTICIPANT_NAME_CITY_BRACES,
  }),
  ioip24: new PcmsParser({
    url: "https://neerc.ifmo.ru/school/ioip/standings-2024.html",
    participantRegex: PARTICIPANT_NAME_CITY_BRACES,
  }),
  ioip23: new PcmsParser({
    url: "https://neerc.ifmo.ru/school/ioip/standings-2023.html",
    participantRegex: PARTICIPANT_NAME_CITY_BRACES,
  }),
  ioip22: new PcmsParser({
    url: "https://neerc.ifmo.ru/school/ioip/standings-2022.html",
    participantRegex: PARTICIPANT_NAME_REGION,
  }),
};

export default ioipParsers;
