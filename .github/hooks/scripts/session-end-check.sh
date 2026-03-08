#!/usr/bin/env bash
# Copilot sessionEnd hook — full quality gate before closing an agent session.
# All four checks must pass: ESLint (no errors or warnings), TypeScript, unit tests, build.
set -uo pipefail

ERRORS=0

# --- TypeScript ---
echo "=== TypeScript (pnpm type-check) ==="
TSC_OUT=$(pnpm type-check 2>&1)
if [ -z "$TSC_OUT" ]; then
  echo "✓ TypeScript: no errors"
else
  echo "$TSC_OUT" | head -60
  echo ""
  echo "✗ TypeScript: errors found"
  ERRORS=1
fi

echo ""

# --- ESLint (errors AND warnings are failures) ---
echo "=== ESLint ==="
LINT_OUT=$(pnpm lint 2>&1)
LINT_EXIT=$?
echo "$LINT_OUT" | tail -40
if [ "$LINT_EXIT" -ne 0 ]; then
  echo "✗ ESLint: errors or warnings found"
  ERRORS=1
else
  echo "✓ ESLint: clean"
fi

echo ""

# --- Vitest unit tests ---
echo "=== Vitest Unit Tests ==="
if pnpm test 2>&1 | tail -50; then
  echo "✓ Tests: all passed"
else
  echo "✗ Tests: failures found"
  ERRORS=1
fi

echo ""

# --- Production build ---
echo "=== pnpm build ==="
if pnpm build 2>&1 | tail -60; then
  echo "✓ Build: successful"
else
  echo "✗ Build: failed"
  ERRORS=1
fi

echo ""

if [ "$ERRORS" -ne 0 ]; then
  echo "================================================================"
  echo "⚠ Session cannot be closed — fix all issues listed above."
  echo "================================================================"
  exit 1
fi

echo "================================================================"
echo "✓ All session checks passed. Session may be closed."
echo "================================================================"
exit 0
