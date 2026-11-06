import { useEffect, useState } from "react";

import {
  buildPersonKey,
  codesUrl,
  type DiplomaStorageYear,
  sha256Hex,
} from "@/lib/rcso-diplomas";
import {
  type DiplomaLoadResult,
  loadDiplomas,
} from "@/lib/rcso-diplomas-sandbox";

export interface DiplomaQuery {
  fullName: string;
  birthIso: string;
  // Bumped on every submit so that repeating the same search reloads it.
  attempt: number;
}

export type DiplomaYearState = DiplomaLoadResult | { status: "loading" };

export interface DiplomaYear extends DiplomaStorageYear {
  state: DiplomaYearState;
}

interface Results {
  key: string;
  byYear: Map<number, DiplomaLoadResult>;
}

const EMPTY_RESULTS: Results = { key: "", byYear: new Map() };

export function useRcsoDiplomas(
  query: DiplomaQuery | null,
  years: DiplomaStorageYear[],
): { years: DiplomaYear[]; done: number; total: number } {
  const key = query ? buildPersonKey(query.fullName, query.birthIso) : "";
  const storageYears = years.map((year) => year.storageYear).join(",");
  const attempt = query?.attempt ?? 0;
  const runKey = `${key}|${storageYears}|${attempt}`;
  const [results, setResults] = useState(EMPTY_RESULTS);

  useEffect(() => {
    if (!key || !storageYears) {
      return;
    }

    const controller = new AbortController();
    void sha256Hex(key).then(
      (hash) => {
        if (controller.signal.aborted) {
          return;
        }
        const yearByUrl = new Map(
          storageYears
            .split(",")
            .map((year) => [codesUrl(Number(year), hash), Number(year)]),
        );
        loadDiplomas(
          [...yearByUrl.keys()],
          controller.signal,
          (url, result) => {
            setResults((prev) => ({
              key: runKey,
              byYear: new Map(prev.key === runKey ? prev.byYear : []).set(
                yearByUrl.get(url)!,
                result,
              ),
            }));
          },
        );
      },
      () => {
        // No WebCrypto (e.g. a non-secure origin): fail every year instead of
        // leaving them loading forever.
        if (controller.signal.aborted) {
          return;
        }
        setResults({
          key: runKey,
          byYear: new Map(
            storageYears
              .split(",")
              .map((year) => [Number(year), { status: "error" } as const]),
          ),
        });
      },
    );

    return () => {
      controller.abort();
    };
  }, [key, storageYears, runKey]);

  const current =
    results.key === runKey ? results.byYear : EMPTY_RESULTS.byYear;

  const items: DiplomaYear[] = years.map((year) => ({
    ...year,
    state: current.get(year.storageYear) ?? {
      status: "loading",
    },
  }));

  return {
    years: query ? items : [],
    done: query
      ? items.filter((item) => item.state.status !== "loading").length
      : 0,
    total: query ? items.length : 0,
  };
}
