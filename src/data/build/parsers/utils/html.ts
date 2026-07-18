import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import { decode as iconvDecode } from "iconv-lite";

import { fetchBuffer } from "./fetch";
import { normalizeRussian } from "./normalize";

const CHARSET_DECLARATION = /charset\s*=\s*["']?([^\s"'>;]+)/i;
const IS_UTF8 = /^utf-?8$/i;

function decodeBuffer(buffer: ArrayBuffer): string {
  const utf8 = new TextDecoder().decode(buffer);
  const charset = CHARSET_DECLARATION.exec(utf8)?.[1];

  if (charset && !IS_UTF8.test(charset)) {
    return iconvDecode(Buffer.from(buffer), charset);
  }

  return utf8;
}

export async function loadHtml(url: string): Promise<cheerio.CheerioAPI> {
  const buffer = await fetchBuffer(url);
  return cheerio.load(normalizeRussian(decodeBuffer(buffer)));
}

export interface HtmlTableRow {
  cells: string[];
  rowElement: AnyNode;
}

export function parseHtmlTableRows(
  rows: cheerio.Cheerio<AnyNode>,
): HtmlTableRow[] {
  return rows.toArray().map((rowElement, rowIndex) => {
    const cells = rows.eq(rowIndex).find("td");
    return {
      cells: cells
        .toArray()
        .map((_, i) => cells.eq(i).text().replace(/\s+/g, " ").trim()),
      rowElement,
    };
  });
}
