import type { EventMeta } from "@/data/types/base";

import atomEvents from "./atom";
import danoEvents from "./dano";
import hseEvents from "./hse";
import infopenEvents from "./infopen";
import innoEvents from "./inno";
import ioipEvents from "./ioip";
import moshEvents from "./mosh";
import ntoEvents from "./nto";
import prodEvents from "./prod";
import vosEvents from "./vos";

const eventsMeta: EventMeta[] = [
  ...atomEvents,
  ...danoEvents,
  ...hseEvents,
  ...innoEvents,
  ...infopenEvents,
  ...ioipEvents,
  ...moshEvents,
  ...ntoEvents,
  ...prodEvents,
  ...vosEvents,
];

export default eventsMeta;
