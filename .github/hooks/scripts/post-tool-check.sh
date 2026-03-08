#!/usr/bin/env bash
# Copilot postToolUse hook — TypeScript + ESLint checks after file edits.
# Receives JSON on stdin: toolName, toolArgs, toolResult, cwd, timestamp.
# Inspired by: github.com/Azure/az-prototype & github.com/foxminchan/BookWorm
set -uo pipefail

INPUT=$(cat)

# Parse toolName from JSON stdin
TOOL_NAME=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('toolName', ''))
except Exception:
    print('')
" <<< "$INPUT" 2>/dev/null || echo "")

# Run only after file-writing tools
case "$TOOL_NAME" in
  create_file|replace_string_in_file|multi_replace_string_in_file|insert_edit_into_file) ;;
  *) exit 0 ;;
esac

ERRORS=0

# --- ESLint ---
echo "--- ESLint ---"
if pnpm lint 2>&1 | tail -30; then
  echo "✓ ESLint: clean"
else
  ERRORS=1
fi

# --- TypeScript ---
echo "--- TypeScript ---"
if pnpm type-check 2>&1 | tail -30; then
  echo "✓ TypeScript: no errors"
else
  ERRORS=1
fi

if [ "$ERRORS" -ne 0 ]; then
  echo ""
  echo "⚠ Quality checks failed — fix the issues above before continuing."
  exit 1
fi

echo "✓ All quality checks passed."
exit 0
