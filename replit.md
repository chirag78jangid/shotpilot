# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: OpenAI via Replit AI Integrations (gpt-5.2)

## Artifacts

- **ShotPilot** (`artifacts/shotpilot`) — React + Vite frontend at `/`
  - Pages: `/` (hero), `/create` (form), `/results` (AI plan), `/saved` (saved plans), `/chat` (AI assistant)
  - Dark/light mode toggle with next-themes
- **API Server** (`artifacts/api-server`) — Express 5 backend at `/api`
  - Routes: `/api/shotpilot/generate`, `/api/shotpilot/saved`, `/api/openai/conversations/*`
  - Streams AI responses via SSE

## DB Tables

- `saved_shot_plans` — user-saved shot plans with JSONB plan field
- `conversations` — OpenAI chat conversations
- `messages` — chat messages per conversation

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
