import type { EventId, ParticipationParser } from "@/data/types/base";

import atomParsers from "./atom";
import danoParsers from "./dano";
import hseParsers from "./hse";
import infopenParsers from "./infopen";
import innoParsers from "./inno";
import ioipParsers from "./ioip";
import moshParsers from "./mosh";
import ntoParsers from "./nto";
import prodParsers from "./prod";
import vosParsers from "./vos";

const parsers: Record<EventId, ParticipationParser> = {
  ...atomParsers,
  ...danoParsers,
  ...hseParsers,
  ...innoParsers,
  ...infopenParsers,
  ...ioipParsers,
  ...moshParsers,
  ...ntoParsers,
  ...prodParsers,
  ...vosParsers,
};

export default parsers;
