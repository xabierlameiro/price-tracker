---
name: nextjs-config
description: >
  Next.js 16 next.config.ts/js complete options reference. Use when configuring Next.js:
  routing (basePath, redirects, rewrites, headers), build output (output, distDir), image
  optimization (remotePatterns, deviceSizes, formats), top-level caching (cacheComponents,
  cacheLife), experimental features (authInterrupts, staleTimes, viewTransition), turbopack,
  server packages, TypeScript/ESLint config. Trigger on any next.config question or when
  setting up Next.js project configuration.
  See references/next-config-options.md for exhaustive per-option details with all sub-options.
---

# Next.js 16 — `next.config.ts` Complete Reference

> All options target **Next.js 16 / App Router**. TypeScript config (`next.config.ts`) is recommended.

## Config File Setup

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // options here
};

export default nextConfig;
```

```js
// next.config.js (CommonJS)
/** @type {import('next').NextConfig} */
const nextConfig = {};
module.exports = nextConfig;
```

---

## Routing

### `basePath`

```ts
basePath: "/docs";
// All routes and Link hrefs are automatically prefixed
// Cannot be changed at runtime — baked into client bundles
```

### `trailingSlash`

```ts
trailingSlash: true;
// /about → /about/ (adds trailing slash)
// false (default) → /about/index.html redirects to /about
```

### `assetPrefix`

```ts
assetPrefix: "https://cdn.example.com";
// Prefix for static asset URLs (_next/static/...)
// Does NOT prefix public/ directory files
```

### `skipTrailingSlashRedirect`

```ts
skipTrailingSlashRedirect: true;
// Disables the built-in redirect for trailing slashes
// Useful when you handle trailing slashes manually in proxy.ts
```

### `skipProxyUrlNormalize`

> **Next.js 16**: Previously `skipMiddlewareUrlNormalize`.

```ts
skipProxyUrlNormalize: true;
// Disables URL normalization for direct URL visits vs client-nav
// Allows proxy.ts to see the original URL without normalization
```

---

## HTTP Routing — `headers()`, `redirects()`, `rewrites()`

See **`references/next-config-options.md`** for full matcher syntax with `has`/`missing`.

### `headers()`

```ts
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ]
}
```

| Field      | Type                               | Description                                            |
| ---------- | ---------------------------------- | ------------------------------------------------------ |
| `source`   | `string`                           | Path pattern (supports `:param`, `:param*`, `:param?`) |
| `headers`  | `{ key: string; value: string }[]` | Headers to add                                         |
| `has`      | `RouteHas[]`                       | Match only if conditions present                       |
| `missing`  | `RouteHas[]`                       | Match only if conditions absent                        |
| `basePath` | `false`                            | Opt out of basePath prefix                             |
| `locale`   | `false`                            | Opt out of locale prefix                               |

### `redirects()`

```ts
async redirects() {
  return [
    { source: '/old', destination: '/new', permanent: true },  // 308
    { source: '/temp', destination: '/new', permanent: false }, // 307
  ]
}
```

| Field         | Type         | Default | Description                         |
| ------------- | ------------ | ------- | ----------------------------------- |
| `source`      | `string`     | —       | Incoming path pattern               |
| `destination` | `string`     | —       | Redirect target                     |
| `permanent`   | `boolean`    | —       | `true` → 308, `false` → 307         |
| `statusCode`  | `number`     | —       | Custom code (overrides `permanent`) |
| `has`         | `RouteHas[]` | —       | Conditional matching                |
| `missing`     | `RouteHas[]` | —       | Conditional absence matching        |
| `basePath`    | `false`      | —       | Opt out of basePath prefix          |

### `rewrites()`

```ts
async rewrites() {
  return {
    beforeFiles: [],  // checked before filesystem + pages
    afterFiles: [],   // checked after filesystem, before 404
    fallback: [],     // checked after filesystem + pages, before 404
  }
  // OR return a flat array (treated as afterFiles)
}
```

---

## Build

### `distDir`

```ts
distDir: ".next"; // default
distDir: "build"; // custom output directory
```

### `output`

```ts
output: "standalone"; // Self-contained server (includes only needed node_modules)
output: "export"; // Static HTML export (no server required)
// undefined (default) → standard server mode
```

### `cleanDistDir`

```ts
cleanDistDir: true; // default — clears distDir on each build
cleanDistDir: false; // keep previous build artifacts
```

### `generateBuildId`

```ts
generateBuildId: async () => {
  return process.env.GIT_COMMIT_SHA ?? "local";
};
```

### `compress`

```ts
compress: true; // default — enables gzip compression for SSR responses
compress: false; // disable if reverse proxy handles compression (nginx, Cloudflare)
```

### `poweredByHeader`

```ts
poweredByHeader: false; // removes X-Powered-By: Next.js header
```

### `pageExtensions`

```ts
pageExtensions: ["tsx", "ts", "jsx", "js"]; // default
pageExtensions: ["page.tsx", "page.ts"]; // require .page suffix
```

---

## Images

```ts
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 's3.amazonaws.com',
      port: '',
      pathname: '/my-bucket/**',
      search: '',
    },
  ],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 14400,  // 4 hours (changed from 60s in Next.js 16)
  dangerouslyAllowSVG: false,
  contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  contentDispositionType: 'inline',  // or 'attachment'
  unoptimized: false,
  loader: 'default',   // or 'cloudinary', 'imgix', 'akamai', 'custom'
  loaderFile: './my-loader.ts',  // required when loader: 'custom'
  qualities: [25, 50, 75],  // allowed quality values
  localPatterns: [
    { pathname: '/assets/**', search: '' },
  ],
}
```

| Option                   | Type              | Default                                  | Description                                     |
| ------------------------ | ----------------- | ---------------------------------------- | ----------------------------------------------- |
| `remotePatterns`         | `RemotePattern[]` | `[]`                                     | Allowlisted remote image sources                |
| `localPatterns`          | `LocalPattern[]`  | —                                        | Restrict local image paths                      |
| `deviceSizes`            | `number[]`        | `[640,750,828,1080,1200,1920,2048,3840]` | Breakpoints for full-width images               |
| `imageSizes`             | `number[]`        | `[16,32,48,64,96,128,256,384]`           | Sizes for partial-width images                  |
| `formats`                | `string[]`        | `['image/avif', 'image/webp']`           | Accepted format order                           |
| `minimumCacheTTL`        | `number`          | `14400`                                  | Seconds to cache optimized images               |
| `dangerouslyAllowSVG`    | `boolean`         | `false`                                  | Allow SVG optimization (XSS risk)               |
| `contentSecurityPolicy`  | `string`          | —                                        | CSP for SVG responses                           |
| `contentDispositionType` | `string`          | `'inline'`                               | Content-Disposition header                      |
| `unoptimized`            | `boolean`         | `false`                                  | Bypass optimization pipeline                    |
| `loader`                 | `string`          | `'default'`                              | Custom image loader                             |
| `loaderFile`             | `string`          | —                                        | Path to custom loader (when `loader: 'custom'`) |
| `qualities`              | `number[]`        | —                                        | Restrict allowed quality values                 |

---

## Rendering

### `reactStrictMode`

```ts
reactStrictMode: true; // Enables React's development-mode double-invoking checks
```

---

## Experimental Features

### `cacheComponents` (Next.js 16)

```ts
cacheComponents: true;
// Replaces experimental.dynamicIO from Next.js 15
// Enables automatic caching of React components
// Unlocks the 'use cache' directive
```

### `cacheLife` (Next.js 16)

Define named `cacheLife` profiles for use with the `cacheLife()` function inside `'use cache'` scopes.

```ts
cacheLife: {
  editorial: {
    stale: 600,        // seconds — serve from client cache (min 30s enforced)
    revalidate: 3600,  // seconds — background revalidation on server
    expire: 86400,     // seconds — hard expiry; never serve after this
  },
  realtime: { stale: 30, revalidate: 10, expire: 300 },
}
```

> Built-in profiles: `'default'`, `'seconds'`, `'minutes'`, `'hours'`, `'days'`, `'weeks'`, `'max'`.
> Custom profiles extend the built-in set and can be referenced by name: `cacheLife('editorial')`.

### `experimental.authInterrupts`

```ts
experimental: {
  authInterrupts: true,
  // Enables forbidden() and unauthorized() functions in Server Components/Actions
}
```

### `experimental.staleTimes`

```ts
experimental: {
  staleTimes: {
    dynamic: 30,    // seconds — cache for non-prefetched pages (default: 0)
    static: 180,    // seconds — cache for prefetched/static pages (default: 300)
  },
}
```

### `experimental.viewTransition`

```ts
experimental: {
  viewTransition: true,
  // Enables React View Transitions API integration
}
```

### `experimental.serverActions`

```ts
experimental: {
  serverActions: {
    bodySizeLimit: '2mb',   // default '1mb'
    allowedOrigins: ['my-proxy.com'],  // for CSRF protection
  },
}
```

---

## Turbopack

```ts
turbopack: {
  rules: {
    '*.svg': {
      loaders: ['@svgr/webpack'],
      as: '*.js',
    },
    '*.mdx': {
      loaders: ['./my-mdx-loader.js'],
      as: '*.js',
    },
  },
  resolveAlias: {
    underscore: 'lodash',
    mocha: { browser: 'mocha/browser-entry.js' },
  },
  resolveExtensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  moduleIdStrategy: 'deterministic',  // or 'named'
  treeShaking: true,
  memoryLimit: 4 * 1024,  // MB
},
```

| Option              | Type                                            | Description                                      |
| ------------------- | ----------------------------------------------- | ------------------------------------------------ |
| `rules`             | `Record<string, TurboRule>`                     | Custom loader rules for file patterns            |
| `resolveAlias`      | `Record<string, string \| { browser: string }>` | Module aliases                                   |
| `resolveExtensions` | `string[]`                                      | File extensions to resolve (overwrites defaults) |
| `moduleIdStrategy`  | `'deterministic' \| 'named'`                    | Module ID generation                             |
| `treeShaking`       | `boolean`                                       | Enable/disable tree shaking                      |
| `memoryLimit`       | `number`                                        | Memory limit in MB                               |

> **Note**: Turbopack is used by `next dev --turbopack` (default in Next.js 16) and `next build --turbopack` (stable from 16.2+). Does not apply to webpack builds.

---

## Runtime & Packages

### `serverExternalPackages`

```ts
serverExternalPackages: ["@prisma/client", "bcrypt", "sharp"];
// Excludes packages from Server Component bundling
// Must be used for native modules or packages with binary dependencies
```

### `transpilePackages`

```ts
transpilePackages: ["@acme/ui", "some-esm-only-package"];
// Force transpilation of packages from node_modules
// Useful for monorepo packages and ESM-only third-party packages
```

### `bundlePagesRouterDependencies`

```ts
bundlePagesRouterDependencies: true;
// Bundle node_modules for Pages Router (like serverComponentsExternalPackages inverse)
```

---

## TypeScript

```ts
typescript: {
  ignoreBuildErrors: false,  // default; true → skip type-check during build
  tsconfigPath: './tsconfig.json',  // custom tsconfig path
}
```

> Use `ignoreBuildErrors: true` only in CI where you run `tsc` separately. Never in production without explicit type validation.

## ESLint

> **Next.js 16**: The `eslint` config option has been **removed** from `next.config.js`. Use the ESLint CLI directly (`eslint .`) with an `eslint.config.mjs` file. Run `pnpm dlx @next/codemod@canary next-lint-to-eslint-cli .` to migrate automatically.

```bash
# Replaced by direct ESLint CLI usage
# eslint: { ignoreDuringBuilds, dirs } — REMOVED
```

---

## Testing Config with `unstable_getResponseFromNextConfig`

```ts
import {
  getRedirectUrl,
  unstable_getResponseFromNextConfig,
} from "next/experimental/testing/server";

const response = await unstable_getResponseFromNextConfig({
  url: "https://example.com/test",
  nextConfig: {
    async redirects() {
      return [{ source: "/test", destination: "/new", permanent: false }];
    },
  },
});
// response.status === 307
// getRedirectUrl(response) === 'https://example.com/new'
```

---

## Quick Reference

| Option                         | Category   | Notes                                               |
| ------------------------------ | ---------- | --------------------------------------------------- |
| `basePath`                     | Routing    | Build-time only                                     |
| `trailingSlash`                | Routing    | Affects all routes                                  |
| `assetPrefix`                  | Routing    | CDN prefix for static assets                        |
| `headers()`                    | Routing    | Custom response headers                             |
| `redirects()`                  | Routing    | 307/308 redirects                                   |
| `rewrites()`                   | Routing    | URL rewrites (no redirect)                          |
| `output`                       | Build      | `'standalone'` / `'export'`                         |
| `distDir`                      | Build      | Build output directory                              |
| `compress`                     | Build      | gzip for SSR (disable for proxy)                    |
| `poweredByHeader`              | Build      | Remove `X-Powered-By` header                        |
| `images`                       | Assets     | Full optimization config                            |
| `cacheComponents`              | Rendering  | Next.js 16 (replaces `dynamicIO`)                   |
| `reactStrictMode`              | Rendering  | Strict mode checks                                  |
| `experimental.authInterrupts`  | Auth       | Enables `forbidden()`/`unauthorized()`              |
| `experimental.staleTimes`      | Cache      | Router cache TTL (dynamic/static)                   |
| `experimental.viewTransition`  | UX         | View Transitions API                                |
| `turbopack`                    | Build      | Turbopack-specific configuration                    |
| `serverExternalPackages`       | Runtime    | Exclude from server bundle                          |
| `transpilePackages`            | Runtime    | Force transpile node_modules                        |
| `typescript.ignoreBuildErrors` | TypeScript | Skip build-time type-check                          |
| ~~`eslint`~~                   | ESLint     | **Removed in Next.js 16** — use ESLint CLI directly |

---

## See Also

- `references/next-config-options.md` — Exhaustive sub-option details, `has`/`missing` matcher syntax, Turbopack loader rules reference
- `nextjs-directives` skill — `'use cache'`, `'use client'`, `'use server'` directives
- `nextjs-components` skill — `<Image>`, `<Link>`, `<Script>` components
