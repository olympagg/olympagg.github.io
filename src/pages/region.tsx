import { createColumnHelper } from "@tanstack/react-table";
import { MapPinned } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { DataTable } from "@/components/shared/data-table";
import { ExternalLinkText } from "@/components/shared/external-link";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { SortableHeader } from "@/components/shared/sortable-header";
import { useDataStore } from "@/contexts/data-context";
import type { PersonData } from "@/data/types";
import { pluralizePeople } from "@/lib/format";
import { routes, useRegionParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";

const columnHelper = createColumnHelper<PersonData>();

const columns = [
  columnHelper.accessor("fullName", {
    header: ({ column }) => (
      <SortableHeader column={column}>ФИО</SortableHeader>
    ),
    meta: { wrap: true },
    cell: (info) => {
      const name = info.getValue();
      return (
        <ExternalLinkText
          to={routes.person(name)}
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {name}
        </ExternalLinkText>
      );
    },
    sortingFn: (a, b) => a.original.fullName.localeCompare(b.original.fullName),
  }),
  columnHelper.accessor("school", {
    header: ({ column }) => (
      <SortableHeader column={column}>Школа</SortableHeader>
    ),
    meta: { wrap: true },
    cell: (info) => {
      const school = info.getValue();
      return school ? (
        <ExternalLinkText
          to={routes.school(school)}
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="text-muted-foreground hover:text-foreground hover:opacity-75"
        >
          {school}
        </ExternalLinkText>
      ) : (
        <span className="text-muted-foreground/50">—</span>
      );
    },
    sortingFn: (a, b) => {
      const schoolA = a.original.school;
      const schoolB = b.original.school;
      if (!schoolA && !schoolB) {
        return 0;
      }
      if (!schoolA) {
        return 1;
      }
      if (!schoolB) {
        return -1;
      }
      return schoolA.localeCompare(schoolB);
    },
  }),
];

export function RegionPage() {
  const { slug } = useRegionParams();
  const store = useDataStore();
  const navigate = useNavigate();

  const regionData = store.getRegionBySlug(slug);

  const sortedPersons = useMemo(
    () =>
      regionData
        ? [...regionData.persons].sort((a, b) =>
            a.fullName.localeCompare(b.fullName),
          )
        : [],
    [regionData],
  );

  if (!regionData) {
    return <NotFoundMessage message="Регион не найден" />;
  }

  return (
    <div className="space-y-6">
      <title>{pageTitle(regionData.region)}</title>
      <BackButton />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <MapPinned className="size-6 shrink-0" />
          {regionData.region}
        </h1>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          {pluralizePeople(regionData.persons.length)}
        </h2>
        <DataTable
          progressive
          fixedLayout
          columns={columns}
          data={sortedPersons}
          onRowClick={(person) => {
            void navigate(routes.person(person.fullName));
          }}
        />
      </div>
    </div>
  );
}
