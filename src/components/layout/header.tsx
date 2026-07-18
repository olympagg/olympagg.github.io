import { BarChart3 } from "lucide-react";
import { Link } from "react-router";

import { SearchCommand } from "@/components/search/search-command";

export function Header() {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground transition-colors hover:text-foreground/80"
        >
          <BarChart3 className="size-5" />
          <span className="hidden sm:inline">Olympiad Aggregator</span>
        </Link>

        <div className="hidden sm:block sm:flex-1" />
        <div className="w-full min-w-0 sm:w-1/2">
          <SearchCommand
            placeholder="Поиск"
            className="h-9 rounded-md border border-input bg-muted/50"
          />
        </div>
      </div>
    </header>
  );
}
