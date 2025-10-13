<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

Description: Guidelines for writing Next.js applications with tRPC, Drizzle, Clerk, and Tailwind.
Globs: **/*.ts, **/*.tsx, **/*.js, **/*.jsx

Overview

This document defines the coding and architecture conventions for projects using the Ultracite Framework — a Next.js (App Router) stack featuring tRPC, Drizzle ORM, Clerk, and Tailwind.

tRPC enables end-to-end typesafe APIs, removing the need for schema duplication, runtime validation boilerplate, and code generation. Drizzle ensures consistent, schema-driven database typing. Together, they form a unified full-stack TypeScript environment.

Tech Stack
Layer	Tool	Purpose
Framework	Next.js (App Router)	Routing, rendering, and API routes
Language	TypeScript	Type safety and autocompletion
API Layer	tRPC	End-to-end typesafe APIs
Database	Drizzle ORM + Postgres	Typed queries and migrations
Auth	Clerk	Authentication and user management
Styling	TailwindCSS + Shadcn + Radix	UI and accessibility
Validation	Zod	Input validation for tRPC procedures
Directory Structure
src/
 ├─ app/
 │   ├─ layout.tsx
 │   ├─ page.tsx
 │   ├─ api/trpc/[trpc].ts       # tRPC HTTP handler
 │   ├─ server/
 │   │   ├─ routers/             # tRPC routers (by feature)
 │   │   ├─ trpc.ts              # router and procedure helpers
 │   │   ├─ context.ts           # shared context
 │   │   └─ index.ts             # app router export
 │   ├─ lib/drizzle/             # database schema and db client
 │   └─ utils/trpc.ts            # createTRPCNext client
 ├─ components/
 ├─ lib/
 ├─ middleware.ts
 └─ styles/globals.css

tRPC Configuration
Backend Initialization
// src/server/trpc.ts
import { initTRPC } from '@trpc/server';
import superjson from 'superjson';

const t = initTRPC.create({ transformer: superjson });

export const router = t.router;
export const publicProcedure = t.procedure;

App Router
// src/server/routers/_app.ts
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';

export const appRouter = router({
  greeting: publicProcedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => `Hello ${input.name}`),
});

export type AppRouter = typeof appRouter;

Client Integration
// src/utils/trpc.ts
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers/_app';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({ url: `${getBaseUrl()}/api/trpc` }),
      ],
    };
  },
  ssr: false,
});

Drizzle + TypeScript Rules

Infer types directly from schema (typeof users.$inferSelect).

Never manually redefine schema-derived types.

Define custom types only for:

API payloads (request/response)

Local or UI state

Use Drizzle migrations (drizzle-kit generate) for all schema changes.

Store queries in lib/db/queries.ts, not inline in components.

Always use typed relationships (references()).

tRPC Best Practices

Validation – Use Zod schemas for all procedure inputs.

.input(z.object({ id: z.string().uuid(), email: z.string().email() }))


Router Organization – Split routers by feature (e.g., userRouter, postRouter).

export const appRouter = router({ user: userRouter, post: postRouter });


Middleware – Use middleware for auth, logging, etc.

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
  return next({ ctx: { user: ctx.user } });
});


Error Handling – Always throw structured TRPCErrors for consistent API responses.

Transformers – Use superjson to preserve non-JSON data (e.g., Date, Map, Set).

React Query Integration – Use hooks like trpc.user.byId.useQuery() for fetching and caching.

Context Creation – Expose shared resources (e.g., db, user) via createContext.

Procedure Types – Use different procedure variants for different access levels:

export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);


Prefetching & Batching – Use httpBatchLink and prefetch data via SSR or SSG where possible.

Export Types Only – Export AppRouter type, never the router instance.

TypeScript Conventions

Use import type and export type for all type-only imports.

Avoid any, unknown, and enums.

Keep type definitions colocated with relevant modules.

Use pnpm build to verify compilation.

Do not use pnpm lint or pnpm typecheck for build validation.

Component and Styling Rules

Functional components only.

Each component defines a Props interface.

No inline CSS — use Tailwind exclusively.

Extend Shadcn UI components; do not override their base styles.

Keep each component under 200 lines.

Split large files into smaller components or hooks.

All UI must meet accessibility standards (proper ARIA, keyboard navigation, contrast).

Build Verification

To verify that code compiles correctly, run:

pnpm build


Do not use:

pnpm lint
pnpm typecheck

Design Philosophy

The framework prioritizes:

End-to-end type safety

Schema-driven architecture

Readable, modular, accessible code

Minimal redundancy

Predictable, composable patterns