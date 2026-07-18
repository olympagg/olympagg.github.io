import HseReoParser, {
  REO23_COLUMNS,
  REO25_COLUMNS,
} from "@/data/build/parsers/hsereo";
import VosParser, { REO22_PARTICIPANT_COLUMNS } from "@/data/build/parsers/vos";
import type { EventId, ParticipationParser } from "@/data/types/base";
import { range } from "@/lib/utils";

const reoParsers: Record<EventId, ParticipationParser> = {
  reo26: new VosParser({
    url: "https://экономика.физтехлицей.рф/storage/pages/5/itogovyy-protokol-vsosh-po-ekonomike-s-prilozheniem-21.03.2026.pdf",
    mode: "ocr",
  }),
  reo25: new HseReoParser({
    tableUrl: "https://vseros.hse.ru/mirror/pubs/share/1041845480.xlsx",
    columns: REO25_COLUMNS,
    sheetNames: ["9 класс", "10 класс", "11 класс"],
    rowsOffset: 4,
  }),
  reo23: new HseReoParser({
    tableUrl: "https://vseros.hse.ru/mirror/pubs/share/824110786.xlsx",
    columns: REO23_COLUMNS,
    sheetNames: ["Общий"],
    rowsOffset: 1,
  }),
  reo22: new VosParser({
    url: "https://hse.ru/mirror/pubs/share/592423204.pdf",
    columns: REO22_PARTICIPANT_COLUMNS,
    pages: range(1, 11),
    mode: "ocr",
  }),
};

export default reoParsers;
