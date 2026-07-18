import VosParser, {
  NAME_SPLITTED_PARTICIPANT_COLUMNS,
} from "@/data/build/parsers/vos";
import type { EventId, ParticipationParser } from "@/data/types/base";

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

export default rocsParsers;
