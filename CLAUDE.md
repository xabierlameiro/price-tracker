# CLAUDE.md — Project Context for AI Assistants

This file is automatically discovered by Claude and other Anthropic-powered runtimes.

> **Primary instructions**: `.github/copilot-instructions.md` — read it first for stack, conventions, quality gates, and anti-patterns.

## Extended Thinking Triggers

For these task types, take extra reasoning steps before writing code:

- **Auth flows** — check session handling, CSRF, and cookie attributes
- **Database schema changes** — consider migration safety and backward compatibility
- **API boundary changes** — verify all callers are updated
- **Performance-sensitive code** — profile mentally before optimizing

## Reasoning Guidance

1. **Read before writing** — always read relevant files before editing
2. **Prefer minimal changes** — don't refactor beyond the scope of the request
3. **Type safety first** — no `any`, no type assertions without a comment explaining why
4. **Security boundary** — validate ALL external input with Zod; never trust user data
5. **Server-first** — default to Server Components; add `"use client"` only when required
