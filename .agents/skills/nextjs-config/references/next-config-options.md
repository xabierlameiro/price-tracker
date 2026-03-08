# next.config Options — Exhaustive Reference

> Next.js 16 App Router only. All sub-options, types, and advanced usage patterns.

---

## `headers()` — Full Reference

### Basic Structure

```ts
async headers(): Promise<Header[]> {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
        { key: 'X-Custom-Header', value: 'value' },
      ],
    },
  ]
}
```

### `Header` Object Shape

```ts
type Header = {
  source: string                        // Path pattern
  headers: { key: string; value: string }[]
  has?: RouteHas[]                      // All must match
  missing?: RouteHas[]                  // All must be absent
  basePath?: false                      // Opt-out of basePath prefix
  locale?: false                        // Opt-out of locale prefix
}
```

### `RouteHas` Type (shared by headers, redirects, rewrites)

```ts
type RouteHas =
  | { type: 'header'; key: string; value?: string }
  | { type: 'cookie'; key: string; value?: string }
  | { type: 'query'; key: string; value?: string }
  | { type: 'host'; value: string }
```

### Conditional Headers with `has` / `missing`

```ts
async headers() {
  return [
    // Only apply if x-new-user header is present
    {
      source: '/',
      has: [{ type: 'header', key: 'x-new-user' }],
      headers: [{ key: 'Welcome', value: 'true' }],
    },
    // Only apply if cookie user is NOT set
    {
      source: '/:path*',
      missing: [{ type: 'cookie', key: 'user' }],
      headers: [{ key: 'X-Guest', value: 'true' }],
    },
    // Match header with specific value
    {
      source: '/api/:path*',
      has: [{ type: 'header', key: 'x-version', value: 'v2' }],
      headers: [{ key: 'X-Api-Version', value: '2' }],
    },
    // Match using named capture groups in value
    {
      source: '/:path*',
      has: [{ type: 'header', key: 'x-pathname', value: '(?<pathname>.*)' }],
      headers: [{ key: 'x-new-pathname', value: '/new/:pathname*' }],
    },
  ]
}
```

### Common Security Headers Pattern

```ts
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

async headers() {
  return [{ source: '/(.*)', headers: securityHeaders }]
}
```

---

## `redirects()` — Full Reference

### Redirect Object Shape

```ts
type Redirect = {
  source: string
  destination: string
  permanent: boolean            // true → 308, false → 307
  statusCode?: number           // Manual override (301, 302, 307, 308)
  has?: RouteHas[]
  missing?: RouteHas[]
  basePath?: false
  locale?: false
}
```

### Path Pattern Syntax

| Pattern | Example Source | Matches |
|---------|---------------|---------|
| Named segment | `/blog/:slug` | `/blog/my-post` |
| Wildcard | `/old/:path*` | `/old/a/b/c` |
| Optional | `/:path?` | `/` and `/anything` |
| Regex | `/blog/:id(\\d{1,})` | `/blog/123` only |

```ts
async redirects() {
  return [
    // Permanent redirect (308)
    { source: '/about-us', destination: '/about', permanent: true },

    // Wildcard — preserve sub-path
    { source: '/docs/:path*', destination: '/documentation/:path*', permanent: false },

    // Regex constraint
    { source: '/api/v1/:path(.*)', destination: '/api/v2/:path', permanent: false },

    // Conditional — only if cookie absent
    {
      source: '/dashboard',
      missing: [{ type: 'cookie', key: 'session' }],
      destination: '/login',
      permanent: false,
    },

    // Query string matching
    {
      source: '/search',
      has: [{ type: 'query', key: 'q', value: '(?<query>.*)' }],
      destination: '/find?search=:query',
      permanent: false,
    },
  ]
}
```

---

## `rewrites()` — Full Reference

### Three-Phase Structure

```ts
async rewrites() {
  return {
    beforeFiles: [
      // Checked BEFORE filesystem + pages
      // Can override static files — be careful
      { source: '/docs/:path*', destination: '/docs-v2/:path*' },
    ],
    afterFiles: [
      // Checked AFTER filesystem, BEFORE dynamic fallback
      { source: '/api/:path*', destination: 'https://api.example.com/:path*' },
    ],
    fallback: [
      // Last resort — after pages + filesystem
      { source: '/:path*', destination: 'https://old-site.example.com/:path*' },
    ],
  }
}
```

### Flat Array (afterFiles equivalent)

```ts
async rewrites() {
  return [
    { source: '/proxy/:path*', destination: 'https://backend.example.com/:path*' },
  ]
}
```

### External Proxy Rewrite

```ts
{ source: '/api/:path*', destination: 'https://api.backend.com/:path*' }
// basePath is NOT automatically prepended for external destinations
// Internal destinations: basePath IS prepended unless basePath: false
```

### Named Capture Group Usage

```ts
{
  source: '/old/:category/:slug',
  destination: '/new/:category?slug=:slug',
}
```

### Conditional Rewrite with Host Matching

```ts
{
  source: '/:path*',
  has: [{ type: 'host', value: 'beta.example.com' }],
  destination: '/beta/:path*',
}
```

---

## `images` — Full Sub-Option Reference

### `remotePatterns`

```ts
type RemotePattern = {
  protocol?: 'http' | 'https'    // default: both
  hostname: string               // required; supports wildcards: '**.example.com'
  port?: string                  // default: '' (any port)
  pathname?: string              // default: '**'; glob pattern
  search?: string                // exact query string match
}

// Examples
remotePatterns: [
  { hostname: 'assets.example.com' },
  { protocol: 'https', hostname: '**.cloudfront.net', pathname: '/images/**' },
  { hostname: 'images.githubusercontent.com', search: '' },  // no query string
]
```

### `localPatterns`

```ts
type LocalPattern = {
  pathname?: string   // Glob pattern from public/ root
  search?: string     // Query string constraint
}

localPatterns: [
  { pathname: '/assets/images/**', search: '' },
  { pathname: '/content/**' },
]
// Only paths matching at least one pattern will be served
```

### `loader` and `loaderFile`

```ts
// Built-in loaders
loader: 'default'     // Vercel/Next.js built-in
loader: 'cloudinary'  // Cloudinary CDN
loader: 'imgix'       // Imgix CDN
loader: 'akamai'      // Akamai CDN
loader: 'custom'      // Custom — requires loaderFile

// Custom loader file
loaderFile: './lib/image-loader.ts'
// Must export a default function:
// (params: { src: string; width: number; quality?: number }) => string
```

```ts
// lib/image-loader.ts
export default function myLoader({ src, width, quality }: {
  src: string
  width: number
  quality?: number
}): string {
  return `https://cdn.example.com/${src}?w=${width}&q=${quality ?? 75}`
}
```

### `formats`

```ts
formats: ['image/avif', 'image/webp']
// Order matters: first supported format by client is served
// 'image/avif' compresses better but slower to encode
// Default in Next.js 16: ['image/avif', 'image/webp']
// Older default: ['image/webp']
```

### `dangerouslyAllowSVG` + `contentSecurityPolicy`

```ts
dangerouslyAllowSVG: true,
contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
// SVGs can execute arbitrary JS — use restrictive CSP
```

### `qualities`

```ts
qualities: [25, 50, 75, 90, 100]
// Only these quality values are accepted via the quality prop on <Image>
// Helps with caching predictability
```

---

## `turbopack` — Full Reference

> Turbopack is the default bundler for `next dev` in Next.js 16 and available for `next build --turbopack` (stable from 16.2+).

### `rules` — Custom Loaders

```ts
turbopack: {
  rules: {
    // SVG as React component
    '*.svg': {
      loaders: ['@svgr/webpack'],
      as: '*.js',
    },
    // MDX
    '*.mdx': {
      loaders: [
        {
          loader: '@mdx-js/loader',
          options: {
            remarkPlugins: [],
            rehypePlugins: [],
          },
        },
      ],
      as: '*.js',
    },
    // Raw file content as string
    '*.txt': {
      loaders: ['raw-loader'],
      as: '*.js',
    },
    // YAML
    '*.yaml': {
      loaders: ['yaml-loader'],
      as: '*.js',
    },
  },
}
```

Each rule value can be:
- `string[]` — array of loader package names
- `{ loaders: (string | { loader: string; options: object })[], as: string }` — with options and explicit output type

### `resolveAlias`

```ts
turbopack: {
  resolveAlias: {
    // Alias a module
    underscore: 'lodash',
    // Conditional alias (browser only)
    mocha: { browser: 'mocha/browser-entry.js' },
    // Alias to a local file
    '@utils': './src/utils/index.ts',
  },
}
```

### `resolveExtensions`

```ts
turbopack: {
  // OVERWRITES defaults — include all you need
  resolveExtensions: [
    '.ts', '.tsx', '.js', '.jsx', '.json', '.node', '.mdx',
  ],
}
```

### `moduleIdStrategy`

```ts
turbopack: {
  moduleIdStrategy: 'deterministic',  // Stable IDs based on content (default for prod)
  // or: 'named'                      // Human-readable IDs (useful for debugging)
}
```

### `treeShaking`

```ts
turbopack: {
  treeShaking: true,   // default
}
```

### `memoryLimit`

```ts
turbopack: {
  memoryLimit: 4096,   // MB — cap Turbopack memory usage
}
```

---

## `experimental.serverActions`

```ts
experimental: {
  serverActions: {
    bodySizeLimit: '2mb',     // default '1mb' — max request body for Server Actions
    allowedOrigins: [         // CSRF protection — origins allowed to invoke actions
      'my-proxy.com',
      '*.trusted.com',
    ],
  },
}
```

> Server Actions are stable in Next.js 14+. The `serverActions` config block only controls these two options.

---

## `output: 'export'` — Static Export Constraints

When using `output: 'export'`, the following are **not supported**:

- Dynamic routes that need `generateStaticParams` must export it
- API routes (Route Handlers) — use `next export` compatible alternatives
- Route Handlers that use dynamic data (cookies, headers)
  - `proxy.ts` — not supported in static export
- Image Optimization — set `unoptimized: true` or use `loader`

```ts
// next.config.ts for static export
const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },  // required unless custom loader
  trailingSlash: true,             // recommended for static hosts
}
```

---

## `output: 'standalone'` — Standalone Server

```ts
output: 'standalone'
// Produces .next/standalone/ with:
// - server.js — Node.js server
// - node_modules/ — only required modules
// Copy public/ and .next/static/ manually in Dockerfile

// Dockerfile example:
// COPY --from=builder /app/.next/standalone ./
// COPY --from=builder /app/.next/static ./.next/static
// COPY --from=builder /app/public ./public
// CMD ["node", "server.js"]
```

---

## `serverExternalPackages` — When to Use

```ts
serverExternalPackages: [
  // Native bindings — cannot be bundled
  'bcrypt',
  'argon2',
  '@libsql/client',
  // Large packages that don't benefit from bundling
  '@prisma/client',
  // Packages with __dirname / __filename dependencies
  'some-legacy-pkg',
]
```

> All packages listed in `serverExternalPackages` are excluded from the Server Component bundle and loaded at runtime from `node_modules`.

---

## `transpilePackages` — When to Use

```ts
transpilePackages: [
  // Monorepo packages (ESM or TypeScript)
  '@acme/ui',
  '@internal/utils',
  // Third-party ESM-only packages lacking CJS build
  'some-esm-only-lib',
  // Packages using React JSX transform
  'react-tweet',
]
```

---

## Full TypeScript Config Type

```ts
import type { NextConfig } from 'next'

// All options (most are optional)
const config: NextConfig = {
  // Routing
  basePath: '',
  trailingSlash: false,
  assetPrefix: '',
  skipTrailingSlashRedirect: false,
  skipProxyUrlNormalize: false,

  // HTTP routing (async functions)
  async headers() { return [] },
  async redirects() { return [] },
  async rewrites() { return [] },

  // Build
  distDir: '.next',
  output: undefined,
  cleanDistDir: true,
  generateBuildId: async () => null,
  compress: true,
  poweredByHeader: true,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Images
  images: {
    remotePatterns: [],
    localPatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 14400,
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: undefined,
    contentDispositionType: 'inline',
    unoptimized: false,
    loader: 'default',
    loaderFile: '',
    qualities: undefined,
  },

  // Rendering
  reactStrictMode: false,

  // Caching (Next.js 16)
  cacheComponents: false,
  cacheLife: {
    // Named profiles for use with cacheLife() inside 'use cache' scopes
    // example: { editorial: { stale: 600, revalidate: 3600, expire: 86400 } }
  },

  // Runtime
  serverExternalPackages: [],
  transpilePackages: [],
  bundlePagesRouterDependencies: false,

  // TypeScript
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // ESLint — REMOVED in Next.js 16
  // Use ESLint CLI directly with eslint.config.mjs

  // Turbopack
  turbopack: {
    rules: {},
    resolveAlias: {},
    resolveExtensions: [],
  },

  // Experimental
  experimental: {
    authInterrupts: false,
    staleTimes: { dynamic: 0, static: 300 },
    viewTransition: false,
    serverActions: {
      bodySizeLimit: '1mb',
      allowedOrigins: [],
    },
  },
}
```
