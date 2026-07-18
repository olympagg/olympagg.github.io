# Contributing

This guide is for developers (and coding agents) working on Olympiad Aggregator.
It covers the architecture, local workflow, and the conventions the codebase
follows. For a product-level overview see [README.md](README.md).

## Architecture

The repository is two things in one:

- **A single-page app** (`src/`, minus `src/data`) — React 19 + React Router v7,
  Tailwind v4, shadcn/ui primitives. Bun bundles the HTML/TSX directly; there is
  no Vite or Webpack. Entry chain: `src/index.ts` (Bun server) → `src/index.html`
  → `src/frontend.tsx` → `src/App.tsx`.
- **A data pipeline** (`src/data/`, `scripts/`) — collectors fetch and parse
  public olympiad protocols into typed JSON, normalize scripts canonicalize
  schools/cities/regions, and ingest processors merge everything into an
  in-memory store consumed by the pages.

### Build-time vs. runtime

The `src/data` tree is split by **when** the code runs:

- `src/data/build/**` runs only at **build time** (when `scripts/parse.ts`
  produces `eventBundle.json`):
  - `build/parsers/` — parser classes (+ `parsers/utils/` shared helpers);
  - `build/registry/` — the parser instance (URL + class) for each event id;
  - `build/meta/` — the `EventMeta` for each event;
  - `build/pipeline/` — the merge that turns parsed rows into `EventData`.
- `src/data/runtime/**` runs only in the **browser**: `runtime/store.ts`,
  `runtime/search.ts` and the per-entity processors under `runtime/processors/`
  build the in-memory store and search index from the baked JSON at app load.
- `src/data/types/` is shared by both.

Keep `build/**` out of browser code paths and vice versa.

### Committed vs. generated

`src/data/parsed/`, `src/data/cache/` and `src/data/eventBundle.json`
are **generated** and git-ignored. The normalization lookup tables
(`normalizedSchools.json`, `cityRegions.json`, `normalizedRegions.json`) are
committed because they are an input to ingest.

## Local workflow

```bash
bun install                # dependencies
cp .env.example .env       # fill in secrets (only needed for `bun parse`)
bun dev                    # dev server at http://localhost:3000
bun run build              # production build into dist/
bun parse                  # run the collectors (see README → Парсинг данных)
bun lint                   # prettier --write + eslint --fix + tsc + knip
```

Before pushing, run `bun lint`. CI fails if `bun lint` leaves any diff, so commit the formatted result.

## Conventions

### Language

User-facing text — UI strings and error messages — is **Russian**. Everything
else — identifiers, comments, commit messages — is **English**. The UI renders
dark-only (`<html class="dark">`); the app name stays "Olympiad Aggregator".

### TypeScript

- Domain strings use **branded types** (`Region`, `City`, `School`, `Team`,
  `FullName`, `EventId`) — see `src/data/types/base.ts`. Convert at the boundary,
  don't sprinkle `as` casts through logic.
- Avoid double assertions (`x as unknown as Y`). If you need one, the types are
  probably wrong.
- `tsconfig` runs with `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`
  and `noUnusedParameters`. Prefix intentionally-unused bindings with `_`.

### Imports & exports

- Use the `@/` alias for cross-directory imports; reserve `./` for same-folder
  siblings.
- Pages, components and collector parser classes use **default exports**;
  utilities under `src/lib` and `src/data` use **named exports**.
- Import order and type-only imports are enforced by ESLint — let `--fix` sort
  them.

### Pages & components

- A page lives in a flat `src/pages/<name>.tsx` until it needs more than one
  concern, then it becomes a `src/pages/<name>/` directory with an `index.tsx`.
- Shared, reusable UI goes in `src/components/shared/`; vendored shadcn/ui
  primitives stay in `src/components/ui/`.
- TanStack Table column definitions live at module scope (`const xColumns`) when
  self-contained, or in a `buildColumns(...)` factory when they need runtime
  values.
- Each page sets its document title via `<title>{pageTitle(...)}</title>`
  (`src/lib/title.ts`); React hoists it into the head.
- **File naming:** prefer a single word when it stays clear (`columns.tsx`,
  `filters.tsx`); otherwise use kebab-case (`search-result-item.tsx`). Do not
  introduce camelCase file names.

### Styling

- Use theme tokens (`bg-background`, `text-muted-foreground`, …), not hardcoded
  colors.
- Always compose class names with the `cn()` helper (`src/lib/utils.ts`), never
  string concatenation or `.join(" ")`.
- Tailwind class order is auto-sorted by `prettier-plugin-tailwindcss` — don't
  hand-order classes.
- **Icons next to wrappable text** (leading icons, trailing help circles) must
  flow _inline_ with the text — render them as `inline-block` with a vertical
  `align-*` nudge, not as `flex` items. A flexed icon becomes its own
  vertically-centred column, so when the label wraps to a second line the icon
  floats beside the block instead of sitting on the adjacent line. For the small
  stat cards use the shared `StatCardTitle`
  (`src/components/shared/stat-card-title.tsx`), which already encodes this.

### Data pipeline

- A collector is a parser class in `src/data/build/parsers/`. It fetches raw
  bytes (via the shared `parsers/utils`) and returns typed
  `ParsedParticipation[]`.
- Processors must be **pure** — build new objects, never mutate their input.
- Adding a new olympiad source:
  1. add a participation type in `src/data/types/`;
  2. add a collector in `src/data/build/parsers/`;
  3. register the parser instance in `src/data/build/registry/`;
  4. add event metadata in `src/data/build/meta/`;
  5. wire both through the corresponding `index.ts` files;
  6. run `bun parse` to validate the parser works correctly.

## CI / deployment

`.github/workflows/push.yml` lints, runs the collectors, uploads the
`event-bundle` artifact and deploys the frontend to GitHub Pages
(`bun run build` → `actions/deploy-pages`);
`.github/workflows/normalize.yml` runs the normalization pipeline.

## Tooling contract

`bun lint` is the quality gate: it formats (prettier, incl. Tailwind class sorting),
auto-fixes lint issues, type-checks and runs knip to flag unused code.

All three run in CI. Never run prettier, eslint, tsc or knip individually — always go
through `bun lint`.
