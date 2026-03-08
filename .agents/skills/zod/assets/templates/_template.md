---
title: {Rule Title — concise, imperative, e.g. "Use safeParse() for User Input"}
impact: {CRITICAL | HIGH | MEDIUM-HIGH | MEDIUM | LOW-MEDIUM}
impactDescription: {One sentence — what goes wrong and why it matters. E.g. "parse() throws on invalid data; unhandled exceptions expose stack traces and crash servers"}
tags: {comma-separated lowercase tags, e.g. parsing, safeparse, error-handling}
---

## {Rule Title}

{2–4 sentence explanation. Describe the problem this rule solves, why the incorrect
pattern is tempting, and what the correct pattern achieves.}

**Incorrect ({brief label, e.g. "using parse() for user input"}):**

```typescript
import { z } from 'zod'

// Example showing the problematic pattern.
// Add a comment pointing out exactly what is wrong.
const schema = z.object({
  email: z.string().email(),
})

// ❌ Bad: throws ZodError if input is invalid — uncaught, it crashes the server
const data = schema.parse(req.body)
```

**Correct ({brief label, e.g. "using safeParse() with result handling"}):**

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
})

// ✅ Good: returns { success, data } or { success: false, error }
const result = schema.safeParse(req.body)

if (!result.success) {
  // Handle validation failure without throwing
  const errors = result.error.flatten().fieldErrors
  return res.status(400).json({ errors })
}

// result.data is fully typed here
const { email } = result.data
```

{Optional: additional context, edge cases, or when to deviate from this rule.
Keep this section brief — one paragraph maximum.}
