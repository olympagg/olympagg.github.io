import { useSearchParams } from "react-router";

export function useYearParam(
  years: number[],
): [number | null, (year: number) => void] {
  const [searchParams, setSearchParams] = useSearchParams();

  const yearParam = searchParams.get("year");
  const latestYear = years.at(-1) ?? null;
  const selectedYear =
    yearParam && years.includes(Number(yearParam))
      ? Number(yearParam)
      : latestYear;

  const setYear = (year: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("year", String(year));
        return next;
      },
      { replace: true },
    );
  };

  return [selectedYear, setYear];
}
