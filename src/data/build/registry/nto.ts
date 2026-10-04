import ntoEvents from "@/data/build/meta/nto";
import NtoParser from "@/data/build/parsers/nto";
import type { EventId, ParticipationParser } from "@/data/types/base";

const NAME_PREFIX = "НТО: ";

const ntoParsers: Record<EventId, ParticipationParser> = Object.fromEntries(
  ntoEvents.map((event) => {
    if (!event.name.startsWith(NAME_PREFIX)) {
      throw new Error(
        `${event.id}: expected name to start with "${NAME_PREFIX}"`,
      );
    }

    return [
      event.id,
      new NtoParser(
        event.date.getFullYear(),
        event.name.slice(NAME_PREFIX.length),
      ),
    ];
  }),
);

export default ntoParsers;
