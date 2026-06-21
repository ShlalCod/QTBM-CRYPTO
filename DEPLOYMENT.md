# QTBM CRYPTO — Production Deployment Guide

This document describes the EXACT steps to deploy QTBM CRYPTO to production.
The app is wired to the real Firebase project `qtb-bank-crypto` (Europe-west1).

---

## Prerequisites

1. **Node.js 20+** or **Bun 1.3+**
2. **JDK 21** (for APK builds via Capacitor 8)
3. **Firebase CLI**: `npm install -g firebase-tools`
4. **Firebase project access**: You must be an editor/owner of `qtb-bank-crypto`

---

## Step 1: Install Dependencies

```bash
# Web app
bun install

# Cloud Functions
cd functions
bun install   # or npm install
cd ..

# Price-stream mini-service
cd mini-services/price-stream
bun install
cd ../..
```

---

## Step 2: Verify Environment

The `.env` file is pre-configured with real Firebase values for `qtb-bank-crypto`.
Verify these match your project:

```bash
cat .env
# NEXT_PUBLIC_FIREBASE_PROJECT_ID=qtb-bank-crypto
# NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCjsrjak2u8J0b6rfaqrB-NZmc1apI70JI
# FIREBASE_RTDB_URL=https://qtb-bank-crypto-default-rtdb.europe-west1.firebasedatabase.app
```

The admin SDK key is in `functions/serviceAccountKey.json` (gitignored — do NOT commit).

---

## Step 3: Deploy Firebase Security Rules

```bash
firebase login   # if not already logged in
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

This enforces:
- Users can only read/write their own profile, wallet, trades, transactions
- Financial writes (wallets, trades, orders, transactions) are blocked client-side — only Cloud Functions can write
- KYC documents readable by user + admin/compliance roles
- Admin collections require `admin` custom claim

---

## Step 4: Deploy Cloud Functions

```bash
cd functions
bun install   # installs firebase-admin, firebase-functions
cd ..
firebase deploy --only functions
```

This deploys 4 callable functions to `europe-west1`:
- `executeTrade` — buy/sell with balance validation in Firestore transaction
- `processWithdraw` — deduct balance, create pending transaction
- `processDeposit` — credit balance, create confirmed transaction
- `processTransfer` — move balance between spot/funding/earn/futures wallets

---

## Step 5: Set Admin Custom Claims (for admin users)

After deploying, set admin claims for your admin account:

```bash
firebase functions:shell
# Then run:
> const admin = require('firebase-admin');
> admin.auth().setCustomUserClaims('ADMIN_UID_HERE', { admin: true })
```

Or create a one-time script in `functions/src/setAdmin.ts`.

---

## Step 6: Enable Firebase Services (Firebase Console)

1. **Authentication** → Sign-in method → Enable **Email/Password**
2. **Firestore Database** → Create database (production mode, `europe-west1`)
3. **Storage** → Get started (production mode, `europe-west1`)
4. **Realtime Database** → Create database (`europe-west1`)

---

## Step 7: Run the Web App (Development)

```bash
bun run dev
# → http://localhost:3000
```

The app will:
- Connect to Firebase Auth (real login/register)
- Sync user profile from Firestore (real-time)
- Show real Binance market prices via WebSocket
- Protect all financial screens (redirect to login if not authenticated)
- Execute trades/withdrawals/deposits via Cloud Functions

---

## Step 8: Build the Android APK

### Option A: GitHub Actions (recommended — no local setup)

1. Push to `main` branch
2. GitHub Actions workflow `.github/workflows/build-apk.yml` builds a signed APK
3. Download from Actions tab → Artifacts

### Option B: Local build

```bash
# 1. Build web assets
bun run build:web

# 2. Sync to Capacitor
bun run cap:sync

# 3. Build release APK (requires Android SDK + keystore)
bun run apk:release
# → android/app/build/outputs/apk/release/app-release.apk
```

---

## Step 9: Seed Initial Data (Optional)

For first-time setup, you may want to seed:
- Public market data document (`/public/markets`)
- Default announcements (`/public/announcements`)
- Default P2P listings

Create a seed script or use Firebase Console to add these documents.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser / APK)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ React 19 UI │  │ Firebase Auth│  │ Firestore (reads)   │ │
│  │ (43 views)  │  │ (onAuthState)│  │ (real-time queries) │ │
│  └─────────────┘  └──────────────┘  └─────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │       Cloud Functions (via httpsCallable)               │ │
│  │  executeTrade | processWithdraw | processDeposit        │ │
│  │  processTransfer                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Project                           │
│                    qtb-bank-crypto                           │
│  ┌──────────┐  ┌───────────┐  ┌────────┐  ┌──────────────┐ │
│  │   Auth   │  │ Firestore │  │Storage │  │  Functions   │ │
│  │ (users)  │  │ (data)    │  │ (KYC)  │  │ (europe-w1)  │ │
│  └──────────┘  └───────────┘  └────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Binance Public API (market data)                │
│  wss://stream.binance.com:9443  ← real-time prices          │
│  https://api.binance.com         ← REST fallback            │
└─────────────────────────────────────────────────────────────┘
```

---

## Security Model

1. **Authentication**: Firebase Auth (email/password). `onAuthStateChanged` drives all UI state.
2. **Authorization**: Firestore Security Rules enforce user-owns-data. Custom claims (`admin`, `compliance`, `support`) gate admin features.
3. **Financial integrity**: All wallet/trade/order/transaction writes go through Cloud Functions with Firestore transactions. Client SDK cannot directly write these collections.
4. **KYC uploads**: Files go to Firebase Storage (`/users/{uid}/kyc/`), metadata to Firestore. Storage rules enforce user-owns-files + 5MB limit + image-only.

---

## What's Real vs. What Needs Your Input

### ✅ Real (production-ready)
- Firebase Auth (email/password login/register)
- Firestore data layer (CRUD for all collections)
- Cloud Functions (4 callable functions with transactions)
- Security rules (firestore.rules + storage.rules)
- Real Binance market prices (WebSocket + REST)
- Auth protection (redirect to login if unauthenticated)
- Real-time notifications (Firestore onSnapshot)
- KYC file upload to Firebase Storage

### ⚠️ Requires your action to go live
- Deploy security rules: `firebase deploy --only firestore:rules,storage:rules`
- Deploy Cloud Functions: `firebase deploy --only functions`
- Enable Email/Password auth in Firebase Console
- Set admin custom claims for admin users
- (Optional) Replace AI chat with real LLM API key in `.env`

### 📝 Still mock (display-only, doesn't affect security)
- Some secondary screens still show mock content for demonstration:
  - NewsFeed articles, SocialFeed posts, Voting proposals (mock content)
  - NFT gallery items
  - Leaderboard traders
- These are display-only — no financial impact. Replace with real Firestore collections when ready.

---

## Verification Checklist

After deployment, verify:

- [ ] `firebase deploy --only firestore:rules` succeeded
- [ ] `firebase deploy --only storage:rules` succeeded
- [ ] `firebase deploy --only functions` succeeded (4 functions in europe-west1)
- [ ] Email/Password auth enabled in Firebase Console
- [ ] User can register → Firestore `/users/{uid}` document created
- [ ] User can login → profile loads → wallet screen shows real data (empty initially)
- [ ] Trade execution → Cloud Function runs → `/trades/{id}` created → wallet balance updated
- [ ] Unauthenticated user redirected to login when accessing `/wallet`
- [ ] Binance prices stream live in Markets/Trade views
- [ ] KYC upload → file appears in Firebase Storage → metadata in `/kyc/{uid}`

---

## Troubleshooting

### "Permission denied" on Firestore reads
- Check that security rules are deployed: `firebase deploy --only firestore:rules`
- Check that the user is authenticated (Auth state not null)
- Check the collection path matches the rules

### Cloud Function not found
- Verify region: functions are in `europe-west1`. Client SDK calls `getFunctions(app, "europe-west1")`
- Verify deployment: `firebase functions:list`

### Binance WebSocket not connecting
- Check network/firewall allows `wss://stream.binance.com:9443`
- Fallback REST polling kicks in automatically every 5s

### APK build fails
- Ensure JDK 21 is installed (`java -version`)
- Ensure Android SDK is configured
- See `android/BUILD_APK.md` for detailed instructions
