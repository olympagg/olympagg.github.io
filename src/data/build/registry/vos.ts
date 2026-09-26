import HseReoParser, {
  REO23_COLUMNS,
  REO25_COLUMNS,
} from "@/data/build/parsers/hsereo";
import RoaiParser from "@/data/build/parsers/roai";
import RoiParser from "@/data/build/parsers/roi";
import VosParser, {
  NAME_SPLITTED_PARTICIPANT_COLUMNS,
  REO22_PARTICIPANT_COLUMNS,
  RMO22_PARTICIPANT_COLUMNS,
  RMO23_PARTICIPANT_COLUMNS,
} from "@/data/build/parsers/vos";
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

const roaiParsers: Record<EventId, ParticipationParser> = {
  roai26: new RoaiParser("https://vsosh-ai-2026.onrender.com/api/scores"),
};

const rocsParsers: Record<EventId, ParticipationParser> = {
  rocs26: new VosParser({
    url: "https://vserosinf.ru/wp-content/uploads/2026/04/Приложение_к_протоколу_жюри_ЗЭ_ВсОШ_2026_ИБ.pdf",
    mode: "extract",
  }),
  rocs25: new VosParser({
    url: "https://kazanvsosh.olimprocrt.ru/12.pdf",
    trackName: "Информационная безопасность",
    columns: NAME_SPLITTED_PARTICIPANT_COLUMNS,
    mode: "ocr",
  }),
  rocs23: new VosParser({
    url: "https://olimpiada.ru/files/m_vos_results/445/tech_protokol_23.pdf",
    trackName: "Информационная безопасность",
    mode: "extract",
  }),
};

const roiParsers: Record<EventId, ParticipationParser> = {
  roi26: new RoiParser(2026),
  roi25: new RoiParser(2025),
  roi24: new RoiParser(2024),
  roi23: new RoiParser(2023),
  roi22: new RoiParser(2022),
};

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

const rroParsers: Record<EventId, ParticipationParser> = {
  rro26: new VosParser({
    url: "https://vserosinf.ru/wp-content/uploads/2026/04/Приложение_к_протоколу_жюри_ЗЭ_ВсОШ_2025_Робототехника.pdf",
    mode: "extract",
  }),
  rro25: new VosParser({
    url: "https://kazanvsosh.olimprocrt.ru/12.pdf",
    columns: NAME_SPLITTED_PARTICIPANT_COLUMNS,
    trackName: "Робототехника",
    mode: "ocr",
  }),
  rro23: new VosParser({
    url: "https://olimpiada.ru/files/m_vos_results/445/tech_protokol_23.pdf",
    trackName: "Робототехника",
    mode: "ocr",
  }),
};

const vosParsers: Record<EventId, ParticipationParser> = {
  ...reoParsers,
  ...rmoParsers,
  ...roaiParsers,
  ...rocsParsers,
  ...roiParsers,
  ...rphoParsers,
  ...rroParsers,
};

export default vosParsers;
