---
name: "Create Page"
agent: "agent"
description: "Scaffold a new Next.js page with layout, loading, and error files"
tools:
  [
    vscode,
    execute,
    read,
    agent,
    edit,
    search,
    web,
    browser,
    "io.github.upstash/context7/*",
    "shadcn/*",
    "playwright/*",
    "next-devtools/*",
    "github/*",
    vscode.mermaid-chat-features/renderMermaidDiagram,
    todo,
  ]
---

Create a new Next.js App Router page following the project conventions.

## Rule precedence

- Use `.github/copilot-instructions.md` as the canonical source for cross-cutting repository conventions.
- Use `.github/instructions/INDEX.md` to load directory-specific instructions before creating files.
- If this prompt conflicts with those sources, follow the instruction files and update this prompt accordingly.

## Required inputs

Ask for these if not provided:

- **Route path** (e.g. `app/(dashboard)/settings/`, `app/(marketing)/about/`)
- **Page title and purpose**
- **Does it need authentication?** (should it be protected by `proxy.ts`)
- **Is it a dynamic route?** (e.g. `[id]`, `[slug]`)
- **Data requirements**: does the page fetch data? From where?

## Files to create

For every page, create all applicable files in the route folder:

1. **`page.tsx`** — the main Server Component page
2. **`loading.tsx`** — skeleton/spinner for Suspense streaming
3. **`error.tsx`** — error boundary (`"use client"` required by Next.js)
4. **`not-found.tsx`** — 404 for this route (if dynamic route)

## Rules

1. **`page.tsx`**: Server Component by default. Use `async` for data fetching. Export a `generateMetadata` function for SEO.
2. **Data fetching**: use `fetch` with Next.js cache options (`cache: 'force-cache'` or `next: { revalidate: N }`). Never fetch in Client Components.
3. **TypeScript**: type all `params` and `searchParams` as `Promise<{...}>` (Next.js 16 async params).
4. **Metadata**: define route metadata using either `export const metadata` or `export async function generateMetadata()` based on data needs.
5. **Accessibility**: one `<h1>` per page, inside `<main>`. Use landmark elements.
6. **File names**: all kebab-case. Route segments match the URL.

## Example output shape

```tsx
// app/(dashboard)/settings/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  return (
    <main>
      <h1>Settings</h1>
      {/* ... */}
    </main>
  );
}
```

```tsx
// app/(dashboard)/settings/loading.tsx
export default function SettingsLoading() {
  return (
    <div
      className="animate-pulse"
      aria-busy="true"
      aria-label="Loading settings"
    />
  );
}
```

```tsx
// app/(dashboard)/settings/error.tsx
"use client";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
```
