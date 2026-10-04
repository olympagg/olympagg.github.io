import { writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";

import type { ParsedParticipation } from "@/data/types";
import { seededShuffle } from "@/lib/shuffle";

import { executePrompt } from "./ai";

const DATA_DIR = join(import.meta.dir, "..", "..", "src", "data");
const PARSED_DATA_DIR = join(DATA_DIR, "parsed");

const DEFAULT_CHUNK_SIZE = 250;

interface LlmNormalizeOptions {
  chunkSize?: number;
  order?: "sort" | "shuffle";
}

export async function getUniqueParticipationValues<
  K extends keyof ParsedParticipation,
>(field: K): Promise<NonNullable<ParsedParticipation[K]>[]> {
  const values = new Set<NonNullable<ParsedParticipation[K]>>();

  for (const file of await readdir(PARSED_DATA_DIR)) {
    const filePath = join(PARSED_DATA_DIR, file);
    process.stdout.write(`Reading ${file}...`);

    const entries = (await Bun.file(filePath).json()) as ParsedParticipation[];

    for (const entry of entries) {
      const value = entry[field];
      if (value) {
        values.add(value);
      }
    }

    console.log(` ${entries.length} entries`);
  }

  return [...values];
}

async function llmNormalizeChunk(
  prompt: string,
  values: string[],
): Promise<Record<string, string>> {
  const input: Record<string, string> = {};
  for (let i = 0; i < values.length; i++) {
    input[String(i + 1)] = values[i]!;
  }

  const normalized = await executePrompt<Record<string, string>>(
    prompt + "\nВходные данные:\n" + JSON.stringify(input),
  );

  const mapping: Record<string, string> = {};
  for (let i = 0; i < values.length; i++) {
    const original = values[i]!;
    const value = normalized[String(i + 1)];
    if (!value) {
      console.error(`No normalized value for "${original}"`);
      continue;
    }

    if (original !== value) {
      console.log(`${original} -> ${value}`);
      mapping[original] = value;
    }
  }

  return mapping;
}

export async function llmNormalize(
  prompt: string,
  values: string[],
  { chunkSize = DEFAULT_CHUNK_SIZE, order = "sort" }: LlmNormalizeOptions = {},
): Promise<Record<string, string>> {
  const orderedValues =
    order === "sort"
      ? values.toSorted((a, b) => a.localeCompare(b))
      : seededShuffle(values);
  const mapping: Record<string, string> = {};

  for (let i = 0; i < orderedValues.length; i += chunkSize) {
    const chunk = orderedValues.slice(i, i + chunkSize);
    console.log(
      `Normalizing chunk ${i} - ${i + chunk.length} / ${orderedValues.length}`,
    );

    const chunkMapping = await llmNormalizeChunk(prompt, chunk);
    Object.assign(mapping, chunkMapping);
  }

  return mapping;
}

export function applyReplacements(
  mapping: Record<string, string>,
  replacements: Record<string, string>,
): void {
  for (const [original, normalized] of Object.entries(mapping)) {
    const replacement = replacements[normalized];
    if (replacement && replacement !== normalized) {
      mapping[original] = replacement;
    }
  }
}

export async function writeMapping(
  mapping: Record<string, unknown>,
  filename: string,
): Promise<void> {
  const sorted = Object.fromEntries(
    Object.entries(mapping).sort(([a], [b]) => a.localeCompare(b)),
  );
  const outPath = join(DATA_DIR, filename);
  await writeFile(outPath, JSON.stringify(sorted, null, 2) + "\n", "utf-8");
  console.log(`\nWrote mapping to ${outPath}`);
}
