import { createColumnHelper } from "@tanstack/react-table";
import { ExternalLink as ExternalLinkIcon } from "lucide-react";

import { SortableHeader } from "@/components/shared/sortable-header";
import type { RcsoOlympiad } from "@/data/types/rcso";
import { extractDomain } from "@/lib/format";

const columnHelper = createColumnHelper<RcsoOlympiad>();

export const olympiadColumns = [
  columnHelper.accessor("number", {
    header: ({ column }) => <SortableHeader column={column}>№</SortableHeader>,
    cell: (info) => (
      <span className="text-muted-foreground">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("name", {
    header: ({ column }) => (
      <SortableHeader column={column}>Олимпиада</SortableHeader>
    ),
    cell: (info) => {
      const olympiad = info.row.original;
      return (
        <span className="inline-flex items-center gap-1.5">
          {olympiad.name}
          {olympiad.url && (
            <a
              href={olympiad.url}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {extractDomain(olympiad.url)}
              <ExternalLinkIcon className="size-3.5" />
            </a>
          )}
        </span>
      );
    },
    sortingFn: (a, b) => a.original.name.localeCompare(b.original.name, "ru"),
  }),
  columnHelper.accessor((olympiad) => olympiad.tracks.length, {
    id: "tracks",
    header: ({ column }) => (
      <SortableHeader column={column}>Профилей</SortableHeader>
    ),
    cell: (info) => info.getValue(),
  }),
];
