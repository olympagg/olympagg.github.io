import VosParser, {
  NAME_SPLITTED_PARTICIPANT_COLUMNS,
} from "@/data/build/parsers/vos";
import type { EventId, ParticipationParser } from "@/data/types/base";

const rphoParsers: Record<EventId, ParticipationParser> = {
  rpho26: new VosParser({
    url: "https://disk.yandex.ru/d/II0YOj5-UrUjgQ",
    columns: NAME_SPLITTED_PARTICIPANT_COLUMNS,
    mode: "ocr",
  }),
  rpho22: new VosParser({
    url: "https://sochisirius.ru/uploads/2022/04/vos_year_22_phys_protocol_jury_3.pdf",
    ignoreRanksForGrades: [9],
    mode: "ocr",
  }),
};

export default rphoParsers;
