import * as XLSX from "xlsx";

import { fetchBuffer } from "./fetch";

const SHEET_ROWS_LIMIT = 5_000;
const SHEET_COLUMNS_LIMIT = 100;

export class WorkbookWrapper {
  workbook: XLSX.WorkBook;

  constructor(workbook: XLSX.WorkBook) {
    this.workbook = workbook;
  }

  get firstSheetName(): string {
    return this.workbook.SheetNames[0]!;
  }

  getSheet(sheetName: string): XLSX.WorkSheet {
    const sheet = this.workbook.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`);
    }

    return sheet;
  }

  getRows<T>(
    sheetName: string,
    header: readonly string[] | "asArray" | "fromHeaderRow",
    rowsOffset: number,
  ): T[] {
    const sheet = this.getSheet(sheetName);

    let headerOption: number | string[] | undefined;
    let endColumn: number | undefined;
    if (header === "asArray") {
      headerOption = 1;
      endColumn = SHEET_COLUMNS_LIMIT;
    } else if (header !== "fromHeaderRow") {
      headerOption = [...header];
      endColumn = header.length - 1;
    }

    const ref = sheet["!ref"];
    let range: XLSX.Range | number = rowsOffset;
    if (ref) {
      const decoded = XLSX.utils.decode_range(ref);
      decoded.s.r = rowsOffset; // start row
      if (endColumn !== undefined) {
        decoded.e.c = endColumn; // end column
      }
      range = decoded;
    }

    return XLSX.utils.sheet_to_json<T>(sheet, {
      header: headerOption,
      range,
      defval: "",
      raw: false,
      blankrows: false,
    });
  }
}

export async function loadExcel(url: string): Promise<WorkbookWrapper> {
  const buffer = await fetchBuffer(url);
  return new WorkbookWrapper(
    XLSX.read(buffer, { type: "array", sheetRows: SHEET_ROWS_LIMIT }),
  );
}

export async function loadCsv(url: string): Promise<WorkbookWrapper> {
  const text = new TextDecoder().decode(await fetchBuffer(url));
  return new WorkbookWrapper(
    XLSX.read(text, { type: "string", sheetRows: SHEET_ROWS_LIMIT }),
  );
}
