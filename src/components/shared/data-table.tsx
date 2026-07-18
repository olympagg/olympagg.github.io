import {
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useState, useTransition } from "react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    minWidth?: string;
    /** Allow text wrapping in cells of this column (default: nowrap). */
    wrap?: boolean;
  }
}

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ROW_HEIGHT_PX = 41;
const PROGRESSIVE_BATCH = 100;

interface DataTableProps<TData> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TanStack Table columns have heterogeneous value types
  columns: ColumnDef<TData, any>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  className?: string;
  /** When true, renders the first 100 rows immediately and defers the rest via startTransition. */
  progressive?: boolean;
  /** Use table-layout:fixed so column widths never change. Pair with meta.wrap on columns. */
  fixedLayout?: boolean;
}

export function DataTable<TData>({
  columns,
  data,
  onRowClick,
  className,
  progressive = false,
  fixedLayout = false,
}: DataTableProps<TData>) {
  const [sorting, setSortingRaw] = useState<SortingState>([]);
  const [columnFilters, setColumnFiltersRaw] = useState<ColumnFiltersState>([]);
  const [, startTransition] = useTransition();

  // eslint-disable-next-line react-hooks/incompatible-library -- known TanStack Table limitation with React Compiler
  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters },
    onSortingChange: (updater) => {
      startTransition(() => {
        setSortingRaw(updater);
      });
    },
    onColumnFiltersChange: (updater) => {
      startTransition(() => {
        setColumnFiltersRaw(updater);
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const { rows } = table.getRowModel();
  const totalRows = rows.length;

  const needsProgressive = progressive && totalRows > PROGRESSIVE_BATCH;

  const [visibleCount, setVisibleCount] = useState(
    needsProgressive ? PROGRESSIVE_BATCH : totalRows,
  );

  useEffect(() => {
    if (!needsProgressive) {
      setVisibleCount(totalRows);
      return;
    }
    setVisibleCount(PROGRESSIVE_BATCH);
    startTransition(() => {
      setVisibleCount(totalRows);
    });
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleRows =
    visibleCount >= totalRows ? rows : rows.slice(0, visibleCount);
  const pendingRows = totalRows - visibleRows.length;

  const rowClass = cn(
    "border-b transition-colors data-[state=selected]:bg-muted",
    onRowClick ? "cursor-pointer hover:bg-accent/50" : "hover:bg-muted/50",
  );

  return (
    <div className={cn("overflow-x-auto rounded-lg border", className)}>
      <table
        className="w-full caption-bottom text-sm"
        style={fixedLayout ? { tableLayout: "fixed" } : undefined}
      >
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <tbody className="[&_tr:last-child]:border-0">
          {visibleRows.length > 0 ? (
            visibleRows.map((row) => (
              <DataTableRow
                key={row.id}
                row={row}
                onRowClick={onRowClick}
                className={rowClass}
              />
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="h-24 p-2 text-center text-muted-foreground"
              >
                Нет данных
              </td>
            </tr>
          )}

          {pendingRows > 0 && (
            <tr
              aria-hidden="true"
              style={{ height: pendingRows * ROW_HEIGHT_PX }}
            >
              <td
                colSpan={columns.length}
                style={{ padding: 0, border: "none" }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

interface DataTableRowProps<TData> {
  row: Row<TData>;
  onRowClick?: (row: TData) => void;
  className?: string;
}

function DataTableRow<TData>({
  row,
  onRowClick,
  className,
}: DataTableRowProps<TData>) {
  return (
    <tr
      data-state={row.getIsSelected() ? "selected" : undefined}
      tabIndex={onRowClick ? 0 : undefined}
      onClick={
        onRowClick
          ? () => {
              onRowClick(row.original);
            }
          : undefined
      }
      onKeyDown={
        onRowClick
          ? (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onRowClick(row.original);
              }
            }
          : undefined
      }
      className={cn(
        className,
        onRowClick &&
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
      )}
      style={{
        contentVisibility: "auto",
        containIntrinsicHeight: ROW_HEIGHT_PX,
      }}
    >
      {row.getVisibleCells().map((cell) => {
        const meta = cell.column.columnDef.meta;
        return (
          <td
            key={cell.id}
            className={cn(
              "p-2 align-middle",
              meta?.wrap ? "break-words" : "whitespace-nowrap",
            )}
            style={
              meta?.minWidth != null ? { minWidth: meta.minWidth } : undefined
            }
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
