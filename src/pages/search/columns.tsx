import { createColumnHelper } from "@tanstack/react-table";

import { ExternalLinkText } from "@/components/shared/external-link";
import { SortableHeader } from "@/components/shared/sortable-header";
import type {
  EventData,
  PersonData,
  RegionData,
  SchoolData,
} from "@/data/types";
import type { TeamRow } from "@/hooks/full-search";
import { getGraduationLabel } from "@/lib/academic";
import { formatRcsoLevel } from "@/lib/format";
import { routes } from "@/lib/routes";
import { compareNullableNumbers, compareStrings } from "@/lib/utils";

const stopPropagation = (e: { stopPropagation: () => void }) => {
  e.stopPropagation();
};

const personHelper = createColumnHelper<PersonData>();
export const personColumns = [
  personHelper.accessor("fullName", {
    header: ({ column }) => (
      <SortableHeader column={column}>ФИО</SortableHeader>
    ),
    cell: (info) => {
      const name = info.getValue();
      return (
        <ExternalLinkText to={routes.person(name)} onClick={stopPropagation}>
          {name}
        </ExternalLinkText>
      );
    },
    sortingFn: (a, b) =>
      a.original.fullName.localeCompare(b.original.fullName, "ru"),
  }),
  personHelper.accessor("school", {
    header: ({ column }) => (
      <SortableHeader column={column}>Школа</SortableHeader>
    ),
    cell: (info) => (
      <span className="text-muted-foreground">{info.getValue() ?? "—"}</span>
    ),
    sortingFn: (a, b) => compareStrings(a.original.school, b.original.school),
  }),
  personHelper.accessor("region", {
    header: ({ column }) => (
      <SortableHeader column={column}>Регион</SortableHeader>
    ),
    cell: (info) => (
      <span className="text-muted-foreground">{info.getValue() ?? "—"}</span>
    ),
    sortingFn: (a, b) => compareStrings(a.original.region, b.original.region),
  }),
  personHelper.accessor("graduationYear", {
    header: ({ column }) => (
      <SortableHeader column={column}>Статус</SortableHeader>
    ),
    cell: (info) => (
      <span className="text-muted-foreground">
        {getGraduationLabel(info.getValue()) ?? "—"}
      </span>
    ),
    sortingFn: (a, b) =>
      compareNullableNumbers(
        a.original.graduationYear,
        b.original.graduationYear,
      ),
  }),
  personHelper.accessor((row) => row.participations.length, {
    id: "participations",
    header: ({ column }) => (
      <SortableHeader column={column}>Участий</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
];

const eventHelper = createColumnHelper<EventData>();
export const eventColumns = [
  eventHelper.accessor((row) => row.meta.name, {
    id: "name",
    header: ({ column }) => (
      <SortableHeader column={column}>Название</SortableHeader>
    ),
    cell: (info) => (
      <ExternalLinkText
        to={routes.event(info.row.original.id)}
        onClick={stopPropagation}
      >
        {info.getValue()}
      </ExternalLinkText>
    ),
    sortingFn: (a, b) =>
      a.original.meta.name.localeCompare(b.original.meta.name, "ru"),
  }),
  eventHelper.accessor((row) => row.meta.date.getFullYear(), {
    id: "year",
    header: ({ column }) => (
      <SortableHeader column={column}>Год</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
  eventHelper.accessor(
    (row) => row.meta.olympiadLevel ?? Number.MAX_SAFE_INTEGER,
    {
      id: "level",
      header: ({ column }) => (
        <SortableHeader column={column}>Уровень</SortableHeader>
      ),
      cell: (info) => (
        <span className="text-muted-foreground">
          {formatRcsoLevel(info.row.original.meta.olympiadLevel)}
        </span>
      ),
    },
  ),
  eventHelper.accessor((row) => row.participations.length, {
    id: "participations",
    header: ({ column }) => (
      <SortableHeader column={column}>Участников</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
];

const teamHelper = createColumnHelper<TeamRow>();
export const teamColumns = [
  teamHelper.accessor("team", {
    header: ({ column }) => (
      <SortableHeader column={column}>Команда</SortableHeader>
    ),
    cell: (info) => (
      <ExternalLinkText
        to={routes.team(info.row.original.eventId, info.getValue())}
        onClick={stopPropagation}
      >
        {info.getValue()}
      </ExternalLinkText>
    ),
    sortingFn: (a, b) => a.original.team.localeCompare(b.original.team, "ru"),
  }),
  teamHelper.accessor((row) => row.eventMeta.name, {
    id: "event",
    header: ({ column }) => (
      <SortableHeader column={column}>Мероприятие</SortableHeader>
    ),
    cell: (info) => (
      <span className="text-muted-foreground">{info.getValue()}</span>
    ),
    sortingFn: (a, b) =>
      a.original.eventMeta.name.localeCompare(b.original.eventMeta.name, "ru"),
  }),
  teamHelper.accessor((row) => row.eventMeta.date.getFullYear(), {
    id: "year",
    header: ({ column }) => (
      <SortableHeader column={column}>Год</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
  teamHelper.accessor("rank", {
    header: ({ column }) => (
      <SortableHeader column={column}>Место</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
];

const schoolHelper = createColumnHelper<SchoolData>();
export const schoolColumns = [
  schoolHelper.accessor("school", {
    header: ({ column }) => (
      <SortableHeader column={column}>Школа</SortableHeader>
    ),
    cell: (info) => (
      <ExternalLinkText
        to={routes.school(info.getValue())}
        onClick={stopPropagation}
      >
        {info.getValue()}
      </ExternalLinkText>
    ),
    sortingFn: (a, b) =>
      a.original.school.localeCompare(b.original.school, "ru"),
  }),
  schoolHelper.accessor((row) => row.persons.length, {
    id: "persons",
    header: ({ column }) => (
      <SortableHeader column={column}>Участников</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
];

const regionHelper = createColumnHelper<RegionData>();
export const regionColumns = [
  regionHelper.accessor("region", {
    header: ({ column }) => (
      <SortableHeader column={column}>Регион</SortableHeader>
    ),
    cell: (info) => (
      <ExternalLinkText
        to={routes.region(info.getValue())}
        onClick={stopPropagation}
      >
        {info.getValue()}
      </ExternalLinkText>
    ),
    sortingFn: (a, b) =>
      a.original.region.localeCompare(b.original.region, "ru"),
  }),
  regionHelper.accessor((row) => row.persons.length, {
    id: "persons",
    header: ({ column }) => (
      <SortableHeader column={column}>Участников</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
];
