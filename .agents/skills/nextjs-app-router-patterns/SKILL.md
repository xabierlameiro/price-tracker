---
name: nextjs-app-router-patterns
description: Master Next.js 16 App Router with Server Components, streaming, Cache Components (use cache), parallel routes, and advanced data fetching. Use when building Next.js applications, implementing SSR/SSG, or optimizing React Server Components.
---

# Next.js App Router Patterns

Comprehensive patterns for Next.js 16 App Router architecture, Server Components, Cache Components, and modern full-stack React development.

## When to Use This Skill

- Building new Next.js applications with App Router
- Migrating from Pages Router to App Router
- Implementing Server Components and streaming
- Setting up parallel and intercepting routes
- Optimizing data fetching and caching
- Building full-stack features with Server Actions

## Core Concepts

### 1. Rendering Modes

| Mode                  | Where        | When to Use                               |
| --------------------- | ------------ | ----------------------------------------- |
| **Server Components** | Server only  | Data fetching, heavy computation, secrets |
| **Client Components** | Browser      | Interactivity, hooks, browser APIs        |
| **Static**            | Build time   | Content that rarely changes               |
| **Dynamic**           | Request time | Personalized or real-time data            |
| **Streaming**         | Progressive  | Large pages, slow data sources            |

### 2. File Conventions

```
app/
├── layout.tsx       # Shared UI wrapper
├── page.tsx         # Route UI
├── loading.tsx      # Loading UI (Suspense)
├── error.tsx        # Error boundary
├── not-found.tsx    # 404 UI
├── route.ts         # API endpoint
├── template.tsx     # Re-mounted layout
├── default.tsx      # Parallel route fallback
└── opengraph-image.tsx  # OG image generation
```

## Quick Start

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: { default: 'My App', template: '%s | My App' },
  description: 'Built with Next.js App Router',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

// app/page.tsx - Server Component by default
// Preferred in Next.js 16: use cache directive (requires cacheComponents: true in next.config)
import { cacheLife } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheLife('hours') // cache for ~1 hour; 'seconds' | 'minutes' | 'hours' | 'days' | 'max'
  const res = await fetch('https://api.example.com/products')
  return res.json()
}

// Alternatively, using fetch cache option (still valid):
// async function getProducts() {
//   const res = await fetch('https://api.example.com/products', {
//     next: { revalidate: 3600 }, // ISR: revalidate every hour
//   })
//   return res.json()
// }

export default async function HomePage() {
  const products = await getProducts()

  return (
    <main>
      <h1>Products</h1>
      <ProductGrid products={products} />
    </main>
  )
}
```

## Patterns

### Pattern 1: Server Components with Data Fetching

```typescript
// app/products/page.tsx
import { Suspense } from 'react'
import { ProductList, ProductListSkeleton } from '@/components/products'
import { FilterSidebar } from '@/components/filters'

interface SearchParams {
  category?: string
  sort?: 'price' | 'name' | 'date'
  page?: string
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams

  return (
    <div className="flex gap-8">
      <FilterSidebar />
      <Suspense
        key={JSON.stringify(params)}
        fallback={<ProductListSkeleton />}
      >
        <ProductList
          category={params.category}
          sort={params.sort}
          page={Number(params.page) || 1}
        />
      </Suspense>
    </div>
  )
}

// components/products/ProductList.tsx - Server Component
async function getProducts(filters: ProductFilters) {
  const res = await fetch(
    `${process.env.API_URL}/products?${new URLSearchParams(filters)}`,
    { next: { tags: ['products'] } }
  )
  if (!res.ok) throw new Error('Failed to fetch products')
  return res.json()
}

export async function ProductList({ category, sort, page }: ProductFilters) {
  const { products, totalPages } = await getProducts({ category, sort, page })

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  )
}
```

### Pattern 2: Client Components with 'use client'

```typescript
// components/products/AddToCartButton.tsx
'use client'

import { useState, useTransition } from 'react'
import { addToCart } from '@/app/actions/cart'

export function AddToCartButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await addToCart(productId)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? 'Adding...' : 'Add to Cart'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
```

### Pattern 3: Server Actions

```typescript
// app/actions/cart.ts
"use server";

import { updateTag } from "next/cache"; // updateTag for Server Actions (immediate expiry)
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function addToCart(productId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;

  if (!sessionId) {
    redirect("/login");
  }

  try {
    await db.cart.upsert({
      where: { sessionId_productId: { sessionId, productId } },
      update: { quantity: { increment: 1 } },
      create: { sessionId, productId, quantity: 1 },
    });

    // updateTag: immediate cache expiry (read-your-own-writes). Only in Server Actions.
    // Use revalidateTag('cart', 'max') instead when stale-while-revalidate is acceptable.
    updateTag("cart");
    return { success: true };
  } catch (error) {
    return { error: "Failed to add item to cart" };
  }
}

export async function checkout(formData: FormData) {
  const address = formData.get("address") as string;
  const payment = formData.get("payment") as string;

  // Validate
  if (!address || !payment) {
    return { error: "Missing required fields" };
  }

  // Process order
  const order = await processOrder({ address, payment });

  // Redirect to confirmation
  redirect(`/orders/${order.id}/confirmation`);
}
```

### Pattern 4: Parallel Routes

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  team,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  team: React.ReactNode
}) {
  return (
    <div className="dashboard-grid">
      <main>{children}</main>
      <aside className="analytics-panel">{analytics}</aside>
      <aside className="team-panel">{team}</aside>
    </div>
  )
}

// app/dashboard/@analytics/page.tsx
export default async function AnalyticsSlot() {
  const stats = await getAnalytics()
  return <AnalyticsChart data={stats} />
}

// app/dashboard/@analytics/loading.tsx
export default function AnalyticsLoading() {
  return <ChartSkeleton />
}

// app/dashboard/@team/page.tsx
export default async function TeamSlot() {
  const members = await getTeamMembers()
  return <TeamList members={members} />
}
```

### Pattern 5: Intercepting Routes (Modal Pattern)

```typescript
// File structure for photo modal
// app/
// ├── @modal/
// │   ├── (.)photos/[id]/page.tsx  # Intercept
// │   └── default.tsx
// ├── photos/
// │   └── [id]/page.tsx            # Full page
// └── layout.tsx

// app/@modal/(.)photos/[id]/page.tsx
import { Modal } from '@/components/Modal'
import { PhotoDetail } from '@/components/PhotoDetail'

export default async function PhotoModal({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <Modal>
      <PhotoDetail photo={photo} />
    </Modal>
  )
}

// app/photos/[id]/page.tsx - Full page version
export default async function PhotoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <div className="photo-page">
      <PhotoDetail photo={photo} />
      <RelatedPhotos photoId={id} />
    </div>
  )
}

// app/layout.tsx
export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
        {modal}
      </body>
    </html>
  )
}
```

### Pattern 6: Streaming with Suspense

```typescript
// app/product/[id]/page.tsx
import { Suspense } from 'react'

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // This data loads first (blocking)
  const product = await getProduct(id)

  return (
    <div>
      {/* Immediate render */}
      <ProductHeader product={product} />

      {/* Stream in reviews */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Reviews productId={id} />
      </Suspense>

      {/* Stream in recommendations */}
      <Suspense fallback={<RecommendationsSkeleton />}>
        <Recommendations productId={id} />
      </Suspense>
    </div>
  )
}

// These components fetch their own data
async function Reviews({ productId }: { productId: string }) {
  const reviews = await getReviews(productId) // Slow API
  return <ReviewList reviews={reviews} />
}

async function Recommendations({ productId }: { productId: string }) {
  const products = await getRecommendations(productId) // ML-based, slow
  return <ProductCarousel products={products} />
}
```

### Pattern 7: Route Handlers (API Routes)

```typescript
// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");

  const products = await db.product.findMany({
    where: category ? { category } : undefined,
    take: 20,
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const product = await db.product.create({
    data: body,
  });

  return NextResponse.json(product, { status: 201 });
}

// app/api/products/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(product);
}
```

### Pattern 8: Metadata and SEO

```typescript
// app/products/[slug]/page.tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) return {}

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  }
}

export async function generateStaticParams() {
  const products = await db.product.findMany({ select: { slug: true } })
  return products.map((p) => ({ slug: p.slug }))
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) notFound()

  return <ProductDetail product={product} />
}
```

## Caching Strategies

### Data Cache

```typescript
// No cache (always fresh)
fetch(url, { cache: "no-store" });

// Cache forever (static)
fetch(url, { cache: "force-cache" });

// ISR - revalidate after 60 seconds
fetch(url, { next: { revalidate: 60 } });

// Tag-based invalidation
fetch(url, { next: { tags: ["products"] } });

// Invalidate via Server Action (use cache + updateTag — preferred in Next.js 16)
"use server";
import { updateTag, revalidateTag, revalidatePath } from "next/cache";

export async function updateProduct(id: string, data: ProductData) {
  await db.product.update({ where: { id }, data });
  // updateTag: immediate expiry in Server Actions (read-your-own-writes)
  updateTag("products");
  // OR for stale-while-revalidate (serves stale while regenerating in background):
  // revalidateTag("products", "max"); // second arg is a cacheLife profile
  revalidatePath("/products"); // also invalidate the full route cache
}
```

### Pattern 9: Cache Components with `use cache` (Next.js 16)

```typescript
// Enable in next.config.ts:
// const nextConfig: NextConfig = { cacheComponents: true }

import { cacheLife, cacheTag } from 'next/cache'

// Cache a Server Component
export default async function ProductsPage() {
  'use cache'
  cacheLife('hours')         // 'seconds' | 'minutes' | 'hours' | 'days' | 'max'
  cacheTag('products')       // tag for on-demand invalidation

  const products = await db.query('SELECT * FROM products')
  return <ProductList products={products} />
}

// Cache a shared data function
async function getProductById(id: string) {
  'use cache'
  cacheLife('days')
  cacheTag(`product-${id}`, 'products')
  return db.product.findUnique({ where: { id } })
}

// Invalidate on mutation (Server Action)
'use server'
import { updateTag } from 'next/cache'

export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } })
  updateTag('products')        // immediate expiry (read-your-own-writes)
  updateTag(`product-${id}`)
}

// Or allow stale-while-revalidate (Route Handlers or Server Actions):
// import { revalidateTag } from 'next/cache'
// revalidateTag('products', 'max') // serves stale, regenerates in background
```

### Pattern 10: `after()` for Non-Blocking Post-Response Work

```typescript
// app/layout.tsx or any Server Component / Route Handler
import { after } from 'next/server'
import { logAnalytics } from '@/lib/analytics'

export default function Layout({ children }: { children: React.ReactNode }) {
  after(() => {
    // Runs after response is sent — does not block the user
    logAnalytics({ event: 'page_view' })
  })
  return <>{children}</>
}

// In a Route Handler
export async function POST(request: Request) {
  const data = await request.json()
  const result = await processData(data)

  after(async () => {
    // e.g. send a webhook, update audit log without blocking the response
    await notifyWebhook(result)
  })

  return Response.json(result)
}
```

## Best Practices

### Do's

- **Start with Server Components** - Add 'use client' only when needed
- **Use `use cache` for Next.js 16** - Prefer it over `unstable_cache` or manual `fetch` cache options
- **Colocate data fetching** - Fetch data where it's used
- **Use Suspense boundaries** - Enable streaming for slow data
- **Leverage parallel routes** - Independent loading states
- **Use Server Actions** - For mutations with progressive enhancement
- **Use `after()`** - For analytics, webhooks, and logging that shouldn't block the response

### Don'ts

- **Don't pass non-serializable data** - Server → Client boundary only accepts serializable values
- **Don't use hooks in Server Components** - No useState, useEffect
- **Don't fetch in Client Components** - Use Server Components; for client-side data use SWR or React Query
- **Don't over-nest layouts** - Each layout adds to the component tree
- **Don't ignore loading states** - Always provide loading.tsx or Suspense
- **Don't call your own Route Handlers from Server Components** - Extract shared logic into `lib/` modules
- **Don't use `unstable_cache` for new code** - Use `use cache` directive instead

## Resources

- [Next.js 16 App Router Documentation](https://nextjs.org/docs/app)
- [Cache Components (use cache)](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [cacheTag / cacheLife / updateTag](https://nextjs.org/docs/app/api-reference/functions/cacheTag)
- [after() function](https://nextjs.org/docs/app/api-reference/functions/after)
- [Upgrading to Next.js 16](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Vercel Templates](https://vercel.com/templates/next.js)
