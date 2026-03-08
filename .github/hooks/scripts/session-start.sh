#!/usr/bin/env bash
# Copilot sessionStart hook — validate dev environment at the start of each agent session.
# Pattern sourced from: microsoft/vscode, foxminchan/BookWorm
# Outputs warnings as additionalContext injected into the agent's first message.
# Always exits 0 — this hook never blocks session start.
set -uo pipefail

INPUT=$(cat)
WARNINGS=()

# --- Node.js version ---
if command -v node &>/dev/null; then
  NODE_VER=$(node --version 2>/dev/null || echo "unknown")
  NODE_MAJOR=$(echo "$NODE_VER" | sed 's/v//' | cut -d'.' -f1)
  if [ "$NODE_MAJOR" -lt 20 ] 2>/dev/null; then
    WARNINGS+=("Node.js $NODE_VER detected — this project requires v20+. Run: nvm use 20")
  fi
else
  WARNINGS+=("Node.js not found in PATH. Install it via nvm or brew.")
fi

# --- pnpm ---
if ! command -v pnpm &>/dev/null; then
  WARNINGS+=("pnpm not found. Install: npm install -g pnpm")
fi

# --- node_modules ---
if [ ! -d "node_modules" ]; then
  WARNINGS+=("node_modules not found — dependencies may be missing. Consider running: pnpm install")
elif [ "package.json" -nt "node_modules" ]; then
  WARNINGS+=("package.json is newer than node_modules — dependencies may be stale. Run: pnpm install")
fi

# --- .env.local ---
if [ ! -f ".env.local" ] && [ -f ".env.example" ]; then
  WARNINGS+=(".env.local not found but .env.example exists — copy it: cp .env.example .env.local")
fi

# --- TypeScript config ---
if [ ! -f "tsconfig.json" ]; then
  WARNINGS+=("tsconfig.json not found — TypeScript configuration is missing.")
fi

# Exit cleanly if nothing to report
if [ ${#WARNINGS[@]} -eq 0 ]; then
  echo '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Environment OK: Node.js, pnpm, node_modules, .env.local all verified."}}'
  exit 0
fi

# Build warning message
MSG="[session-start] Environment warnings:\n"
for w in "${WARNINGS[@]}"; do
  MSG+="  ⚠ $w\n"
done
MSG+="Address these before making changes."

# Escape for JSON
ESCAPED=$(python3 -c "import sys,json; print(json.dumps(sys.stdin.read(), ensure_ascii=False))" <<< "$MSG" 2>/dev/null || echo "\"Environment warnings detected.\"")

echo "{\"hookSpecificOutput\":{\"hookEventName\":\"SessionStart\",\"additionalContext\":$ESCAPED}}"
exit 0
