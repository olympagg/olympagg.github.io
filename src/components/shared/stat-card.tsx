import type { LucideIcon } from "lucide-react";
import type React from "react";

import { StatCardTitle } from "@/components/shared/stat-card-title";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  icon,
  help,
  className,
  children,
}: {
  /** Card label; may be a fragment (e.g. responsive short/long variants). */
  title: React.ReactNode;
  /** Optional leading icon; hidden on mobile, inline on `sm+`. */
  icon?: LucideIcon;
  /** Optional help text shown in a trailing help circle. */
  help?: React.ReactNode;
  /** Extra classes for the value container. */
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-2 py-3 sm:gap-6 sm:py-6">
      <CardHeader className="px-3 pb-0 sm:px-6 sm:pb-2">
        <StatCardTitle icon={icon} help={help}>
          {title}
        </StatCardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          "mt-auto px-3 text-xl font-bold sm:px-6 sm:text-2xl",
          className,
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
