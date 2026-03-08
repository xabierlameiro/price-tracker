---
name: "Create Schema"
agent: "agent"
description: "Create a Zod schema with full type inference and validation utilities"
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

Create a Zod schema for the described data structure, following the project conventions.

## Rule precedence

- Use `.github/copilot-instructions.md` as the canonical source for cross-cutting repository conventions.
- Use `.github/instructions/INDEX.md` to load directory-specific instructions before creating files.
- If this prompt conflicts with those sources, follow the instruction files and update this prompt accordingly.

## Required inputs

Ask for these if not provided:

- **Schema name and purpose** (e.g. "user registration form", "API response from /api/products")
- **Fields and their types/constraints**
- **Is this for a form, API request body, or API response?**
- **Are there conditional fields** (e.g. field B is required only if field A is true)?

## Rules

1. **File location**: `lib/schemas/<name>.schema.ts` — kebab-case
2. **Always export**: the schema AND its inferred TypeScript type via `z.infer<>`
3. **No custom error messages for obvious validations** — Zod defaults are clear enough. Add messages only for business-specific rules.
4. **Use `safeParse`** (not `parse`) at call sites — never let Zod throw uncaught.
5. **For forms**: use `.transform()` to normalize data (trim strings, lowercase emails) — but only after validation.
6. **Avoid `z.any()` and `z.unknown()` as final types** — narrow them.
7. **For optional fields**: prefer `z.string().optional()` over `z.string().nullable()` unless the data can truly be `null`.

## Common patterns

```ts
import { z } from "zod";

// Form schema with transformation
export const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100).trim(),
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(8).max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// API response schema
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().nonnegative(),
  category: z.enum(["electronics", "clothing", "food"]),
  tags: z.array(z.string()),
  createdAt: z.string().datetime(),
});

export type Product = z.infer<typeof productSchema>;

// Reusable at API boundary
export function parseProduct(data: unknown): Product {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid product data: ${result.error.message}`);
  }
  return result.data;
}
```

## Also consider

- If this is a form schema, export a `<FormName>FormValues` type too
- If this is an API response, create a collection schema: `export const productsSchema = z.array(productSchema)`
- For paginated responses: wrap in `z.object({ data: z.array(itemSchema), total: z.number(), page: z.number() })`
