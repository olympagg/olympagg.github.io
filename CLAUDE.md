## Runtime

Default to Bun, never Node.js or Vite.

- `bun <file>` instead of `node`/`ts-node`
- `bun install` instead of `npm install`
- `bun <script>`, e.g. `bun dev` to start development server at http://localhost:3000
- `bunx <tool>`

## Setup

Install dependencies by `bun install`.

`src/data/eventBundle.json` is required for build and running dev server.

If it's missing in your environment, either run `bun parse` or fill the file with `{"events":[]}` (this will satisfy tsc).

`bun parse` caches every fetched URL in `src/data/cache/`; re-fetches only happen when a URL isn't cached yet. It needs the user's consent only when the cache is empty (first run in this environment, or a newly added source).

`bun parse <filter>` will only parse events whose id includes `<filter>`,
emitting any other events. Use for quick testing. Run plain `bun parse` in the end
to rebuild the bundle.

## Lint

Always run `bun lint` after finishing your changes. Fix errors is any.

`bun lint` includes Prettier, eslint, and tsc. Never run any of those tools manually. Run them only via `bun lint`.

If you encounter errors due to missing dependencies (errored type) or missing `eventBundle.json`, do steps in Setup.

## Frontend conventions

- Bun bundles HTML imports directly — **no Vite, no Webpack**. `index.html` references `frontend.tsx`; `.tsx`/`.css` are transpiled by Bun.
- Tailwind v4 via `bun-plugin-tailwind` (configured in `build.ts` and `bunfig.toml`). Global styles in `src/index.css` and `src/styles/`.
- UI primitives: shadcn/ui (`components.json`) on top of Radix. Use `clsx` + `tailwind-merge` (`cn` helper in `src/lib/`).
- Tables: `@tanstack/react-table`. Search: `flexsearch`. Icons: `lucide-react`, `simple-icons`.
- Routing: `react-router` v7 (data router, SPA — server rewrites all paths to `index.html`).

## Data pipeline

The `src/data` tree is split by execution phase: `build/` runs at build time (`bun parse`), `runtime/` runs in the browser. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full layout.

1. **Collect** (`scripts/parse.ts` → `src/data/build/parsers/*`): fetch raw HTML/PDF/XLSX, parse to typed JSON in `src/data/parsed/`. PDFs use `@nalinor/mupdf4llm` / `mupdf` via `parsers/utils/pdf.ts`. XLSX via the `xlsx` package.
2. **Normalize** (`scripts/normalize*.ts`): canonicalize schools/cities/regions; outputs the `normalized*.json` lookup tables. Uses Gemini (`@google/genai`) for fuzzy matching.
3. **Ingest** (`src/data/runtime/`): at app load, processors merge parsed results into the in-memory store and build the FlexSearch index consumed by pages.

When adding a new olympiad source: add a type in `src/data/types/`, a collector in `src/data/build/parsers/`, a registry entry in `src/data/build/registry/`, and event metadata in `src/data/build/meta/`. Wire it through `registry/index.ts` and `meta/index.ts`.

## Deployment

GitHub Pages (see the `deploy` job in `.github/workflows/push.yml`). The job builds with `bun run build` and publishes `dist/` via `actions/upload-pages-artifact` + `actions/deploy-pages`. SPA — `build.ts` copies `index.html` to `404.html` so Pages serves the app for every route.

## Contributing

Architecture, conventions and the new-source checklist live in [CONTRIBUTING.md](CONTRIBUTING.md).

## Reference

Bun API docs live in `node_modules/bun-types/docs/**.mdx`.
