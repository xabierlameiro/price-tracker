---
description: "Defines how to capture and persist learnings from conversations into instruction files."
applyTo: "**"
---

# Learnings Protocol

## The `learn!` Command

When the user says **`learn!`**, you must:

1. Identify the key insight from the recent conversation
2. Determine which instruction file is the most appropriate home for the learning (e.g., `nextjs.instructions.md`, `a11y.instructions.md`, `security-and-owasp.instructions.md`, or `copilot-instructions.md`)
3. Append a bullet point to that file's `## Learnings` section (create the section if missing)
4. Confirm to the user: "Learned: [one-sentence summary] → saved to [file]"

## Format for Learning Entries

Each learning must be:

- **Brief** — 1–2 sentences maximum
- **Actionable** — tells you what to do (or avoid) in a specific situation
- **Generalizable** — applies beyond the single conversation that produced it
- **Categorized** — placed in the most relevant instruction file, not always `copilot-instructions.md`

```
- [Context / condition]: [what to do or avoid]. [Why, if not obvious].
```

**Good examples:**

- When using `next/image` with external URLs, always add the domain to `remotePatterns` in `next.config.ts` — forgetting this causes a runtime error in production.
- Avoid `aria-label` that duplicates the visible text exactly — assistive technology reads both and creates redundancy.
- Auth.js v5 `auth()` cannot be called inside Edge Runtime — use `getToken()` from `next-auth/jwt` for middleware.

**Bad examples (too vague or non-actionable):**

- ~~"Next.js is good"~~
- ~~"Be careful with TypeScript"~~

## Which File to Choose

| Topic                                          | Target file                                |
| ---------------------------------------------- | ------------------------------------------ |
| Next.js App Router, Server Components, caching | `nextjs.instructions.md`                   |
| Accessibility, ARIA, keyboard                  | `a11y.instructions.md`                     |
| Security, OWASP, auth                          | `security-and-owasp.instructions.md`       |
| TypeScript types, generics, strict mode        | `typescript-5-es2022.instructions.md`      |
| Tailwind, design tokens, CSS                   | `nextjs-tailwind.instructions.md`          |
| React patterns, components, hooks              | `reactjs.instructions.md`                  |
| Vitest, unit tests                             | `nodejs-javascript-vitest.instructions.md` |
| Playwright, E2E tests                          | `playwright-typescript.instructions.md`    |
| Project conventions, branching, naming         | `copilot-instructions.md`                  |
| Performance                                    | `performance-optimization.instructions.md` |

## Learnings
