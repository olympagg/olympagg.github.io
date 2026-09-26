import type { EventId, ParticipationParser } from "@/data/types/base";

import danoParsers from "./dano";
import hseParsers from "./hse";
import infopenParsers from "./infopen";
import innoParsers from "./inno";
import ioipParsers from "./ioip";
import moshParsers from "./mosh";
import prodParsers from "./prod";
import vosParsers from "./vos";

const parsers: Record<EventId, ParticipationParser> = {
  ...danoParsers,
  ...hseParsers,
  ...innoParsers,
  ...infopenParsers,
  ...ioipParsers,
  ...moshParsers,
  ...prodParsers,
  ...vosParsers,
};

export default parsers;
