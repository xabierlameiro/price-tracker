---
name: "Create Component"
agent: "agent"
description: "Scaffold a new React Server Component following project conventions"
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

Create a new React component following the project conventions for this Next.js 16 starter template.

## Rule precedence

- Use `.github/copilot-instructions.md` as the canonical source for cross-cutting repository conventions.
- Use `.github/instructions/INDEX.md` to load directory-specific instructions before creating files.
- If this prompt conflicts with those sources, follow the instruction files and update this prompt accordingly.

## Required inputs

Ask for these if not provided:

- **Component name** (PascalCase, e.g. `UserCard`)
- **Location** (e.g. `app/components/`, `app/(dashboard)/components/`)
- **Is it interactive?** (needs `"use client"`? e.g. has onClick, useState, useEffect)
- **Does it need props?** Describe them.

## Rules to follow

1. **File name**: kebab-case matching the component name (e.g. `user-card.tsx`)
2. **Default to Server Component** — only add `"use client"` if the component truly needs interactivity (event handlers, hooks, browser APIs). Justify it in a comment.
3. **TypeScript**: define a `Props` interface or type. Never use `any`.
4. **Styling**: Tailwind CSS utility classes only — no inline styles, no CSS modules.
5. **Accessibility**: use semantic HTML (`<article>`, `<section>`, `<button>`, etc.). Every image needs a descriptive `alt`. Interactive elements must be keyboard accessible.
6. **Imports**: use `@/` alias for all internal imports.
7. **Export**: named export (not default), except if it's a Next.js route file.

## Output structure

1. The component file at the correct path
2. A basic unit test file at `<same-folder>/<component-name>.test.tsx` using Vitest + `@testing-library/react`
3. Brief explanation of any non-obvious decisions

## Example output shape

```tsx
// app/components/user-card.tsx

type Props = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export function UserCard({ name, email, avatarUrl }: Props) {
  return (
    <article className="rounded-lg border border-border p-4">
      {/* ... */}
    </article>
  );
}
```
