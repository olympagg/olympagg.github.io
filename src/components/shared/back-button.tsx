import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router";

import { routes } from "@/lib/routes";

function sectionHome(pathname: string): string {
  return pathname === "/rcso" || pathname.startsWith("/rcso/")
    ? routes.rcso()
    : routes.home();
}

export function BackButton() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <button
      onClick={() => {
        // The router numbers its history entries; idx 0 means the page was
        // opened directly (new tab, shared link), so there is nothing of ours
        // to go back to.
        const state = window.history.state as { idx?: number } | null;
        if ((state?.idx ?? 0) > 0) {
          void navigate(-1);
        } else {
          void navigate(sectionHome(pathname));
        }
      }}
      className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Назад
    </button>
  );
}
