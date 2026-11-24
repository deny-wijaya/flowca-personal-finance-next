<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules

- Read `docs/PRD.md` for scope before adding features. The API contract lives only in `../express-personal-finance/docs/API-CONTRACT.md`; keep `src/modules/*/infrastructure/*-dto.ts` in sync with it.
- The architecture contract is `docs/ARCHITECTURE.md`. It is enforced by `eslint.config.mjs` and `src/architecture.test.ts`; never weaken those to make a change pass.
- Clean architecture per module in `src/modules/<feature>/{domain,application,infrastructure,presentation}`. Dependencies point inward only; `eslint.config.mjs` enforces this with `no-restricted-imports`.
- Only `src/shared/config/env.ts` reads `process.env`. Only `src/di/container.ts` picks concrete implementations (`DATA_SOURCE=mock|api`).
- The backend API is called only from the server (Server Components and Server Actions). Never expose `API_BASE_URL` or tokens via `NEXT_PUBLIC_`.
- Financial data is per-user: do not use `"use cache"` for it. Async data sections call `connection()` and are wrapped in `<Suspense>`.
- UI follows `docs/PRD-UI-Flowca.md`: values only from `src/shared/ui/styles/tokens.css`, variants via `cva`, formatting in `presentation/view-models/`, screens are pure (no container/infrastructure imports). Design source lives in `design/*.dc.html`.
- Before finishing: `npm run verify` (typecheck, lint, test, build).
- When a change touches UI (screens, components, layouts, styles, or anything the user sees or clicks), open the affected pages in a browser and check the result yourself before reporting it as done. Check desktop width (at least 1024px) and mobile width (about 390px), click through the changed flow (menus, forms, redirects), and compare with the matching `design/*.dc.html`. Report what you saw. If no browser is available, say clearly that the UI was not checked in a browser.
