import type { EventMeta } from "@/data/types/base";

import danoEvents from "./dano";
import hseEvents from "./hse";
import infopenEvents from "./infopen";
import innoEvents from "./inno";
import ioipEvents from "./ioip";
import moshEvents from "./mosh";
import prodEvents from "./prod";
import reoEvents from "./reo";
import rmoEvents from "./rmo";
import roaiEvents from "./roai";
import rocsEvents from "./rocs";
import roiEvents from "./roi";
import rphoEvents from "./rpho";
import rroEvents from "./rro";

const eventsMeta: EventMeta[] = [
  ...danoEvents,
  ...hseEvents,
  ...innoEvents,
  ...infopenEvents,
  ...ioipEvents,
  ...moshEvents,
  ...prodEvents,
  ...reoEvents,
  ...rmoEvents,
  ...roaiEvents,
  ...rocsEvents,
  ...roiEvents,
  ...rphoEvents,
  ...rroEvents,
];

export default eventsMeta;
