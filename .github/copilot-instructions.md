# GitHub Copilot Instructions

## Project Overview

This is a professional Next.js 16 starter template. Use it as the foundation for building production-grade web applications.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS v4
- **Package Manager**: pnpm
- **Unit Testing**: Vitest
- **E2E Testing**: Playwright
- **Authentication**: Auth.js v5 (NextAuth)
- **Validation**: Zod v4
- **State Management**: Zustand (client state)

## Project Structure

```
app/                    # Next.js App Router
  layout.tsx            # Root layout
  page.tsx              # Home page
  globals.css           # Global styles
public/                 # Static assets
.github/
  instructions/         # Copilot per-file instructions
  copilot-instructions.md
```

## Core Conventions

### General

- Always use TypeScript with strict mode — no `any`, no type assertions unless unavoidable
- Prefer named exports over default exports (except for Next.js pages/layouts/routes which require default exports)
- Use path alias `@/` for all internal imports (configured in `tsconfig.json`)
- Use `pnpm` for all package management commands
- Use `import type` for type-only imports — `import type { Foo } from './foo'` — keeps the runtime bundle clean
- Use `export type { Foo }` for type-only exports — mirrors `import type`, prevents accidental value exports
- Prefix boolean variables and props with `is`, `has`, `can`, or `should` (e.g., `isLoading`, `hasError`, `canSubmit`, `shouldRedirect`)
- No abbreviations in variable names — write `user` not `u`, `fieldMetadata` not `fm`, `event` not `e`
- Use descriptive lowercase names for generic type parameters instead of single uppercase letters — prefer `function map<item, result>(…)` over `function map<T, R>(…)`; reserve `T` only for utilities where a single-letter convention is widespread (e.g., `Array<T>`, `Promise<T>`)
- Prefix intentionally unused parameters or locals with `_` (e.g., `_event`, `_index`) — signals the omission is deliberate and satisfies `noUnusedLocals` / `noUnusedParameters` compiler checks
- Prefer string union types over TypeScript enums — e.g., `type Status = 'active' | 'inactive'` instead of `enum Status { Active, Inactive }`
- Use early returns for readability — prefer guard clauses over deeply nested conditions
- Prefer destructuring over direct property access — `const { id, name } = user` not `user.id`, `user.name`
- Prefer `readonly` and `as const` for immutable data structures
- Avoid non-null assertion operators (`!`) — use type narrowing or guards instead
- Use `Boolean(value)` instead of `!!value` for explicit boolean coercion — clarifies intent and avoids double-negation confusion
- Prefer `type` over `interface` for type definitions — use `interface` only when explicitly extending external library types or defining class contracts
- Infer types from Zod schemas using `z.infer<typeof schema>` — do not duplicate as separate interfaces
- Don't export types or interfaces that are only used within the same file
- Organize module contents top-down: place exported/public functions before internal helpers — readers see the module's public API before implementation details
- Avoid premature abstraction — duplicating code 2–3 times is fine; extract only when a stable pattern emerges
- Do not reformat code unrelated to your change — only modify lines that are strictly necessary
- Batch related edits across multiple files first, then run the build/tests once — not after each micro-change
- Clarity over cleverness: when two approaches are equivalent, always choose the simpler, more readable one
- Verify solutions work for all relevant cases and edge cases, not just the happy path
- Do not describe a solution or pattern as "best practice", "widely used", or "the standard way" without verifying it in this codebase or citing a specific authoritative source
- Prefer pure functions — when a function must mutate state, return the mutated object instead of `void` so callers can chain and reason about state
- Limit functions to 2–3 parameters maximum — if more are needed, accept a single options object instead
- **Comments**: Only write inline comments that answer _why_ code was written this way (context, background, decisions). Never write comments that describe _what_ the code does — that should be self-evident. Reserve _how_ comments for genuinely complex logic with external constraints.
- Do not delete existing comments that explain non-obvious behavior or past decisions — update them as the surrounding code changes, but preserve the context they carry

### Components

- Server Components by default — only add `"use client"` when strictly necessary (event handlers, hooks, browser APIs)
- One component per file
- Co-locate component styles and tests with the component when possible
- Use Tailwind CSS utility classes — no inline styles, no CSS modules unless needed for complex animations
- Prefer event handlers over `useEffect` for state updates — `useEffect` should be a last resort for syncing with external systems
- Use functional state updates when new state depends on previous state — `setState(prev => ({ ...prev, field: newValue }))` avoids stale closure bugs
- Prefix event handler functions with `handle` (e.g., `handleClick` for `onClick`, `handleSubmit` for `onSubmit`)
- Custom query hooks follow `use[Resource]` naming (e.g., `useUser`, `useOrders`); mutation hooks follow `use[Action]` naming (e.g., `useDeleteUser`, `useUpdateOrder`)

### File Naming

- All files use **kebab-case** (e.g., `user-card.tsx`, `use-auth.ts`, `format-date.ts`)
- Components: `kebab-case.tsx` (e.g., `user-card.tsx`)
- Hooks: `kebab-case.ts` prefixed with `use` (e.g., `use-auth.ts`)
- Utils/helpers: `kebab-case.ts` (e.g., `format-date.ts`)
- Route files: Next.js conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`)
- Test files: `*.test.ts` / `*.test.tsx` for unit, `*.spec.ts` for E2E, `*.test-d.ts` for type-level assertions

### Data Fetching

- Fetch data in Server Components whenever possible
- Use `fetch` with Next.js cache options (`cache: 'force-cache'`, `next: { revalidate }`) for server-side fetching
- Use Zustand for client-side UI state only — not for server data
- Validate all external data at boundaries with Zod

### Authentication

- Use Auth.js v5 patterns for all authentication flows
- Install with `pnpm add next-auth@beta` — package name is `next-auth` (v5 is currently beta; v4 is npm stable)
- Protect routes with edge middleware (`proxy.ts`) — this project uses `proxy.ts` instead of `middleware.ts`
- Never expose sensitive session data to the client

#### Authorization Placement Matrix

| File         | Use when                                                   | Notes                                                                      |
| ------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `proxy.ts`   | The same auth gate applies to a route group/prefix         | Prefer this for cross-cutting protection (`/dashboard/**`, `/settings/**`) |
| `page.tsx`   | Authorization depends on page-specific data or role checks | Safe location for resource-level decisions in App Router                   |
| `layout.tsx` | Never                                                      | Layout checks can be bypassed; do not put authorization here               |

### Error Handling

- Use `error.tsx` boundaries for route-level errors
- Use `not-found.tsx` for 404 handling
- Throw typed errors — avoid generic `Error` objects
- Write error messages that explain: (1) what happened, (2) why it's a problem, and (3) how to fix it — vague messages like `"Invalid input"` waste debugging time
- Keep async logic linear — avoid nested `try/catch` blocks; prefer early returns from `catch` to reduce nesting
- No floating promises — always `await` or explicitly handle every async call; never fire-and-forget

### Testing

- Write tests alongside code (TDD preferred); when fixing a bug, write the failing test first, verify it fails, then fix — a test that passes from the start proves nothing
- Unit tests with Vitest for utilities, hooks, and pure functions
- E2E tests with Playwright for user flows and critical paths
- Use `getByRole` and accessible locators in Playwright — never `getByTestId` unless no alternative
- Test behavior, not implementation — write assertions against user-observable outcomes (what renders, what events fire) rather than internal state or method calls
- Prefer `vi.spyOn` over `vi.mock` for isolating dependencies — less invasive, easier to restore
- Aim for 80%+ test coverage for new or modified code — AI excels at generating comprehensive tests
- Never commit `test.only`, `it.only`, or `describe.only` — they silently skip the rest of the suite
- Name test cases starting with "should" — e.g., `it('should return null when user not found')`
- Prefer a single top-level `describe` block per test file — nest sub-describes only when grouping genuinely different behaviors of the same unit
- Tests must be self-contained: clean up any state they create; use `afterEach` for shared cleanup logic
- One test should verify one behavior — keep `it` blocks focused and avoid asserting multiple unrelated things in a single test case
- No loops or conditionals (`for`, `if`, `switch`) inside `describe()` blocks — they break test isolation and prevent running individual tests by name
- Prefer parameterized tests (`it.each()` / `test.each()`) when asserting the same behavior across multiple inputs — avoid copying nearly-identical test blocks
- No `console.log` or `debugger` statements in tests or production code — remove before committing
- Do not write flaky tests — avoid `setTimeout` in tests; instead `await` the condition to be met
- Never remove, skip, or comment out tests to make them pass — fix the underlying code instead
- Never re-run the same failing test command without making a code change first — save and analyze the output instead of re-running
- Before writing tests, search the codebase for similar test files — follow established testing patterns already present in the repo
- Test both success and failure cases — a feature untested on failure paths is incomplete
- When updating test snapshots, review each change individually — never blindly accept all snapshot updates

### Security

- Never hardcode secrets — use environment variables
- Never print, log, or paste secret values (tokens, API keys, cookies) in chat responses, commits, or logs — this includes values _derived_ from secrets; summarize and redact; if a required secret is missing, stop and ask rather than inventing placeholder credentials
- Validate and sanitize all user input with Zod at API boundaries
- Follow OWASP guidelines — see `security-and-owasp.instructions.md`
- Use parameterized queries for any database operations

### Accessibility

- All interactive elements must be keyboard accessible
- Use semantic HTML elements — `<button>`, `<nav>`, `<main>`, etc.
- Follow WCAG 2.2 Level AA — see `a11y.instructions.md`
- Every image must have descriptive `alt` text

### Performance

- Optimize images with `next/image`
- Use `next/font` for fonts (already configured with Geist)
- Lazy load non-critical components with `dynamic()` and `React.lazy()`
- Avoid large client-side bundles — keep `"use client"` boundaries minimal

## Component-Specific Instructions

**IMPORTANT**: Before modifying any code in the directories listed below, you **MUST** first read the corresponding instruction file to understand the specific conventions, patterns, and requirements for that area.

Quick entry point: `.github/instructions/INDEX.md`.

**For AI/Copilot**: Always use the `read_file` tool to read the relevant instruction file(s) before analyzing, modifying, or creating code in these directories. This ensures adherence to project patterns and prevents architectural violations.

### Required Reading by Directory

| Directory        | Instruction File                                                                             | When to Read                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app/**`         | `.github/instructions/nextjs.instructions.md`                                                | Before modifying App Router pages, layouts, loading/error boundaries, or server components     |
| `app/api/**`     | `.github/instructions/security-and-owasp.instructions.md`                                    | Before creating or modifying API route handlers — validate all inputs, never expose raw errors |
| `app/auth/**`    | `.github/instructions/security-and-owasp.instructions.md`                                    | Before touching authentication pages or flows — session handling, CSRF, cookie attributes      |
| `components/**`  | `.github/instructions/reactjs.instructions.md` + `.github/instructions/a11y.instructions.md` | Before creating or modifying UI components — accessibility and React patterns both apply       |
| `hooks/**`       | `.github/instructions/reactjs.instructions.md`                                               | Before creating or modifying custom React hooks — rules of hooks, naming, memoization          |
| `lib/**`         | `.github/instructions/typescript-5-es2022.instructions.md`                                   | Before adding utilities, constants, or shared logic                                            |
| `lib/schemas/**` | Use `zod` skill                                                                              | Before adding or updating Zod schemas — load skill for schema patterns                         |
| `store/**`       | Use `zustand` skill                                                                          | Before modifying Zustand stores — load skill for store patterns                                |
| `*.test.ts(x)`   | `.github/instructions/nodejs-javascript-vitest.instructions.md`                              | Before writing or modifying Vitest unit tests                                                  |
| `tests/**`       | `.github/instructions/playwright-typescript.instructions.md`                                 | Before writing or modifying Playwright E2E tests                                               |
| `**/*.css`       | `.github/instructions/nextjs-tailwind.instructions.md`                                       | Before modifying styles — Tailwind v4 CSS-first config, design tokens                          |
| `**/*.md`        | `.github/instructions/markdown.instructions.md`                                              | Before writing or editing Markdown documentation                                               |
| Any code file    | `.github/instructions/performance-optimization.instructions.md`                              | Before performance-sensitive changes — rendering, caching, bundle size                         |
| Any code file    | `.github/instructions/context7.instructions.md`                                              | Loaded automatically — provides Context7 MCP lookup guidance for external docs                 |

## Boundaries

### Always do

- Read the relevant instruction file before touching any directory listed in "Component-Specific Instructions"
- Run `pnpm lint && pnpm type-check && pnpm test` before concluding any session
- Use `@/` path alias for all internal imports
- Place authorization checks in `page.tsx` or `proxy.ts` — **never in `layout.tsx`**
- Validate all user input at API boundaries with Zod
- Use named exports for all modules except Next.js file conventions (`page.tsx`, `layout.tsx`, etc.)
- Import directly from source files — not from barrel `index.ts` re-exports

### Ask first before

- Deleting or renaming files — check for imports and transitive usages first
- Adding a new dependency — discuss alternatives and bundle impact
- Making breaking changes to shared types, API routes, or exported utilities — maintain backwards compatibility by default unless explicitly instructed otherwise
- Refactoring code beyond the scope of the request
- Implementing anything that requires a database schema change
- Introducing patterns not yet established in this codebase — check `lib/`, `components/`, and `hooks/` first

### Never do

- Hardcode secrets, API keys, or credentials — always use `process.env.*`
- Use `any` in TypeScript — use proper types, `unknown`, or a Zod-parsed result
- Disable ESLint rules (`// eslint-disable`) to suppress a lint error — fix the code instead
- Add `"use client"` without a clear reason — always default to Server Components
- Skip the Session Completion Checklist before marking a task done
- Use `window`, `document`, or other browser APIs in Server Components
- Perform authorization checks in `layout.tsx` — layouts can be bypassed
- Commit `test.only`, `it.only`, or `describe.only` — they silently disable the rest of the test suite
- Rewrite or duplicate code without first searching for an existing utility — look in `lib/` before writing new helpers
- Suppress TypeScript errors with `@ts-ignore` or `@ts-expect-error` — fix the root cause instead
- Proactively create documentation files (`.md`, README) — only create docs if explicitly requested by the user
- Leave temporary files, debug scripts, or scratch files in the repository — remove them before marking a task complete
- Modify auto-generated files directly (e.g., `next-env.d.ts`, generated type files) — find and edit the source that generates them, then regenerate

## Common Pitfalls

### 1. Adding `"use client"` unnecessarily

```tsx
// ❌ Bad: "use client" just because the component accepts props
"use client";
export function UserCard({ name }: { name: string }) {
  return <div>{name}</div>;
}

// ✅ Good: Only use "use client" when hooks, events, or browser APIs are needed
export function UserCard({ name }: { name: string }) {
  return <div>{name}</div>;
}
```

### 2. Barrel imports killing tree-shaking

```typescript
// ❌ Bad: importing from a barrel re-export
import { Button, Card } from "@/components/ui";

// ✅ Good: import directly from the source file
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
```

### 3. Client-side data fetching when Server Component would suffice

```tsx
// ❌ Bad: useEffect fetch in a Client Component
"use client";
export function UserList() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []);
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}

// ✅ Good: fetch in a Server Component
export async function UserList() {
  const users = await getUsers(); // server-side
  return (
    <ul>
      {users.map((u) => (
        <li key={u.id}>{u.name}</li>
      ))}
    </ul>
  );
}
```

### 4. Auth checks in `layout.tsx`

```tsx
// ❌ Bad: layout auth can be bypassed by direct navigation / API calls
export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session) redirect("/sign-in"); // NOT reliable
  return <>{children}</>;
}

// ✅ Good: auth in page.tsx or proxy.ts (never layout.tsx)
export default async function AdminPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  return <main>...</main>;
}
```

### 5. Skipping Zod validation at API boundaries

```typescript
// ❌ Bad: trusting raw request body
export async function POST(req: Request) {
  const { email, password } = await req.json(); // unvalidated!
  await createUser(email, password);
}

// ✅ Good: parse and validate at the boundary
export async function POST(req: Request) {
  const body = CreateUserSchema.parse(await req.json());
  await createUser(body.email, body.password);
}
```

### 6. Using `any` to silence TypeScript

```typescript
// ❌ Bad: any defeats the type system
const data: any = await response.json();
console.log(data.user.email);

// ✅ Good: define a schema, parse, infer the type
const data = UserResponseSchema.parse(await response.json());
console.log(data.user.email); // fully typed
```

### 7. Generic error objects

```typescript
// ❌ Bad: unactionable error message
throw new Error("Something went wrong");

// ✅ Good: typed, descriptive error with context
throw new AppError("User not found", { userId, context: "getUser" });
// (use typed error classes from lib/errors.ts)
```

### 8. Hardcoding secrets

```typescript
// ❌ Bad: secret committed to source control
const apiKey = "sk-live-abc123";

// ✅ Good: read from environment, validate at startup
const apiKey = process.env.THIRD_PARTY_API_KEY;
if (!apiKey) throw new Error("THIRD_PARTY_API_KEY is not set");
```

## Personal Preferences

### Branching Strategy — Trunk-Based Development (TBD)

- This project uses **Trunk-Based Development** — Git Flow is NOT used
- `main` is the trunk and must always be releasable
- Prefer committing directly to `main` for small, complete changes
- If a branch is needed, keep it **short-lived** (merge within 1 day)
- Branch names: `<type>/<short-description>` (e.g. `fix/login-redirect`, `feat/user-avatar`)
- No `develop`, `release`, or `hotfix` branches
- Use feature flags for incomplete work in progress

### Language and Comments

- All code comments must be written in **English**
- Commit messages in English
- Variable names, function names, and identifiers in English

### Operating System

- All terminal commands must target **macOS** (use `open`, `pbcopy`, `brew`, etc.)
- Do not suggest Linux-only or Windows-only commands
- Use `~` for home directory, macOS paths and conventions

### Session Completion Checklist

Before ending any coding session or considering a task complete, the following commands MUST pass without errors:

```bash
pnpm lint        # ESLint — zero errors
pnpm type-check  # TypeScript type check — zero errors
pnpm test        # Vitest — all tests passing
pnpm build       # Next.js production build — successful
```

Never mark a task as done if any of these commands fail. Fix all errors before concluding.

## When Stuck

If you are unsure how to proceed during a task:

1. **Check existing patterns first** — search the codebase for similar implementations before creating new ones
2. **Do not guess behavior** — verify assumptions by reading source code, existing tests, and established patterns before drawing conclusions
3. **Run the type checker** — `pnpm type-check` often pinpoints the exact issue; fix type errors before investigating test failures — they're often the root cause
4. **If type checking keeps failing** — run `pnpm clean` to clear build caches, then re-run `pnpm type-check`
5. **Read the relevant instruction file** — check the "Component-Specific Instructions" table for the directory you're working in
6. **Propose a plan before complex changes** — for multi-file refactors or anything touching shared types, outline the approach and ask for confirmation before proceeding
7. **Don't guess at security or business rules** — if access control or domain logic is unclear, ask rather than assume
8. **When unclear how to verify a change** — ask the user how they'd like it verified before proceeding; not every change fits the standard quality gate (lint + tsc + test)
9. **Never guess CLI flags** — always check `--help` before using an unfamiliar command or flag
10. **Prefer smaller reversible changes** — break large tasks into smaller committed steps that can be reviewed and rolled back independently
11. **Stop after 2–3 failed attempts** — if the same fix fails repeatedly, document what you tried and ask rather than continuing to guess

> If you are about to change 5+ files, touch shared types or API contracts, or make a breaking change — stop and propose a plan first.

## Task Completion Guidelines

These define the expected artifacts for each task type. Use judgment — trivial fixes (typos, one-liners) may not need all steps.

### Bug Fixes

1. **Tests**: Add a failing test that reproduces the bug (regression guard)
2. **Implementation**: Fix the root cause — not just the symptom
3. **Verification**: Run the quality gate to confirm no regressions

### New Features

1. **Implementation**: Build the feature following project conventions
2. **Unit tests**: Cover new logic with Vitest — aim for 80%+
3. **E2E test** (if user-facing): Add or update a Playwright test
4. **Documentation**: Update relevant comments or docs for public APIs

### Refactoring / Internal Changes

- Write tests for any changed behavior
- No documentation needed for internal-only changes
- Do not change public APIs without updating all callers

### When to Deviate

These are guidelines, not rigid rules. Adjust based on scope and context. When uncertain, ask.

## Knowledge Reminders

> The AI training data frequently contains outdated patterns for the versions used in this project. Prefer the code patterns already present in this repo over your general knowledge when they conflict.

### Tailwind CSS v4

- **Config**: No `tailwind.config.js` — configuration is CSS-first, inside `globals.css`
- **Directives**: Use `@import "tailwindcss"` (NOT the three `@tailwind base/components/utilities` directives from v3)
- **Plugins**: Use `@plugin` directive in CSS, not `plugins: []` in config

### Auth.js v5

- **Install**: `pnpm add next-auth@beta` — the npm package is still `next-auth`, version 5 is in beta
- **Server session**: Call `auth()` from `@/lib/auth` in Server Components and API routes
- **Route handler**: `GET` and `POST` exported from `app/api/auth/[...nextauth]/route.ts`
- **Middleware**: Use `auth` as middleware exported from `auth.ts` at root — do NOT use `withAuth` from v4
- **Edge Runtime**: `auth()` cannot be called in Edge Runtime — use `getToken()` from `next-auth/jwt` in `proxy.ts`

### Next.js 16

- **`'use cache'`**: This is a Next.js 16 directive for Cache Components — different from React's `cache()` import
- **`proxy.ts`**: This project uses `proxy.ts` at root **instead of `middleware.ts`** for edge middleware — always use `proxy.ts`
- **No `pages/` directory**: This project uses App Router only — never suggest Pages Router patterns

### Zod v4

- **Import**: `import { z } from "zod"` — same as v3
- **Breaking changes from v3**: `z.string().email()` still works; check release notes before using unfamiliar v3 patterns

### React 19

- **New hooks**: `useActionState`, `useFormStatus`, `useOptimistic` are available directly from `react`
- **`use()` hook**: Can unwrap Promises and Context — useful in Server Components
- **No `React.FC`**: Just write `function MyComponent({ prop }: { prop: string })` — no type annotation needed for the component itself

## VS Code Agent Hooks (Preview)

Hooks execute shell commands at specific agent lifecycle points. Store hook configs in `.github/hooks/*.json` — they are committed to the repo and apply for all team members. VS Code also reads `.claude/settings.json` and `~/.claude/settings.json` for Claude Code compatibility.

| Event          | Use for                                                     |
| -------------- | ----------------------------------------------------------- |
| `PostToolUse`  | Auto-run `pnpm lint` and `pnpm type-check` after file edits |
| `PreToolUse`   | Block destructive operations (`rm -rf`, `DROP TABLE`)       |
| `SessionStart` | Inject branch/Node version context into every session       |
| `SessionEnd`   | Require full quality gate to pass before the agent finishes |

Example — auto-lint after any file edit (`.github/hooks/quality.json`):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "type": "command",
        "command": "pnpm lint",
        "timeout": 30
      }
    ]
  }
}
```

Generate hooks with AI: type `/create-hook` in Chat and describe the automation. Hooks can be diagnosed via **Configure Chat → Diagnostics** in VS Code.

> Hooks execute with full shell permissions — always review hook configs before enabling, especially in shared repos.

## Agent Routing (Default Behaviour)

Routing logic and the full intent-to-agent decision table live in `.github/agents/router.agent.md`. Use the **Router** agent as the default entry point — it reads your intent and delegates to the appropriate specialist automatically.

Available specialist agents: **Feature Builder**, **Debug**, **Planner**, **Code Reviewer**, **Test Generator**, **Architect**, **ADR Generator**, **GitHub Actions**, **PRD Creator**.

If already inside a specialist agent context, skip routing and proceed directly with the work.

## Learnings

_(Updated dynamically. When the user says `learn!`, extract the learning from the recent conversation and add it here as a bullet point under the most relevant section. Keep each entry brief — 1–2 sentences, actionable, generalizable.)_
