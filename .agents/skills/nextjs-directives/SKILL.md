---
name: nextjs-directives
description: >
  Next.js 16 App Router directives reference. Use this skill when working with
  'use cache', 'use cache: remote', 'use cache: private', 'use client', or
  'use server'. Covers all caching levels (file/component/function), cacheLife
  profiles, cache keys, dynamic content inside cache, Server Actions, and
  client-boundary rules. Trigger on any question about caching directives,
  server/client boundaries, or when implementing Server Actions in Next.js 16.
---

# Next.js 16 — Directives

> **Scope**: App Router only. All directives below are for Next.js 16+.

---

## Overview

| Directive | Purpose | Context |
|-----------|---------|---------|
| `'use cache'` | Cache return value of a function/component | Server (async functions & components) |
| `'use cache: remote'` | Like `'use cache'` but delegated to a platform cache handler | Server |
| `'use cache: private'` | Caches sensitive/personalized data; not stored in shared cache | Server |
| `'use client'` | Marks a Client Component boundary | Client |
| `'use server'` | Marks a Server Action (callable from client) | Server |

---

## `'use cache'`

The `'use cache'` directive marks an async function or Server Component as cacheable. Requires `cacheComponents: true` (top-level, **not** under `experimental`) in `next.config.ts`.

### Activation

```ts
// next.config.ts
import type { NextConfig } from 'next'
const nextConfig: NextConfig = {
  cacheComponents: true,   // top-level — NOT under experimental
}
export default nextConfig
```

### Scope Levels

```ts
// 1. File level — every async export in the file is cached
'use cache'

export default async function Page() { /* ... */ }
export async function getStats() { /* ... */ }

// 2. Component level — only this component is cached
export async function MyWidget() {
  'use cache'
  return <div>{await fetchData()}</div>
}

// 3. Function level — only this function's return value is cached
export async function getUser(id: string) {
  'use cache'
  return db.user.findUnique({ where: { id } })
}
```

### Cache Keys

Arguments and closed-over values automatically form the cache key. Different inputs → separate cache entries.

```ts
// These two calls produce independent cache entries
await getUser('user-1')
await getUser('user-2')
```

### `cacheLife` — Cache Lifetime Profiles

```ts
import { cacheLife } from 'next/cache'

export async function getData() {
  'use cache'
  cacheLife('seconds')       // stale: 30s, revalidate: 1s, expire: 1min
  cacheLife('minutes')        // stale: 5min, revalidate: 1min, expire: 1h
  cacheLife('hours')          // stale: 5min, revalidate: 1h, expire: 1d
  cacheLife('days')           // stale: 5min, revalidate: 1d, expire: 1w
  cacheLife('weeks')          // stale: 5min, revalidate: 7d, expire: 30d
  cacheLife('max')            // stale: 5min, revalidate: 30d, expire: 1y
  // Custom profile
  cacheLife({ stale: 30, revalidate: 60, expire: 3600 })
}
```

| Profile | `stale` (client) | `revalidate` (server) | `expire` |
|---------|------------------|-----------------------|----------|
| `'default'` | 5min | 15min | 1 year |
| `'seconds'` | 30s | 1s | 1min |
| `'minutes'` | 5min | 1min | 1h |
| `'hours'` | 5min | 1h | 1d |
| `'days'` | 5min | 1d | 1w |
| `'weeks'` | 5min | 7d | 30d |
| `'max'` | 5min | 30d | 1y |

> The `'default'` profile is used implicitly when no `cacheLife()` call is made inside a `'use cache'` function.

> Minimum stale time of **30 seconds** is enforced for client-side prefetching — values below 30s are rounded up.

Custom profiles can be defined in `next.config.ts`:

```ts
// next.config.ts — cacheLife is a top-level key alongside cacheComponents
const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    editorial: { stale: 600, revalidate: 3600, expire: 86400 },
  },
}
```

### `cacheTag` — Cache Invalidation Tags

```ts
import { cacheTag } from 'next/cache'

export async function getProduct(id: string) {
  'use cache'
  cacheTag(`product-${id}`, 'products')
  return db.product.findUnique({ where: { id } })
}
```

Invalidate with `revalidateTag('products', 'max')` from Server Actions or Route Handlers. Use `updateTag('products')` inside Server Actions for **immediate** expiry (read-your-own-writes).

> **Limits**: max tag string length is **256 characters**, max tags per cached entry is **128**.

### Dynamic Content Inside Cached Scopes

Cookies, headers, and `searchParams` must be read **outside** the cached scope and passed as arguments:

```ts
// ✅ Correct
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value
  return <ThemedWidget theme={theme} />
}

async function ThemedWidget({ theme }: { theme?: string }) {
  'use cache'
  cacheTag(`theme-${theme}`)
  return <div data-theme={theme}>{await fetchThemeData(theme)}</div>
}
```

---

## `'use cache: remote'`

Like `'use cache'` but stores cached values in an external/remote cache handler instead of in-memory. Use when distributed caching is needed across multiple server instances.

```ts
export async function getGlobalConfig() {
  'use cache: remote'
  cacheLife('days')
  return fetch('/api/config').then(r => r.json())
}
```

**Trade-offs:**
- Survives server restarts and scales across instances
- Incurs network round-trip on cache check
- Typically incurs platform fees

**Nesting rules:**
| Combination | Allowed? |
|-------------|----------|
| `remote` inside `remote` | ✅ |
| `remote` inside `'use cache'` | ✅ |
| `remote` inside `'use cache: private'` | ❌ Error |
| `'use cache: private'` inside `remote` | ❌ Error |

---

## `'use cache: private'`

> ⚠️ **Experimental** — for compliance or personalized data requirements.

Caches data for the **browser** only — results are **never stored on the server**. Cached values live only in the browser's memory and do not persist across page reloads. Unlike `'use cache'`, this directive **allows** reading `cookies()`, `headers()`, and `searchParams` directly inside the cached scope.

```ts
export async function getUserProfile() {
  'use cache: private'
  cacheLife('minutes')  // stale must be ≥ 30 seconds
  const cookieStore = await cookies()   // ✅ allowed inside 'use cache: private'
  const userId = cookieStore.get('user-id')?.value
  return db.userProfile.findUnique({ where: { id: userId } })
}
```

**APIs allowed inside `'use cache: private'` (unlike regular `'use cache'`):**

| API | `'use cache'` | `'use cache: private'` |
|-----|:-------------:|:----------------------:|
| `cookies()` | ❌ | ✅ |
| `headers()` | ❌ | ✅ |
| `searchParams` | ❌ | ✅ |
| `connection()` | ❌ | ❌ |

> **Not available in Route Handlers.** Only works in Server Components.

Use when:
- Data contains PII and must not leave the browser
- You need to read `cookies()` or `headers()` inside a cached scope
- Compliance rules (GDPR, HIPAA) forbid server-side caching of personal data

---

## `'use client'`

Marks a **Client Component** boundary. Everything in the file (and its imports) is included in the client bundle.

### Rules

```ts
'use client'

import { useState } from 'react'

// ✅ Props must be serializable (no functions from Server -> Client)
export function Counter({ initialCount }: { initialCount: number }) {
  const [count, setCount] = useState(initialCount)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

| Rule | Detail |
|------|--------|
| Only add where strictly necessary | Entire subtree becomes client bundle |
| Cannot import Server Components | Can accept them as `children` prop |
| Props must be serializable | No plain JS functions, class instances; **Server Actions are allowed** as props |
| Hooks & browser APIs work here | `useState`, `useEffect`, `window`, `document` |

### When to Use `'use client'`

- Event handlers (`onClick`, `onChange`, `onSubmit`)
- React hooks (`useState`, `useEffect`, `useContext`, `useRef`)
- Browser-only APIs (`localStorage`, `window`, `document`)
- Third-party libraries that rely on client state

---

## `'use server'`

Marks a **Server Action** — an async function that executes on the server and can be called from Client Components or HTML forms.

### Placement

```ts
// Option 1: In a dedicated actions file (preferred)
// app/actions/user.ts
'use server'

export async function updateUser(formData: FormData) {
  const name = formData.get('name') as string
  // ✅ Validate at the boundary
  if (!name || name.length < 2) throw new Error('Invalid name')
  await db.user.update({ where: { id: getCurrentUserId() }, data: { name } })
  revalidatePath('/profile')
}

// Option 2: Inline in a Server Component
export default async function Page() {
  async function handleSubmit(formData: FormData) {
    'use server'
    await updateUser(formData)
  }
  return <form action={handleSubmit}>...</form>
}
```

### Security Rules

| Rule | Why |
|------|-----|
| Always validate inputs with Zod | Arguments come from untrusted clients |
| Check authentication & authorization | Server Actions are public HTTP endpoints |
| Never return sensitive data to client | Return only what the UI needs |
| Use `revalidatePath` / `revalidateTag` after mutations | Keeps UI in sync |

```ts
'use server'

import { z } from 'zod'
import { auth } from '@/auth'

const UpdateSchema = z.object({ name: z.string().min(2).max(100) })

export async function updateUser(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const data = UpdateSchema.parse({ name: formData.get('name') })
  await db.user.update({ where: { id: session.user.id }, data })
  revalidatePath('/profile')
}
```

### `bind()` — Pre-filling Arguments

Use `Function.prototype.bind` to pass additional arguments alongside form data:

```tsx
'use client'
import { updateUser } from './actions'

export function UserProfile({ userId }: { userId: string }) {
  const updateUserWithId = updateUser.bind(null, userId)
  return (
    <form action={updateUserWithId}>
      <input type="text" name="name" />
      <button type="submit">Update</button>
    </form>
  )
}
```

### `useActionState` — Managing Action State

```tsx
'use client'
import { useActionState } from 'react'
import { createPost } from './actions'

export function CreatePostForm() {
  const [state, formAction, pending] = useActionState(createPost, { errors: {} })
  return (
    <form action={formAction}>
      <input name="title" aria-invalid={!!state.errors.title} />
      {state.errors.title && <span>{state.errors.title}</span>}
      <button type="submit" disabled={pending}>Create</button>
    </form>
  )
}
```

### Progressive Enhancement

Server Actions work with HTML forms without JavaScript:

```tsx
<form action={updateUser}>
  <input name="name" type="text" required />
  <button type="submit">Save</button>
</form>
```

---

## Common Pitfalls

| Issue | Fix |
|-------|-----|
| Reading `cookies()` / `headers()` inside `'use cache'` | Read outside the cached scope; pass as argument |
| Using `'use cache'` without enabling `cacheComponents` | Add `cacheComponents: true` (top-level) to `next.config.ts` |
| Returning non-serializable values from cached functions | Only return JSON-serializable values |
| Missing auth check in `'use server'` action | Always check session before mutation |
| Placing `'use client'` on a file that imports server-only code | Separate concerns; keep server imports in server files |
