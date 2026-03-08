#!/usr/bin/env bash
# Copilot preToolUse hook — secret & credential scanner.
# Pattern sourced from: foxminchan/BookWorm (secret-scanner.sh)
# Scans file content BEFORE writing to detect hardcoded secrets.
# Returns permissionDecision: "deny" if secrets found — blocks the tool call.
# Always exits 0 (non-zero would be a hook error, not a permission denial).
set -uo pipefail

INPUT=$(cat)

TOOL_NAME=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('toolName', ''))
except Exception:
    print('')
" <<< "$INPUT" 2>/dev/null || echo "")

# Only scan file-writing tools
case "$TOOL_NAME" in
  create_file|replace_string_in_file|multi_replace_string_in_file|insert_edit_into_file) ;;
  *) exit 0 ;;
esac

CONTENT=$(python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    args = d.get('toolArgs', {})
    # Try multiple field names depending on the tool
    print(args.get('content', args.get('newString', args.get('new_string', ''))))
except Exception:
    print('')
" <<< "$INPUT" 2>/dev/null || echo "")

if [ -z "$CONTENT" ]; then
  exit 0
fi

# --- Secret patterns adapted for Next.js / TypeScript stacks ---
PATTERNS=(
  # OpenAI / Anthropic API keys
  "sk-[a-zA-Z0-9]{20,}"
  "sk-ant-[a-zA-Z0-9-]{40,}"
  # GitHub tokens
  "ghp_[a-zA-Z0-9]{36}"
  "gho_[a-zA-Z0-9]{36}"
  "github_pat_[a-zA-Z0-9_]{82}"
  # AWS
  "AKIA[0-9A-Z]{16}"
  # Stripe
  "sk_live_[a-zA-Z0-9]{24,}"
  "rk_live_[a-zA-Z0-9]{24,}"
  # JWT secrets hardcoded in assignments
  "AUTH_SECRET\s*=\s*[\"'][^\"']{16,}"
  "NEXTAUTH_SECRET\s*=\s*[\"'][^\"']{16,}"
  "JWT_SECRET\s*=\s*[\"'][^\"']{16,}"
  # Database URLs with embedded password
  "postgresql://[^:]+:[^@]{8,}@"
  "mysql://[^:]+:[^@]{8,}@"
  "mongodb(\+srv)?://[^:]+:[^@]{8,}@"
  # Bearer tokens in code (not in comments)
  "Authorization.*Bearer\s+[a-zA-Z0-9+/=_\-]{20,}"
  # Private keys
  "-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY"
  # Vercel tokens
  "VERCEL_TOKEN\s*=\s*[\"'][\"']?[a-zA-Z0-9_\-]{20,}"
  # Supabase service role key
  "SUPABASE_SERVICE_ROLE_KEY\s*=\s*[\"'][^\"']{30,}"
  # Resend API keys
  "re_[a-zA-Z0-9]{20,}"
  # SendGrid API keys
  "SG\.[a-zA-Z0-9_\-]{22}\.[a-zA-Z0-9_\-]{43}"
)

for pattern in "${PATTERNS[@]}"; do
  if echo "$CONTENT" | grep -qE "$pattern" 2>/dev/null; then
    REASON="Potential secret/credential detected in file content (pattern: ${pattern:0:40}...). Hardcoded secrets must never be committed. Use environment variables (.env.local) and read them via process.env instead."
    python3 -c "
import json, sys
reason = sys.argv[1]
print(json.dumps({'permissionDecision': 'deny', 'permissionDecisionReason': reason}))
" "$REASON"
    exit 0
  fi
done

# Clean — allow the tool call
exit 0
