import { Route, Trophy } from "lucide-react";
import { Link } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { useDataStore } from "@/contexts/data-context";
import { capitalize } from "@/lib/format";
import { routes, useRcsoTrackParams } from "@/lib/routes";
import { pageTitle } from "@/lib/title";

import { RcsoTrackHistoryTable } from "./track-history-table";

export function RcsoTrackPage() {
  const { olympiadSlug, trackSlug } = useRcsoTrackParams();
  const store = useDataStore();

  const olympiadName = store.getRcsoOlympiadName(olympiadSlug);
  const trackName = olympiadName
    ? store.getRcsoTrackName(olympiadName, trackSlug)
    : null;

  const history = olympiadName
    ? store.getRcsoOlympiadHistory(olympiadName)
    : [];

  if (!olympiadName || !trackName) {
    return <NotFoundMessage message="Профиль не найден" />;
  }

  return (
    <div className="space-y-6">
      <title>{pageTitle(`${trackName} — ${olympiadName}`)}</title>
      <BackButton />

      <div>
        <h1 className="flex items-start gap-2 text-2xl font-bold tracking-tight">
          <Trophy className="mt-1 size-6 shrink-0" />
          <Link
            to={routes.rcsoOlympiad(olympiadName)}
            className="transition-opacity hover:opacity-75"
          >
            {olympiadName}
          </Link>
        </h1>
        <h2 className="mt-2 text-lg font-semibold">
          <Route className="mr-1.5 inline size-5 align-[-0.15em] text-muted-foreground" />
          {capitalize(trackName)}
        </h2>
      </div>

      <RcsoTrackHistoryTable
        olympiadName={olympiadName}
        trackName={trackName}
        history={history}
      />
    </div>
  );
}
