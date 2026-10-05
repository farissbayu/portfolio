---
title: "Scaffolding a Fullstack Monorepo: React, TanStack Router, Hono, Vite & Cloudflare"
description: "A step-by-step guide to wiring React 19, TanStack Router, Hono on Cloudflare Workers, Tailwind v4, shadcn/ui, Zod, Zustand and TanStack Query into one Bun-managed monorepo."
publishedDate: 2026-10-05
tags: ["Fullstack", "Monorepo", "Cloudflare", "React", "Hono"]
featured: true
draft: false
---

Most "modern stack" tutorials hand you a single app and hope for the best. The
moment you add a real backend, shared types, and a deploy target, the seams show.
This guide scaffolds the whole thing up front: a Bun workspace with a React SPA,
a Hono API running on Cloudflare Workers, shared Zod schemas, and the tooling that
keeps them honest.

Everything below is pinned to the versions that were current when this was
written (late 2026). Treat the versions as a starting point, not law.

## What we are building

- **Runtime & package manager**: Bun 1.4 (workspaces built in)
- **Frontend**: React 19 + Vite 8
- **Routing**: TanStack Router (file-based, type-safe)
- **Server state**: TanStack Query 5
- **Client state**: Zustand 5
- **Validation**: Zod 4 (shared between client and server)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Backend**: Hono 4 on Cloudflare Workers
- **Types**: TypeScript 7 (strict)

The repo layout:

```text
monorepo/
├── apps/
│   ├── web/               # React SPA (Vite)
│   └── api/               # Hono worker (Cloudflare)
├── packages/
│   └── shared/            # Zod schemas + inferred types
├── package.json           # workspace root
├── bunfig.toml
└── tsconfig.base.json
```

## 1. Bootstrap the workspace

Bun workspaces are just a `workspaces` field. No Turborepo required for a repo
this size, though the layout is compatible if you add it later.

```bash
mkdir monorepo && cd monorepo
bun init -y
```

Edit the root `package.json`:

```json
{
  "name": "monorepo",
  "private": true,
  "type": "module",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "build": "bun run --filter '*' build",
    "check": "bun run --filter '*' check"
  }
}
```

Create a shared base tsconfig so every package inherits the same strictness:

```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}
```

## 2. The shared package

This is the piece most tutorials skip. Put every wire-format schema here so the
client and the worker cannot drift apart.

```text
packages/shared/
├── package.json
├── tsconfig.json
└── src/index.ts
```

```json
{
  "name": "@repo/shared",
  "version": "0.0.0",
  "type": "module",
  "exports": {
    ".": "./src/index.ts"
  },
  "dependencies": {
    "zod": "^4.6.5"
  }
}
```

Because Bun resolves workspace packages straight to source, we can export `.ts`
directly and skip a build step during development. Here is a schema plus its
inferred type:

```ts
import { z } from "zod";

export const createPostSchema = z.object({
  title: z.string().min(3).max(120),
  body: z.string().min(1),
  tags: z.array(z.string()).default([]),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

export const postSchema = createPostSchema.extend({
  id: z.string(),
  createdAt: z.coerce.date(),
});

export type Post = z.infer<typeof postSchema>;
```

`z.infer` is the whole point: the type is derived from the runtime validator, so
it can never disagree with what actually passes validation.

## 3. The API: Hono on Cloudflare Workers

Create `apps/api`:

```text
apps/api/
├── package.json
├── tsconfig.json
├── wrangler.toml
└── src/index.ts
```

```json
{
  "name": "@repo/api",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "build": "wrangler deploy --dry-run --outdir=dist",
    "deploy": "wrangler deploy",
    "check": "tsc --noEmit"
  },
  "dependencies": {
    "@repo/shared": "workspace:*",
    "@hono/zod-validator": "^0.9.1",
    "hono": "^4.13.13",
    "zod": "^4.6.5"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.0.0",
    "typescript": "^7.0.2",
    "wrangler": "^4.147.0"
  }
}
```

```toml
name = "monorepo-api"
main = "src/index.ts"
compatibility_date = "2026-10-05"
compatibility_flags = ["nodejs_compat"]
```

The worker itself. Notice the shared schema doing validation duty — the same
contract the client uses:

```ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createPostSchema, postSchema, type Post } from "@repo/shared";

type Env = { Bindings: { DB: D1Database } };

const app = new Hono<Env>().basePath("/api");

const posts: Post[] = [];

app.get("/health", (c) => c.json({ ok: true }));

app.get("/posts", (c) => c.json(posts));

app.post("/posts", zValidator("json", createPostSchema), (c) => {
  const input = c.req.valid("json");
  const post = postSchema.parse({
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date(),
  });
  posts.push(post);
  return c.json(post, 201);
});

export default app;
```

`zValidator` rejects malformed payloads with a 400 before your handler runs, so
the handler body can assume a valid, typed `input`.

## 4. The frontend: Vite + React 19

Create `apps/web` and install the client stack:

```bash
bun create vite apps/web --template react-ts
```

Then add the frontend dependencies:

```bash
bun add @tanstack/react-router @tanstack/react-query zustand @repo/shared
bun add -d @tanstack/router-plugin @tailwindcss/vite tailwindcss vite @vitejs/plugin-react
```

Configure Vite with the TanStack Router plugin (for file-based routes) and the
Tailwind v4 plugin:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tanstackRouter({ target: "react", autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: { "/api": "http://localhost:8787" },
  },
});
```

The proxy means the SPA can call `/api/*` in dev without CORS fuss, and the same
relative paths work in production when both share a domain.

## 5. App shell: Query + Router

Wire TanStack Query's provider into the router so loaders can prefetch:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

`routeTree.gen.ts` is generated by the plugin — do not edit it by hand. A route
module declares its own loader, which makes data fetching type-safe:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { postSchema } from "@repo/shared";

const postsQuery = queryOptions({
  queryKey: ["posts"],
  queryFn: async () => {
    const res = await fetch("/api/posts");
    return postSchema.array().parse(await res.json());
  },
});

export const Route = createFileRoute("/posts/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: PostsPage,
});

function PostsPage() {
  const { data } = useSuspenseQuery(postsQuery);
  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

Because parsed types flow through `postSchema`, `post.title` is guaranteed to
exist. Rename the field on the server and TypeScript lights up everywhere.

## 6. Zustand for client state

TanStack Query owns server state. For genuinely client-only state — a theme, a
sidebar, a draft — reach for Zustand:

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    }),
    { name: "ui" }
  )
);
```

The rule of thumb: if the data lives on a server, it belongs in Query; if it only
ever exists in the browser, it belongs in Zustand.

## 7. Tailwind v4 and shadcn/ui

Tailwind v4 is configured entirely in CSS. Replace `src/index.css`:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --color-brand-500: #7d8c4e;
  --radius-lg: 0.75rem;
}
```

Now initialise shadcn/ui. It detects Vite and writes the component config plus a
`components.json`:

```bash
bunx shadcn@latest init
bunx shadcn@latest add button card input
```

shadcn copies component source into `src/components/ui`, so you own the code and
can edit it freely. Combined with the `@theme` block above, both the generated
components and your own utilities speak the same design tokens.

## 8. Typecheck and run

Add a `check` script to `apps/web`:

```json
{
  "scripts": {
    "check": "tsc --noEmit"
  }
}
```

Then from the repo root, start everything:

```bash
bun install
bun run dev
```

The Vite dev server proxies `/api` to the worker on `:8787`, so the browser talks
to one origin while you edit both sides with hot reload.

## 9. Deploy

The API deploys to Cloudflare Workers with Wrangler:

```bash
cd apps/api && bun run deploy
```

For the web app, `bun run build` produces a static `dist/` you can serve from
Cloudflare Pages, Workers Assets, or any static host. Because the frontend only
calls relative `/api` paths, you can also serve both from a single Worker with an
assets binding, which sidesteps CORS entirely.

A minimal CI workflow runs the whole workspace through the typecheck gate:

```yaml
name: CI
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run check
```

## Takeaways

- **One schema, two consumers.** Put Zod in a shared package and infer types from
  it; the client and worker then share a contract that cannot drift.
- **Separate the two kinds of state.** TanStack Query for anything server-owned,
  Zustand for anything browser-only. Mixing them is where most apps get painful.
- **Bun workspaces keep it boring.** No build step for the shared package during
  dev, one lockfile, one command to run everything.
- **Cloudflare as the edge.** Hono runs unchanged on Workers, and static assets
  land on the same platform, so you can deploy the whole stack in one place.

The stack is large, but each piece has one job. Wire them in this order —
schemas, API, client shell, styling, deploy — and the seams stay clean.
