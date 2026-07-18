import { createColumnHelper } from "@tanstack/react-table";
import { School as SchoolIcon } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { DataTable } from "@/components/shared/data-table";
import { ExternalLinkText } from "@/components/shared/external-link";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { SortableHeader } from "@/components/shared/sortable-header";
import { useDataStore } from "@/contexts/data-context";
import type { PersonData } from "@/data/types";
import { getAcademicYearEnd, getGraduationLabel } from "@/lib/academic";
import { pluralizePeople } from "@/lib/format";
import { routes, useSchoolParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";

function sortPersons(persons: PersonData[]) {
  const academicYearEnd = getAcademicYearEnd();

  return [...persons].sort((a, b) => {
    const aYear = a.graduationYear;
    const bYear = b.graduationYear;

    const aIsCurrent = aYear != null && aYear >= academicYearEnd;
    const bIsCurrent = bYear != null && bYear >= academicYearEnd;
    const aIsGraduate = aYear != null && aYear < academicYearEnd;
    const bIsGraduate = bYear != null && bYear < academicYearEnd;

    if (aIsCurrent && !bIsCurrent) {
      return -1;
    }
    if (!aIsCurrent && bIsCurrent) {
      return 1;
    }

    if (aIsCurrent && bIsCurrent) {
      const byYear = aYear - bYear;
      if (byYear !== 0) {
        return byYear;
      }
      return a.fullName.localeCompare(b.fullName);
    }

    if (aIsGraduate && !bIsGraduate) {
      return -1;
    }
    if (!aIsGraduate && bIsGraduate) {
      return 1;
    }

    if (aIsGraduate && bIsGraduate) {
      const byYear = bYear - aYear;
      if (byYear !== 0) {
        return byYear;
      }
      return a.fullName.localeCompare(b.fullName);
    }

    return a.fullName.localeCompare(b.fullName);
  });
}

const columnHelper = createColumnHelper<PersonData>();

const columns = [
  columnHelper.accessor("fullName", {
    header: ({ column }) => (
      <SortableHeader column={column}>ФИО</SortableHeader>
    ),
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
  columnHelper.accessor("graduationYear", {
    header: ({ column }) => (
      <SortableHeader column={column}>Статус</SortableHeader>
    ),
    cell: (info) => (
      <span className="text-muted-foreground">
        {getGraduationLabel(info.getValue()) ?? "—"}
      </span>
    ),
    sortingFn: (a, b) => {
      const yearA = a.original.graduationYear;
      const yearB = b.original.graduationYear;
      if (yearA == null && yearB == null) {
        return 0;
      }
      if (yearA == null) {
        return 1;
      }
      if (yearB == null) {
        return -1;
      }
      return yearA - yearB;
    },
  }),
];

export function SchoolPage() {
  const { slug } = useSchoolParams();
  const store = useDataStore();
  const navigate = useNavigate();

  const schoolData = store.getSchoolBySlug(slug);

  const sortedPersons = useMemo(
    () => (schoolData ? sortPersons(schoolData.persons) : []),
    [schoolData],
  );

  if (!schoolData) {
    return <NotFoundMessage message="Школа не найдена" />;
  }

  return (
    <div className="space-y-6">
      <title>{pageTitle(schoolData.school)}</title>
      <BackButton />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <SchoolIcon className="size-6 shrink-0" />
          {schoolData.school}
        </h1>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          {pluralizePeople(schoolData.persons.length)}
        </h2>
        <DataTable
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
