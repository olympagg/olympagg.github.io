import { use } from "react";

import { buildSearchIndex, type SearchIndex } from "@/data/runtime/search";
import { DataStore } from "@/data/runtime/store";
import type { EventBundle } from "@/data/types";

// Started at module load so the bundle downloads in parallel with the first render.
const dataPromise = import("@/data/eventBundle.json").then((module) => {
  const bundle = module.default as unknown as EventBundle;

  const eventsData = bundle.events.map((event) => ({
    ...event,
    meta: { ...event.meta, date: new Date(event.meta.date) },
  }));

  const rcsoCatalogs = bundle.rcsoCatalogs.map((catalog) => ({
    ...catalog,
    order: {
      ...catalog.order,
      date: new Date(catalog.order.date),
    },
  }));

  const dataStore = new DataStore(eventsData, rcsoCatalogs);
  const searchIndex = buildSearchIndex(dataStore);
  return { dataStore, searchIndex };
});

export function useDataStore(): DataStore {
  return use(dataPromise).dataStore;
}

export function useSearchIndex(): SearchIndex {
  return use(dataPromise).searchIndex;
}
