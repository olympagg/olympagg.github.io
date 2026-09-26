import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T> {
  value: T;
  label: ReactNode;
  href?: string;
}

export function SegmentedPicker<T extends string | number>({
  options,
  value,
  onSelect,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onSelect?: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex gap-1 rounded-lg bg-muted p-1 text-muted-foreground",
        className,
      )}
    >
      {options.map((option) => {
        const optionClass = cn(
          "rounded-md px-3 py-1 text-sm font-medium transition-colors",
          option.value === value
            ? "bg-background text-foreground shadow-sm"
            : "hover:text-foreground",
        );

        return option.href != null ? (
          <Link
            key={String(option.value)}
            to={option.href}
            className={optionClass}
          >
            {option.label}
          </Link>
        ) : (
          <button
            key={String(option.value)}
            type="button"
            onClick={() => {
              onSelect?.(option.value);
            }}
            className={optionClass}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
