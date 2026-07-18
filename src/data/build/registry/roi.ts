import RoiParser from "@/data/build/parsers/roi";
import type { EventId, ParticipationParser } from "@/data/types/base";

const roiParsers: Record<EventId, ParticipationParser> = {
  roi26: new RoiParser(2026),
  roi25: new RoiParser(2025),
  roi24: new RoiParser(2024),
  roi23: new RoiParser(2023),
  roi22: new RoiParser(2022),
};

export default roiParsers;
