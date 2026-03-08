---
name: "Generate Tests"
agent: "agent"
description: "Generate comprehensive Vitest unit tests and/or Playwright E2E tests for existing code"
tools:
  [
    vscode,
    execute,
    read,
    agent,
    edit,
    search,
    web,
    browser,
    "io.github.upstash/context7/*",
    "shadcn/*",
    "playwright/*",
    "next-devtools/*",
    "github/*",
    vscode.mermaid-chat-features/renderMermaidDiagram,
    todo,
  ]
---

Generate tests for the specified code. Read the target file before generating anything.

## Rule precedence

- Use `.github/copilot-instructions.md` as the canonical source for cross-cutting repository conventions.
- Use `.github/instructions/INDEX.md` plus test-specific instruction files for framework details.
- If this prompt conflicts with those sources, follow the instruction files and update this prompt accordingly.

## Required inputs

Ask for these if not provided:

- **Target file or feature** to test
- **Test type**: unit (Vitest), E2E (Playwright), or both?
- **Coverage goal**: happy path only, or include edge cases and error scenarios?

## Unit tests (Vitest)

### Rules

1. File location: co-located with the source — `<name>.test.ts` or `<name>.test.tsx`
2. Use `describe` blocks to group by function/component
3. Test names: `'should <expected behavior> when <condition>'`
4. Structure: Arrange → Act → Assert
5. Mock only external dependencies (fetch, DB, auth) — never mock the unit under test
6. Use `vi.mock()` for module mocking, `vi.spyOn()` for method spying
7. For React components: use `@testing-library/react` with accessible queries (`getByRole`, `getByLabelText`, `getByText`)
8. Cover: happy path, edge cases (empty/null/undefined), error cases, boundary values

### Example

```ts
import { describe, it, expect, vi } from "vitest";

describe("calculateDiscount", () => {
  it("should apply 15% discount when order total exceeds threshold", () => {
    const result = calculateDiscount(150, 100);
    expect(result).toBe(15);
  });

  it("should return 0 when item price is 0", () => {
    const result = calculateDiscount(150, 0);
    expect(result).toBe(0);
  });
});
```

## E2E tests (Playwright)

### Rules

1. File location: `tests/<feature>.spec.ts`
2. Use `test.describe` blocks per feature
3. Use `test.beforeEach` for common setup (navigation)
4. **Locators**: `getByRole`, `getByLabel`, `getByText` — never `getByTestId` unless no alternative
5. Use `test.step()` to group related interactions
6. **Assertions**: web-first (`await expect(locator).toBeVisible()`) — no hard waits
7. Use `toMatchAriaSnapshot` for structure verification

### Example

```ts
import { test, expect } from "@playwright/test";

test.describe("User Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should sign in with valid credentials", async ({ page }) => {
    await test.step("Fill credentials", async () => {
      await page.getByLabel("Email").fill("user@example.com");
      await page.getByLabel("Password").fill("password123");
      await page.getByRole("button", { name: "Sign in" }).click();
    });

    await test.step("Verify redirect to dashboard", async () => {
      await expect(page).toHaveURL("/dashboard");
      await expect(
        page.getByRole("heading", { name: "Dashboard" }),
      ).toBeVisible();
    });
  });
});
```

## After generating

Run the tests and fix any failures:

```bash
pnpm test        # for unit tests
npx playwright test --project=chromium  # for E2E
```
