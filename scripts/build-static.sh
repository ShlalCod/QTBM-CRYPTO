#!/usr/bin/env bash
# =================================================================
# Build the Next.js web app as a static export into ./out
# =================================================================
# Uses next.config.ts setting: output: "export"
# Output: out/ directory with index.html + static assets
# Consumed by Capacitor (webDir: "out" in capacitor.config.ts)
# =================================================================
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

PKG_MANAGER="$(command -v bun >/dev/null 2>&1 && echo bun || echo npm)"

echo "▶ Building Next.js (static export)…"
if [[ "$PKG_MANAGER" == "bun" ]]; then
  bun run build
else
  npm run build
fi

# Verify index.html was generated
if [[ ! -f "$PROJECT_ROOT/out/index.html" ]]; then
  echo "✗ Build failed: out/index.html not found"
  echo "  Ensure next.config.ts has output: 'export'"
  exit 1
fi

# Remove any secrets that might have been copied (safety check)
rm -rf "$PROJECT_ROOT/out/audit-workspace" 2>/dev/null || true
rm -rf "$PROJECT_ROOT/out/functions" 2>/dev/null || true

echo "✓ Static export ready at ./out ($(du -sh "$PROJECT_ROOT/out" | cut -f1))"
echo "  index.html: $(wc -c < "$PROJECT_ROOT/out/index.html") bytes"
