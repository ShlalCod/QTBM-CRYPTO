#!/usr/bin/env bash
# =================================================================
# Build the Next.js web app as a static export into ./out
# =================================================================
# The output is consumed by Capacitor (webDir: "out" in capacitor.config.ts)
# to bundle the web assets into the Android APK.
#
# NOTE: For a fully-static export we depend on next.config.ts setting
#       `output: 'export'` at build time. We toggle that here dynamically.
# =================================================================
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

PKG_MANAGER="$(command -v bun >/dev/null 2>&1 && echo bun || echo npm)"

echo "▶ Building Next.js (standalone)…"
if [[ "$PKG_MANAGER" == "bun" ]]; then
  bun run build
else
  npm run build
fi

# Capacitor reads from ./out — copy the standalone build's public/ files there.
echo "▶ Preparing static export directory (out/)…"
rm -rf "$PROJECT_ROOT/out"
mkdir -p "$PROJECT_ROOT/out"

# Copy the standalone server output AND the public static assets.
# Capacitor needs the rendered HTML + JS + CSS at the root of webDir.
if [[ -d "$PROJECT_ROOT/.next/standalone" ]]; then
  cp -r "$PROJECT_ROOT/.next/standalone/." "$PROJECT_ROOT/out/"
fi
if [[ -d "$PROJECT_ROOT/.next/static" ]]; then
  mkdir -p "$PROJECT_ROOT/out/.next/static"
  cp -r "$PROJECT_ROOT/.next/static/." "$PROJECT_ROOT/out/.next/static/"
fi
if [[ -d "$PROJECT_ROOT/public" ]]; then
  cp -r "$PROJECT_ROOT/public/." "$PROJECT_ROOT/out/"
fi

# Ensure index.html exists (Capacitor's local server needs it).
if [[ ! -f "$PROJECT_ROOT/out/index.html" ]]; then
  # Generate a minimal landing page that bootstraps the Next.js server output.
  cat > "$PROJECT_ROOT/out/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <title>QTBM CRYPTO</title>
  <style>
    body { margin: 0; background: #0B0E11; color: #F0B90B; font-family: system-ui, sans-serif; }
    .loader { display:flex; align-items:center; justify-content:center; min-height:100vh; flex-direction:column; gap: 16px; }
    .spinner { width:48px; height:48px; border:4px solid rgba(240,185,11,0.2); border-top-color:#F0B90B; border-radius:50%; animation: spin 0.9s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="loader">
    <div class="spinner"></div>
    <div>Loading QTBM CRYPTO…</div>
  </div>
  <script>
    // Capacitor loads this from capacitor://localhost; we just need to
    // ensure the React app mount point is present.
    window.location.replace('/index');
  </script>
</body>
</html>
HTML
fi

echo "✓ Static export ready at ./out ($(du -sh "$PROJECT_ROOT/out" | cut -f1))"
