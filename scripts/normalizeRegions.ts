import cityRegions from "@/data/cityRegions.json";

import {
  llmNormalize,
  getUniqueParticipationValues,
  writeMapping,
} from "./utils/normalize";
import { RUSSIAN_REGIONS_TEXT } from "./utils/regions";

const NORMALIZE_REGIONS_PROMPT = `
Твоя задача - приводить названия регионов РФ и других стран к единому формату.

Список регионов РФ:

${RUSSIAN_REGIONS_TEXT}

Если встречаешь регион РФ, придерживайся названия строго из этого списка.

Если встречаешь город/регион не РФ, используй название страны на русском языке.

Ключевое - консистентность. Один и тот же регион всегда должен называться одинаково. Используй именительный падеж.

Примеры:
"г. Москва" -> "Москва"
"Санкт-Петербург" -> "Санкт-Петербург"
"Московская область" -> "Московская область"
"Республика Удмуртия" -> "Удмуртская Республика"
"Татарстан" -> "Республика Татарстан"
"Белоруссия" -> "Беларусь"

На вход будет поступать пронумерованный список в JSON-формате.
Выводи ответ в формате JSON-объекта, в котором ключ — порядковый номер, а значение — нормализованное название региона.
Тебе не нужно писать код. Тебе нужно только выполнить задачу на основе входных данных.

Главное - консистентность. Один и тот же регион всегда должен называться одинаково.
`;

console.log("Reading unique region values...");
const fromField = await getUniqueParticipationValues("region");
const fromCities = Object.values(cityRegions).filter(
  (region): region is string => Boolean(region),
);
const regions = [...new Set([...fromField, ...fromCities])];
console.log(
  `\nFound ${regions.length} unique regions (${fromField.length} from field, ${fromCities.length} from cityRegions)`,
);

const mapping = await llmNormalize(NORMALIZE_REGIONS_PROMPT, regions);

const uniqueNormalized = new Set(Object.values(mapping));
console.log(`Normalized to ${uniqueNormalized.size} unique regions`);

await writeMapping(mapping, "normalizedRegions.json");
