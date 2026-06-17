#!/usr/bin/env bash
# =================================================================
# Sync web assets into the native Android project (Capacitor sync).
# =================================================================
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

if ! command -v bun >/dev/null 2>&1 && ! command -v npx >/dev/null 2>&1; then
  echo "✗ Need bun or npx to run cap sync." >&2
  exit 1
fi

if [[ ! -d "out" ]]; then
  echo "✗ 'out/' directory does not exist. Run 'bun run build:static' first." >&2
  exit 1
fi

# Ensure google-services.json is in the right place
if [[ ! -f "android/app/google-services.json" ]]; then
  if [[ -f "google-services.json" ]]; then
    echo "▶ Copying google-services.json → android/app/"
    cp google-services.json android/app/google-services.json
  else
    echo "⚠ google-services.json not found. Firebase features will be unavailable."
  fi
fi

echo "▶ Running cap sync android…"
if command -v bun >/dev/null 2>&1; then
  bunx cap sync android
else
  npx cap sync android
fi

echo "✓ Capacitor sync complete."
