import MoshParser from "@/data/build/parsers/mosh";
import type { EventId, ParticipationParser } from "@/data/types/base";

const moshParsers: Record<EventId, ParticipationParser> = {
  mosh26: new MoshParser("https://mos-inf.olimpiada.ru/mosh10_11_2026_results"),
};

export default moshParsers;
