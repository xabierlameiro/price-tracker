# Security Policy

## Supported Versions

| Version         | Supported |
| --------------- | --------- |
| Latest (`main`) | ✅        |

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public issue**.

Report it privately via one of these channels:

- **GitHub Security Advisory**: Use the [Report a vulnerability](../../security/advisories/new) button on this repository.
- **Email**: Contact the maintainer directly (see profile for contact details).

Please include:

- A description of the vulnerability and its potential impact
- Steps to reproduce or a proof-of-concept (PoC)
- Your recommended fix, if you have one

You will receive a response within **72 hours**. We follow responsible disclosure: a fix will be coordinated and released before any public disclosure.

## Security Practices

This project follows [OWASP Top 10](https://owasp.org/www-project-top-ten/) guidelines. See [`.github/instructions/security-and-owasp.instructions.md`](.github/instructions/security-and-owasp.instructions.md) for the secure coding standards applied throughout this codebase.

Key practices enforced:

- All user input validated with Zod at system boundaries
- Secrets loaded from environment variables only — never hardcoded
- Parameterized queries for any database operations
- Auth.js v5 for authentication with secure session management
- HTTPS enforced in production; secure cookie attributes (`HttpOnly`, `Secure`, `SameSite`)

## AI Agent and MCP Server Security

This project uses AI agents (GitHub Copilot, Claude) and MCP servers. Additional security measures:

- **Secret scanning hook**: A `preToolUse` hook (`.github/hooks/scripts/pre-tool-secret-scan.sh`) automatically scans file content for hardcoded API keys, tokens, and credentials before any file write. It blocks the operation if secrets are detected.
- **MCP server vetting**: 5 MCP servers are configured in `.vscode/mcp.json` (Context7, shadcn, Playwright, Next DevTools, GitHub). Only use MCP servers from trusted sources. Review server configurations before enabling.
- **MCP secret management**: MCP inputs that require authentication (e.g., `CONTEXT7_API_KEY`, GitHub PAT) are marked as `password: true` and must be provided at runtime. Never commit these values to the repository.
- **Agent boundaries**: Agent operations are constrained by hooks that enforce the quality gate (`pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm build`) at session end. Destructive operations (`rm -rf`, `git push --force`) require explicit user confirmation.
- **Audit trail**: Agent sessions produce output logs. Review agent-generated PRs with the same rigor as human-authored code.
