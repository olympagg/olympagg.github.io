import { Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { DataTable } from "@/components/shared/data-table";
import { Input } from "@/components/ui/input";
import { useFullSearch } from "@/hooks/full-search";
import { getAcademicYearEnd } from "@/lib/academic";
import { routes } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { cn } from "@/lib/utils";

import {
  eventColumns,
  personColumns,
  regionColumns,
  schoolColumns,
  teamColumns,
} from "./columns";
import {
  DEFAULT_FILTERS,
  isTab,
  TAB_LABELS,
  TAB_ORDER,
  type Tab,
} from "./constants";
import { FilterSelect } from "./filters";
import { AllResults } from "./results";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  // The URL is the source of truth for both the query text and the active tab.
  const query = searchParams.get("q") ?? "";
  const rawTab = searchParams.get("tab");
  const tab: Tab = isTab(rawTab) ? rawTab : "all";

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Skip autofocus on touch devices — it forces the on-screen keyboard open
  // when arriving here via Enter from the header search bar.
  const [autoFocus] = useState(
    () => window.matchMedia("(pointer: fine)").matches,
  );

  // Reset per-type filters whenever the query changes (render-time pattern,
  // see https://react.dev/learn/you-might-not-need-an-effect).
  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    setFilters(DEFAULT_FILTERS);
  }

  const {
    personResults,
    eventResults,
    teamResults,
    schoolResults,
    regionResults,
    counts,
  } = useFullSearch(query);

  const setTab = (t: Tab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (t === "all") {
          next.delete("tab");
        } else {
          next.set("tab", t);
        }
        return next;
      },
      { replace: true },
    );
  };

  const handleInputChange = (value: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value.trim()) {
          next.set("q", value);
        } else {
          next.delete("q");
        }
        next.delete("tab");
        return next;
      },
      { replace: true },
    );
  };

  const setFilter = (key: keyof typeof DEFAULT_FILTERS, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const totalCount =
    counts.person + counts.event + counts.team + counts.school + counts.region;

  const tabCount = (t: Tab) => (t === "all" ? totalCount : counts[t]);

  // Filter option lists
  const regionOptions = useMemo(() => {
    const set = new Set<string>();
    for (const person of personResults) {
      if (person.region) {
        set.add(person.region);
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b, "ru"));
  }, [personResults]);

  const eventYearOptions = useMemo(() => {
    const set = new Set<number>();
    for (const event of eventResults) {
      set.add(event.meta.date.getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [eventResults]);

  const teamYearOptions = useMemo(() => {
    const set = new Set<number>();
    for (const team of teamResults) {
      set.add(team.eventMeta.date.getFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [teamResults]);

  // Apply per-type filters
  const academicYearEnd = getAcademicYearEnd();
  const filteredPersons = useMemo(() => {
    return personResults.filter((person) => {
      if (filters.region !== "all" && person.region !== filters.region) {
        return false;
      }
      if (filters.status !== "all") {
        const year = person.graduationYear;
        if (filters.status === "unknown" && year != null) {
          return false;
        }
        if (
          filters.status === "current" &&
          !(year != null && year >= academicYearEnd)
        ) {
          return false;
        }
        if (
          filters.status === "graduate" &&
          !(year != null && year < academicYearEnd)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [personResults, filters.region, filters.status, academicYearEnd]);

  const filteredEvents = useMemo(() => {
    return eventResults.filter((event) => {
      if (
        filters.eventYear !== "all" &&
        event.meta.date.getFullYear() !== Number(filters.eventYear)
      ) {
        return false;
      }
      if (filters.level !== "all") {
        if (filters.level === "none" && event.meta.olympiadLevel != null) {
          return false;
        }
        if (
          filters.level !== "none" &&
          event.meta.olympiadLevel !== Number(filters.level)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [eventResults, filters.eventYear, filters.level]);

  const filteredTeams = useMemo(() => {
    return teamResults.filter((team) => {
      if (
        filters.teamYear !== "all" &&
        team.eventMeta.date.getFullYear() !== Number(filters.teamYear)
      ) {
        return false;
      }
      return true;
    });
  }, [teamResults, filters.teamYear]);

  const hasQuery = query.trim().length >= 2;

  return (
    <div className="space-y-6">
      <title>{pageTitle(query || undefined)}</title>
      <BackButton />

      <div>
        <h1 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight">
          <SearchIcon className="size-6 shrink-0" />
          Поиск
        </h1>
        <Input
          value={query}
          onChange={(e) => {
            handleInputChange(e.target.value);
          }}
          placeholder="Поиск участников, мероприятий, команд, школ, регионов..."
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
        />
      </div>

      {!hasQuery ? (
        <p className="text-sm text-muted-foreground">
          Введите запрос (минимум 2 символа), чтобы начать поиск
        </p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {TAB_ORDER.filter((t) => t === "all" || tabCount(t) > 0).map(
              (t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTab(t);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition-colors",
                    tab === t
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input text-muted-foreground hover:bg-accent",
                  )}
                >
                  {TAB_LABELS[t]}{" "}
                  <span className="opacity-70">{tabCount(t)}</span>
                </button>
              ),
            )}
          </div>

          {totalCount === 0 ? (
            <p className="text-sm text-muted-foreground">Ничего не найдено</p>
          ) : tab === "all" ? (
            <AllResults
              personResults={personResults}
              eventResults={eventResults}
              teamResults={teamResults}
              schoolResults={schoolResults}
              regionResults={regionResults}
            />
          ) : tab === "person" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={filters.region}
                  onChange={(v) => {
                    setFilter("region", v);
                  }}
                  placeholder="Регион"
                  options={[
                    { value: "all", label: "Все регионы" },
                    ...regionOptions.map((r) => ({ value: r, label: r })),
                  ]}
                />
                <FilterSelect
                  value={filters.status}
                  onChange={(v) => {
                    setFilter("status", v);
                  }}
                  placeholder="Статус"
                  options={[
                    { value: "all", label: "Любой статус" },
                    { value: "current", label: "Текущие ученики" },
                    { value: "graduate", label: "Выпускники" },
                    { value: "unknown", label: "Статус неизвестен" },
                  ]}
                />
              </div>
              <DataTable
                progressive
                columns={personColumns}
                data={filteredPersons}
                onRowClick={(person) => {
                  void navigate(routes.person(person.fullName));
                }}
              />
            </div>
          ) : tab === "event" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={filters.eventYear}
                  onChange={(v) => {
                    setFilter("eventYear", v);
                  }}
                  placeholder="Год"
                  options={[
                    { value: "all", label: "Все годы" },
                    ...eventYearOptions.map((y) => ({
                      value: String(y),
                      label: String(y),
                    })),
                  ]}
                />
                <FilterSelect
                  value={filters.level}
                  onChange={(v) => {
                    setFilter("level", v);
                  }}
                  placeholder="Уровень"
                  options={[
                    { value: "all", label: "Любой уровень" },
                    { value: "1", label: "I уровень РСОШ" },
                    { value: "2", label: "II уровень РСОШ" },
                    { value: "3", label: "III уровень РСОШ" },
                    { value: "none", label: "Без уровня" },
                  ]}
                />
              </div>
              <DataTable
                progressive
                columns={eventColumns}
                data={filteredEvents}
                onRowClick={(event) => {
                  void navigate(routes.event(event.id));
                }}
              />
            </div>
          ) : tab === "team" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <FilterSelect
                  value={filters.teamYear}
                  onChange={(v) => {
                    setFilter("teamYear", v);
                  }}
                  placeholder="Год"
                  options={[
                    { value: "all", label: "Все годы" },
                    ...teamYearOptions.map((y) => ({
                      value: String(y),
                      label: String(y),
                    })),
                  ]}
                />
              </div>
              <DataTable
                progressive
                columns={teamColumns}
                data={filteredTeams}
                onRowClick={(team) => {
                  void navigate(routes.team(team.eventId, team.team));
                }}
              />
            </div>
          ) : tab === "school" ? (
            <DataTable
              progressive
              columns={schoolColumns}
              data={schoolResults}
              onRowClick={(school) => {
                void navigate(routes.school(school.school));
              }}
            />
          ) : (
            <DataTable
              progressive
              columns={regionColumns}
              data={regionResults}
              onRowClick={(region) => {
                void navigate(routes.region(region.region));
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
