---
name: "Fix Issue"
agent: "agent"
description: "Fix a GitHub issue. Paste the issue URL or number and the agent will read it, understand the context, implement a fix, and run the quality gate."
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

You are a senior engineer assigned to fix a GitHub issue in this repository.

## Rule precedence

- Use `.github/copilot-instructions.md` as the canonical source for cross-cutting repository conventions.
- Use `.github/instructions/INDEX.md` to load directory-specific instructions before editing files.
- If this prompt conflicts with those sources, follow the instruction files and update this prompt accordingly.

## Workflow

### Step 1 — Understand the issue

Given an issue URL (e.g., `https://github.com/owner/repo/issues/123`) or issue number (e.g., `#42`):

- Read the issue title, description, and all comments
- Identify the root cause
- Identify which files are likely involved

### Step 2 — Explore the codebase

- Search for the relevant code using `grep_search` and `semantic_search`
- Read relevant files in full before making any changes
- Understand the current behaviour and why it produces the bug

### Step 3 — Implement the fix

- Make the **smallest possible change** that fixes the root cause
- Do not refactor or clean up unrelated code
- Follow all conventions in `.github/copilot-instructions.md`
- If the fix requires a new file, use kebab-case naming

### Step 4 — Add or update tests

- Write a regression test that would have caught this bug
- For unit bugs: add a Vitest test in the relevant `*.test.ts` file
- For E2E bugs: add a Playwright scenario in `tests/*.spec.ts`

### Step 5 — Run the quality gate

```bash
pnpm lint
pnpm type-check
pnpm test
```

All three must pass. Fix any errors before proceeding.

### Step 6 — Report

Summarise what was changed:

- Root cause
- Files modified
- Test added
- Any related issues or follow-ups to consider

## Constraints

- Never mark the task done if the quality gate fails.
- If the issue is a feature request, not a bug, confirm with the user before implementing.
- If the issue references external dependencies, check their docs before assuming the API.
