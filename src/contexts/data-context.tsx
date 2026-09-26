import type React from "react";
import { createContext, useContext } from "react";

import rawData from "@/data/eventBundle.json";
import { buildSearchIndex, type SearchIndex } from "@/data/runtime/search";
import { DataStore } from "@/data/runtime/store";
import type { EventBundle } from "@/data/types";

const bundle = rawData as unknown as EventBundle;

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

const DataStoreContext = createContext(dataStore);
const SearchIndexContext = createContext(searchIndex);

export function DataProvider({ children }: { children: React.ReactNode }) {
  return (
    <DataStoreContext.Provider value={dataStore}>
      <SearchIndexContext.Provider value={searchIndex}>
        {children}
      </SearchIndexContext.Provider>
    </DataStoreContext.Provider>
  );
}

export function useDataStore(): DataStore {
  return useContext(DataStoreContext);
}

export function useSearchIndex(): SearchIndex {
  return useContext(SearchIndexContext);
}
