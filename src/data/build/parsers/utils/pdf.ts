import { toMarkdownPages } from "@nalinor/mupdf4llm";

import { storeInCache, getFromCache, fetchBuffer } from "./fetch";
import { normalizeRussian } from "./normalize";

export type PdfTextMode = "pdf" | "mixed";

interface LoadPdfTextOptions {
  url: string;
  pages?: number[];
  mode?: PdfTextMode;
}

export const PDF_PAGE_SEPARATOR = "\n\n\f\n\n";

export async function loadPdfText(
  options: LoadPdfTextOptions,
): Promise<string> {
  const { url, pages, mode = "pdf" } = options;
  const usesOcr = mode === "mixed";

  const cacheUrl = `${url}.${mode}.pages-${pages?.join(",") ?? "all"}.txt`;

  const cached = await getFromCache(cacheUrl);
  if (cached) {
    return normalizeRussian(new TextDecoder().decode(cached));
  }

  const buffer = await fetchBuffer(url);
  const chunks = await toMarkdownPages(buffer, {
    pages,
    tableStrategy: usesOcr ? "pixels" : "lines",
    textSource: usesOcr ? "auto" : "pdf",
    elements: ["table"],
  });
  const text = chunks.map((chunk) => chunk.text).join(PDF_PAGE_SEPARATOR);

  await storeInCache(cacheUrl, new TextEncoder().encode(text).buffer);

  return normalizeRussian(text);
}

function normalizeCellValue(raw: string): string {
  return raw.replace(/\*/g, "").replace(/\s+/g, " ").trim();
}

export function parseTableRows<K extends string | number>(
  text: string,
  columns: readonly K[],
): (Record<K, string> & { rowOffset: number })[] {
  const results = new Array<Record<K, string> & { rowOffset: number }>();

  // Join cells wrapped across lines: a newline not followed by `|` is a soft
  // wrap inside a cell, a blank line ends the table. 1:1 replacement keeps
  // offsets valid.
  const flatText = text.replace(/\n(?![|\n])/g, " ");

  for (const match of flatText.matchAll(/^\|([^\n]*)\|$/gm)) {
    // `\|` is a literal pipe inside a cell
    const parts = match[1]!
      .split(/(?<!\\)\|/)
      .map((part) => part.replaceAll("\\|", "|"));
    if (parts.length !== columns.length) {
      continue;
    }

    if (parts.every((part) => part.trim() === "---")) {
      continue;
    }

    const entries = columns.map(
      (column, index) => [column, normalizeCellValue(parts[index]!)] as const,
    );

    const row = Object.fromEntries(entries) as Record<K, string>;
    results.push({ ...row, rowOffset: match.index });
  }

  if (results.length === 0) {
    throw new Error(`Failed to find table in text: ${text.slice(0, 500)}`);
  }

  return results;
}
