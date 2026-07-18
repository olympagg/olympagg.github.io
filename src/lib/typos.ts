import type { FullName } from "@/data/types/base";
import { MAX_TYPO_LEVENSHTEIN_DISTANCE } from "@/lib/constants";

function isWithinLevenshtein(
  a: string,
  b: string,
  maxDistance: number,
): boolean {
  if (a === b) {
    return true;
  }
  if (Math.abs(a.length - b.length) > maxDistance) {
    return false;
  }

  const row = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i++) {
    let prevDiagonal = row[0]!;
    row[0] = i;
    let rowMin = row[0];

    for (let j = 1; j <= b.length; j++) {
      const above = row[j]!;
      row[j] =
        a[i - 1] === b[j - 1]
          ? prevDiagonal
          : 1 + Math.min(prevDiagonal, above, row[j - 1]!);
      prevDiagonal = above;
      rowMin = Math.min(rowMin, row[j]!);
    }

    if (rowMin > maxDistance) {
      return false;
    }
  }

  return row[b.length]! <= maxDistance;
}

function* deletionVariants(name: FullName): Generator<string> {
  const lower = name.toLowerCase();
  yield lower;
  for (let i = 0; i < lower.length; i++) {
    yield lower.slice(0, i) + lower.slice(i + 1);
  }
}

function differingPartPopularity(
  tokens: string[],
  other: string[],
  partFrequency: Map<string, number>,
): number {
  const remaining = [...other];
  let popularity = 0;
  for (const token of tokens) {
    const index = remaining.indexOf(token);
    if (index >= 0) {
      remaining.splice(index, 1);
    } else {
      popularity += partFrequency.get(token) ?? 0;
    }
  }
  return popularity;
}

function pickCanonical(
  a: FullName,
  b: FullName,
  frequency: Map<FullName, number>,
  partFrequency: Map<string, number>,
): FullName {
  // Smallest edit distance is the top criterion. Linking only ever connects
  // names within MAX_TYPO_LEVENSHTEIN_DISTANCE (currently 1), so every
  // candidate here is equidistant and this stage is inert today — it is the
  // first knob to wire up once that threshold grows beyond 1.

  const freqA = frequency.get(a)!;
  const freqB = frequency.get(b)!;
  if (freqA !== freqB) {
    return freqA > freqB ? a : b;
  }

  const tokensA = a.toLowerCase().split(" ");
  const tokensB = b.toLowerCase().split(" ");
  const popA = differingPartPopularity(tokensA, tokensB, partFrequency);
  const popB = differingPartPopularity(tokensB, tokensA, partFrequency);
  if (popA !== popB) {
    return popA > popB ? a : b;
  }

  if (a.length !== b.length) {
    return a.length > b.length ? a : b;
  }

  return a.localeCompare(b) <= 0 ? a : b;
}

function collectComponent(
  start: FullName,
  neighbors: Map<FullName, Set<FullName>>,
  visited: Set<FullName>,
): FullName[] {
  const component: FullName[] = [];
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const name = queue.pop()!;
    component.push(name);
    for (const neighbor of neighbors.get(name)!) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return component;
}

// Maps every typo name to its canonical form. Names within lowercased
// Levenshtein distance 1 are treated as spelling variants of one person.
// Steps:
//   1. Count how popular each name part (token) is across the whole dataset,
//      weighted by participations.
//   2. Index every name by its deletion variants (the word itself plus each
//      one-character deletion) — two names can only be within distance 1 if
//      they share a variant, which avoids an O(n^2) comparison.
//   3. For each variant bucket, verify the candidate pairs with the exact
//      distance check and record them as an undirected neighbor graph.
//   4. Split that graph into connected components (each component is one
//      cluster of mutually-typo'd names).
//   5. Reduce every component to a single canonical (smallest edit distance,
//      then most frequent, then more popular differing part, then longer, then
//      lexicographic) and map all other members of the component to it.
export function buildTypoMapping(
  frequency: Map<FullName, number>,
): Map<FullName, FullName> {
  const partFrequency = new Map<string, number>();
  for (const [name, count] of frequency) {
    for (const part of name.toLowerCase().split(" ")) {
      partFrequency.set(part, (partFrequency.get(part) ?? 0) + count);
    }
  }

  const namesByVariant = new Map<string, FullName[]>();
  for (const name of frequency.keys()) {
    for (const variant of deletionVariants(name)) {
      const names = namesByVariant.get(variant);
      if (names) {
        names.push(name);
      } else {
        namesByVariant.set(variant, [name]);
      }
    }
  }

  const neighbors = new Map<FullName, Set<FullName>>();
  const link = (a: FullName, b: FullName) => {
    if (!neighbors.has(a)) {
      neighbors.set(a, new Set());
    }
    neighbors.get(a)!.add(b);
  };

  for (const names of namesByVariant.values()) {
    if (names.length < 2) {
      continue;
    }
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const a = names[i]!.toLowerCase();
        const b = names[j]!.toLowerCase();
        if (
          a !== b &&
          isWithinLevenshtein(a, b, MAX_TYPO_LEVENSHTEIN_DISTANCE)
        ) {
          link(names[i]!, names[j]!);
          link(names[j]!, names[i]!);
        }
      }
    }
  }

  const mapping = new Map<FullName, FullName>();
  const visited = new Set<FullName>();
  for (const start of neighbors.keys()) {
    if (visited.has(start)) {
      continue;
    }

    const component = collectComponent(start, neighbors, visited);
    const canonical = component.reduce((best, name) =>
      pickCanonical(best, name, frequency, partFrequency),
    );

    for (const name of component) {
      if (name !== canonical) {
        mapping.set(name, canonical);
      }
    }
  }

  return mapping;
}
