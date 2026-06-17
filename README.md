# QTBM CRYPTO — Digital Asset Exchange

A production-grade, Binance-style crypto banking & trading platform built with Next.js 16, React 19, Tailwind CSS 4, Prisma, and Firebase.

![QTBM CRYPTO](https://img.shields.io/badge/version-1.0.0-F0B90B) ![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Trading**: Spot, Margin, Futures, Copy Trading, Limit/Market/Stop orders
- **Markets**: 200+ pairs, live price simulator, depth chart, candlestick chart (lightweight-charts)
- **Wallet**: Multi-asset wallet, Deposit/Withdraw/Transfer, QR codes, transaction history
- **Earn**: Staking, Savings Goals, Launchpad, DeFi dashboard
- **P2P**: Peer-to-peer OTC trading
- **AI Assistant**: In-app AI chat support (Z.AI SDK)
- **Admin**: KYC review, user management, announcements, audit log
- **Auth**: Email/password + Google/Apple OAuth (Firebase Auth)
- **Realtime**: Price streaming via WebSocket mini-service
- **i18n**: Arabic + English with RTL support
- **Mobile-First**: Responsive design, installable PWA, Android APK build
- **Push Notifications**: Firebase Cloud Messaging
- **Dark/Light theme** with next-themes

## Tech Stack

| Area | Tech |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| State | Zustand (client) + TanStack Query (server) |
| Database | Prisma ORM + SQLite |
| Auth | Firebase Auth + NextAuth.js |
| Realtime | Firebase Realtime DB + Socket.io |
| Notifications | Firebase Cloud Messaging |
| AI | Z.AI Web Dev SDK (LLM, VLM, TTS, ASR) |
| Charts | Recharts + lightweight-charts |
| Animations | Framer Motion |

## Firebase Configuration

The app is wired to the **`qtb-bank-crypto`** Firebase project (Europe-west1).
Configuration values are derived from `google-services.json` and exposed to
the client through `NEXT_PUBLIC_*` environment variables (see `.env.example`).

| Field | Value |
|-------|-------|
| Project ID | `qtb-bank-crypto` |
| Database URL | `https://qtb-bank-crypto-default-rtdb.europe-west1.firebasedatabase.app` |
| Storage bucket | `qtb-bank-crypto.firebasestorage.app` |
| Android package | `com.qtbm.crypto` |
| Android App ID | `1:506536686458:android:cb8e1888f30ea8a1ac1cc3` |

## Getting Started

### Prerequisites
- Node.js 20+ (or Bun 1.3+)
- Android Studio (for APK builds, optional)

### Install & Run (Web)

```bash
bun install
bun run db:push     # Initialize SQLite database
bun run dev         # Start dev server at http://localhost:3000
```

### Build APK (Android)

See **[android/BUILD_APK.md](android/BUILD_APK.md)** for the complete
production APK build guide. Quick start:

```bash
# 1) Build the web assets
bun run build:web

# 2) Sync into the native Android project
bun run cap:sync

# 3) Build the release APK (requires Android SDK + signing keystore)
bun run apk:build
```

The signed production APK will be at:
`android/app/build/outputs/apk/release/app-release.apk`

## Project Structure

```
.
├── src/
│   ├── app/                  # Next.js App Router (pages + API routes)
│   ├── components/qtbm/      # Feature views (45+ views)
│   ├── components/ui/        # shadcn/ui primitives
│   ├── hooks/                # use-mobile, use-toast, use-price-simulator
│   ├── lib/                  # db, firebase, i18n, utils, mock-data
│   ├── stores/               # Zustand stores
│   └── types/                # TypeScript domain types
├── prisma/                   # Prisma schema
├── mini-services/            # price-stream WebSocket service
├── android/                  # Capacitor Android project (APK wrapper)
├── public/                   # Static assets + firebase-messaging-sw.js
└── scripts/                  # APK build scripts
```

## License

MIT — © QTBM CRYPTO
