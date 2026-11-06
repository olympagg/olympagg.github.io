import {
  Award,
  Check,
  Copy,
  ExternalLink as ExternalLinkIcon,
  FileText,
  Loader2,
  Search,
  RotateCw,
  ShieldCheck,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router";

import { BackButton } from "@/components/shared/back-button";
import { ExternalLinkText } from "@/components/shared/external-link";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDataStore } from "@/contexts/data-context";
import {
  type FullName,
  ParticipationStatus,
  WinnerDegree,
} from "@/data/types/base";
import type { RcsoDiploma, RcsoLevel } from "@/data/types/rcso";
import {
  type DiplomaQuery,
  type DiplomaYear,
  useRcsoDiplomas,
} from "@/hooks/rcso-diplomas";
import { formatAcademicYear, formatRcsoLevel } from "@/lib/format";
import {
  diplomaStorageYears,
  formatBirthInput,
  formatDiplomaCode,
  isValidFullName,
  normalizeFullName,
  parseBirth,
  parseDiplomaTitle,
  pdfUrl,
} from "@/lib/rcso-diplomas";
import { routes } from "@/lib/routes";
import { pageTitle } from "@/lib/title";
import { cn, formatNumber, pluralize } from "@/lib/utils";

const DEGREES = [WinnerDegree.FIRST, WinnerDegree.SECOND, WinnerDegree.THIRD];

function toQuery(name: string, birth: string): DiplomaQuery | null {
  const birthIso = parseBirth(birth);
  return isValidFullName(name) && birthIso
    ? { fullName: normalizeFullName(name), birthIso, attempt: 0 }
    : null;
}

// ФИО and birth date live in the hash: it never reaches the server or
// analytics, yet links and reloads keep the input.
export function RcsoDiplomasPage() {
  const { hash } = useLocation();
  // The form writes the hash past the router, so the router only sees external
  // changes (a pasted link in the same tab, back/forward) and those restart it.
  return <DiplomaSearch key={hash} initialHash={hash} />;
}

function DiplomaSearch({ initialHash }: { initialHash: string }) {
  const store = useDataStore();
  const [initialParams] = useState(
    () => new URLSearchParams(initialHash.slice(1)),
  );

  // Inputs keep their own state so the caret isn't reset by URL round-trips;
  // the URL hash only mirrors them.
  const [name, setName] = useState(() => initialParams.get("name") ?? "");
  const [birth, setBirth] = useState(() => initialParams.get("birth") ?? "");

  const [query, setQuery] = useState(() => toQuery(name, birth));
  // Prefilled values from a link are validated right away, so a broken link
  // explains itself instead of silently not searching.
  const [touched, setTouched] = useState(() => ({
    name: name !== "",
    birth: birth !== "",
  }));
  const nameRef = useRef<HTMLInputElement>(null);
  const birthRef = useRef<HTMLInputElement>(null);

  // Coming from a person page the name is prefilled, so start at the birth date.
  useEffect(() => {
    if (nameRef.current?.value && !birthRef.current?.value) {
      birthRef.current?.focus();
    }
  }, []);

  const years = useMemo(
    () =>
      diplomaStorageYears(
        store.getRcsoCatalogs().map((catalog) => catalog.year),
        new Date(),
      ).reverse(),
    [store],
  );
  const results = useRcsoDiplomas(query, years);

  const nameError =
    touched.name && !isValidFullName(name)
      ? "Укажите фамилию, имя и отчество (если есть)"
      : null;
  const birthError =
    touched.birth && !parseBirth(birth)
      ? "Дата в формате дд.мм.гггг, например 21.01.2008"
      : null;

  const writeHash = (nextName: string, nextBirth: string) => {
    const params = new URLSearchParams();
    if (nextName) {
      params.set("name", nextName);
    }
    if (nextBirth) {
      params.set("birth", nextBirth);
    }
    const hash = params.toString() ? `#${params.toString()}` : "";
    const url = `${window.location.pathname}${window.location.search}${hash}`;
    window.history.replaceState(window.history.state, "", url);
  };

  const onSubmit = (event: SyntheticEvent) => {
    event.preventDefault();
    setTouched({ name: true, birth: true });
    const next = toQuery(name, birth);
    if (next) {
      setQuery((prev) => ({ ...next, attempt: (prev?.attempt ?? 0) + 1 }));
    }
  };

  const oldest = years.at(-1);
  const newest = years.at(0);

  return (
    <div className="space-y-6">
      <title>{pageTitle("Дипломы РСОШ")}</title>
      <BackButton />

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Award className="size-6 shrink-0" />
          Дипломы РСОШ
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Дипломы олимпиад из{" "}
          <Link
            to={routes.rcso()}
            className="underline transition-colors hover:text-foreground"
          >
            перечня
          </Link>
          {oldest && newest && (
            <>
              {" "}
              {oldest === newest
                ? `за ${formatAcademicYear(newest.catalogYear)}`
                : `за ${formatAcademicYear(oldest.catalogYear)}–${formatAcademicYear(newest.catalogYear)}`}
            </>
          )}
          . Данные с{" "}
          <a
            href="https://diploma.rsr-olymp.ru/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-foreground"
          >
            официального сайта РСОШ
          </a>
        </p>
      </div>

      <form
        noValidate
        onSubmit={onSubmit}
        className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_10rem_auto] sm:gap-3"
      >
        <Field label="ФИО" htmlFor="diploma-name" error={nameError}>
          <Input
            id="diploma-name"
            ref={nameRef}
            value={name}
            autoComplete="name"
            placeholder="Иванов Иван Иванович"
            aria-invalid={nameError != null}
            aria-describedby={nameError ? "diploma-name-error" : undefined}
            onChange={(event) => {
              setName(event.target.value);
              writeHash(event.target.value, birth);
            }}
            onBlur={() => {
              if (name) {
                setTouched((prev) => ({ ...prev, name: true }));
              }
            }}
          />
        </Field>
        <Field label="Дата рождения" htmlFor="diploma-birth" error={birthError}>
          <Input
            id="diploma-birth"
            ref={birthRef}
            value={birth}
            inputMode="numeric"
            autoComplete="bday"
            placeholder="дд.мм.гггг"
            maxLength={10}
            aria-invalid={birthError != null}
            aria-describedby={birthError ? "diploma-birth-error" : undefined}
            onChange={(event) => {
              const { value, selectionStart } = event.target;
              // Mask only while typing at the end; erasing or editing in the
              // middle keeps the text as is, so digits don't shift or pad.
              const typingAtEnd =
                selectionStart === value.length && value.length > birth.length;
              const next = typingAtEnd
                ? formatBirthInput(value)
                : value.replace(/[^\d.]/g, "");
              setBirth(next);
              writeHash(name, next);
            }}
            onBlur={() => {
              if (birth) {
                setTouched((prev) => ({ ...prev, birth: true }));
              }
            }}
          />
        </Field>
        <Button type="submit" className="mt-2 sm:mt-6.5">
          <Search />
          Найти дипломы
        </Button>
      </form>

      {query && (
        <Results
          query={query}
          onRetry={() => {
            setQuery((prev) => prev && { ...prev, attempt: prev.attempt + 1 });
          }}
          {...results}
        />
      )}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error: string | null;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

function Results({
  query,
  onRetry,
  years,
  done,
  total,
}: {
  query: DiplomaQuery;
  onRetry: () => void;
  years: DiplomaYear[];
  done: number;
  total: number;
}) {
  const loading = done < total;
  const rows = years.flatMap((year) =>
    year.state.status === "found"
      ? year.state.diplomas.map((diploma) => ({ diploma, year }))
      : [],
  );
  const failed = years.filter((year) => year.state.status === "error").length;

  return (
    <section className="space-y-4" aria-busy={loading}>
      <p className="text-sm font-medium empty:hidden" aria-live="polite">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" />
            Ищем дипломы…
          </span>
        ) : (
          rows.length > 0 &&
          `${pluralize(rows.length, ["Найден", "Найдено", "Найдено"])} ${rows.length} ${pluralize(rows.length, ["диплом", "диплома", "дипломов"])}`
        )}
      </p>

      {!loading && failed > 0 && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm"
        >
          <span className="flex items-center gap-2">
            <TriangleAlert className="size-4 shrink-0 text-destructive" />
            Не удалось загрузить {failed}{" "}
            {pluralize(failed, ["учебный год", "учебных года", "учебных лет"])}{" "}
            — не удалось проверить наличие дипломов на сайте РСОШ.
          </span>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <RotateCw />
            Повторить
          </Button>
        </div>
      )}

      {!loading && rows.length === 0 && failed === 0 && (
        <p className="text-sm text-muted-foreground">
          Для «{query.fullName}» дипломов не нашлось. Проверьте написание ФИО
          {/[её]/i.test(query.fullName) && " («е» и «ё»)"} и дату рождения.
        </p>
      )}

      {(loading || rows.length > 0) && (
        <div className="divide-y rounded-lg border">
          {rows.map(({ diploma, year }) => (
            <DiplomaItem
              key={`${year.storageYear}-${diploma.code}`}
              diploma={diploma}
              year={year}
            />
          ))}
          {loading && (
            <>
              <DiplomaSkeleton />
              <DiplomaSkeleton />
            </>
          )}
        </div>
      )}
    </section>
  );
}

function DiplomaItem({
  diploma,
  year,
}: {
  diploma: RcsoDiploma;
  year: DiplomaYear;
}) {
  const store = useDataStore();
  const title = parseDiplomaTitle(diploma.oa);
  const olympiad = title
    ? store
        .getRcsoCatalog(year.catalogYear)
        ?.olympiads.find((item) => item.number === title.number)
    : undefined;
  const degree = title ? DEGREES[title.degree - 1] : undefined;
  const olympiadName = olympiad?.name ?? title?.catalogName ?? diploma.oa;

  // The track is named after the diploma subject; if it is linked to an event
  // on the site, show the holder's result there.
  const track =
    olympiad && title
      ? olympiad.tracks.find(
          (item) => item.name.toLowerCase() === title.subject.toLowerCase(),
        )
      : undefined;
  const eventIds =
    olympiad && track
      ? store.getEventIdsByRcso(year.catalogYear, olympiad.name, track.name)
      : [];
  const holder = diploma.name.split(",")[0]!.trim() as FullName;
  const participations = eventIds.flatMap((eventId) => {
    const participation = store.getParticipation(eventId, holder);
    const event = store.getEvent(eventId);
    return participation && event ? [{ participation, event }] : [];
  });

  const details = [
    formatAcademicYear(year.catalogYear),
    title?.subject,
    title &&
      isRcsoLevel(title.level) &&
      `${formatRcsoLevel(title.level)} уровень`,
    diploma.form && `${diploma.form} класс`,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium">
            {olympiad ? (
              <ExternalLinkText
                to={routes.rcsoOlympiad(olympiad.name, year.catalogYear)}
              >
                {olympiadName}
              </ExternalLinkText>
            ) : (
              olympiadName
            )}
          </span>
          {degree && (
            <StatusBadge
              status={
                degree === WinnerDegree.FIRST
                  ? ParticipationStatus.WINNER
                  : ParticipationStatus.PRIZE_WINNER
              }
              winnerDegree={degree}
            />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {details.join(" · ")}
          {participations.map(({ participation, event }) => (
            <span key={event.id}>
              {" · "}
              <ExternalLinkText
                to={routes.participation(event.id, holder)}
                className="text-foreground hover:opacity-75"
              >
                {participations.length > 1 ? event.meta.name : "Результат"}:{" "}
                {formatNumber(participation.score)} /{" "}
                {formatNumber(event.meta.maxScore)}
              </ExternalLinkText>
            </span>
          ))}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 whitespace-nowrap">
        <CopyCode code={diploma.code} />
        <Button asChild size="sm" variant="outline">
          <a
            href={pdfUrl(year.storageYear, diploma.code)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText />
            PDF
            <ExternalLinkIcon className="size-3" />
          </a>
        </Button>
      </div>
    </div>
  );
}

function DiplomaSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-56 max-w-[60vw]" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64 max-w-[70vw]" />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

function isRcsoLevel(level: number): level is RcsoLevel {
  return level === 1 || level === 2 || level === 3;
}

const COPIED_MS = 1500;

function CopyCode({ code }: { code: string }) {
  const [status, setStatus] = useState<"copied" | "failed" | null>(null);

  useEffect(() => {
    if (!status) {
      return;
    }
    const timeout = setTimeout(() => {
      setStatus(null);
    }, COPIED_MS);
    return () => {
      clearTimeout(timeout);
    };
  }, [status]);

  const StatusIcon =
    status === "copied" ? Check : status === "failed" ? X : Copy;

  return (
    <button
      type="button"
      title={
        status === "failed"
          ? "Не удалось скопировать номер"
          : "Скопировать номер диплома"
      }
      onClick={() => {
        // The clipboard can be missing (non-secure origin) or denied
        // (permissions, embedded browsers); say so instead of failing
        // silently.
        void Promise.resolve()
          .then(() => navigator.clipboard.writeText(code))
          .then(
            () => {
              setStatus("copied");
            },
            () => {
              setStatus("failed");
            },
          );
      }}
      className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <ShieldCheck className="size-4" />
      {/* Monospace digits sit higher than the icons; nudge them to center. */}
      <span className="translate-y-[0.125em] font-mono">
        {formatDiplomaCode(code)}
      </span>
      <StatusIcon
        className={cn(
          // The copy icon has less built-in padding than the shield; even out
          // the visible gaps around the number.
          "ml-[1.25px] size-3.5",
          status === "copied" && "text-foreground",
          status === "failed" && "text-destructive",
        )}
      />
      <span className="sr-only" aria-live="polite">
        {status === "copied" && "Скопировано"}
        {status === "failed" && "Не удалось скопировать"}
      </span>
    </button>
  );
}
