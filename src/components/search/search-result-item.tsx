import { RESULT_ICONS } from "@/components/search/icons";
import type { SearchResult } from "@/data/runtime/search";
import { pluralizePeople } from "@/lib/format";
import { routes } from "@/lib/routes";
import { formatDate } from "@/lib/utils";

function resultLabel(result: SearchResult): string {
  switch (result.type) {
    case "event":
      return result.eventMeta.name;
    case "person":
      return result.fullName;
    case "team":
      return result.team;
    case "school":
      return result.school;
    case "region":
      return result.region;
  }
}

function resultSubLabel(result: SearchResult): string | null {
  switch (result.type) {
    case "person":
      return result.school ?? null;
    case "team":
      return `${result.eventMeta.name} ${result.eventMeta.date.getFullYear()}`;
    case "school":
      return pluralizePeople(result.personCount);
    case "region":
      return pluralizePeople(result.personCount);
    case "event":
      return formatDate(result.eventMeta.date);
  }
}

export function resultHref(result: SearchResult): string {
  switch (result.type) {
    case "event":
      return routes.event(result.eventId);
    case "person":
      return routes.person(result.fullName);
    case "team":
      return routes.team(result.eventId, result.team);
    case "school":
      return routes.school(result.school);
    case "region":
      return routes.region(result.region);
  }
}

export function SearchResultItem({ result }: { result: SearchResult }) {
  const Icon = RESULT_ICONS[result.type];
  const label = resultLabel(result);
  const subLabel = resultSubLabel(result);

  return (
    <div className="flex w-full min-w-0 items-center gap-3">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{label}</div>
        {subLabel && (
          <div className="truncate text-xs text-muted-foreground">
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );
}
