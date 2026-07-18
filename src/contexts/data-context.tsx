import type React from "react";
import { createContext, useContext } from "react";

import { buildSearchIndex, type SearchIndex } from "@/data/runtime/search";
import { DataStore } from "@/data/runtime/store";
import type { EventBundle } from "@/data/types";

import rawData from "../data/eventBundle.json";

const bundle = rawData as unknown as EventBundle;

const eventsData = bundle.events.map((event) => ({
  ...event,
  meta: { ...event.meta, date: new Date(event.meta.date as unknown as string) },
}));

const dataStore = new DataStore(eventsData);
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
