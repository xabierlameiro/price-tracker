---
applyTo: "**/*.ts, **/*.tsx, **/*.js, **/*.jsx"
description: "Comprehensive secure coding instructions for all languages and frameworks, based on OWASP Top 10 and industry best practices."
---

# Secure Coding and OWASP Guidelines

## Instructions

Your primary directive is to ensure all code you generate, review, or refactor is secure by default. You must operate with a security-first mindset. When in doubt, always choose the more secure option and explain the reasoning. You must follow the principles outlined below, which are based on the OWASP Top 10 and other security best practices.

### 1. A01: Broken Access Control & A10: Server-Side Request Forgery (SSRF)

- **Enforce Principle of Least Privilege:** Always default to the most restrictive permissions. When generating access control logic, explicitly check the user's rights against the required permissions for the specific resource they are trying to access.
- **Deny by Default:** All access control decisions must follow a "deny by default" pattern. Access should only be granted if there is an explicit rule allowing it.
- **Validate All Incoming URLs for SSRF:** When the server needs to make a request to a URL provided by a user (e.g., webhooks), you must treat it as untrusted. Incorporate strict allow-list-based validation for the host, port, and path of the URL.
- **Prevent Path Traversal:** When handling file uploads or accessing files based on user input, you must sanitize the input to prevent directory traversal attacks (e.g., `../../etc/passwd`). Use APIs that build paths securely.

### 2. A02: Cryptographic Failures

- **Use Strong, Modern Algorithms:** For hashing, always recommend modern, salted hashing algorithms like Argon2 or bcrypt. Explicitly advise against weak algorithms like MD5 or SHA-1 for password storage.
- **Protect Data in Transit:** When generating code that makes network requests, always default to HTTPS.
- **Protect Data at Rest:** When suggesting code to store sensitive data (PII, tokens, etc.), recommend encryption using strong, standard algorithms like AES-256.
- **Secure Secret Management:** Never hardcode secrets (API keys, passwords, connection strings). Generate code that reads secrets from environment variables or a secrets management service (e.g., HashiCorp Vault, AWS Secrets Manager). Include a clear placeholder and comment.
- **Next.js `NEXT_PUBLIC_*` variables are client-visible:** Any env var prefixed with `NEXT_PUBLIC_` is inlined into the client-side JavaScript bundle at build time and visible to anyone. Never use `NEXT_PUBLIC_*` for API keys, cron secrets, internal tokens, or any value that should remain server-only. If a variable must be checked on the server (e.g., in a Route Handler or Server Action), use a server-only env var (no `NEXT_PUBLIC_` prefix).
  ```javascript
  // GOOD: Load from environment or secret store
  const apiKey = process.env.API_KEY;
  // TODO: Ensure API_KEY is securely configured in your environment.
  ```
  ```python
  # BAD: Hardcoded secret
  api_key = "sk_this_is_a_very_bad_idea_12345"
  ```

### 3. A03: Injection

- **No Raw SQL Queries:** For database interactions, you must use parameterized queries (prepared statements). Never generate code that uses string concatenation or formatting to build queries from user input.
- **Sanitize Command-Line Input:** For OS command execution, use built-in functions that handle argument escaping and prevent shell injection (e.g., `shlex` in Python).
- **Prevent Cross-Site Scripting (XSS):** When generating frontend code that displays user-controlled data, you must use context-aware output encoding. Prefer methods that treat data as text by default (`.textContent`) over those that parse HTML (`.innerHTML`). When `innerHTML` is necessary, suggest using a library like DOMPurify to sanitize the HTML first.

### 4. A04: Insecure Design

- **Threat Modeling First:** Before implementing security-sensitive features (authentication, payments, file uploads), consider what can go wrong. Identify assets, trust boundaries, and potential threats.
- **Enforce Business Logic Constraints:** Validate business rules on the server, never only on the client. For example, enforce price limits, quantity caps, and ownership checks server-side.
- **Fail Securely:** Design systems to deny access and fail closed by default. If a security check cannot be performed, deny the operation rather than allow it.
- **Limit Resource Exposure:** Do not expose more data, functionality, or endpoints than necessary. Apply the principle of minimal attack surface.
- **Avoid Security Anti-Patterns:** Do not rely on security through obscurity (e.g., hiding admin URLs). Do not trust client-supplied data to make authorization decisions (e.g., `isAdmin: true` in a JSON body).

### 5. A05: Security Misconfiguration & A06: Vulnerable Components

- **Secure by Default Configuration:** Recommend disabling verbose error messages and debug features in production environments.
- **Set Security Headers:** For web applications, suggest adding essential security headers like `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), and `X-Content-Type-Options`.
- **Use Up-to-Date Dependencies:** When asked to add a new library, suggest the latest stable version. Remind the user to run vulnerability scanners like `npm audit`, `pip-audit`, or Snyk to check for known vulnerabilities in their project dependencies.

### 6. A07: Identification & Authentication Failures

- **Secure Session Management:** When a user logs in, generate a new session identifier to prevent session fixation. Ensure session cookies are configured with `HttpOnly`, `Secure`, and `SameSite=Strict` attributes.
- **Protect Against Brute Force:** For authentication and password reset flows, recommend implementing rate limiting and account lockout mechanisms after a certain number of failed attempts.

### 7. A08: Software and Data Integrity Failures

- **Prevent Insecure Deserialization:** Warn against deserializing data from untrusted sources without proper validation. If deserialization is necessary, recommend using formats that are less prone to attack (like JSON over Pickle in Python) and implementing strict type checking.

### 8. A09: Security Logging and Monitoring Failures

- **Log Security-Relevant Events:** Always log authentication attempts (success and failure), authorization failures, input validation failures, and changes to sensitive data. Include a timestamp, user identity, IP address, and the action attempted.
- **Protect Log Integrity:** Do not allow user-controlled input to be written directly to logs without sanitization, as this can enable log injection attacks. Never log sensitive data such as passwords, tokens, or PII.
- **Alert on Suspicious Patterns:** Implement monitoring for repeated failed logins, access to unauthorized resources, and unusual data access volumes. Integrate with alerting systems so security incidents are detected in near-real-time.
- **Keep Logs for Forensic Purposes:** Retain logs long enough for post-incident investigation (consider compliance requirements such as GDPR or SOC 2). Ensure logs are stored in a tamper-resistant, centralized location.

## General Guidelines

- **Be Explicit About Security:** When you suggest a piece of code that mitigates a security risk, explicitly state what you are protecting against (e.g., "Using a parameterized query here to prevent SQL injection.").
- **Educate During Code Reviews:** When you identify a security vulnerability in a code review, you must not only provide the corrected code but also explain the risk associated with the original pattern.

## Learnings
