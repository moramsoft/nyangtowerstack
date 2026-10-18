#!/bin/bash
set -euo pipefail

BOLD="\033[1m"
GREEN="\033[32m"
CYAN="\033[36m"
RESET="\033[0m"

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

HOOK_FILE=".git/hooks/pre-push"

echo -e "\n${BOLD}${CYAN}Installing Git Pre-Push Hook...${RESET}"

cat <<'EOF' > "$HOOK_FILE"
#!/bin/bash
set -euo pipefail

echo ""
echo "🛡️  [Release Gate] Running mandatory automated verification before Git push..."
echo ""

# Execute the release gate harness
./scripts/release_gate.sh --fast

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ [Release Gate] Verification FAILED! Push aborted."
  echo "   Please fix failing test scenarios before pushing to remote."
  echo ""
  exit 1
fi

echo ""
echo "✅ [Release Gate] Verification passed! Proceeding with push."
echo ""
exit 0
EOF

chmod +x "$HOOK_FILE"

echo -e "${GREEN}✓ Pre-push hook successfully installed at: ${HOOK_FILE}${RESET}\n"
