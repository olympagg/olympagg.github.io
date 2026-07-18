import type { SearchResult } from "@/data/runtime/search";

export type Tab = "all" | SearchResult["type"];

export const TAB_ORDER: Tab[] = [
  "all",
  "person",
  "event",
  "team",
  "school",
  "region",
];

export function isTab(value: string | null): value is Tab {
  return value !== null && (TAB_ORDER as string[]).includes(value);
}

export const TAB_LABELS: Record<Tab, string> = {
  all: "Все",
  person: "Люди",
  event: "Мероприятия",
  team: "Команды",
  school: "Школы",
  region: "Регионы",
};

export const DEFAULT_FILTERS = {
  region: "all",
  status: "all",
  eventYear: "all",
  level: "all",
  teamYear: "all",
};
