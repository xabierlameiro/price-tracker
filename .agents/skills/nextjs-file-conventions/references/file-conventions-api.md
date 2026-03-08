# Next.js 16 — File Conventions: Full API Reference

> Extends `nextjs-file-conventions` SKILL.md with full per-file API details.

---

## `layout.tsx` — Full API

### Props

```ts
// Static params layout
export default function Layout({ children }: { children: React.ReactNode }) {}

// Dynamic segment layout
export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
}
```

### Metadata Exports

```ts
import type { Metadata } from 'next'

// Static metadata
export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js',
}

// Dynamic metadata (async)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await fetch(`/api/${slug}`)
  return { title: data.title }
}
```

### Segment Config Exports

```ts
export const dynamic = 'auto'           // 'auto' | 'force-dynamic' | 'error' | 'force-static'
export const dynamicParams = true       // boolean — allow dynamic params not in generateStaticParams
export const revalidate = false         // false | 0 | number (seconds)
export const fetchCache = 'auto'        // 'auto' | 'default-cache' | 'only-cache' | 'force-cache' | 'force-no-store' | 'default-no-store' | 'only-no-store'
export const runtime = 'nodejs'         // 'nodejs' | 'edge'
export const preferredRegion = 'auto'   // 'auto' | 'global' | 'home' | string | string[]
export const maxDuration = 5            // number (seconds)
```

---

## `page.tsx` — Full API

### Props

```ts
// Dynamic route: app/blog/[slug]/page.tsx
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {}

// Catch-all route: app/docs/[...path]/page.tsx
// params.path is string[]

// Optional catch-all: app/docs/[[...path]]/page.tsx
// params.path is string[] | undefined
```

### `generateStaticParams`

```ts
export async function generateStaticParams() {
  const posts = await db.post.findMany({ select: { slug: true } })
  return posts.map(post => ({ slug: post.slug }))
}
// Type: () => Promise<Array<{ [paramKey: string]: string | string[] }>>
```

> When `generateStaticParams` is defined, `dynamicParams` controls whether ungenerated params are allowed (default: `true`).

---

## `route.ts` — Full API

### Handler Signature

```ts
import { NextRequest, NextResponse } from 'next/server'

type Handler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string | string[]>> }
) => Response | NextResponse | Promise<Response | NextResponse>
```

### Dynamic Route Handler

```ts
// app/api/products/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const updated = await db.product.update({ where: { id }, data: body })
  revalidateTag(`product-${id}`)
  return NextResponse.json(updated)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await db.product.delete({ where: { id } })
  return new Response(null, { status: 204 })
}
```

### Reading URL and Request Data

```ts
export async function GET(request: NextRequest) {
  // URL search params
  const { searchParams } = request.nextUrl
  const page = searchParams.get('page') ?? '1'

  // Headers
  const auth = request.headers.get('authorization')

  // Cookies
  const session = request.cookies.get('session')?.value

  return NextResponse.json({ page, auth, session })
}
```

---

## `proxy.ts` — Full API

> **Next.js 16**: Renamed from `middleware.ts`. Export function `proxy` (was `middleware`). Runtime: **Node.js** (was Edge).

### `NextRequest` Extensions

```ts
request.nextUrl          // NextURL — mutable URL object with search, pathname, basePath
request.nextUrl.pathname // current pathname
request.cookies          // RequestCookies — get/set/delete
request.geo              // { city?, country?, region?, latitude?, longitude? } | undefined
request.ip               // string | undefined
```

### `NextResponse` Factory Methods

```ts
// Pass through (default)
NextResponse.next()
NextResponse.next({ headers: { 'x-custom': 'value' } })

// Redirect
NextResponse.redirect(new URL('/login', request.url))
NextResponse.redirect(new URL('/login', request.url), { status: 301 })

// Rewrite (change what's served, not the URL bar)
NextResponse.rewrite(new URL('/internal/page', request.url))

// JSON (useful for edge API)
NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

### Matcher Advanced Patterns

```ts
export const config = {
  matcher: [
    // Exclude specific paths (negative lookahead)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',

    // Only paths with specific header
    {
      source: '/api/:path*',
      has: [{ type: 'header', key: 'x-api-key' }],
    },

    // Paths WITHOUT a header
    {
      source: '/public/:path*',
      missing: [{ type: 'cookie', key: 'session' }],
    },
  ],
}
```

---

## `instrumentation.ts` — Full API

### `register()` Hook

Called **once** on cold start (not on every request). Runs in both Node.js and Edge runtimes.

```ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Node.js-only initialization (e.g., database pool)
    await import('./lib/db-pool').then(m => m.init())
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge-only initialization
    await import('./lib/edge-analytics').then(m => m.init())
  }
}
```

### `onRequestError()` Hook

```ts
export async function onRequestError(
  error: { digest: string } & Error,
  request: {
    path: string
    method: string
    headers: { [key: string]: string | string[] }
  },
  context: {
    routerKind: 'App Router' | 'Pages Router'
    routeType: 'render' | 'route' | 'action' | 'proxy'
    routePath: string                    // e.g., '/dashboard/[id]'
    renderSource?: string                // e.g., 'react-server-components'
    renderType?: string                  // e.g., 'dynamic'
    revalidateReason?: 'on-demand' | 'stale'
  }
): Promise<void> {
  await reportError({ error, path: request.path })
}
```

---

## Metadata Files — Full API

### `opengraph-image.tsx`

```ts
import { ImageResponse } from 'next/og'
import type { ImageResponseOptions } from 'next/og'

// Required exports
export const alt = 'My page title'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return new ImageResponse(
    <div style={{ display: 'flex', background: '#000', width: '100%', height: '100%' }}>
      <h1 style={{ color: '#fff' }}>{slug}</h1>
    </div>,
    { ...size }
  )
}
```

### `generateImageMetadata()`

```ts
export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Array<{ id: string; alt: string; size: { width: number; height: number }; contentType: 'image/png' | 'image/jpeg' }>> {
  const { id } = await params
  return [
    { id: 'og', alt: 'Open Graph Image', size: { width: 1200, height: 630 }, contentType: 'image/png' },
    { id: 'twitter', alt: 'Twitter Card', size: { width: 1200, height: 600 }, contentType: 'image/png' },
  ]
}

// id is a SEPARATE prop — NOT nested inside params
export default async function Image({
  params,
  id,
}: {
  params: Promise<{ id: string }>
  id: Promise<string>   // receives the 'id' value returned by generateImageMetadata
}) {
  const { id: routeId } = await params
  const imageId = await id  // 'og' | 'twitter'
  return new ImageResponse(/* ... */)
}
```

### `sitemap.ts`

```ts
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',   // 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
      priority: 1,                  // 0.0 – 1.0
      alternates: {
        languages: {
          es: 'https://example.com/es',
          de: 'https://example.com/de',
        },
      },
      images: ['https://example.com/image.jpg'],
      videos: [{
        title: 'My video',
        thumbnail_loc: 'https://example.com/thumb.jpg',
        description: 'Video description',
      }],
      news: {
        publication: { name: 'Example', language: 'en' },
        publication_date: new Date(),
        title: 'My article',
      },
    },
  ]
}

// Paginated sitemaps (returns /sitemap/0.xml, /sitemap/1.xml, ...)
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }]
}
```

### `robots.ts`

```ts
import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/private/' },
      { userAgent: 'Googlebot', allow: ['/products/', '/about/'], disallow: '/admin/' },
      { userAgent: 'AdsBot-Google', disallow: '/' },
    ],
    sitemap: 'https://example.com/sitemap.xml',   // string | string[]
    host: 'https://example.com',
  }
}
```

### `manifest.ts`

```ts
import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'My App',
    short_name: 'MyApp',
    description: 'My awesome app',
    start_url: '/',
    display: 'standalone',          // 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
    background_color: '#ffffff',
    theme_color: '#000000',
    orientation: 'portrait',        // 'portrait' | 'landscape' | 'any' | ...
    scope: '/',
    lang: 'en',
    dir: 'ltr',                     // 'ltr' | 'rtl' | 'auto'
    prefer_related_applications: false,
    related_applications: [],
    categories: ['productivity'],
    screenshots: [
      {
        src: '/screenshot-1.png',
        sizes: '1280x720',
        type: 'image/png',
        label: 'Home screen',
        form_factor: 'wide',        // 'wide' | 'narrow'
      },
    ],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'New Post',
        short_name: 'New',
        description: 'Create a new post',
        url: '/posts/new',
        icons: [{ src: '/shortcut-icon.png', sizes: '96x96' }],
      },
    ],
  }
}
```
