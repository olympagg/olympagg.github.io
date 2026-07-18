import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import {
  SearchResultItem,
  resultHref,
} from "@/components/search/search-result-item";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  EMPTY_COUNTS,
  type SearchCounts,
  type SearchResult,
} from "@/data/runtime/search";
import { useSearch } from "@/hooks/search";
import { routes } from "@/lib/routes";
import { groupBy, pluralize } from "@/lib/utils";

const GROUP_LABELS: Record<SearchResult["type"], string> = {
  event: "Мероприятия",
  person: "Люди",
  team: "Команды",
  school: "Школы",
  region: "Регионы",
};

const GROUP_ORDER: SearchResult["type"][] = [
  "event",
  "person",
  "team",
  "school",
  "region",
];

const SEARCH_ALL_VALUE = "__show_all__";

function useSearchState(query: string) {
  const { results, counts, loading } = useSearch(query);
  const hasQuery = query.trim().length >= 2;

  // Commit results only when the deferred value catches up.
  const [committed, setCommitted] = useState({
    results: [] as SearchResult[],
    counts: EMPTY_COUNTS,
    ready: false,
  });
  if (!hasQuery) {
    if (committed.ready) {
      setCommitted({ results: [], counts: EMPTY_COUNTS, ready: false });
    }
  } else if (!loading && committed.results !== results) {
    setCommitted({ results, counts, ready: true });
  }

  const firstResult = committed.results[0];
  const firstValue = firstResult ? resultHref(firstResult) : "";

  const [sel, setSel] = useState({ synced: firstValue, value: firstValue });
  if (sel.synced !== firstValue) {
    setSel({ synced: firstValue, value: firstValue });
  }

  return {
    displayResults: committed.results,
    displayCounts: committed.counts,
    initialized: committed.ready,
    commandValue: sel.value,
    setCommandValue: (v: string) => {
      setSel((p) => ({ ...p, value: v }));
    },
  };
}

function SearchResultsList({
  query,
  displayResults,
  displayCounts,
  initialized,
  onSelect,
  visible = true,
}: {
  query: string;
  displayResults: SearchResult[];
  displayCounts: SearchCounts;
  initialized: boolean;
  onSelect: (href: string) => void;
  visible?: boolean;
}) {
  const grouped = useMemo(
    () => groupBy(displayResults, (r) => r.type),
    [displayResults],
  );

  if (!visible || query.trim().length < 2 || !initialized) {
    return null;
  }

  const total = GROUP_ORDER.reduce((sum, type) => sum + displayCounts[type], 0);

  return (
    <div className="absolute top-full right-0 left-0 z-50 mt-1 flex max-h-64 flex-col rounded-md border bg-popover shadow-md">
      <CommandList className="min-h-0 flex-1 overflow-y-auto">
        {displayResults.length === 0 && (
          <CommandEmpty>Ничего не найдено</CommandEmpty>
        )}
        {GROUP_ORDER.map((type) => {
          const items = grouped.get(type);
          if (!items?.length) {
            return null;
          }
          return (
            <CommandGroup
              key={type}
              heading={
                <span className="flex items-center justify-between">
                  <span>{GROUP_LABELS[type]}</span>
                  <span className="font-normal text-muted-foreground/70">
                    {displayCounts[type]}
                  </span>
                </span>
              }
            >
              {items.map((result, index) => {
                const href = resultHref(result);
                return (
                  <CommandItem
                    key={`${type}-${index}`}
                    value={href}
                    onSelect={() => {
                      onSelect(href);
                    }}
                    className="cursor-pointer"
                  >
                    <SearchResultItem result={result} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          );
        })}
      </CommandList>
      {total > 0 && (
        <div className="shrink-0 border-t">
          <CommandGroup>
            <CommandItem
              value={SEARCH_ALL_VALUE}
              onSelect={() => {
                onSelect(routes.search(query));
              }}
              className="cursor-pointer justify-center gap-1 text-xs text-muted-foreground"
            >
              Показать все
              <span className="font-semibold text-foreground">{total}</span>
              {pluralize(total, ["результат", "результата", "результатов"])} →
            </CommandItem>
          </CommandGroup>
        </div>
      )}
    </div>
  );
}

export function SearchCommand({
  className,
  placeholder = "Поиск",
}: {
  className?: string;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const {
    displayResults,
    displayCounts,
    initialized,
    commandValue,
    setCommandValue,
  } = useSearchState(query);
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (href: string) => {
    void navigate(href);
    setQuery("");
    setFocused(false);
    // When items unmount (setFocused → visible=false), cmdk's item-cleanup
    // useLayoutEffect calls input.focus() to restore selection state. Deferring
    // blur to the next macrotask ensures it runs after that commit cycle.
    setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  // Type-to-search: pressing a printable key anywhere (except the dedicated
  // search page or another text field) focuses this bar and seeds the query.
  useEffect(() => {
    if (location.pathname === routes.search()) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) {
        return;
      }
      if (e.key.length !== 1 || e.key === " ") {
        return;
      }
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      const input = containerRef.current?.querySelector("input");
      if (!input) {
        return;
      }
      e.preventDefault();
      input.focus();
      setQuery((q) => q + e.key);
      setFocused(true);
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [location.pathname]);

  return (
    <div ref={containerRef} className="relative">
      <Command
        shouldFilter={false}
        value={commandValue}
        onValueChange={setCommandValue}
        className={className}
      >
        <CommandInput
          placeholder={placeholder}
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            setFocused(true);
          }}
          onFocus={() => {
            setFocused(true);
          }}
        />
        <SearchResultsList
          query={query}
          displayResults={displayResults}
          displayCounts={displayCounts}
          initialized={initialized}
          onSelect={handleSelect}
          visible={focused}
        />
      </Command>
    </div>
  );
}
