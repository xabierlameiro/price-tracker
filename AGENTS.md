# AGENTS.md — Task Execution Guide

This file is automatically discovered by AI agent runtimes (OpenAI, GitHub Copilot coding agent, etc.).

> **Primary instructions**: `.github/copilot-instructions.md` — read it first for stack, conventions, file naming, quality gates, and anti-patterns.

> **Living document**: If you discover something about this codebase that would help future tasks (e.g., a convention, a quirk, a gotcha), update `.github/copilot-instructions.md` immediately under `## Learnings` or the relevant section.

## Operations & Conventions

> **Allowed/prohibited operations, quality gates, branching strategy, and git best practices**: See `.github/copilot-instructions.md` §Boundaries, §Personal Preferences, and §Session Completion Checklist. The rules below are AGENTS.md-specific additions.

- Read hook configurations in `.github/hooks/*.json` — these run automatically at agent lifecycle events (PostToolUse, SessionStart, SessionEnd, etc.)
- Use `git add <filename>` instead of `git add .` — avoids accidentally staging unintended files
- Create PRs as drafts first: `gh pr create --draft` — lets the requester verify correctness before involving reviewers
- When remote has new changes, prefer `git fetch && git rebase origin/main` over merge commits
- Do NOT use `--no-verify` when committing — fix the lint/pre-commit issues instead

## PR Size Guidelines

- Keep PRs small and reviewable — aim for under 500 lines of code (additions + deletions)
- Keep PRs under 10 changed code files where possible
- Each PR should have a single clear purpose — one feature, one bug fix, or one refactor
- Split large changes by layer: schema/DB changes → service logic → UI components
- Do preparatory refactoring in a separate PR before adding new functionality that depends on it
- Lock files, auto-generated files, and documentation are excluded from the size count

## Task Execution Protocol

1. **Read** relevant files before making any change
2. **Plan** the approach in 2–3 sentences before writing code
3. **Implement** the smallest change that satisfies the requirement
4. **Verify** by running lint + tsc + test in order
5. **Report** with a clear summary of what was changed and why — keep PR descriptions concise; a few sentences is enough for simple changes
6. **Disclose AI assistance** in the PR description when the agent authored or significantly contributed: add `> This PR was created with AI assistance.`

---

## GitHub Copilot Coding Agent — WRAP Methodology

Use the **WRAP** framework when assigning issues to the Copilot coding agent.

### W — Write effective issues

Write issues as if they are for someone brand new to the codebase:

- **Descriptive title** that explains where the work is being done (e.g. `[auth] Add rate limiting to login endpoint` not `Fix login`)
- **Include examples** of the pattern you want (paste a code snippet, link to an existing file that already does it right)
- **Specify scope** — what files/modules are affected, what tests should pass

```markdown
<!-- Good issue for coding agent -->

Title: [components] Add accessible error state to all form inputs

Context: We use Zod + React Hook Form. All <input> elements need `aria-invalid` and
`aria-describedby` linked to inline error messages when validation fails.

See app/components/ui/text-field.tsx for the existing pattern to follow.
Add unit tests with Vitest and update Playwright E2E smoke test.
```

### R — Refine your instructions

Use custom instructions to avoid repeating yourself across issues:

| Scope         | File                              | Use for                                                       |
| ------------- | --------------------------------- | ------------------------------------------------------------- |
| Repository    | `.github/copilot-instructions.md` | Stack conventions, naming rules, quality gates                |
| Custom agents | `.github/agents/*.agent.md`       | Repeated workflows (e.g. `feature-builder`, `test-generator`) |
| Org-level     | GitHub org settings               | Cross-repo standards                                          |

Tip: Ask the coding agent itself to generate or improve `.github/copilot-instructions.md` from the codebase.

### A — Atomic tasks

Break large work into small, independent, reviewable units:

```markdown
<!-- Instead of: "Migrate everything to use the new design system" -->

✅ [ui] Replace all <button> usages in app/auth/ with <Button> component
✅ [ui] Replace all <input> usages in app/dashboard/ with <Input> component
✅ [ui] Update Storybook stories for Button and Input components
```

Each issue should result in a PR you can review in under 15 minutes.

### P — Pair with the coding agent

Know what humans do better vs. what the agent does better:

| Humans                          | Coding Agent                                              |
| ------------------------------- | --------------------------------------------------------- |
| Understand _why_ a task exists  | Tireless parallel execution                               |
| Spot cross-repo impact          | Repetitive tasks without fatigue                          |
| Navigate business ambiguity     | Explore multiple implementation approaches simultaneously |
| Validate the result makes sense | Apply consistent patterns across many files               |

### Assigning an issue to the coding agent

1. Go to the issue on GitHub
2. In the right sidebar, under **Assignees**, assign **Copilot**
3. Or from the **Agents panel** (top-right on github.com) → New task → select repo + model
4. Choose your model: fast model for tests/formatting, powerful model (Claude) for refactors
5. Monitor progress in the session logs; the agent self-reviews with Copilot code review before opening the PR

### Handling Review Feedback (AI Agents Only)

> **Note**: This section applies only to AI coding agents. Human contributors should push commits directly to their PR branches as usual.

When a reviewer requests changes on an open PR, the coding agent must create a **Sub-PR** (a new pull request that targets the original PR branch) to address those changes — instead of pushing commits directly to the existing PR branch.

**Why Sub-PRs for AI agents?**

- Allows reviewers to evaluate AI-generated revisions in isolation
- Maintains a clear separation between original work and AI-generated fixes
- Enables easy rollback if AI-generated changes introduce new issues
- Provides an additional review checkpoint specifically for AI changes

### Good candidates for the coding agent in this project

- Adding/updating Vitest unit tests for existing utilities
- Applying a new ESLint rule consistently across the codebase
- Updating dependencies with `pnpm update`
- Generating or improving `copilot-instructions.md` from existing code
- Adding Zod validation schemas for new API boundaries
- Migrating components to follow new accessibility patterns
- Writing Playwright E2E tests for existing flows
