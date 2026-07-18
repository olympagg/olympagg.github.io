import RoaiParser from "@/data/build/parsers/roai";
import type { EventId, ParticipationParser } from "@/data/types/base";

const roaiParsers: Record<EventId, ParticipationParser> = {
  roai26: new RoaiParser("https://vsosh-ai-2026.onrender.com/api/scores"),
};

export default roaiParsers;
