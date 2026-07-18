import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  children: React.ReactNode;
}

export function SortableHeader<TData, TValue>({
  column,
  children,
}: SortableHeaderProps<TData, TValue>) {
  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "flex items-center gap-1.5 transition-colors hover:text-foreground",
        sorted ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {children}
      {sorted === "asc" ? (
        <ArrowUp className="size-3.5 shrink-0" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3.5 shrink-0" />
      ) : (
        <ArrowUpDown className="size-3.5 shrink-0 opacity-40" />
      )}
    </button>
  );
}
