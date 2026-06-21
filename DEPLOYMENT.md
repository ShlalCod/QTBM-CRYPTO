# QTBM CRYPTO — Production Deployment Guide

Complete steps to deploy QTBM CRYPTO to production with real Firebase backend.

---

## Prerequisites

1. **Node.js 20+** or **Bun 1.3+**
2. **JDK 21** (for APK builds via Capacitor 8)
3. **Firebase CLI**: `npm install -g firebase-tools`
4. **Firebase project**: `qtb-bank-crypto` (or your own)

---

## Step 1: Install Dependencies

```bash
# Web app
bun install

# Cloud Functions
cd functions && bun install && cd ..

# Price-stream mini-service
cd mini-services/price-stream && bun install && cd ../..
```

## Step 2: Configure Environment

```bash
cp .env.example .env
# Edit .env with your Firebase project values
```

Required env vars (see `.env.example`):
- `NEXT_PUBLIC_FIREBASE_*` — client-side Firebase config
- `DATABASE_URL` — Prisma SQLite path

## Step 3: Deploy Firebase Security Rules

```bash
firebase login
firebase use qtb-bank-crypto
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

**Rules enforce:**
- Users can only read/write their own data
- Financial writes (wallets, trades, transactions) via Firestore transactions
- KYC readable by user + admin/compliance
- Admin collections require `admin` custom claim

## Step 4: Deploy Cloud Functions (requires Blaze plan)

> **Note:** Cloud Functions require Firebase Blaze (pay-as-you-go) plan.
> On Spark (free) plan, financial operations run via direct Firestore client SDK transactions instead.

```bash
cd functions && bun install && cd ..
firebase deploy --only functions
```

Deploys 4 callable functions:
- `executeTrade` — buy/sell with balance validation
- `processWithdraw` — deduct balance, create pending transaction
- `processDeposit` — credit balance, create confirmed transaction
- `processTransfer` — move between spot/funding/earn/futures wallets

## Step 5: Set Admin Custom Claims

After creating an admin user in Firebase Console → Authentication:

```bash
firebase functions:shell
> const admin = require('firebase-admin');
> admin.auth().setCustomUserClaims('ADMIN_UID', { admin: true })
```

## Step 6: Enable Firebase Services (Firebase Console)

1. **Authentication** → Sign-in method → Enable **Email/Password**
2. **Firestore Database** → Create database (production mode, `europe-west1`)
3. **Storage** → Get started (production mode)
4. **Realtime Database** → Create database (`europe-west1`)

## Step 7: Run the Web App

```bash
bun run dev    # development
# OR
bun run build  # production static export to out/
```

## Step 8: Build Android APK

### Option A: GitHub Actions (recommended)

1. Push to `main` branch
2. GitHub Actions workflow `.github/workflows/build-apk.yml` builds signed APK
3. Download from **Actions tab → latest run → Artifacts**

### Option B: Local build

```bash
# 1. Build static export
bun run build          # → out/ directory with index.html

# 2. Sync to Capacitor
bun run cap:sync

# 3. Build release APK (requires Android SDK + JDK 21 + keystore)
cd android
./gradlew assembleRelease
# → android/app/build/outputs/apk/release/QTBM-CRYPTO-v1.0.0.apk
```

### Generate a release keystore (one-time)

```bash
bun run keystore:generate
# Creates android/app/qtbm-release.keystore
```

## Step 9: Publish to Google Play Store

1. Register at https://play.google.com/console/signup ($25 one-time fee)
2. Build AAB (Play Store preferred format):
   ```bash
   cd android && ./gradlew bundleRelease
   # → android/app/build/outputs/bundle/release/app-release.aab
   ```
3. Create app in Play Console → upload AAB → fill store listing
4. Submit for review (1-3 days)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Client (Browser / Android APK)              │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐ │
│  │ React UI │  │ Firebase  │  │  Firestore (reads)   │ │
│  │ 43 views │  │   Auth    │  │  real-time onSnapshot│ │
│  └──────────┘  └───────────┘  └──────────────────────┘ │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Financial Operations (Firestore transactions)      ││
│  │  executeTrade | processWithdraw | processDeposit    ││
│  │  processTransfer                                     ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                Firebase Project: qtb-bank-crypto         │
│  ┌────────┐  ┌───────────┐  ┌────────┐  ┌────────────┐ │
│  │  Auth  │  │ Firestore │  │Storage │  │  Functions │ │
│  │ (users)│  │  (data)   │  │ (KYC)  │  │ (europe-w1)│ │
│  └────────┘  └───────────┘  └────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│           Binance Public API (market data)               │
│  wss://stream.binance.com:9443  ← real-time prices      │
│  https://api.binance.com         ← REST fallback         │
└─────────────────────────────────────────────────────────┘
```

## Verification Checklist

After deployment, verify:

- [ ] `firebase deploy --only firestore:rules` succeeded
- [ ] `firebase deploy --only storage:rules` succeeded
- [ ] Email/Password auth enabled in Firebase Console
- [ ] User can register → Firestore `/users/{uid}` created
- [ ] User can login → profile loads → wallet shows real balance
- [ ] Trade execution → `/trades/{id}` created → wallet balance updated
- [ ] Unauthenticated user redirected to login
- [ ] Binance prices stream live in Markets/Trade views
- [ ] Admin login → admin dashboard with real user data
- [ ] Admin can suspend/reactivate users
- [ ] Admin can approve/reject KYC
- [ ] Admin can create/delete announcements
- [ ] APK builds and loads without infinite loading

## Troubleshooting

### "Permission denied" on Firestore reads
- Check security rules deployed: `firebase deploy --only firestore:rules`
- Check user is authenticated
- Check collection path matches rules

### APK shows infinite loading
- Ensure `next.config.ts` uses `output: "export"` (not "standalone")
- Ensure `out/index.html` exists after `bun run build`
- Run `bun run cap:sync` after build

### Cloud Functions deployment fails
- Requires Blaze plan (pay-as-you-go)
- Enable Cloud Build API + Artifact Registry API in Google Cloud Console
- On Spark plan, app uses direct Firestore client transactions instead

### Binance WebSocket not connecting
- Check network allows `wss://stream.binance.com:9443`
- REST polling fallback kicks in automatically
