import type { EventMeta } from "@/data/types/base";

import danoEvents from "./dano";
import hseEvents from "./hse";
import infopenEvents from "./infopen";
import innoEvents from "./inno";
import ioipEvents from "./ioip";
import moshEvents from "./mosh";
import prodEvents from "./prod";
import vosEvents from "./vos";

const eventsMeta: EventMeta[] = [
  ...danoEvents,
  ...hseEvents,
  ...innoEvents,
  ...infopenEvents,
  ...ioipEvents,
  ...moshEvents,
  ...prodEvents,
  ...vosEvents,
];

export default eventsMeta;
