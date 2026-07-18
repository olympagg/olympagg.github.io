import { join } from "node:path";

import eventsMeta from "@/data/build/meta";
import { buildEventData, type ParsedEvent } from "@/data/build/pipeline/event";
import parsers from "@/data/build/registry";
import type { EventId } from "@/data/types/base";
import { PROXY_DOMAINS, PROXY_URL } from "@/env";

const PARSED_DATA_DIR = join(import.meta.dir, "..", "src", "data", "parsed");
const OUT_PATH = join(import.meta.dir, "..", "src", "data", "eventBundle.json");

if (PROXY_URL && PROXY_DOMAINS.length > 0) {
  console.log(`Will proxy these domains: ${PROXY_DOMAINS.join(" ")}`);
}

const metaById = new Map(eventsMeta.map((meta) => [meta.id, meta]));

const parserIds = new Set(Object.keys(parsers));
const metaIds = new Set(metaById.keys());
const missingMeta = [...parserIds].filter((id) => !metaIds.has(id as EventId));
const missingParser = [...metaIds].filter((id) => !parserIds.has(id));

if (missingMeta.length > 0 || missingParser.length > 0) {
  throw new Error(
    `Registry/meta mismatch. Missing meta: [${missingMeta.join(", ")}]. ` +
      `Missing parser: [${missingParser.join(", ")}].`,
  );
}

const filter = process.argv[2];

const parsedEvents: ParsedEvent[] = [];

for (const [eventId, parser] of Object.entries(parsers)) {
  if (filter && !eventId.includes(filter)) {
    continue;
  }

  process.stdout.write(`Parsing ${eventId}...`);

  const parsedParticipations = await parser.parse();
  if (parsedParticipations.length === 0) {
    throw new Error(`${eventId} parsed 0 rows`);
  }

  await Bun.write(
    join(PARSED_DATA_DIR, `${eventId}.json`),
    JSON.stringify(parsedParticipations, null, 2),
  );

  console.log(` ${parsedParticipations.length} rows`);

  const meta = metaById.get(eventId as EventId);
  if (!meta) {
    throw new Error(`Could not find meta for ${eventId}`);
  }

  parsedEvents.push({ id: eventId as EventId, meta, parsedParticipations });
}

const events = [...buildEventData(parsedEvents).values()];

await Bun.write(OUT_PATH, JSON.stringify({ events }));
console.log(`\nWrote ${events.length} events to ${OUT_PATH}`);
