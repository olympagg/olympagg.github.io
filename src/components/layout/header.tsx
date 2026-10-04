import { BarChart3 } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

import { SearchCommand } from "@/components/search/search-command";
import { SegmentedPicker } from "@/components/shared/segmented-picker";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { value: "/", label: "Результаты", href: "/" },
  { value: "/rcso", label: "РСОШ", href: "/rcso" },
];

function HeaderSlot({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number | null>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }
    setWidth(content.offsetWidth);
    const observer = new ResizeObserver(() => {
      setWidth(content.offsetWidth);
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      style={
        width === null
          ? undefined
          : ({ "--slot-w": `${String(width)}px` } as CSSProperties)
      }
      className={cn(
        "shrink-0 overflow-hidden transition-[width,margin] duration-200 ease-out",
        "mr-2 max-sm:w-(--slot-w) sm:mr-4",
        collapsed && "max-sm:mr-0 max-sm:w-0",
      )}
    >
      <div
        ref={contentRef}
        className={cn(
          "w-max transition-opacity duration-200 ease-out",
          collapsed && "max-sm:opacity-0",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Header() {
  const { pathname } = useLocation();
  const [searchActive, setSearchActive] = useState(false);
  const section =
    pathname === "/rcso" || pathname.startsWith("/rcso/") ? "/rcso" : "/";

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        <Link
          to="/"
          className="mr-2 inline-flex shrink-0 items-center gap-2 font-semibold whitespace-nowrap text-foreground transition-colors hover:text-foreground/80 sm:mr-4"
        >
          <BarChart3 className="size-5" />
          <span className="hidden lg:inline">Olympiad Aggregator</span>
        </Link>

        <HeaderSlot collapsed={searchActive}>
          <SegmentedPicker
            className="shrink-0"
            options={SECTIONS}
            value={section}
          />
        </HeaderSlot>

        <div className="min-w-0 flex-1">
          <SearchCommand
            placeholder="Поиск"
            className="h-9 rounded-md border border-input bg-muted/50"
            onActiveChange={setSearchActive}
          />
        </div>
      </div>
    </header>
  );
}
