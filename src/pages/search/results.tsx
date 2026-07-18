import type { ReactNode } from "react";
import { Link } from "react-router";

import { RESULT_ICONS } from "@/components/search/icons";
import type { SearchResult } from "@/data/runtime/search";
import type {
  EventData,
  PersonData,
  RegionData,
  SchoolData,
} from "@/data/types";
import type { TeamRow } from "@/hooks/full-search";
import { pluralizePeople } from "@/lib/format";
import { routes } from "@/lib/routes";

function PreviewRow({
  type,
  to,
  label,
  subLabel,
}: {
  type: SearchResult["type"];
  to: string;
  label: string;
  subLabel: string | null;
}) {
  const Icon = RESULT_ICONS[type];
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent"
    >
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm">{label}</div>
        {subLabel && (
          <div className="truncate text-xs text-muted-foreground">
            {subLabel}
          </div>
        )}
      </div>
    </Link>
  );
}

export function AllResults({
  personResults,
  eventResults,
  teamResults,
  schoolResults,
  regionResults,
}: {
  personResults: PersonData[];
  eventResults: EventData[];
  teamResults: TeamRow[];
  schoolResults: SchoolData[];
  regionResults: RegionData[];
}) {
  const sections: {
    type: SearchResult["type"];
    label: string;
    rows: ReactNode[];
  }[] = [];

  if (personResults.length) {
    sections.push({
      type: "person",
      label: "Люди",
      rows: personResults.map((person) => (
        <PreviewRow
          key={person.fullName}
          type="person"
          to={routes.person(person.fullName)}
          label={person.fullName}
          subLabel={person.school}
        />
      )),
    });
  }
  if (eventResults.length) {
    sections.push({
      type: "event",
      label: "Мероприятия",
      rows: eventResults.map((event) => (
        <PreviewRow
          key={event.id}
          type="event"
          to={routes.event(event.id)}
          label={event.meta.name}
          subLabel={String(event.meta.date.getFullYear())}
        />
      )),
    });
  }
  if (teamResults.length) {
    sections.push({
      type: "team",
      label: "Команды",
      rows: teamResults.map((team) => (
        <PreviewRow
          key={`${team.eventId}-${team.team}`}
          type="team"
          to={routes.team(team.eventId, team.team)}
          label={team.team}
          subLabel={`${team.eventMeta.name} ${team.eventMeta.date.getFullYear()}`}
        />
      )),
    });
  }
  if (schoolResults.length) {
    sections.push({
      type: "school",
      label: "Школы",
      rows: schoolResults.map((school) => (
        <PreviewRow
          key={school.school}
          type="school"
          to={routes.school(school.school)}
          label={school.school}
          subLabel={pluralizePeople(school.persons.length)}
        />
      )),
    });
  }
  if (regionResults.length) {
    sections.push({
      type: "region",
      label: "Регионы",
      rows: regionResults.map((region) => (
        <PreviewRow
          key={region.region}
          type="region"
          to={routes.region(region.region)}
          label={region.region}
          subLabel={pluralizePeople(region.persons.length)}
        />
      )),
    });
  }

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div key={section.type}>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground">
            {section.label}
          </h2>
          <div className="rounded-lg border p-1">{section.rows}</div>
        </div>
      ))}
    </div>
  );
}
