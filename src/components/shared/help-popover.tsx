import { HelpCircle } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import type React from "react";

import { cn } from "@/lib/utils";

export function HelpPopover({
  text,
  className,
}: {
  text: React.ReactNode;
  className?: string;
}) {
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>
        <button
          className={cn(
            "shrink-0 text-muted-foreground/50 transition-colors hover:text-muted-foreground",
            className,
          )}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
          }}
        >
          <HelpCircle className="size-3.5" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side="top"
          sideOffset={6}
          className="z-50 max-w-[220px] animate-in rounded-md bg-foreground px-3 py-2 text-xs text-balance text-background shadow-md fade-in-0 zoom-in-95"
        >
          {text}
          <PopoverPrimitive.Arrow className="fill-foreground" />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
