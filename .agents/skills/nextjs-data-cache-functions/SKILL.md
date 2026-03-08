---
name: nextjs-data-cache-functions
description: >
  Next.js 16 App Router data and cache functions reference. Use this skill when
  working with cookies, headers, revalidatePath, revalidateTag, unstable_cache,
  cacheTag, cacheLife, updateTag, after, or connection. Covers reading/writing
  cookies and headers, cache invalidation strategies, ISR revalidation,
  post-response callbacks for logging, and dynamic rendering opt-in. Trigger on
  any question about caching, cache invalidation, cookies, headers, ISR, or
  background tasks in Next.js 16.
---

# Next.js 16 — Data & Cache Functions

> **Scope**: App Router only. All functions import from `next/headers`, `next/cache`, or `next/server`.

---

## `cookies()`

Read and write HTTP cookies in Server Components, Route Handlers, and Server Actions.

```ts
import { cookies } from 'next/headers'
```

### Signature

```ts
function cookies(): Promise<ReadonlyRequestCookies>   // Server Components (read-only)
function cookies(): Promise<RequestCookies>            // Route Handlers & Actions (read/write)
```

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `(name: string) => { name: string; value: string } \| undefined` | Get a single cookie |
| `getAll` | `(name?: string) => { name: string; value: string }[]` | Get all cookies |
| `has` | `(name: string) => boolean` | Check if cookie exists |
| `set` | `(name: string, value: string, options?: CookieOptions) => void` | Set a cookie |
| `delete` | `(name: string \| string[]) => void` | Delete a cookie |

### `CookieOptions`

```ts
type CookieOptions = {
  name?: string
  value?: string
  domain?: string
  path?: string           // default: '/'
  expires?: Date
  maxAge?: number         // seconds
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none' | boolean
  priority?: 'low' | 'medium' | 'high'
  partitioned?: boolean
}
```

### Examples

```ts
// Server Component (read-only)
export default async function Page() {
  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value ?? 'light'
  return <ThemedLayout theme={theme} />
}

// Server Action (read + write)
'use server'
export async function setTheme(theme: string) {
  const cookieStore = await cookies()
  cookieStore.set('theme', theme, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
}
```

---

## `headers()`

Read incoming HTTP request headers in Server Components, Route Handlers, and Middleware.

```ts
import { headers } from 'next/headers'
```

### Signature

```ts
function headers(): Promise<ReadonlyHeaders>
```

### Methods (extends Web `Headers`)

| Method | Signature | Description |
|--------|-----------|-------------|
| `get` | `(name: string) => string \| null` | Get first value for header |
| `getAll` | `(name: string) => string[]` | All values for header name |
| `has` | `(name: string) => boolean` | Check if header exists |
| `entries` | `() => IterableIterator<[string, string]>` | All name + value pairs |
| `keys` | `() => IterableIterator<string>` | All header names |
| `values` | `() => IterableIterator<string>` | All header values |
| `forEach` | `(cb: (value, name) => void) => void` | Iterate all headers |

### Examples

```ts
export default async function Page() {
  const headerStore = await headers()
  const userAgent = headerStore.get('user-agent')
  const ip = headerStore.get('x-forwarded-for')
  return <div>UA: {userAgent}</div>
}

// Forwarding headers to downstream fetch
export default async function Page() {
  const requestHeaders = await headers()
  const data = await fetch('https://api.example.com/data', {
    headers: { authorization: requestHeaders.get('authorization') ?? '' },
  })
  return <Data data={await data.json()} />
}
```

> `headers()` is read-only. Use `NextResponse` in middleware to set response headers.

---

## `revalidatePath(path, type?)`

Purges the cached content for a specific URL path. Available in Route Handlers and Server Actions.

```ts
import { revalidatePath } from 'next/cache'
```

### Signature

```ts
function revalidatePath(path: string, type?: 'page' | 'layout'): void
```

### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `path` | `string` | — | ✅ URL path (e.g., `'/products'`, `'/products/[id]'`) |
| `type` | `'page' \| 'layout'` | `'page'` | `'layout'` invalidates all pages using that layout |

### Examples

```ts
'use server'
import { revalidatePath } from 'next/cache'

export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({ where: { id }, data })
  revalidatePath(`/products/${id}`)   // invalidate specific product page
  revalidatePath('/products')         // invalidate product listing
}

// Invalidate all pages using /app/dashboard/layout.tsx
revalidatePath('/dashboard', 'layout')

// Invalidate ALL pages
revalidatePath('/', 'layout')
```

---

## `revalidateTag(tag, profile?)`

Purges all cached entries associated with a tag. Works with `fetch` cache tags and `use cache` `cacheTag()`. Accepts an optional `profile` second parameter introduced in Next.js 16.

```ts
import { revalidateTag } from 'next/cache'
```

### Signature

```ts
function revalidateTag(tag: string, profile?: 'max'): void
```

> **`profile` parameter (Next.js 16):** When called as `revalidateTag(tag, 'max')`, the server refetches the data in the background while immediately serving the existing cached value (stale-while-revalidate). Without `'max'`, the legacy behavior triggers immediate cache expiry — this single-arg behavior is **deprecated** in Next.js 16. Prefer passing `'max'` for graceful invalidation.

```ts
// Tag a fetch call
const data = await fetch('/api/products', { next: { tags: ['products'] } })

// Tag inside use cache
export async function getProducts() {
  'use cache'
  cacheTag('products')
  return db.product.findMany()
}

// Invalidate from a Server Action (preferred: use 'max' for stale-while-revalidate)
'use server'
export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } })
  revalidateTag('products', 'max')    // background refetch, users see old data until done
  revalidateTag(`product-${id}`, 'max')
}
```
```

---

## `unstable_cache(fn, keyParts, options)` ⚠️ Legacy

Caches an async function's return value. Prefer `'use cache'` directive for new code.

```ts
import { unstable_cache } from 'next/cache'
```

### Signature

```ts
function unstable_cache<T>(
  fn: (...args: any[]) => Promise<T>,
  keyParts?: string[],
  options?: {
    revalidate?: number | false
    tags?: string[]
  }
): (...args: any[]) => Promise<T>
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `fn` | `(...args) => Promise<T>` | ✅ Async function to cache |
| `keyParts` | `string[]` | Additional cache key segments |
| `options.revalidate` | `number \| false` | TTL in seconds; `false` = never revalidate |
| `options.tags` | `string[]` | Tags for `revalidateTag()` invalidation |

```ts
import { unstable_cache } from 'next/cache'

const getUser = unstable_cache(
  async (id: string) => db.user.findUnique({ where: { id } }),
  ['user'],
  { revalidate: 60, tags: ['users'] }
)

// Usage
const user = await getUser(userId)
```

---

## `cacheTag(...tags)`

Assigns invalidation tags to the current `'use cache'` scope. Must be called inside a `'use cache'` function.

```ts
import { cacheTag } from 'next/cache'
```

### Signature

```ts
function cacheTag(...tags: string[]): void
```

```ts
export async function getPost(slug: string) {
  'use cache'
  cacheTag(`post-${slug}`, 'posts', 'content')
  return db.post.findUnique({ where: { slug } })
}
```

---

## `cacheLife(profile)`

Sets the lifetime of the current `'use cache'` scope. Must be called inside a `'use cache'` function.

```ts
import { cacheLife } from 'next/cache'
```

### Signature

```ts
function cacheLife(profile: CacheLifeProfile | CustomProfile): void

type CacheLifeProfile = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'
type CustomProfile = { stale?: number; revalidate?: number; expire?: number }
```

```ts
export async function getConfig() {
  'use cache'
  cacheLife('days')
  // or custom:
  cacheLife({ stale: 60, revalidate: 300, expire: 86400 })
  return fetch('/api/config').then(r => r.json())
}
```

---

## `updateTag(tag, value?)`

Immediately expires a cache tag from within a Server Action (read-your-own-writes pattern).

```ts
import { updateTag } from 'next/cache'
```

### Signature

```ts
function updateTag(tag: string, value?: string): void
```

**Difference from `revalidateTag`:**

| | `revalidateTag` | `updateTag` |
|--|----------------|-------------|
| Where | Server Actions + Route Handlers | Server Actions only |
| Effect | Marks stale, revalidates on next request | **Immediately expires** — next read fetches fresh data |
| Use case | Background ISR invalidation | Mutations where user must see updated data immediately |

```ts
'use server'
import { updateTag } from 'next/cache'

export async function submitOrder(formData: FormData) {
  await db.order.create({ data: parseOrder(formData) })
  updateTag('cart')        // immediate expiry — user sees empty cart now
  updateTag('orders')
}
```

---

## `after(callback)`

Schedules a callback to run **after** the response has been sent to the client. Use for logging, analytics, or side effects that should not block the response.

```ts
import { after } from 'next/server'
```

### Signature

```ts
function after(callback: () => void | Promise<void>): void
```

```ts
import { after } from 'next/server'

export default async function Page() {
  after(async () => {
    // Executes after response is sent
    await analytics.trackPageView('/dashboard')
  })

  return <Dashboard />
}

// In a Server Action
'use server'
export async function createPost(formData: FormData) {
  const post = await db.post.create({ data: parseForm(formData) })
  after(() => {
    sendSlackNotification(`New post created: ${post.title}`)
  })
  return post
}
```

> `after()` is available in **Node.js runtime only** (not Edge).

---

## `connection()`

Explicitly opts a Server Component into **dynamic rendering** (prevents static prerendering). Use when you need request-time data that doesn't come from `cookies()` or `headers()`.

```ts
import { connection } from 'next/server'
```

### Signature

```ts
function connection(): Promise<void>
```

```ts
import { connection } from 'next/server'

export default async function Page() {
  await connection()       // ← opts out of static rendering
  const randomId = Math.random()  // safe to use after connection()
  return <div>Random: {randomId}</div>
}
```

---

## Quick Reference

| Function | Import | Use Case |
|----------|--------|----------|
| `cookies()` | `next/headers` | Read/write HTTP cookies |
| `headers()` | `next/headers` | Read incoming request headers |
| `revalidatePath(path)` | `next/cache` | Invalidate cache for a URL |
| `revalidateTag(tag, profile?)` | `next/cache` | Invalidate cache by tag; `'max'` profile = stale-while-revalidate |
| `unstable_cache(fn)` | `next/cache` | ⚠️ Legacy function-level cache |
| `cacheTag(...tags)` | `next/cache` | Tag current `use cache` scope |
| `cacheLife(profile)` | `next/cache` | Set lifetime of `use cache` scope |
| `updateTag(tag)` | `next/cache` | Immediate expiry in Server Actions |
| `after(cb)` | `next/server` | Post-response side effects |
| `connection()` | `next/server` | Force dynamic rendering |
