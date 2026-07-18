import { Outlet } from "react-router";

import { ErrorBoundary } from "@/components/shared/error-boundary";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { UpdateNotifier } from "@/components/shared/update-notifier";
import { DataProvider } from "@/contexts/data-context";

import { Footer } from "./footer";
import { Header } from "./header";

export function RootLayout() {
  return (
    <DataProvider>
      <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="sticky top-0 z-40">
          <UpdateNotifier />
          <Header />
        </div>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 pb-12">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </DataProvider>
  );
}
