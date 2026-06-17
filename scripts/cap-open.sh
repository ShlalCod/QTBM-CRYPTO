#!/usr/bin/env bash
# =================================================================
# Open the Android project in Android Studio (or build via CLI).
# =================================================================
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Ensure sync has run
if [[ ! -d "$PROJECT_ROOT/out" ]]; then
  echo "▶ 'out/' missing — building web assets first…"
  bash "$PROJECT_ROOT/scripts/build-static.sh"
fi

echo "▶ Syncing Capacitor…"
bash "$PROJECT_ROOT/scripts/cap-sync.sh"

if command -v studio >/dev/null 2>&1; then
  studio "$PROJECT_ROOT/android" &
elif [[ -n "${STUDIO_HOME:-}" ]] && [[ -x "$STUDIO_HOME/bin/studio.sh" ]]; then
  "$STUDIO_HOME/bin/studio.sh" "$PROJECT_ROOT/android" &
elif [[ -d "/Applications/Android Studio.app" ]]; then
  open -a "Android Studio" "$PROJECT_ROOT/android"
else
  echo "⚠ Android Studio command not found on PATH."
  echo "  Open the project manually at: $PROJECT_ROOT/android"
fi

echo "✓ Android project ready at: $PROJECT_ROOT/android"
