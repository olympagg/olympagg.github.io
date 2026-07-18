import VosParser, {
  NAME_SPLITTED_PARTICIPANT_COLUMNS,
} from "@/data/build/parsers/vos";
import type { EventId, ParticipationParser } from "@/data/types/base";

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

export default rroParsers;
