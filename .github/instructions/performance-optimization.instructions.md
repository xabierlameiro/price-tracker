---
applyTo: "**/*.tsx, **/*.ts, **/*.jsx, **/*.js, **/*.css"
description: "Performance optimization guidelines for this Next.js 16 / React 19 / TypeScript stack. Covers rendering, caching, bundle size, and API patterns."
---

# Performance Optimization — Next.js 16 / React 19

Measure first; optimize second. Profile with Lighthouse, Chrome DevTools Performance tab, and Next.js build output before making changes.

---

## Rendering

- Default to **Server Components** — zero client-side JS overhead.
- Add `"use client"` only when the component needs interactivity (hooks, events, browser APIs). Keep client boundaries as deep and narrow as possible.
- Wrap async Server Components with `<Suspense>` to enable streaming and avoid waterfall blocking.
- Use `loading.tsx` for route-level loading skeletons; it activates automatically without manual state.
- Use `React.memo` and `useCallback`/`useMemo` sparingly — measure before adding; they have overhead.

## Caching (Next.js 16 Cache Components)

- Prefer `'use cache'` directive over `unstable_cache` for new code — see `nextjs.instructions.md §7`.
- Tag cached functions with `cacheTag(...)` so they can be invalidated precisely.
- Set lifetimes with `cacheLife(...)` using the appropriate preset (`minutes`, `hours`, `days`, `max`).
- Use `revalidateTag(tag, 'max')` (stale-while-revalidate) for background revalidation.
- Use `updateTag(tag)` inside Server Actions when you need immediate consistency after a mutation.
- Avoid `cache: 'no-store'` unless data genuinely must be fresh on every request — it disables all caching.

## Images and Assets

- Always use `<Image>` from `next/image` — auto-optimizes size, format (WebP/AVIF), and lazy loading.
- Always specify `width` and `height` (or `fill` + a positioned parent) to prevent layout shift (CLS).
- Serve fonts via `next/font` — eliminates FOUT and reduces layout shift.
- Inline small SVG icons as React components; avoid `<img>` for icons.

## JavaScript Bundle

- Keep client components small — the more logic lives on the server, the smaller the client bundle.
- Use `dynamic()` from `next/dynamic` for heavy client components that aren't needed on first render.
- Never import a large library just for one utility function — use tree-shakeable alternatives or write the 10-line version yourself.
- Audit bundle size with `pnpm build` and inspect `.next/analyze/` (add `@next/bundle-analyzer` when needed).

## Data Fetching

- Fetch in Server Components directly — never fetch from a Client Component what can be fetched on the server.
- Do NOT call your own Route Handlers from Server Components (`fetch('/api/...')`); call the underlying function directly.
- Parallel-fetch independent data with `Promise.all()` to reduce waterfall latency.
- Paginate all list queries — never return unbounded result sets from Route Handlers.

## API Route Handlers

- Keep handlers thin: validate input with Zod, call a service function, return a typed response.
- Set appropriate `cache` headers for GET handlers that return stable data.
- Use `NextResponse.json()` with explicit HTTP status codes.

## Code Review Checklist

- [ ] New components default to Server Component (no unnecessary `"use client"`)
- [ ] Images use `<Image>` with explicit dimensions
- [ ] Heavy components use `dynamic()` for lazy loading
- [ ] Data fetched server-side where possible; no `useEffect` data fetching
- [ ] Large lists are paginated
- [ ] Cached functions/routes have appropriate tags and lifetimes
- [ ] No entire library imported for a single util

---

<!-- End of Performance Optimization Instructions -->

## Learnings
