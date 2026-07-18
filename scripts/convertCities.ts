import { loadCsv } from "@/data/build/parsers/utils/excel";
import { normalizeCity } from "@/data/build/parsers/utils/normalize";

import {
  getUniqueParticipationValues,
  llmNormalize,
  writeMapping,
} from "./utils/normalize";
import { RUSSIAN_REGIONS_TEXT } from "./utils/regions";

const CITY_CSV_URL =
  "https://raw.githubusercontent.com/hflabs/city/master/city.csv";

const CITIES_TO_REGIONS_PROMPT = `
Твоя задача — по названию населённого пункта определить его регион.

Если это населённый пункт РФ, верни субъект РФ строго из этого списка:

${RUSSIAN_REGIONS_TEXT}

Если это населённый пункт другой страны, верни название страны на русском языке.
Если определить регион невозможно, верни пустую строку.

Исправляй опечатки и произвольный регистр во входных названиях.
Используй именительный падеж. Не добавляй ничего, кроме названия региона или страны.

На вход поступает пронумерованный список городов в JSON-формате.
Выводи ответ в формате JSON-объекта, где ключ — порядковый номер, а значение —
регион (или страна, или пустая строка).
Тебе не нужно писать код. Выполни задачу на основе входных данных.

Примеры:
"москва" -> "Москва"
"красноярск" -> "Красноярский край"
"душанбе" -> "Таджикистан"
"санкт-петербург" -> "Санкт-Петербург"
`;

interface CityCsvRow {
  region_type: string;
  region: string;
  city: string;
}

function formatRegion(row: CityCsvRow): string {
  const formats: Record<string, string> = {
    Респ: `Республика ${row.region}`,
    обл: `${row.region} область`,
    край: `${row.region} край`,
    АО: `${row.region} автономный округ`,
    Аобл: `${row.region} автономная область`,
  };
  return formats[row.region_type] ?? row.region;
}

async function loadCityRegions(): Promise<Map<string, string>> {
  const workbook = await loadCsv(CITY_CSV_URL);
  const rows = workbook.getRows<CityCsvRow>(
    workbook.firstSheetName,
    "fromHeaderRow",
    0,
  );

  const map = new Map<string, string>();
  for (const row of rows) {
    const name = row.city || row.region;
    if (name) {
      map.set(normalizeCity(name).toLowerCase(), formatRegion(row));
    }
  }

  return map;
}

const cities = await getUniqueParticipationValues("city");
const uniqueCities = [...new Set(cities.map((city) => city.toLowerCase()))];

const reference = await loadCityRegions();
console.log(`\nLoaded ${reference.size} cities from hflabs/city`);

const mapping: Record<string, string> = {};
const misses: string[] = [];

for (const city of uniqueCities) {
  const region = reference.get(city);
  if (region) {
    mapping[city] = region;
  } else {
    misses.push(city);
  }
}
console.log(
  `Resolved ${uniqueCities.length - misses.length}/${uniqueCities.length} via hflabs/city`,
);

if (misses.length) {
  console.log(`Resolving ${misses.length} missed cities via LLM...`);
  Object.assign(mapping, await llmNormalize(CITIES_TO_REGIONS_PROMPT, misses));
}

console.log(
  `\nResolved ${Object.keys(mapping).length}/${uniqueCities.length} cities to regions`,
);
await writeMapping(mapping, "cityRegions.json");
