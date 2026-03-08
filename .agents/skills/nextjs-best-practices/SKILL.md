---
name: nextjs-best-practices
description: "Next.js App Router principles. Server Components, data fetching, routing patterns."
metadata:
  source: community
  date_added: "2026-02-27"
---

# Next.js Best Practices

> Principles for Next.js App Router development.

---

## 1. Server vs Client Components

### Decision Tree

```
Does it need...?
│
├── useState, useEffect, event handlers
│   └── Client Component ('use client')
│
├── Direct data fetching, no interactivity
│   └── Server Component (default)
│
└── Both?
    └── Split: Server parent + Client child
```

### By Default

| Type       | Use                                   |
| ---------- | ------------------------------------- |
| **Server** | Data fetching, layout, static content |
| **Client** | Forms, buttons, interactive UI        |

---

## 2. Data Fetching Patterns

### Fetch Strategy

> **Next.js 16 breaking change:** `fetch()` is **not cached by default** anymore.
> The default `auto` behavior fetches fresh on every request unless you explicitly opt in.

| Pattern                     | How                                        | Use                                                          |
| --------------------------- | ------------------------------------------ | ------------------------------------------------------------ |
| **`use cache`** (preferred) | `'use cache'` directive + `cacheLife`      | Caching in Next.js 16; works for components, functions, data |
| **Force-cache**             | `fetch(url, { cache: 'force-cache' })`     | Explicitly cache a single fetch call                         |
| **Revalidate**              | `fetch(url, { next: { revalidate: 60 } })` | ISR (time-based refresh)                                     |
| **No-store**                | `fetch(url, { cache: 'no-store' })`        | Always fetch fresh (dynamic)                                 |
| **No cache (default)**      | `fetch(url)`                               | Not cached — runs on every request                           |

### Data Flow

| Source     | Pattern                      |
| ---------- | ---------------------------- |
| Database   | Server Component fetch       |
| API        | fetch with caching           |
| User input | Client state + server action |

---

## 3. Routing Principles

### File Conventions

| File            | Purpose        |
| --------------- | -------------- |
| `page.tsx`      | Route UI       |
| `layout.tsx`    | Shared layout  |
| `loading.tsx`   | Loading state  |
| `error.tsx`     | Error boundary |
| `not-found.tsx` | 404 page       |

### Route Organization

| Pattern                 | Use                       |
| ----------------------- | ------------------------- |
| Route groups `(name)`   | Organize without URL      |
| Parallel routes `@slot` | Multiple same-level pages |
| Intercepting `(.)`      | Modal overlays            |

---

## 4. API Routes

### Route Handlers

| Method    | Use         |
| --------- | ----------- |
| GET       | Read data   |
| POST      | Create data |
| PUT/PATCH | Update data |
| DELETE    | Remove data |

### Best Practices

- Validate input with Zod
- Return proper status codes
- Handle errors gracefully
- Use **Node.js runtime** (default); prefer Edge runtime only for ultra-low latency needs where its feature restrictions are acceptable
- Do not call your own Route Handlers from Server Components — extract shared logic into `lib/` modules and call directly

---

## 5. Performance Principles

### Image Optimization

- Use next/image component
- Set priority for above-fold
- Provide blur placeholder
- Use responsive sizes

### Bundle Optimization

- Dynamic imports for heavy components
- Route-based code splitting (automatic)
- Analyze with bundle analyzer

---

## 6. Metadata

### Static vs Dynamic

| Type             | Use               |
| ---------------- | ----------------- |
| Static export    | Fixed metadata    |
| generateMetadata | Dynamic per-route |

### Essential Tags

- title (50-60 chars)
- description (150-160 chars)
- Open Graph images
- Canonical URL

---

## 7. Caching Strategy (Next.js 16)

### Recommended: `use cache` Directive (Cache Components)

Next.js 16 introduces Cache Components as the **primary caching mechanism**. Enable it in `next.config.ts`:

```typescript
const nextConfig: NextConfig = { cacheComponents: true };
```

Then use the `'use cache'` directive in components, Server Actions, or utility functions:

```typescript
import { cacheLife, cacheTag } from "next/cache";

async function getProducts() {
  "use cache";
  cacheLife("hours"); // built-in profile: seconds / minutes / hours / days / max
  cacheTag("products"); // tag for on-demand invalidation
  return db.query("SELECT * FROM products");
}
```

### Cache Layers

| Layer              | Control                                            |
| ------------------ | -------------------------------------------------- |
| Component/Function | `'use cache'` directive + `cacheLife` + `cacheTag` |
| Individual fetch   | `fetch(url, { cache: 'force-cache' })`             |
| Data tags          | `cacheTag` / `revalidateTag` / `updateTag`         |
| Full route         | route segment config                               |

### Revalidation

| Method                              | Where                          | Use                                     |
| ----------------------------------- | ------------------------------ | --------------------------------------- |
| `revalidateTag(tag, 'max')`         | Server Actions, Route Handlers | Stale-while-revalidate                  |
| `updateTag(tag)`                    | Server Actions **only**        | Immediate expiry (read-your-own-writes) |
| `revalidatePath(path)`              | Server Actions, Route Handlers | Invalidate a route's full cache         |
| `cacheLife('hours')`                | inside `'use cache'` scope     | Time-based TTL                          |
| `fetch(url, { cache: 'no-store' })` | Server Components              | Dynamic, never cached                   |

> **Legacy patterns still work** (`unstable_cache`, `fetch` with `next.revalidate`) but prefer `use cache` for new code.

---

## 8. Server Actions

### Use Cases

- Form submissions
- Data mutations
- Revalidation triggers

### Best Practices

- Mark with 'use server'
- Validate all inputs
- Return typed responses
- Handle errors

---

## 9. Anti-Patterns

| ❌ Don't                   | ✅ Do             |
| -------------------------- | ----------------- |
| 'use client' everywhere    | Server by default |
| Fetch in client components | Fetch in server   |
| Skip loading states        | Use loading.tsx   |
| Ignore error boundaries    | Use error.tsx     |
| Large client bundles       | Dynamic imports   |

---

## 10. Project Structure

```
app/
├── (marketing)/     # Route group
│   └── page.tsx
├── (dashboard)/
│   ├── layout.tsx   # Dashboard layout
│   └── page.tsx
├── api/
│   └── [resource]/
│       └── route.ts
└── components/
    └── ui/
```

---

> **Remember:** Server Components are the default for a reason. Start there, add client only when needed.

---

## When to Use

Invoke this skill when:

- Deciding whether a component should be a Server or Client Component
- Implementing data fetching in a Next.js App Router page or layout
- Adding caching (`'use cache'`, `cacheLife`, `cacheTag`) to a Server Component or function
- Writing Route Handlers (`route.ts`)
- Debugging unexpected re-renders or stale data
- Reviewing a PR that touches `app/` files

---

## BAD / GOOD Patterns

### Server vs Client split

```tsx
// BAD — adding "use client" to a whole page just to handle a button click
"use client";
export default function ProductPage() {
  const [count, setCount] = useState(0);
  const products = await db.getProducts(); // not allowed in client component anyway
  return <div>...</div>;
}

// GOOD — Server Component fetches data; thin Client Component handles interaction
// app/products/page.tsx (Server Component — no directive needed)
export default async function ProductPage() {
  const products = await db.getProducts();
  return <ProductList products={products} />;
}

// components/add-to-cart-button.tsx
("use client");
export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button onClick={() => handleAdd(productId, setLoading)}>
      Add to cart
    </button>
  );
}
```

### Caching

```tsx
// BAD — calls route handler from a server component (creates unnecessary HTTP round-trip)
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const res = await fetch("/api/stats"); // ❌ calls own API from server
  const stats = await res.json();
  return <Stats data={stats} />;
}

// GOOD — call shared lib function directly from Server Component
// app/dashboard/page.tsx
import { getStats } from "@/lib/stats";

export default async function DashboardPage() {
  const stats = await getStats(); // ✅ direct call, caching works correctly
  return <Stats data={stats} />;
}

// lib/stats.ts
export async function getStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("stats");
  return db.query("SELECT ...");
}
```

### Route Handler input validation

```ts
// BAD — no validation, trusting req.json() blindly
// app/api/users/route.ts
export async function POST(req: Request) {
  const body = await req.json();
  await db.createUser(body); // ❌ body is unknown shape
}

// GOOD — validate with Zod at the API boundary
import { userCreateSchema } from "@/lib/schemas/user.schema";

export async function POST(req: Request) {
  const raw = await req.json();
  const result = userCreateSchema.safeParse(raw);
  if (!result.success) {
    return Response.json({ error: result.error.flatten() }, { status: 400 });
  }
  await db.createUser(result.data); // ✅ fully typed and validated
}
```

---

## Pre-Submit Checklist

- [ ] New/changed components: is `'use client'` only where it's strictly needed?
- [ ] Data fetching: fetching in Server Components, not in Client Components when possible
- [ ] Caching: `'use cache'` + `cacheLife` + `cacheTag` for cacheable data
- [ ] Route Handler: input validated with Zod, correct HTTP status codes returned
- [ ] Images: using `next/image`, not `<img>`
- [ ] Large components: using `dynamic()` if only needed client-side
- [ ] Metadata: `generateMetadata` or static export defined for new routes
