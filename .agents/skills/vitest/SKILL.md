---
name: vitest
description: Vitest fast unit testing framework powered by Vite with Jest-compatible API. Use when writing tests, mocking, configuring coverage, or working with test filtering and fixtures.
metadata:
  author: Anthony Fu
  version: "2026.1.28"
  source: Generated from https://github.com/vitest-dev/vitest, scripts located at https://github.com/antfu/skills
---

Vitest is a next-generation testing framework powered by Vite. It provides a Jest-compatible API with native ESM, TypeScript, and JSX support out of the box. Vitest shares the same config, transformers, resolvers, and plugins with your Vite app.

**Key Features:**

- Vite-native: Uses Vite's transformation pipeline for fast HMR-like test updates
- Jest-compatible: Drop-in replacement for most Jest test suites
- Smart watch mode: Only reruns affected tests based on module graph
- Native ESM, TypeScript, JSX support without configuration
- Multi-threaded workers for parallel test execution
- Built-in coverage via V8 or Istanbul
- Snapshot testing, mocking, and spy utilities

> The skill is based on Vitest 3.x, generated at 2026-01-28.

## Core

| Topic         | Description                                                     | Reference                                    |
| ------------- | --------------------------------------------------------------- | -------------------------------------------- |
| Configuration | Vitest and Vite config integration, defineConfig usage          | [core-config](references/core-config.md)     |
| CLI           | Command line interface, commands and options                    | [core-cli](references/core-cli.md)           |
| Test API      | test/it function, modifiers like skip, only, concurrent         | [core-test-api](references/core-test-api.md) |
| Describe API  | describe/suite for grouping tests and nested suites             | [core-describe](references/core-describe.md) |
| Expect API    | Assertions with toBe, toEqual, matchers and asymmetric matchers | [core-expect](references/core-expect.md)     |
| Hooks         | beforeEach, afterEach, beforeAll, afterAll, aroundEach          | [core-hooks](references/core-hooks.md)       |

## Features

| Topic        | Description                                                    | Reference                                                  |
| ------------ | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Mocking      | Mock functions, modules, timers, dates with vi utilities       | [features-mocking](references/features-mocking.md)         |
| Snapshots    | Snapshot testing with toMatchSnapshot and inline snapshots     | [features-snapshots](references/features-snapshots.md)     |
| Coverage     | Code coverage with V8 or Istanbul providers                    | [features-coverage](references/features-coverage.md)       |
| Test Context | Test fixtures, context.expect, test.extend for custom fixtures | [features-context](references/features-context.md)         |
| Concurrency  | Concurrent tests, parallel execution, sharding                 | [features-concurrency](references/features-concurrency.md) |
| Filtering    | Filter tests by name, file patterns, tags                      | [features-filtering](references/features-filtering.md)     |

## Advanced

| Topic        | Description                                             | Reference                                                    |
| ------------ | ------------------------------------------------------- | ------------------------------------------------------------ |
| Vi Utilities | vi helper: mock, spyOn, fake timers, hoisted, waitFor   | [advanced-vi](references/advanced-vi.md)                     |
| Environments | Test environments: node, jsdom, happy-dom, custom       | [advanced-environments](references/advanced-environments.md) |
| Type Testing | Type-level testing with expectTypeOf and assertType     | [advanced-type-testing](references/advanced-type-testing.md) |
| Projects     | Multi-project workspaces, different configs per project | [advanced-projects](references/advanced-projects.md)         |

---

## When to Use

Invoke this skill when:

- Writing unit tests for utilities, hooks, or pure functions in `hooks/`, `lib/`, or `store/`
- Mocking a module, timer, or external dependency in a test
- Setting up or updating `vitest.config.ts`
- A test is failing unexpectedly and you need to debug
- Adding test coverage to a new file (TDD or post-implementation)

**Don't use for E2E tests** — those go in `tests/*.spec.ts` with Playwright.

---

## Quick Start (project conventions)

1. Create the test file alongside the source: `hooks/use-debounce.test.ts` ↔ `hooks/use-debounce.ts`
2. Import from vitest (not jest): `import { describe, it, expect, vi } from 'vitest'`
3. Use `renderHook` from `@testing-library/react` for hooks
4. Use `vi.useFakeTimers()` in `beforeEach` for time-dependent tests; restore in `afterEach`
5. Run: `pnpm test` (watch mode: `pnpm test -- --watch`)

---

## BAD / GOOD Patterns

### Test naming — describe what it does, not how

```ts
// BAD — test name doesn't describe expected behaviour
it('test1', () => { ... })
it('should work', () => { ... })

// GOOD — named like a specification (from hooks/use-debounce.test.ts)
it('calls the callback after the delay elapses', () => { ... })
it('debounces multiple rapid calls — only the last fires', () => { ... })
```

### Timers — fake timers instead of real waits

```ts
// BAD — real setTimeout makes tests slow and brittle
it("debounces correctly", async () => {
  const cb = vi.fn();
  triggerDebounce(cb, 300);
  await new Promise((r) => setTimeout(r, 350)); // ❌ slow, 350ms blocked
  expect(cb).toHaveBeenCalled();
});

// GOOD — fake timers advance instantly (from hooks/use-debounce.test.ts)
beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.restoreAllMocks();
});

it("calls the callback after the delay elapses", () => {
  const callback = vi.fn();
  const { result } = renderHook(() => useDebounce(callback, 300));
  act(() => {
    result.current("test");
    vi.advanceTimersByTime(300); // ✅ instant, no real wait
  });
  expect(callback).toHaveBeenCalledOnce();
});
```

### Module mocking — mock at the boundary, not deep inside

```ts
// BAD — mocking a private implementation detail that may change
vi.mock("@/lib/utils", () => ({ formatDate: vi.fn() }));
// (if formatDate is pure, just call it — no mock needed)

// GOOD — mock external/IO boundaries (databases, fetch, Auth.js)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "1", name: "Test" } }),
}));
```

### Assertions — be specific

```ts
// BAD — toBeTruthy accepts '', 0, and [] — too loose
expect(result).toBeTruthy();

// GOOD — assert exact value or shape
expect(result).toBe("expected string");
expect(result).toEqual({ id: "1", name: "Test" });
expect(callback).toHaveBeenCalledOnce();
expect(callback).toHaveBeenCalledWith("third");
```

---

## Checklist

Before committing tests:

- [ ] Test file is co-located with source (`*.test.ts` beside the source file)
- [ ] Imports use `vitest` not `jest`
- [ ] Fake timers used where real timers would make tests slow
- [ ] `vi.restoreAllMocks()` in `afterEach` when using fakes
- [ ] No `setTimeout(..., N)` or real async waits inside tests
- [ ] Assertions are specific (`toHaveBeenCalledOnce`, `toBe`, `toEqual`) not `toBeTruthy`
- [ ] All tests pass: `pnpm test`
