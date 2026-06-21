# QTBM CRYPTO — Digital Asset Exchange

A production-grade, Binance-style crypto trading platform built with Next.js 16, Firebase, and Capacitor (Android APK).

![Version](https://img.shields.io/badge/version-1.0.0-F0B90B) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Firebase](https://img.shields.io/badge/Firebase-12-orange)

---

## Features

- **Trading**: Spot trading with real Binance market data (WebSocket + REST)
- **Markets**: 200+ pairs, live prices, candlestick charts (lightweight-charts)
- **Wallet**: Multi-asset wallet, Deposit/Withdraw/Transfer, real Firestore balances
- **Earn**: Staking, Savings Goals, Launchpad, DeFi dashboard
- **P2P**: Peer-to-peer OTC trading
- **AI Assistant**: In-app AI chat support
- **Admin**: Full admin dashboard (user management, KYC review, announcements, audit logs)
- **Auth**: Firebase Authentication (email/password)
- **Realtime**: Live price streaming via Binance WebSocket
- **i18n**: Arabic + English with RTL support
- **Mobile-First**: Responsive design, installable PWA, Android APK build
- **Dark/Light theme** with next-themes

## Tech Stack

| Area | Tech |
|------|------|
| Framework | Next.js 16 (App Router, output: export for static) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| State | Zustand (client) + TanStack Query (server) |
| Database | Firebase Firestore (production) + Prisma/SQLite (dev metadata) |
| Auth | Firebase Auth |
| Realtime | Binance WebSocket + Firebase onSnapshot |
| Charts | Recharts + lightweight-charts |
| Mobile | Capacitor 8 (Android APK) |

## Firebase Project

- **Project ID**: `qtb-bank-crypto` (Europe-west1)
- **Services**: Auth, Firestore, Storage, Realtime DB, Cloud Messaging
- **Config**: in `.env` (see `.env.example` for template)

## Quick Start

### Prerequisites
- Node.js 20+ (or Bun 1.3+)
- JDK 21 (for APK builds)

### Install & Run (Web)

```bash
bun install
cp .env.example .env   # fill in your Firebase config
bun run dev            # http://localhost:3000
```

### Build Android APK

```bash
# Option 1: GitHub Actions (recommended — no local setup)
# Push to main → Actions tab → Build APK → download artifact

# Option 2: Local build
bun run build          # static export to out/
bun run cap:sync       # sync to android project
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/QTBM-CRYPTO-v1.0.0.apk
```

## Default Admin Account

```
Email:    admin@qtbm.crypto
Password: QTBM2026!Secure
```

This account has `role: admin` custom claims and lands on the admin dashboard after login.

## Project Structure

```
.
├── src/
│   ├── app/              # Next.js App Router (layout, page, globals.css)
│   ├── components/
│   │   ├── qtbm/         # 43 feature views (Home, Trade, Wallet, Admin, etc.)
│   │   └── ui/           # shadcn/ui primitives
│   ├── hooks/            # use-binance, use-price-simulator, use-mobile, etc.
│   ├── lib/              # firebase, firestore, auth-context, i18n, mock-data
│   ├── stores/           # Zustand app-store
│   └── types/            # TypeScript domain types
├── android/              # Capacitor Android project (APK wrapper)
├── functions/            # Firebase Cloud Functions (4 callable)
├── mini-services/        # price-stream WebSocket (real Binance data)
├── prisma/               # Prisma schema
├── public/               # Static assets + firebase-messaging-sw.js
├── scripts/              # Build scripts (APK, keystore, capacitor sync)
├── .github/workflows/    # CI + APK build
├── firestore.rules       # Firestore security rules
├── storage.rules         # Firebase Storage rules
└── firebase.json         # Firebase CLI config
```

## Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** — Complete production deployment guide
- **[APK-BUILD-REPORT.md](APK-BUILD-REPORT.md)** — APK build verification report

## Security

- Firebase Auth for user authentication
- Firestore Security Rules enforce user-owns-data model
- Financial operations use Firestore transactions (atomic)
- KYC uploads to Firebase Storage with size/type validation
- Admin actions write audit logs to Firestore

## License

MIT — © QTBM CRYPTO
