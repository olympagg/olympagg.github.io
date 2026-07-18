import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router";

import { RootLayout } from "@/components/layout/root-layout";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import "./index.css";

const HomePage = lazy(() =>
  import("@/pages/home").then((m) => ({ default: m.HomePage })),
);
const SearchPage = lazy(() =>
  import("@/pages/search").then((m) => ({ default: m.SearchPage })),
);
const EventPage = lazy(() =>
  import("@/pages/event").then((m) => ({ default: m.EventPage })),
);
const ParticipationPage = lazy(() =>
  import("@/pages/participation").then((m) => ({
    default: m.ParticipationPage,
  })),
);
const TeamPage = lazy(() =>
  import("@/pages/team").then((m) => ({ default: m.TeamPage })),
);
const PersonPage = lazy(() =>
  import("@/pages/person").then((m) => ({ default: m.PersonPage })),
);
const SchoolPage = lazy(() =>
  import("@/pages/school").then((m) => ({ default: m.SchoolPage })),
);
const RegionPage = lazy(() =>
  import("@/pages/region").then((m) => ({ default: m.RegionPage })),
);

const fallback = <PageSkeleton />;

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route
            index
            element={
              <Suspense fallback={fallback}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="search"
            element={
              <Suspense fallback={fallback}>
                <SearchPage />
              </Suspense>
            }
          />
          <Route
            path="event/:eventId"
            element={
              <Suspense fallback={fallback}>
                <EventPage />
              </Suspense>
            }
          />
          <Route
            path="event/:eventId/participant/:slug"
            element={
              <Suspense fallback={fallback}>
                <ParticipationPage />
              </Suspense>
            }
          />
          <Route
            path="event/:eventId/team/:slug"
            element={
              <Suspense fallback={fallback}>
                <TeamPage />
              </Suspense>
            }
          />
          <Route
            path="person/:slug"
            element={
              <Suspense fallback={fallback}>
                <PersonPage />
              </Suspense>
            }
          />
          <Route
            path="school/:slug"
            element={
              <Suspense fallback={fallback}>
                <SchoolPage />
              </Suspense>
            }
          />
          <Route
            path="region/:slug"
            element={
              <Suspense fallback={fallback}>
                <RegionPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
