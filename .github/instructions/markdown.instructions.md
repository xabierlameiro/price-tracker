---
description: "Standards for writing and editing Markdown files in this project"
applyTo: "**/*.md"
---

## Markdown Content Rules

1. **Headings**: Use hierarchical heading levels. Do not use H1 (`#`) in documentation body — it is reserved for the page/file title.
2. **Lists**: Use bullet points (`-`) or numbered lists (`1.`) with proper indentation.
3. **Code blocks**: Always use fenced code blocks with a language specifier for syntax highlighting.
4. **Links**: Use proper markdown syntax; ensure URLs are valid and not bare.
5. **Images**: Include descriptive `alt` text for accessibility.
6. **Tables**: Use properly aligned markdown tables.
7. **Whitespace**: Use blank lines between sections. Avoid excessive blank lines.

## Formatting conventions

- Use `##` for H2, `###` for H3 — avoid going deeper than H4
- Use `-` for unordered lists; indent nested lists with 2 spaces
- Use triple backticks with a language ID: ` ```typescript `, ` ```bash `, ` ```json `
- Wrap inline code and file names in backticks: `pnpm install`, `app/layout.tsx`
- Separate top-level sections with a blank line before and after
- Do not end files with trailing whitespace

## Content style

- Write in English (matches the project's language convention)
- Be concise — prefer bullet lists over long paragraphs for instructions
- Use imperative mood for instructions: "Run `pnpm build`", not "You should run..."
- Keep line length reasonable (max ~120 chars) for easy diff review in PRs

## Learnings
