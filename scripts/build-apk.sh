#!/usr/bin/env bash
# =================================================================
# QTBM CRYPTO — Production APK Build Script
# =================================================================
# Builds a production-ready Android APK from the Next.js web app.
#
# Usage:
#   bash scripts/build-apk.sh              # release APK (default)
#   bash scripts/build-apk.sh --release    # release APK
#   bash scripts/build-apk.sh --debug      # debug APK
#   bash scripts/build-apk.sh --clean      # clean build artifacts and exit
#
# Prerequisites:
#   - Node.js 20+ / Bun 1.3+
#   - Android SDK (ANDROID_HOME or ANDROID_SDK_ROOT set)
#   - JDK 17+
#   - A release keystore at android/app/qtbm-release.keystore
#     (generate one with `bun run keystore:generate`)
#
# Output:
#   android/app/build/outputs/apk/release/QTBM-CRYPTO-v1.0.0.apk
# =================================================================
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# ---------- Color helpers ----------
RED=$'\033[0;31m'; GREEN=$'\033[0;32m'; YELLOW=$'\033[0;33m'
BLUE=$'\033[0;34m'; BOLD=$'\033[1m'; NC=$'\033[0m'
log() { echo "${BLUE}▶${NC} ${BOLD}$*${NC}"; }
ok()  { echo "${GREEN}✓${NC} $*"; }
warn(){ echo "${YELLOW}!${NC} $*"; }
err() { echo "${RED}✗${NC} $*" >&2; }

# ---------- Parse args ----------
BUILD_TYPE="release"
DO_CLEAN=0
for arg in "$@"; do
  case "$arg" in
    --release) BUILD_TYPE="release" ;;
    --debug)   BUILD_TYPE="debug"   ;;
    --clean)   DO_CLEAN=1            ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *) err "Unknown argument: $arg"; exit 1 ;;
  esac
done

# ---------- Clean only ----------
if [[ "$DO_CLEAN" -eq 1 ]]; then
  log "Cleaning build artifacts…"
  rm -rf "$PROJECT_ROOT/out" "$PROJECT_ROOT/.next"
  rm -rf "$PROJECT_ROOT/android/app/build"
  rm -rf "$PROJECT_ROOT/android/.gradle"
  ok "Clean done."
  exit 0
fi

# ---------- Pre-flight checks ----------
log "Pre-flight checks…"

if ! command -v bun >/dev/null 2>&1 && ! command -v npm >/dev/null 2>&1; then
  err "Neither bun nor npm found in PATH. Install Bun (https://bun.sh) or Node.js 20+."
  exit 1
fi
PKG_MANAGER="$(command -v bun >/dev/null 2>&1 && echo bun || echo npm)"
ok "Package manager: $PKG_MANAGER"

# Android SDK
: "${ANDROID_HOME:=${ANDROID_SDK_ROOT:-}}"
if [[ -z "$ANDROID_HOME" ]]; then
  # Try common defaults
  for p in "$HOME/Android/Sdk" "$HOME/Library/Android/sdk" "/opt/android-sdk" "/usr/lib/android-sdk"; do
    if [[ -d "$p" ]]; then ANDROID_HOME="$p"; break; fi
  done
fi
if [[ -z "$ANDROID_HOME" ]]; then
  warn "ANDROID_HOME not set and no Android SDK detected in common locations."
  warn "  Install Android Studio (https://developer.android.com/studio) and set ANDROID_HOME."
  warn "  Continuing with web build only — Gradle step will fail if SDK is still missing."
else
  ok "Android SDK: $ANDROID_HOME"
  export ANDROID_HOME
  export ANDROID_SDK_ROOT="$ANDROID_HOME"
fi

# JDK
if ! command -v java >/dev/null 2>&1; then
  err "Java not found. Install JDK 17 (e.g. temurin-17)."
  exit 1
fi
JAVA_MAJOR=$(java -version 2>&1 | head -1 | sed -E 's/.*"([0-9]+)\..*/\1/')
if [[ "$JAVA_MAJOR" != "17" && "$JAVA_MAJOR" -lt 17 ]]; then
  warn "Detected Java $JAVA_MAJOR — Gradle 8.7 requires JDK 17+. Build may fail."
fi
ok "Java: $(java -version 2>&1 | head -1)"

# Release keystore (only required for release builds)
if [[ "$BUILD_TYPE" == "release" ]]; then
  KS_FILE="$PROJECT_ROOT/android/app/qtbm-release.keystore"
  KS_PROPS="$PROJECT_ROOT/android/keystore.properties"
  if [[ ! -f "$KS_FILE" || ! -f "$KS_PROPS" ]]; then
    warn "Release keystore not found."
    warn "  Generate one with: bun run keystore:generate"
    warn "  Falling back to debug signing for this release build."
    warn "  The resulting APK is NOT suitable for Play Store distribution."
  else
    ok "Release keystore: $KS_FILE"
  fi
fi

# google-services.json
GS_FILE="$PROJECT_ROOT/android/app/google-services.json"
if [[ ! -f "$GS_FILE" ]]; then
  err "google-services.json not found at $GS_FILE"
  err "  Copy your Firebase google-services.json there before building."
  exit 1
fi
ok "google-services.json present"

# ---------- Step 1: Build Next.js web app ----------
log "Step 1/4 — Building Next.js web app (static export)…"
rm -rf "$PROJECT_ROOT/out" "$PROJECT_ROOT/.next"
if [[ "$PKG_MANAGER" == "bun" ]]; then
  bun run build:static
else
  npm run build:static
fi
if [[ ! -d "$PROJECT_ROOT/out" ]]; then
  err "Static export failed — 'out/' directory was not created."
  exit 1
fi
ok "Static export ready ($(du -sh "$PROJECT_ROOT/out" | cut -f1))"

# ---------- Step 2: Sync into Capacitor ----------
log "Step 2/4 — Syncing web assets into Capacitor Android project…"
if [[ "$PKG_MANAGER" == "bun" ]]; then
  bun run cap:sync
else
  npm run cap:sync
fi
ok "Capacitor sync complete"

# ---------- Step 3: Gradle build ----------
log "Step 3/4 — Building ${BUILD_TYPE} APK with Gradle…"
cd "$PROJECT_ROOT/android"

# Write local.properties pointing at the SDK
if [[ -n "$ANDROID_HOME" ]]; then
  cat > "$PROJECT_ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF
fi

# Make gradlew executable if present
if [[ -f "./gradlew" ]]; then chmod +x ./gradlew; fi
GRADLE_CMD=""
if [[ -f "./gradlew" ]]; then
  GRADLE_CMD="./gradlew"
elif command -v gradle >/dev/null 2>&1; then
  GRADLE_CMD="gradle"
else
  err "No Gradle wrapper or system Gradle found."
  err "  Run this once to bootstrap the wrapper: gradle wrapper --gradle-version 8.7"
  exit 1
fi

if [[ "$BUILD_TYPE" == "release" ]]; then
  $GRADLE_CMD assembleRelease --no-daemon --console=plain
  APK_GLOB="app/build/outputs/apk/release/*.apk"
else
  $GRADLE_CMD assembleDebug --no-daemon --console=plain
  APK_GLOB="app/build/outputs/apk/debug/*.apk"
fi

# ---------- Step 4: Locate & report APK ----------
log "Step 4/4 — Locating built APK…"
APK_PATH=$(ls -1 $APK_GLOB 2>/dev/null | head -1 || true)
if [[ -z "$APK_PATH" ]]; then
  err "No APK found in $APK_GLOB"
  err "Build may have failed. Check the Gradle output above."
  exit 1
fi
APK_ABS="$PROJECT_ROOT/android/$APK_PATH"
APK_SIZE=$(du -h "$APK_ABS" | cut -f1)

echo ""
echo "${GREEN}${BOLD}============================================================${NC}"
echo "${GREEN}${BOLD} ✓ QTBM CRYPTO — ${BUILD_TYPE^} APK BUILD SUCCEEDED${NC}"
echo "${GREEN}${BOLD}============================================================${NC}"
echo "  Path:  ${APK_ABS}"
echo "  Size:  ${APK_SIZE}"
echo "  Type:  ${BUILD_TYPE}"
echo ""
if [[ "$BUILD_TYPE" == "release" ]]; then
  if [[ ! -f "$KS_FILE" || ! -f "$KS_PROPS" ]]; then
    echo "${YELLOW}  ⚠ Signed with DEBUG keystore — not suitable for Play Store.${NC}"
    echo "${YELLOW}    Run \`bun run keystore:generate\` then \`bun run apk:build\` again.${NC}"
  else
    echo "  ${GREEN}Signed with production keystore — ready for distribution.${NC}"
  fi
fi
echo ""
echo "Install on a connected device:"
echo "  adb install -r ${APK_ABS}"
echo ""
