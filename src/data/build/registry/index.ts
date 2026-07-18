import type { EventId, ParticipationParser } from "@/data/types/base";

import danoParsers from "./dano";
import hseParsers from "./hse";
import infopenParsers from "./infopen";
import innoParsers from "./inno";
import ioipParsers from "./ioip";
import moshParsers from "./mosh";
import prodParsers from "./prod";
import reoParsers from "./reo";
import rmoParsers from "./rmo";
import roaiParsers from "./roai";
import rocsParsers from "./rocs";
import roiParsers from "./roi";
import rphoParsers from "./rpho";
import rroParsers from "./rro";

const parsers: Record<EventId, ParticipationParser> = {
  ...danoParsers,
  ...hseParsers,
  ...innoParsers,
  ...infopenParsers,
  ...ioipParsers,
  ...moshParsers,
  ...prodParsers,
  ...reoParsers,
  ...rmoParsers,
  ...roiParsers,
  ...rocsParsers,
  ...roaiParsers,
  ...rphoParsers,
  ...rroParsers,
};

export default parsers;
