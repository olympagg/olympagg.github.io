import { EyeOff, MessageSquare } from "lucide-react";
import { siGithub } from "simple-icons";

import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/olympagg/olympagg.github.io";
const FEEDBACK_URL = "https://forms.gle/GKFsoiGV8GeHEGZLA";
const TAKEDOWN_URL = `${REPO_URL}/issues/new?template=takedown.yml`;

const COMMIT_HASH = process.env.BUN_PUBLIC_COMMIT_HASH;

function SimpleIcon({
  icon,
  className,
}: {
  icon: { path: string };
  className?: string;
}) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d={icon.path} />
    </svg>
  );
}

const linkClass =
  "rounded-md px-2 py-1 transition-colors hover:bg-muted hover:text-foreground";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-background/80">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1">
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("flex items-center gap-1.5", linkClass)}
          >
            <SimpleIcon icon={siGithub} className="size-4" />
            <span>GitHub</span>
          </a>
          {COMMIT_HASH ? (
            <span className="px-2 py-1">Сборка {COMMIT_HASH}</span>
          ) : null}
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <a
            href={TAKEDOWN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("flex items-center gap-1.5", linkClass)}
          >
            <EyeOff className="size-4" />
            <span>Скрыть данные</span>
          </a>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("flex items-center gap-1.5", linkClass)}
          >
            <MessageSquare className="size-4" />
            <span>Связаться с нами</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
