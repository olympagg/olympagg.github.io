import AtomParser from "@/data/build/parsers/atom";
import type { EventId, ParticipationParser } from "@/data/types/base";

const atomParsers: Record<EventId, ParticipationParser> = {
  atommath26: new AtomParser("math", 2026),
  atommath25: new AtomParser("math", 2025),
  atommath24: new AtomParser("math", 2024),
  atommath23: new AtomParser("math", 2023),
  atommath22: new AtomParser("math", 2022),
  atomphys26: new AtomParser("phys", 2026),
  atomphys25: new AtomParser("phys", 2025),
  atomphys24: new AtomParser("phys", 2024),
  atomphys23: new AtomParser("phys", 2023),
  atomphys22: new AtomParser("phys", 2022),
};

export default atomParsers;
