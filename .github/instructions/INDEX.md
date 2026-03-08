---
description: "Index of instruction files and when to read each one"
applyTo: "**"
---

## Instructions Index

Use this file as the entry point to quickly find the right instruction file for the task.

## Routing by Task

| Task                                                | Read first                                                      |
| --------------------------------------------------- | --------------------------------------------------------------- |
| App Router pages, layouts, loading/error boundaries | `.github/instructions/nextjs.instructions.md`                   |
| Tailwind styling, design tokens, responsive UI      | `.github/instructions/nextjs-tailwind.instructions.md`          |
| React component patterns, hooks, composition        | `.github/instructions/reactjs.instructions.md`                  |
| TypeScript architecture and typing rules            | `.github/instructions/typescript-5-es2022.instructions.md`      |
| API security, auth hardening, OWASP controls        | `.github/instructions/security-and-owasp.instructions.md`       |
| Accessibility, WCAG 2.2 AA, keyboard/focus          | `.github/instructions/a11y.instructions.md`                     |
| Unit tests with Vitest                              | `.github/instructions/nodejs-javascript-vitest.instructions.md` |
| E2E tests with Playwright                           | `.github/instructions/playwright-typescript.instructions.md`    |
| Performance optimization in this stack              | `.github/instructions/performance-optimization.instructions.md` |
| External docs lookup with Context7                  | `.github/instructions/context7.instructions.md`                 |
| Review rubric and issue prioritization              | `.github/instructions/code-review-generic.instructions.md`      |
| Learning capture protocol (`learn!`)                | `.github/instructions/learnings.instructions.md`                |
| Markdown writing standards                          | `.github/instructions/markdown.instructions.md`                 |

## Routing by Directory

| Directory       | Read first                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------- |
| `app/**`        | `.github/instructions/nextjs.instructions.md`                                                |
| `app/api/**`    | `.github/instructions/security-and-owasp.instructions.md`                                    |
| `components/**` | `.github/instructions/reactjs.instructions.md` + `.github/instructions/a11y.instructions.md` |
| `hooks/**`      | `.github/instructions/reactjs.instructions.md`                                               |
| `lib/**`        | `.github/instructions/typescript-5-es2022.instructions.md`                                   |
| `tests/**`      | `.github/instructions/playwright-typescript.instructions.md`                                 |
| `*.test.ts(x)`  | `.github/instructions/nodejs-javascript-vitest.instructions.md`                              |

## Selection Rules

- If multiple files apply, read all relevant ones before editing.
- If there is a conflict, `.github/copilot-instructions.md` and security/accessibility instructions take precedence.
- For version-sensitive external APIs, follow `.github/instructions/context7.instructions.md`.

## Learnings
