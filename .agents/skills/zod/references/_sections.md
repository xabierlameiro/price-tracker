# Zod Rule Categories

This file defines the 8 categories used to organise the 43 Zod best-practice rules.
Each section heading is linked from the AGENTS.md table of contents.

---

## 1. Schema Definition

**Impact: CRITICAL**

Rules governing how to declare Zod schemas correctly. Mistakes here propagate through the
entire validation pipeline — wrong primitives, excessive optionals, or missing coercions
allow malformed or malicious data to reach business logic.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `schema-use-primitives-correctly` | Use Primitive Schemas Correctly | CRITICAL |
| `schema-use-unknown-not-any` | Use z.unknown() Instead of z.any() | CRITICAL |
| `schema-avoid-optional-abuse` | Avoid Overusing Optional Fields | CRITICAL |
| `schema-string-validations` | Apply String Validations at Schema Definition | CRITICAL |
| `schema-use-enums` | Use Enums for Fixed String Values | CRITICAL |
| `schema-coercion-for-form-data` | Use Coercion for Form and Query Data | CRITICAL |

---

## 2. Parsing & Validation

**Impact: CRITICAL**

Rules governing how to invoke validation safely. `parse()` throws on invalid input;
`safeParse()` returns a typed result object. Picking the wrong method — or validating
at the wrong layer — leads to unhandled exceptions, double-parsing overhead, or corrupt
data reaching the database.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `parse-use-safeparse` | Use safeParse() for User Input | CRITICAL |
| `parse-async-for-async-refinements` | Use parseAsync for Async Refinements | CRITICAL |
| `parse-handle-all-issues` | Handle All Validation Issues Not Just First | CRITICAL |
| `parse-validate-early` | Validate at System Boundaries | CRITICAL |
| `parse-avoid-double-validation` | Avoid Double Validation | HIGH |
| `parse-never-trust-json` | Never Trust JSON.parse Output | CRITICAL |

---

## 3. Type Inference

**Impact: HIGH**

Rules for deriving TypeScript types from schemas. Manual type definitions drift from
schemas over time. `z.infer<typeof schema>` guarantees the TypeScript type and the
runtime validator are always in sync.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `type-use-z-infer` | Use z.infer Instead of Manual Types | HIGH |
| `type-input-vs-output` | Distinguish z.input from z.infer for Transforms | HIGH |
| `type-export-schemas-and-types` | Export Both Schemas and Inferred Types | HIGH |
| `type-branded-types` | Use Branded Types for Domain Safety | HIGH |
| `type-enable-strict-mode` | Enable TypeScript Strict Mode | HIGH |

---

## 4. Error Handling

**Impact: HIGH**

Rules for surfacing validation errors to users. Default Zod error messages are
developer-facing and must be replaced with human-readable, potentially localised
messages. Errors must also be linked to specific fields for form display.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `error-custom-messages` | Provide Custom Error Messages | HIGH |
| `error-use-flatten` | Use flatten() for Form Error Display | HIGH |
| `error-path-for-nested` | Use issue.path for Nested Error Location | HIGH |
| `error-i18n` | Implement Internationalized Error Messages | HIGH |
| `error-avoid-throwing-in-refine` | Return False Instead of Throwing in Refine | HIGH |

---

## 5. Object Schemas

**Impact: MEDIUM-HIGH**

Rules for working with `z.object()`. Choices like `strict()` vs `strip()`, how to
model optional vs nullable fields, and when to use discriminated unions all affect
type safety and runtime correctness.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `object-strict-vs-strip` | Choose strict() vs strip() for Unknown Keys | MEDIUM-HIGH |
| `object-partial-for-updates` | Use partial() for Update Schemas | MEDIUM-HIGH |
| `object-pick-omit` | Use pick() and omit() for Schema Variants | MEDIUM-HIGH |
| `object-extend-for-composition` | Use extend() for Adding Fields | MEDIUM-HIGH |
| `object-optional-vs-nullable` | Distinguish optional() from nullable() | MEDIUM-HIGH |
| `object-discriminated-unions` | Use Discriminated Unions for Type Narrowing | MEDIUM-HIGH |

---

## 6. Schema Composition

**Impact: MEDIUM**

Rules for building complex schemas from simpler ones. Shared schemas create a single
source of truth; `z.lazy()` enables recursive types; `pipe()` makes multi-stage
validation explicit.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `compose-shared-schemas` | Extract Shared Schemas into Reusable Modules | MEDIUM |
| `compose-intersection` | Use intersection() for Type Combinations | MEDIUM |
| `compose-lazy-recursive` | Use z.lazy() for Recursive Schemas | MEDIUM |
| `compose-preprocess` | Use preprocess() for Data Normalization | MEDIUM |
| `compose-pipe` | Use pipe() for Multi-Stage Validation | MEDIUM |

---

## 7. Refinements & Transforms

**Impact: MEDIUM**

Rules for custom validation logic and data transformation. `refine()` adds a
predicate; `superRefine()` adds multiple issues; `transform()` changes the output
type; `default()` and `catch()` handle missing or invalid values gracefully.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `refine-vs-superrefine` | Choose refine() vs superRefine() Correctly | MEDIUM |
| `refine-transform-coerce` | Distinguish transform() from refine() and coerce() | MEDIUM |
| `refine-add-path` | Add Path to Refinement Errors | MEDIUM |
| `refine-defaults` | Use default() for Optional Fields with Defaults | MEDIUM |
| `refine-catch` | Use catch() for Fault-Tolerant Parsing | MEDIUM |

---

## 8. Performance & Bundle

**Impact: LOW-MEDIUM**

Rules for minimising bundle size and validation overhead. Schema instances should be
created once at module level; `@zod/mini` (Zod v4) reduces the gzipped footprint from
~17 kb to ~1.9 kb for bundle-sensitive applications.

> **Note:** Rules `perf-zod-mini` and `perf-avoid-dynamic-creation` refer to Zod v4
> (`@zod/mini`, JIT compilation). Skip them if your project uses Zod v3.

**Rules in this section:**

| Slug | Title | Impact |
|------|-------|--------|
| `perf-cache-schemas` | Cache Schema Instances | LOW-MEDIUM |
| `perf-zod-mini` | Use Zod Mini for Bundle-Sensitive Applications | LOW-MEDIUM |
| `perf-avoid-dynamic-creation` | Avoid Dynamic Schema Creation in Hot Paths | LOW-MEDIUM |
| `perf-lazy-loading` | Lazy Load Large Schemas | LOW-MEDIUM |
| `perf-arrays` | Optimize Large Array Validation | LOW-MEDIUM |
