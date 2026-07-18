import type { LucideIcon } from "lucide-react";
import type React from "react";

import { HelpPopover } from "@/components/shared/help-popover";
import { CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCardTitle({
  icon: Icon,
  help,
  className,
  children,
}: {
  /** Optional leading icon; hidden on mobile, inline on `sm+`. */
  icon?: LucideIcon;
  /** Optional help text shown in a trailing help circle. */
  help?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <CardTitle
      className={cn("text-[15px] leading-tight sm:text-base", className)}
    >
      {Icon && (
        <Icon className="mr-1.5 hidden size-4 align-[-0.2em] sm:inline-block" />
      )}
      {children}
      {help != null && (
        <HelpPopover className="ml-1 inline-block align-[-0.2em]" text={help} />
      )}
    </CardTitle>
  );
}
