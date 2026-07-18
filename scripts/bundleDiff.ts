import { $ } from "bun";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { EventBundle, EventData } from "@/data/types";
import type { EventId } from "@/data/types/base";

const MAX_EVENT_DIFF_BYTES = 200_000;

const [prevPath, currPath] = process.argv.slice(2);
if (!prevPath || !currPath) {
  console.error("Usage: bun scripts/bundleDiff.ts <prev.json> <curr.json>");
  process.exit(2);
}

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, sortKeysDeep(entry)]),
    );
  }
  return value;
}

function renderEvent(event: EventData | undefined): string | null {
  if (!event) {
    return null;
  }
  const header = JSON.stringify(
    sortKeysDeep({ id: event.id, meta: event.meta }),
    null,
    2,
  );
  const lines = event.participations.map((participation) =>
    JSON.stringify(sortKeysDeep(participation)),
  );
  return [header, ...lines, ""].join("\n");
}

async function loadEvents(path: string): Promise<Map<EventId, EventData>> {
  const bundle = (await Bun.file(path).json()) as EventBundle;
  return new Map(bundle.events.map((event) => [event.id, event]));
}

const tmpDir = join(tmpdir(), `bundle-diff-${Bun.randomUUIDv7()}`);

async function gitDiff(
  id: EventId,
  prevText: string | null,
  currText: string | null,
) {
  const writeSide = async (side: string, text: string | null) => {
    if (text === null) {
      return "/dev/null";
    }
    const path = join(side, `${id.replace(/[^\w.-]/g, "_")}.txt`);
    await Bun.write(join(tmpDir, path), text);
    return path;
  };
  const paths = [
    await writeSide("prev", prevText),
    await writeSide("curr", currText),
  ];

  // git diff exits 1 when the files differ, hence nothrow.
  const proc =
    await $`git --no-pager diff --no-index --color=always -- ${paths}`
      .cwd(tmpDir)
      .quiet()
      .nothrow();

  if (proc.exitCode >= 2) {
    throw new Error(
      `git diff failed (${proc.exitCode}): ${proc.stderr.toString()}`,
    );
  }

  return proc.stdout.toString();
}

function countChangedLines(diff: string) {
  // eslint-disable-next-line no-control-regex
  const plain = diff.replace(/\x1b\[[0-9;]*m/g, "");
  let added = 0;
  let removed = 0;
  for (const line of plain.split("\n")) {
    if (line.startsWith("+") && !line.startsWith("+++")) {
      added++;
    }
    if (line.startsWith("-") && !line.startsWith("---")) {
      removed++;
    }
  }
  return { added, removed };
}

const prevEvents = await loadEvents(prevPath);
const currEvents = await loadEvents(currPath);

const ids = [
  ...currEvents.keys(),
  ...[...prevEvents.keys()].filter((id) => !currEvents.has(id)),
];

interface Change {
  id: EventId;
  status: "added" | "removed" | "changed";
  diff: string;
  added: number;
  removed: number;
}

const changes: Change[] = [];

for (const id of ids) {
  const prevText = renderEvent(prevEvents.get(id));
  const currText = renderEvent(currEvents.get(id));
  if (prevText === currText) {
    continue;
  }

  const status =
    prevText === null ? "added" : currText === null ? "removed" : "changed";
  const diff = await gitDiff(id, prevText, currText);
  changes.push({ id, status, diff, ...countChangedLines(diff) });
}

await $`rm -rf ${tmpDir}`;

if (changes.length === 0) {
  console.log("::notice::eventBundle: no changes vs previous run");
  process.exit(0);
}

const countBy = (status: Change["status"]) =>
  changes.filter((change) => change.status === status).length;
const totalAdded = changes.reduce((sum, change) => sum + change.added, 0);
const totalRemoved = changes.reduce((sum, change) => sum + change.removed, 0);

console.log(
  `eventBundle: ${countBy("added")} added, ${countBy("changed")} changed, ` +
    `${countBy("removed")} removed events (+${totalAdded} -${totalRemoved} lines)`,
);
for (const change of changes) {
  console.log(
    `  ${change.status.padEnd(7)} ${change.id} (+${change.added} -${change.removed})`,
  );
}
console.log("");

for (const change of changes) {
  console.log(`::group::${change.status}: ${change.id}`);
  console.log(
    change.diff.length > MAX_EVENT_DIFF_BYTES
      ? `${change.diff.slice(0, MAX_EVENT_DIFF_BYTES)}\n... (truncated)`
      : change.diff,
  );
  console.log("::endgroup::");
}
