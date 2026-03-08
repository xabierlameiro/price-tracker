---
name: nextjs-components
description: >
  Next.js 16 built-in components reference. Use this skill when working with
  <Image>, <Link>, <Script>, <Font> (next/font/google, next/font/local), or <Form>.
  Covers all props, TypeScript signatures, optimization behavior, and patterns
  for the App Router. Trigger on any question about optimized images, navigation
  links, third-party scripts, web fonts, or form submissions in Next.js.
---

# Next.js 16 — Built-in Components

> **Scope**: App Router only. Import from `next/image`, `next/link`, `next/script`, `next/font/*`, `next/form`.

---

## `<Image>` — `next/image`

Optimizes images: automatic WebP/AVIF conversion, lazy loading, prevents CLS via reserved space, resizes to device widths.

```ts
import Image from "next/image";
```

### Props

| Prop            | Type                                                  | Default   | Required | Description                                                           |
| --------------- | ----------------------------------------------------- | --------- | -------- | --------------------------------------------------------------------- |
| `src`           | `string \| StaticImageData`                           | —         | ✅       | Path, URL, or imported image                                          |
| `alt`           | `string`                                              | —         | ✅       | Accessible description; `""` for decorative images                    |
| `width`         | `number`                                              | —         | ✅\*     | Intrinsic width in px (\*not required with `fill`)                    |
| `height`        | `number`                                              | —         | ✅\*     | Intrinsic height in px (\*not required with `fill`)                   |
| `fill`          | `boolean`                                             | `false`   | —        | Fills parent container; ignores `width`/`height`                      |
| `sizes`         | `string`                                              | `100vw`   | —        | Media condition → image size, used for `srcset`                       |
| `quality`       | `number`                                              | `75`      | —        | 1–100; higher = better quality, larger file                           |
| `priority`      | `boolean`                                             | `false`   | —        | Disables lazy load; use for LCP images                                |
| `placeholder`   | `'blur' \| 'empty' \| 'data:...'`                     | `'empty'` | —        | Shown while image loads                                               |
| `blurDataURL`   | `string`                                              | —         | —        | Base64 data URI for `placeholder="blur"` (required for remote images) |
| `loader`        | `ImageLoader`                                         | —         | —        | Custom function to resolve image URL                                  |
| `unoptimized`   | `boolean`                                             | `false`   | —        | Skip Next.js optimization (serves original)                           |
| `overrideSrc`   | `string`                                              | —         | —        | Overrides the `src` in the rendered `<img>` (SEO use cases)           |
| `onLoad`        | `(e: React.SyntheticEvent<HTMLImageElement>) => void` | —         | —        | Callback when image loaded (`'use client'` required)                  |
| `onError`       | `(e: React.SyntheticEvent<HTMLImageElement>) => void` | —         | —        | Callback on load error (`'use client'` required)                      |
| `loading`       | `'lazy' \| 'eager'`                                   | `'lazy'`  | —        | Browser hint; use `priority` instead of `'eager'`                     |
| `decoding`      | `'async' \| 'auto' \| 'sync'`                         | `'async'` | —        | Image decoding hint                                                   |
| `fetchPriority` | `'high' \| 'low' \| 'auto'`                           | `'auto'`  | —        | Fetch priority hint                                                   |
| `style`         | `React.CSSProperties`                                 | —         | —        | CSS object on the `<img>` element                                     |
| `className`     | `string`                                              | —         | —        | CSS class on the `<img>` element                                      |
| `ref`           | `React.Ref<HTMLImageElement>`                         | —         | —        | Forward ref to underlying `<img>` element                             |

### `ImageLoader` Type

```ts
type ImageLoader = (resolverProps: ImageLoaderProps) => string;

type ImageLoaderProps = {
  src: string;
  width: number;
  quality?: number;
};
```

### Examples

```tsx
// Local image (width/height auto-inferred from import)
import profile from '@/public/profile.jpg'
<Image src={profile} alt="Profile photo" placeholder="blur" priority />

// Remote image (requires remotePatterns in next.config.ts)
<Image
  src="https://cdn.example.com/photo.jpg"
  alt="Photo"
  width={800}
  height={600}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Fill mode (parent must be position: relative/absolute/fixed)
<div className="relative h-[400px]">
  <Image src="/hero.jpg" alt="Hero" fill className="object-cover" />
</div>
```

### Remote Patterns (next.config.ts)

```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.example.com', port: '', pathname: '/**' },
  ],
}
```

---

## `<Link>` — `next/link`

Client-side navigation with automatic prefetching in the viewport.

```ts
import Link from "next/link";
```

### Props

| Prop             | Type                           | Default | Description                                         |
| ---------------- | ------------------------------ | ------- | --------------------------------------------------- |
| `href`           | `string \| UrlObject`          | —       | ✅ Destination path or URL object                   |
| `as`             | `string \| UrlObject`          | —       | Optional URL alias for dynamic routes               |
| `replace`        | `boolean`                      | `false` | Replace history entry instead of push               |
| `scroll`         | `boolean`                      | `true`  | Scroll to top on navigation                         |
| `prefetch`       | `boolean \| null`              | `null`  | `null`=auto, `true`=always, `false`=never           |
| `legacyBehavior` | `boolean`                      | `false` | Deprecated: v12 behavior requiring `<a>` child      |
| `passHref`       | `boolean`                      | `false` | Force `href` on custom child component              |
| `shallow`        | —                              | —       | **Pages Router only** — not supported in App Router |
| `locale`         | `string \| false`              | —       | **Pages Router i18n only** — locale prefix          |
| `ref`            | `React.Ref<HTMLAnchorElement>` | —       | Forward ref to underlying `<a>` element             |

### Examples

```tsx
// Basic navigation
<Link href="/about">About</Link>

// Dynamic route
<Link href={`/blog/${post.slug}`}>{post.title}</Link>

// URL object
<Link href={{ pathname: '/search', query: { q: 'next.js' } }}>Search</Link>

// Replace history (no back button entry)
<Link href="/checkout" replace>Checkout</Link>

// Disable prefetch
<Link href="/heavy-page" prefetch={false}>Heavy page</Link>
```

---

## `<Script>` — `next/script`

Loads third-party scripts with performance strategies.

```ts
import Script from "next/script";
```

### Props

| Prop       | Type                 | Default              | Required      | Description                                                      |
| ---------- | -------------------- | -------------------- | ------------- | ---------------------------------------------------------------- |
| `src`      | `string`             | —                    | ✅\*          | URL of the script (\*required unless using `children`)           |
| `strategy` | `ScriptStrategy`     | `'afterInteractive'` | —             | When to load the script                                          |
| `id`       | `string`             | —                    | ✅ for inline | Unique ID for inline scripts                                     |
| `onLoad`   | `() => void`         | —                    | —             | Callback after script loads (`'use client'` required)            |
| `onReady`  | `() => void`         | —                    | —             | Callback after load AND on every mount (`'use client'` required) |
| `onError`  | `(e: Error) => void` | —                    | —             | Callback on load failure (`'use client'` required)               |
| `nonce`    | `string`             | —                    | —             | CSP nonce for the script                                         |

### `ScriptStrategy` Values

| Value                 | When it Loads                            | Use Case                                                                                                                         |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `'beforeInteractive'` | Before any Next.js code; blocks page     | Critical scripts (polyfills, bot detectors)                                                                                      |
| `'afterInteractive'`  | After page becomes interactive (default) | Tag managers, analytics                                                                                                          |
| `'lazyOnload'`        | During idle time                         | Chat widgets, low-priority scripts                                                                                               |
| `'worker'`            | In a Web Worker                          | CPU-intensive third-party scripts. Requires `@builder.io/partytown` + `experimental.nextScriptWorkers: true` in `next.config.ts` |

### Examples

```tsx
// Analytics loaded after page is interactive
<Script src="https://analytics.example.com/script.js" strategy="afterInteractive" />

// Inline script with nonce (CSP compliant)
<Script id="my-inline-script" nonce={nonce}>
  {`window.__THEME__ = 'dark'`}
</Script>

// Callback when ready
<Script
  src="https://maps.googleapis.com/maps/api/js"
  strategy="lazyOnload"
  onReady={() => { window.initMap() }}
/>
```

> ⚠️ `'beforeInteractive'` must be placed in a `layout.tsx`, not in `page.tsx`.

---

## `<Font>` — `next/font/google` & `next/font/local`

Zero-layout-shift font loading with automatic self-hosting.

### `next/font/google`

```ts
import { Inter, Roboto_Mono } from "next/font/google";
```

#### Options

| Option               | Type                                                      | Description                                                                        |
| -------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `weight`             | `string \| string[]`                                      | `'400'`, `['400', '700']`, `'variable'`                                            |
| `style`              | `'normal' \| 'italic' \| ('normal' \| 'italic')[]`        | Font style(s)                                                                      |
| `subsets`            | `string[]`                                                | `['latin']`, `['latin', 'cyrillic']`                                               |
| `display`            | `'auto' \| 'block' \| 'swap' \| 'fallback' \| 'optional'` | `font-display` value (default: `'swap'`)                                           |
| `preload`            | `boolean`                                                 | `true` — preload font files                                                        |
| `fallback`           | `string[]`                                                | Fallback fonts: `['system-ui', 'arial']`                                           |
| `adjustFontFallback` | `boolean`                                                 | Reduce CLS with metric-adjusted fallback (`boolean` for Google fonts)              |
| `variable`           | `string`                                                  | CSS variable name: `'--font-inter'`                                                |
| `axes`               | `string[]`                                                | Variable font axes to enable, e.g. `['wght', 'ital']` (Google variable fonts only) |

#### Return Value

| Property     | Type                                          | Description                                              |
| ------------ | --------------------------------------------- | -------------------------------------------------------- |
| `.className` | `string`                                      | CSS class with the font family applied                   |
| `.style`     | `{ fontFamily: string; fontWeight?: number }` | Style object                                             |
| `.variable`  | `string`                                      | CSS custom property name (only if `variable` option set) |

```tsx
// app/layout.tsx
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### `next/font/local`

```ts
import localFont from "next/font/local";
```

#### Options

Extends `next/font/google` options plus:

| Option               | Type                                     | Description                                                                              |
| -------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `src`                | `string \| FontSrcObject[]`              | Path to font file(s) relative to `app/`                                                  |
| `adjustFontFallback` | `string`                                 | Font name to use as metric-adjusted fallback (e.g. `'Arial'`) — `string` for local fonts |
| `declarations`       | `Array<{ prop: string; value: string }>` | Additional `@font-face` CSS descriptor pairs                                             |

```ts
type FontSrcObject = {
  path: string;
  weight?: string;
  style?: string;
};
```

```ts
const myFont = localFont({
  src: [
    {
      path: "../public/fonts/MyFont-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/MyFont-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-my",
});
```

---

## `<Form>` — `next/form`

Extends HTML `<form>` with client-side navigation, prefetching, and progressive enhancement.

```ts
import Form from "next/form";
```

### Props — String Action (navigation)

| Prop       | Type      | Default | Description                                   |
| ---------- | --------- | ------- | --------------------------------------------- |
| `action`   | `string`  | —       | ✅ URL/path to navigate to on submit          |
| `replace`  | `boolean` | `false` | Replace history entry instead of push         |
| `scroll`   | `boolean` | `true`  | Scroll to top after navigation                |
| `prefetch` | `boolean` | `true`  | Prefetch action URL when form enters viewport |

### Props — Function Action (mutation)

| Prop     | Type                                            | Description                     |
| -------- | ----------------------------------------------- | ------------------------------- |
| `action` | `(formData: FormData) => void \| Promise<void>` | Server Action to call on submit |

### Unsupported Props

`method`, `encType`, `target` — these are ignored. Use `<form>` directly if you need them.

### Examples

```tsx
// Search form with navigation (GET-like behavior)
<Form action="/search">
  <input name="q" type="search" placeholder="Search…" />
  <button type="submit">Search</button>
</Form>;
// Navigates to /search?q=<value>

// Mutation form with Server Action
import { createPost } from "@/app/actions/post";

<Form action={createPost}>
  <input name="title" required />
  <button type="submit">Create Post</button>
</Form>;
```

> **Note**: `<input type="file">` with string action submits the filename (not the file object), matching browser default behavior.
