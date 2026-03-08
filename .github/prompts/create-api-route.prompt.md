---
name: "Create API Route"
agent: "agent"
description: "Create a Next.js API Route Handler with Zod validation and proper error handling"
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

Create a Next.js Route Handler (App Router) following the project conventions.

## Rule precedence

- Use `.github/copilot-instructions.md` as the canonical source for cross-cutting repository conventions.
- Use `.github/instructions/INDEX.md` to load directory-specific instructions before creating files.
- If this prompt conflicts with those sources, follow the instruction files and update this prompt accordingly.

## Required inputs

Ask for these if not provided:

- **Route path** (e.g. `app/api/users/route.ts`, `app/api/posts/[id]/route.ts`)
- **HTTP methods** needed (GET, POST, PUT, PATCH, DELETE)
- **Request body shape** (for POST/PUT/PATCH)
- **Response shape**
- **Is it protected?** (requires authentication via Auth.js v5)

## Rules

1. **Zod validation**: always validate request body and query params with Zod. Never trust raw input.
2. **Auth check**: for protected routes, verify session at the top before any logic.
3. **Error responses**: use consistent `{ error: string }` shape with proper HTTP status codes.
4. **No `any`**: type everything. Use `z.infer<typeof schema>` for validated data types.
5. **File name**: always `route.ts` (not `route.tsx`).
6. **Security**: parameterized queries if DB is involved. Never expose internal error details to client.

## HTTP status codes to use

- `200` — success (GET, PATCH, PUT)
- `201` — created (POST)
- `400` — Zod validation error / bad request
- `401` — unauthenticated
- `403` — unauthorized (authenticated but lacks permission)
- `404` — resource not found
- `500` — unexpected server error (never expose error details)

## Example output shape

```ts
// app/api/users/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const result = createUserSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid request", details: result.error.flatten() },
      { status: 400 },
    );
  }

  // ... business logic with result.data (fully typed)

  return NextResponse.json({ user }, { status: 201 });
}
```
