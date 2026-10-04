import { ScrollText } from "lucide-react";
import { useNavigate } from "react-router";

import { DataTable } from "@/components/shared/data-table";
import { NotFoundMessage } from "@/components/shared/not-found-message";
import { YearPicker } from "@/components/shared/year-picker";
import { useDataStore } from "@/contexts/data-context";
import { useYearParam } from "@/hooks/year-param";
import { routes } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { formatDate } from "@/lib/utils";

import { olympiadColumns } from "./columns";

export function RcsoListPage() {
  const store = useDataStore();
  const navigate = useNavigate();

  const catalogs = store.getRcsoCatalogs();
  const years = catalogs.map((catalog) => catalog.year);
  const [selectedYear, setYear] = useYearParam(years);

  const catalog =
    selectedYear != null ? store.getRcsoCatalog(selectedYear) : null;

  const olympiads = catalog
    ? [...catalog.olympiads].sort((a, b) => a.number - b.number)
    : [];

  if (!catalog || selectedYear == null) {
    return <NotFoundMessage message="Перечень РСОШ недоступен" />;
  }

  return (
    <div className="space-y-6">
      <title>{pageTitle("Перечень РСОШ")}</title>

      <div>
        <h1 className="mb-3 flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ScrollText className="size-6 shrink-0" />
          Перечень олимпиад школьников
        </h1>
        <YearPicker years={years} selected={selectedYear} onSelect={setYear} />
        <p className="mt-3 text-sm text-muted-foreground">
          Согласно{" "}
          <a
            href={catalog.order.url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-foreground"
          >
            приказу Минобрнауки № {catalog.order.number} от{" "}
            {formatDate(catalog.order.date)}
          </a>
        </p>
      </div>

      <DataTable
        columns={olympiadColumns}
        data={olympiads}
        onRowClick={(olympiad) => {
          void navigate(routes.rcsoOlympiad(olympiad.name, selectedYear));
        }}
      />
    </div>
  );
}
