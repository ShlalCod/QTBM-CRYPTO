# Building the QTBM CRYPTO Android APK

This guide explains how to build a **production-ready, signed APK** of the
QTBM CRYPTO app for general / public / private distribution (Google Play,
direct APK install, enterprise MDM, etc.).

The Android app is a **Capacitor wrapper** around the Next.js 16 web build.
The same codebase produces both the web app and the APK — no separate
React Native or Flutter project is needed.

---

## 1. Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| **Bun** (or Node.js 20+) | ≥ 1.3 / 20 | Build the Next.js web assets |
| **Android Studio** | Hedgehog (2023.1.1) or newer | Provides the Android SDK + emulator |
| **Android SDK** | API 34 (compileSdk) + API 23 (minSdk) | Compile the native project |
| **JDK** | 17 (temurin-17 recommended) | Required by Gradle 8.7 |
| **keytool** | ships with JDK | Generate the release keystore |

Set these environment variables (in `~/.bashrc` / `~/.zshrc`):

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"
```

Verify:

```bash
java -version          # → 17.x
echo $ANDROID_HOME     # → /home/user/Android/Sdk
adb --version          # → Android Debug Bridge ...
```

---

## 2. One-time setup — generate a release keystore

You need a release keystore to sign the production APK. **Keep it forever** —
the same keystore must be used for every update published to the same app
listing.

```bash
bun run keystore:generate
```

The script will ask you for:
- a keystore password (≥ 6 chars)
- a key password (or press Enter to reuse)
- a key alias (default: `qtbm`)
- your name / organization
- a 2-letter country code

It produces:
- `android/qtbm-release.keystore`  ← **BACK THIS UP** (offline, e.g. USB + cloud)
- `android/keystore.properties`    ← git-ignored, contains the passwords

> If you ever lose the keystore, you cannot publish updates to the same
> Google Play listing. Treat it like a root credential.

---

## 3. Build the production APK

```bash
bun run apk:release
```

This single command:

1. Runs `bun run build:static` — Next.js standalone build → `out/`
2. Runs `bun run cap:sync` — copies `out/` into the Android project
3. Runs `./gradlew assembleRelease` — produces the signed APK
4. Reports the final APK path and size

### Output

```
android/app/build/outputs/apk/release/QTBM-CRYPTO-v1.0.0.apk
```

### Build variants

| Command | Result |
|---------|--------|
| `bun run apk:release` | Signed release APK (production) |
| `bun run apk:debug`   | Debug APK with debug signing (testing only) |
| `bun run apk:clean`   | Clean build artifacts and exit |

---

## 4. Install on a device

### Wired install (USB debugging on)

```bash
adb devices                                # verify device is visible
adb install -r android/app/build/outputs/apk/release/QTBM-CRYPTO-v1.0.0.apk
```

### Direct APK distribution (sideloading)

Copy the APK to the device (email, MDM, download link) and tap to install.
The user must enable **"Install unknown apps"** for the source app
(Settings → Apps → Special access).

---

## 5. Publishing to Google Play

1. Bump `versionCode` and `versionName` in
   `android/app/build.gradle`:

   ```gradle
   defaultConfig {
       versionCode 2          // increment for every upload
       versionName "1.0.1"
   }
   ```

2. Build an **App Bundle** (recommended over APK for Play Store):

   ```bash
   cd android
   ./gradlew bundleRelease
   # Output: android/app/build/outputs/bundle/release/app-release.aab
   ```

3. Upload the `.aab` to the
   [Play Console](https://play.google.com/console) →
   your app → **Production** → **Create new release**.

4. Complete the store listing, content rating, data safety form, etc.

---

## 6. Private / enterprise distribution

For internal distribution without the Play Store:

- **MDM (Mobile Device Management)**: publish the APK through your MDM
  server (Workspace ONE, Intune, Jamf, etc.).
- **Private Play Store track**: Use
  [Google Play Managed Publishing](https://support.google.com/googleplay/android-developer/answer/9844679)
  to distribute privately to specific organizations.
- **Direct download**: Host the APK on your own CDN with a simple HTML
  download page. Example nginx snippet:

  ```nginx
  location /qtbm/latest.apk {
      alias /var/www/qtbm/QTBM-CRYPTO-v1.0.0.apk;
      types { application/vnd.android.package-archive apk; }
      add_header Content-Disposition "attachment";
  }
  ```

---

## 7. Firebase integration

The `google-services.json` shipped with this project wires the Android app
to the **`qtb-bank-crypto`** Firebase project:

- **Cloud Messaging** (push notifications) — already declared in
  `AndroidManifest.xml` and `app/build.gradle`.
- **Realtime Database**, **Storage**, **Analytics** — automatically linked
  through the Firebase BOM.

To regenerate or replace the file (e.g. switching Firebase projects):

```bash
# 1. Download the new google-services.json from the Firebase console
#    (Project Settings → Your apps → Android app → Download config file)
# 2. Replace it in two locations:
cp google-services.json android/app/google-services.json
# 3. Re-sync and rebuild
bun run cap:sync && bun run apk:release
```

---

## 8. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `SDK location not found` | Set `ANDROID_HOME` (see §1) or run `bash scripts/build-apk.sh` which writes `android/local.properties` automatically. |
| `Failed to transform google-services.json` | The package name in `google-services.json` must match `applicationId "com.qtbm.crypto"` in `app/build.gradle`. |
| Keystore mismatch on Play Store | You must use the **same keystore** for every release. Recover it from your backup; if lost, contact Play Console support to reset. |
| White screen in the APK | Run `bun run cap:sync` after every web change; check `adb logcat` for JS errors. |
| Gradle OOM | Raise `org.gradle.jvmargs=-Xmx4g` in `android/gradle.properties`. |

---

## 9. Quick reference — file map

```
.
├── capacitor.config.ts          # Capacitor config (appId, webDir)
├── google-services.json         # Firebase config (root copy, .gitignored-optional)
├── scripts/
│   ├── build-static.sh          # Next.js → out/ (static export)
│   ├── cap-sync.sh              # cap sync android
│   ├── cap-open.sh              # Open Android project in Android Studio
│   ├── build-apk.sh             # Full release/debug APK pipeline
│   └── generate-keystore.sh     # One-time release keystore generator
└── android/
    ├── build.gradle             # Top-level Gradle config
    ├── settings.gradle          # Includes :app + capacitor plugins
    ├── gradle.properties        # JVM args, AndroidX flags
    ├── variables.gradle         # SDK versions
    ├── keystore.properties.example  # Template — copy to keystore.properties
    ├── google-services.json     # Firebase Android config (committed)
    └── app/
        ├── build.gradle         # Module build config + signingConfigs
        ├── proguard-rules.pro   # ProGuard / R8 keep rules
        ├── debug.keystore       # Pre-generated debug keystore (committed)
        └── src/main/
            ├── AndroidManifest.xml
            ├── java/com/qtbm/crypto/MainActivity.kt
            └── res/             # Strings, colors, styles, drawables, icons
```
