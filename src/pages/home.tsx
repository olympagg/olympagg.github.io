import { ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { Link } from "react-router";

import { ClickableTableRow } from "@/components/shared/clickable-table-row";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDataStore } from "@/contexts/data-context";
import type { EventData } from "@/data/types";
import { getAcademicYear } from "@/lib/academic";
import { pageTitle } from "@/lib/title";
import { cn, formatDate, groupBy, pluralize, sorted } from "@/lib/utils";

interface EventItem {
  kind: "event";
  event: EventData;
}

interface GroupItem {
  kind: "group";
  label: string;
  events: EventData[];
  lastDate: Date;
}

type DisplayItem = EventItem | GroupItem;

const MIN_GROUP_SIZE = 3;

function buildDisplayItems(yearEvents: EventData[]) {
  const eventGroups = new Map<string, EventData[]>();
  const standalone: EventData[] = [];

  for (const event of yearEvents) {
    const groupName = event.meta.groupName;
    if (!groupName) {
      standalone.push(event);
      continue;
    }

    const bucket = eventGroups.get(groupName);
    if (bucket) {
      bucket.push(event);
    } else {
      eventGroups.set(groupName, [event]);
    }
  }

  const items: DisplayItem[] = standalone.map((event) => ({
    kind: "event",
    event,
  }));

  for (const [label, events] of eventGroups) {
    if (events.length < MIN_GROUP_SIZE) {
      for (const event of events) {
        items.push({ kind: "event", event });
      }
      continue;
    }

    const lastDate = new Date(
      Math.max(...events.map((e) => e.meta.date.getTime())),
    );
    items.push({
      kind: "group",
      label,
      events: sorted(events, (e) => -e.meta.date.getTime()),
      lastDate,
    });
  }

  return sorted(
    items,
    (a) => -(a.kind === "event" ? a.event.meta.date : a.lastDate).getTime(),
  );
}

export function HomePage() {
  const store = useDataStore();
  const events = store.getEvents();
  const personCount = store.getPersons().length;
  const [expanded, setExpanded] = useState(new Set());

  const byYear = groupBy(events, (e) => getAcademicYear(e.meta.date));
  const years = sorted(byYear.keys(), (y) => -y);

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className="space-y-8">
      <title>{pageTitle()}</title>
      <div className="space-y-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight">
          Агрегатор результатов олимпиад
        </h1>
        <p className="text-muted-foreground">
          {personCount.toLocaleString("ru-RU")}{" "}
          {pluralize(personCount, ["участник", "участника", "участников"])} из{" "}
          {events.length}{" "}
          {pluralize(events.length, [
            "мероприятия",
            "мероприятий",
            "мероприятий",
          ])}{" "}
          — всё в одном месте
        </p>
      </div>

      <Separator />

      <div className="space-y-8">
        {years.map((year) => {
          const items = buildDisplayItems(byYear.get(year)!);

          return (
            <div key={year}>
              <h2 className="mb-4 text-lg font-semibold">
                {year}–{year + 1}
              </h2>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead className="w-36">Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      if (item.kind === "event") {
                        return (
                          <ClickableTableRow
                            key={item.event.id}
                            to={`/event/${item.event.id}`}
                          >
                            <TableCell>
                              <Link
                                to={`/event/${item.event.id}`}
                                tabIndex={-1}
                                className="font-medium hover:opacity-75"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                {item.event.meta.name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDate(item.event.meta.date)}
                            </TableCell>
                          </ClickableTableRow>
                        );
                      }

                      const key = `${year}-${item.label}`;
                      const isOpen = expanded.has(key);
                      const count = item.events.length;

                      return (
                        <Fragment key={key}>
                          <TableRow
                            tabIndex={0}
                            role="button"
                            aria-expanded={isOpen}
                            className="cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
                            onClick={() => {
                              toggle(key);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                toggle(key);
                              }
                            }}
                          >
                            <TableCell colSpan={2}>
                              <div className="flex items-center gap-2">
                                <ChevronRight
                                  className={cn(
                                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                    isOpen && "rotate-90",
                                  )}
                                />
                                <span className="font-medium">
                                  {item.label}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {count}{" "}
                                  {pluralize(count, [
                                    "мероприятие",
                                    "мероприятия",
                                    "мероприятий",
                                  ])}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>

                          {isOpen &&
                            item.events.map((event) => (
                              <ClickableTableRow
                                key={event.id}
                                to={`/event/${event.id}`}
                                className="bg-muted/40 hover:bg-muted/60"
                              >
                                <TableCell className="pl-10">
                                  <Link
                                    to={`/event/${event.id}`}
                                    tabIndex={-1}
                                    className="text-sm font-medium hover:opacity-75"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                  >
                                    {event.meta.name}
                                  </Link>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {formatDate(event.meta.date)}
                                </TableCell>
                              </ClickableTableRow>
                            ))}
                        </Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
