import { ExternalLink as ExternalLinkIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

/**
 * A router link that renders its label followed by a trailing "external link"
 * icon. Defaults to the primary link colour; pass `className` to override.
 */
export function ExternalLinkText({
  children,
  className,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link className={cn("text-primary hover:opacity-75", className)} {...props}>
      {children}
      <span className="inline-flex items-center whitespace-nowrap">
        <ExternalLinkIcon className="ml-1 size-3" />
      </span>
    </Link>
  );
}
