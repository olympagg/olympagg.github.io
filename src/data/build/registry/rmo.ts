import VosParser, {
  RMO22_PARTICIPANT_COLUMNS,
  RMO23_PARTICIPANT_COLUMNS,
} from "@/data/build/parsers/vos";
import type { EventId, ParticipationParser } from "@/data/types/base";

const rmoParsers: Record<EventId, ParticipationParser> = {
  rmo26: new VosParser({
    url: "https://static.centraluniversity.ru/documents/bachelor/vseros-math-2026/protokol-zasedaniya-zhyuri.pdf",
    mode: "extract",
  }),
  rmo25: new VosParser({
    url: "https://disk.360.yandex.ru/i/942E3XfzpSfveQ",
    mode: "extract",
  }),
  rmo23: new VosParser({
    url: "https://sochisirius.ru/uploads/2023/04/vos_math_2023_protokol_jury.pdf",
    columns: RMO23_PARTICIPANT_COLUMNS,
    mode: "ocr",
  }),
  rmo22: new VosParser({
    url: "https://olympiads.mccme.ru/vmo/2022/final/protokol.pdf",
    mode: "ocr",
    columns: RMO22_PARTICIPANT_COLUMNS,
    maxTaskScore: 7,
  }),
};

export default rmoParsers;
