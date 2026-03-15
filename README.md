# Price Tracker

A full-stack web application that tracks product prices across online stores, built with Next.js 16, Prisma, and Cheerio.

[![CI](https://github.com/xabierlameiro/price-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/xabierlameiro/price-tracker/actions/workflows/ci.yml)

## Features

- 🔍 Track product prices from multiple online stores
- 📈 Price history charts with Recharts
- 🔔 Price drop alerts
- 🔒 User authentication with Auth.js
- 📊 Dashboard with price trends

## Stack

| Layer           | Choice                        |
| --------------- | ----------------------------- |
| Framework       | Next.js 16.1.6 (App Router)   |
| Language        | TypeScript 5 (strict)         |
| Database        | Prisma ORM                    |
| Auth            | Auth.js v5                    |
| Charts          | Recharts                      |
| Scraping        | Cheerio                       |
| Validation      | Zod v4                        |
| State           | Zustand                       |
| Testing         | Vitest + Playwright           |
| Package manager | pnpm                          |
| Deployment      | Vercel                        |

## Getting started

```bash
git clone https://github.com/xabierlameiro/price-tracker.git
cd price-tracker
npm install -g pnpm
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

## Scripts

| Script            | Description                  |
| ----------------- | ---------------------------- |
| `pnpm dev`        | Start development server     |
| `pnpm build`      | Production build             |
| `pnpm test`       | Vitest unit tests            |
| `pnpm test:e2e`   | Playwright E2E tests         |
| `pnpm lint`       | ESLint                       |
| `pnpm type-check` | TypeScript type check        |

## License

[MIT](./LICENSE) — © 2026 Xabier Lameiro
