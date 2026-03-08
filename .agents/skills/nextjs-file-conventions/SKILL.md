---
name: nextjs-file-conventions
description: >
  Next.js 16 App Router file conventions reference. Use this skill when creating
  or working with layout.tsx, page.tsx, loading.tsx, error.tsx, not-found.tsx,
  route.ts, template.tsx, default.tsx, proxy.ts, instrumentation.ts,
  opengraph-image, sitemap.ts, robots.ts, or manifest.ts. Covers all props,
  exports, TypeScript signatures, and sub-segment behavior. Trigger on any
  question about special files, routing, API routes, proxy, or metadata files.
  See references/file-conventions-api.md for exhaustive per-file API details.
---

# Next.js 16 — File Conventions

> **Scope**: App Router only. Files live inside the `app/` directory unless noted.

---

## File Conventions Overview

```
app/
├── layout.tsx              # Shared UI wrapper (persists across navigations)
├── page.tsx                # Route page UI
├── loading.tsx             # Suspense loading UI
├── error.tsx               # Error boundary UI ('use client' required)
├── not-found.tsx           # 404 UI
├── route.ts                # API endpoint (HTTP handlers)
├── template.tsx            # Re-mounting layout alternative
├── default.tsx             # Parallel route slot fallback
├── proxy.ts                # Node.js proxy (runs before every request) — renamed from middleware.ts in Next.js 16
├── instrumentation.ts      # Telemetry hooks (at root, not inside app/)
├── opengraph-image.tsx     # OG image generation
├── twitter-image.tsx       # Twitter card image generation
├── icon.tsx                # App icon
├── sitemap.ts              # XML sitemap
├── robots.ts               # robots.txt
└── manifest.ts             # Web app manifest (PWA)
```

> For full per-file API details, see `references/file-conventions-api.md`.

---

## `layout.tsx`

Wraps a route segment and its children. **Does not re-mount on navigation**.

### Required Exports

```ts
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}
```

### Root Layout Requirements

The root `app/layout.tsx` **must** include `<html>` and `<body>` tags.

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Props

| Prop       | Type                         | Description                                       |
| ---------- | ---------------------------- | ------------------------------------------------- |
| `children` | `React.ReactNode`            | ✅ Required — nested segments                     |
| `params`   | `Promise<{ [key]: string }>` | Dynamic segment params (only if route is dynamic) |

### Optional Exports

| Export             | Type                                   | Description      |
| ------------------ | -------------------------------------- | ---------------- |
| `metadata`         | `Metadata`                             | Static metadata  |
| `generateMetadata` | `(props, parent) => Promise<Metadata>` | Dynamic metadata |
| `viewport`         | `Viewport`                             | Viewport config  |
| `generateViewport` | `(props) => Promise<Viewport>`         | Dynamic viewport |

---

## `page.tsx`

Defines the unique UI for a route. Required to make a route publicly accessible.

### Props

| Prop           | Type                                                  | Description          |
| -------------- | ----------------------------------------------------- | -------------------- |
| `params`       | `Promise<{ [key]: string \| string[] }>`              | Dynamic route params |
| `searchParams` | `Promise<{ [key]: string \| string[] \| undefined }>` | URL query params     |

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab = "content" } = await searchParams;
  const post = await getPost(slug);
  return <Article post={post} activeTab={tab} />;
}
```

### Optional Exports

Same as `layout.tsx`: `metadata`, `generateMetadata`, `viewport`, `generateViewport`, plus:

| Export                 | Type                                                     | Description                      |
| ---------------------- | -------------------------------------------------------- | -------------------------------- |
| `generateStaticParams` | `() => Promise<Params[]>`                                | Static generation at build time  |
| `dynamic`              | `'auto' \| 'force-dynamic' \| 'error' \| 'force-static'` | Rendering mode override          |
| `revalidate`           | `number \| false`                                        | Revalidation interval in seconds |
| `fetchCache`           | `'auto' \| 'default-cache' \| ...`                       | Fetch caching mode               |
| `runtime`              | `'nodejs' \| 'edge'`                                     | Runtime environment              |
| `preferredRegion`      | `string \| string[]`                                     | Deployment region(s)             |
| `maxDuration`          | `number`                                                 | Max execution time (seconds)     |

---

## `loading.tsx`

Provides instant Suspense loading state for a segment. Automatically wraps `page.tsx` in a `<Suspense>` boundary.

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />;
}
```

No props. No required exports beyond the default export.

**HTTP behavior**: streaming responses return **200** status while loading.

---

## `error.tsx`

Client Component error boundary for a route segment. Catches errors thrown in Server Components, data fetches, and Client Components in the same segment.

```tsx
"use client"; // ← Required

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Props

| Prop    | Type                          | Description                                      |
| ------- | ----------------------------- | ------------------------------------------------ |
| `error` | `Error & { digest?: string }` | The thrown error; `digest` is a server-side hash |
| `reset` | `() => void`                  | Retry — re-renders the segment's children        |

> `global-error.tsx` at `app/` root catches errors in the root `layout.tsx`. It must render its own `<html>` and `<body>`.

---

## `not-found.tsx`

Rendered when `notFound()` is called or a route URL has no match.

```tsx
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>404 — Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link href="/">Return home</Link>
    </main>
  );
}

// Optional metadata
export const metadata = { title: "Not Found" };
```

---

## `route.ts`

API endpoint. Exports named HTTP method handlers; no default export.

```ts
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.user.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Supported Method Handlers

`GET` · `POST` · `PUT` · `PATCH` · `DELETE` · `HEAD` · `OPTIONS`

### Handler Signature

```ts
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ [key]: string }> },
): Promise<Response>;
```

### Segment Config Exports

| Export            | Type                                                     | Description               |
| ----------------- | -------------------------------------------------------- | ------------------------- |
| `dynamic`         | `'auto' \| 'force-dynamic' \| 'error' \| 'force-static'` | Caching behavior          |
| `revalidate`      | `number \| false`                                        | ISR revalidation interval |
| `runtime`         | `'nodejs' \| 'edge'`                                     | Runtime                   |
| `preferredRegion` | `string \| string[]`                                     | Deployment region         |

---

## `template.tsx`

Like `layout.tsx` but **re-mounts on every navigation** between children. Use for enter/exit animations or per-page state resets.

```tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
```

---

## `default.tsx`

Fallback UI for a parallel route slot when the slot has no active match after a full-page reload.

```tsx
// app/@modal/default.tsx
export default function ModalDefault() {
  return null; // or notFound()
}
```

---

## `proxy.ts`

> **Next.js 16**: `middleware.ts` was renamed to `proxy.ts`. The function is also renamed from `middleware` to `proxy`. Runtime changed from Edge to **Node.js**.

Runs before every request. Lives at the **project root** (next to `app/`).

```ts
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("session")?.value;
  if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

// Alternatively:
// export default function proxy(request: NextRequest) { ... }

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
```

### `matcher` Rules

```ts
export const config = {
  matcher: [
    // Match specific paths
    "/about",
    "/dashboard/:path*",
    // Exclude static files and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Conditional logic with has/missing
    {
      source: "/api/:path*",
      has: [{ type: "header", key: "x-my-header" }],
    },
  ],
};
```

> `proxy.ts` runs in the **Node.js runtime**. Full Node.js APIs available.
>
> ⚠️ **Do NOT export a `runtime` config variable from `proxy.ts`** — doing so throws an error. The runtime is always Node.js and cannot be overridden.

---

## `instrumentation.ts`

Server-side telemetry hooks. Lives at the **project root** or `src/`.

```ts
// instrumentation.ts
import { registerOTel } from "@vercel/otel";

export function register() {
  registerOTel({ serviceName: "my-app" });
}

// Capture errors for observability
export function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string;
    method: string;
    headers: { [key: string]: string | string[] };
  },
  context: {
    routerKind: "Pages Router" | "App Router";
    routeType: "render" | "route" | "action" | "proxy";
    routePath: string;
    renderSource?: string;
    renderType?: string;
  },
) {
  fetch("/api/errors", {
    method: "POST",
    body: JSON.stringify({
      message: error.message,
      digest: error.digest,
      path: request.path,
    }),
  });
}
```

### Exports

| Export           | Signature                                            | Description                            |
| ---------------- | ---------------------------------------------------- | -------------------------------------- |
| `register`       | `() => void \| Promise<void>`                        | Called once on server start            |
| `onRequestError` | `(error, request, context) => void \| Promise<void>` | Called on every unhandled server error |

---

## Metadata Files

For full details see `references/file-conventions-api.md`.

| File                              | Output                 | Description                          |
| --------------------------------- | ---------------------- | ------------------------------------ |
| `opengraph-image.tsx`             | Image                  | Dynamic OG image via `ImageResponse` |
| `opengraph-image.png/jpg/gif`     | Static image           | Static OG image                      |
| `twitter-image.tsx`               | Image                  | Dynamic Twitter card image           |
| `apple-icon.tsx / apple-icon.png` | Image                  | Apple touch icon                     |
| `icon.tsx / icon.png`             | Favicon                | App icon                             |
| `favicon.ico`                     | Favicon                | Root-level browser favicon           |
| `sitemap.ts`                      | `sitemap.xml`          | XML sitemap                          |
| `robots.ts`                       | `robots.txt`           | Crawler config                       |
| `manifest.ts`                     | `manifest.webmanifest` | PWA manifest                         |
