import { toMarkdownPages } from "@nalinor/mupdf4llm";

import { MISTRAL_OCR_MODEL } from "@/env";

import { isCloudStorageUrl, resolveCloudStorageUrl } from "./cloud";
import { storeInCache, getFromCache, fetchBuffer } from "./fetch";
import { mistralClient } from "./mistral";
import { normalizeOcr, normalizeRussian } from "./normalize";

interface LoadPdfTextOptions {
  url: string;
  mode?: "extract" | "ocr";
  pages?: number[];
}

export const PDF_PAGE_SEPARATOR = "\n\n\f\n\n";

export async function loadPdfText(
  options: LoadPdfTextOptions,
): Promise<string> {
  const { url, mode = "extract", pages } = options;

  if (mode === "extract") {
    const buffer = await fetchBuffer(url);
    const chunks = toMarkdownPages(buffer, {
      pages,
      tableStrategy: "lines",
      elements: ["table"],
    });
    return chunks
      .map((chunk) => normalizeRussian(chunk.text))
      .join(PDF_PAGE_SEPARATOR);
  }

  const cacheUrl = `${url}.txt`;

  const cached = await getFromCache(cacheUrl);
  if (cached) {
    return normalizeOcr(new TextDecoder().decode(cached));
  }

  let documentUrl = url;

  if (isCloudStorageUrl(url)) {
    const resolvedUrl = await resolveCloudStorageUrl(url);
    const buffer = await fetchBuffer(resolvedUrl);
    documentUrl = `data:application/pdf;base64,${Buffer.from(buffer).toString("base64")}`;
  }

  const result = await mistralClient.ocr.process({
    model: MISTRAL_OCR_MODEL,
    document: { type: "document_url", documentUrl },
    pages,
  });

  const text = result.pages.map((p) => p.markdown).join(PDF_PAGE_SEPARATOR);
  await storeInCache(cacheUrl, new TextEncoder().encode(text).buffer);
  return normalizeOcr(text);
}

function normalizeCellValue(raw: string): string {
  return raw.replace(/\*/g, "").replace(/\s+/g, " ").trim();
}

export function parseTableRows<K extends string | number>(
  text: string,
  columns: readonly K[],
): (Record<K, string> & { rowOffset: number })[] {
  const results = new Array<Record<K, string> & { rowOffset: number }>();

  // Join cells wrapped across lines: a newline not followed by `|` is a
  // soft wrap inside a cell. 1:1 replacement keeps offsets valid.
  const flatText = text.replace(/\n(?!\|)/g, " ");

  // Trailing `|` is optional: OCR may drop it for an empty last cell.
  const rowPattern = new RegExp(
    `^\\|` + `([^|\\n]*)\\|`.repeat(columns.length - 1) + `([^|\\n]*)\\|?`,
    "gm",
  );

  for (const match of flatText.matchAll(rowPattern)) {
    const parts = match.slice(1);

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
