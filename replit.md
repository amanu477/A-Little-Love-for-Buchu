# A Little Love for Buchu

A mobile-first, interactive photo story with chapters, playful moments, and a personal note.

## Run & Operate

- `pnpm install --frozen-lockfile` — install workspace dependencies from the lockfile
- Replit preview: start `artifacts/buchu-love: web`; it runs `pnpm --filter @workspace/buchu-love run dev` and supplies `PORT` and `BASE_PATH`
- `pnpm --filter @workspace/buchu-love run typecheck` — typecheck the story website
- `PORT=5000 BASE_PATH=/ pnpm --filter @workspace/buchu-love run build` — build the static story site into `artifacts/buchu-love/dist/public`
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `DATABASE_URL` is for the API/database packages; the static story website does not need it.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Story website: React, Vite, Tailwind CSS, and Wouter
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/buchu-love/src/` — story website, chapter flow, and content
- `artifacts/buchu-love/public/images/` — supplied story photos
- `artifacts/buchu-love/.replit-artifact/artifact.toml` — Replit preview path, service, and runtime environment
- `lib/` and `artifacts/api-server/` — shared packages and API service

## Architecture decisions

The Buchu story is a static Vite site; it does not call the API server or require a database.

## Product

A paginated personal story that weaves portraits and shared photos into scenes, with chapter navigation and optional music playback.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
