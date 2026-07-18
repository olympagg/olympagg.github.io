import { useDeferredValue, useMemo } from "react";

import { useSearchIndex } from "@/contexts/data-context";
import { EMPTY_COUNTS, runSearch, searchCounts } from "@/data/runtime/search";
import type { SearchCounts, SearchResult } from "@/data/runtime/search";

export function useSearch(query: string): {
  results: SearchResult[];
  counts: SearchCounts;
  loading: boolean;
} {
  const searchIndex = useSearchIndex();

  const trimmedQuery = query.trim();
  const deferredQuery = useDeferredValue(trimmedQuery);

  const results = useMemo<SearchResult[]>(() => {
    if (!deferredQuery) {
      return [];
    }
    return runSearch(deferredQuery, searchIndex);
  }, [searchIndex, deferredQuery]);

  const counts = useMemo<SearchCounts>(() => {
    if (!deferredQuery) {
      return EMPTY_COUNTS;
    }
    return searchCounts(deferredQuery, searchIndex);
  }, [searchIndex, deferredQuery]);

  const loading = trimmedQuery !== deferredQuery;

  return {
    results: trimmedQuery ? results : [],
    counts: trimmedQuery ? counts : EMPTY_COUNTS,
    loading: trimmedQuery ? loading : false,
  };
}
