import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";

/**
 * A single "icon + text" metadata item. The icon is a true inline element
 * (glued to its text, wraps with it) rather than a flex box, so a row of items
 * flows as inline text instead of stacking as blocks.
 */
export function MetaItem({
  icon: Icon,
  to,
  href,
  className,
  children,
}: {
  icon: LucideIcon;
  to?: string;
  href?: string;
  className?: string;
  children: ReactNode;
}) {
  const content = (
    <>
      <Icon className="mr-1.5 inline size-3.5 align-[-0.15em]" />
      {children}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }
  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  return <span className={className}>{content}</span>;
}

export function MetaRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "text-sm text-muted-foreground [&>*]:mr-4 [&>*:last-child]:mr-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
