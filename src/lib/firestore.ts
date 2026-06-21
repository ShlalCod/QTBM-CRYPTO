/**
 * QTBM CRYPTO — Production Firestore Data Layer
 *
 * Real CRUD operations against Firestore (project: qtb-bank-crypto).
 * All writes to financial collections (wallets, trades, orders, transactions)
 * are blocked by firestore.rules (write: if false) and must go through
 * Cloud Functions. This module handles READ operations client-side and
 * delegates WRITES to callable functions.
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Firestore,
  type Unsubscribe,
} from "firebase/firestore";
import app from "./firebase";
import {
  httpsCallable,
  getFunctions,
  type Functions,
} from "firebase/functions";

// ─── Singletons ───────────────────────────────────────────────────────────
export const firestore: Firestore = getFirestore(app);
export const functions: Functions = getFunctions(app, "europe-west1");

// ─── Collection names ─────────────────────────────────────────────────────
export const COLLECTIONS = {
  users: "users",
  wallets: "wallets",
  trades: "trades",
  orders: "orders",
  transactions: "transactions",
  kyc: "kyc",
  notifications: "notifications",
  earnSubscriptions: "earnSubscriptions",
  p2pListings: "p2pListings",
  supportTickets: "supportTickets",
  priceAlerts: "priceAlerts",
  referralHistory: "referralHistory",
  public: "public", // public-readable data: market stats, announcements
  admin: "admin", // admin-only
} as const;

// ─── Types ────────────────────────────────────────────────────────────────
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: "user" | "vip" | "admin" | "compliance" | "support";
  status: "registered" | "email_verified" | "kyc_pending" | "kyc_approved" | "restricted" | "suspended";
  kycStatus: "not_started" | "pending" | "approved" | "rejected";
  twoFactorEnabled: boolean;
  referralCode: string | null;
  referredBy: string | null;
  language: "en" | "ar";
  currency: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

export interface WalletBalance {
  asset: string;
  free: number;
  locked: number;
  usdValue: number;
}

export interface FirestoreWallet {
  uid: string;
  spot: Record<string, WalletBalance>;
  funding: Record<string, WalletBalance>;
  earn: Record<string, WalletBalance>;
  futures: Record<string, WalletBalance>;
  updatedAt: ReturnType<typeof serverTimestamp>;
}

export interface FirestoreTrade {
  tradeId: string;
  userId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop_limit";
  quantity: number;
  price: number;
  status: "pending" | "filled" | "cancelled" | "partially_filled";
  createdAt: ReturnType<typeof serverTimestamp>;
}

export interface FirestoreTransaction {
  transactionId: string;
  userId: string;
  type: "deposit" | "withdrawal" | "transfer";
  asset: string;
  amount: number;
  status: "pending" | "confirmed" | "completed" | "failed";
  txHash?: string | null;
  address?: string;
  network?: string;
  fromWallet?: string;
  toWallet?: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export interface FirestoreNotification {
  id: string;
  userId: string;
  type: "security" | "trade" | "deposit" | "withdrawal" | "system" | "promotion";
  title: string;
  body: string;
  isRead: boolean;
  createdAt: ReturnType<typeof serverTimestamp>;
}

// ═══════════════════════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════════════════════

export async function getUserProfile(uid: string): Promise<FirestoreUser | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.users, uid));
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

export async function createUserProfile(
  uid: string,
  data: Partial<FirestoreUser>
): Promise<void> {
  await setDoc(doc(firestore, COLLECTIONS.users, uid), {
    uid,
    email: data.email ?? "",
    displayName: data.displayName ?? null,
    photoURL: data.photoURL ?? null,
    role: "user",
    status: "registered",
    kycStatus: "not_started",
    twoFactorEnabled: false,
    referralCode: data.referralCode ?? null,
    referredBy: data.referredBy ?? null,
    language: data.language ?? "ar",
    currency: data.currency ?? "USD",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUserProfile(
  uid: string,
  data: Partial<FirestoreUser>
): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.users, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToUserProfile(
  uid: string,
  callback: (user: FirestoreUser | null) => void
): Unsubscribe {
  return onSnapshot(doc(firestore, COLLECTIONS.users, uid), (snap) => {
    callback(snap.exists() ? (snap.data() as FirestoreUser) : null);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// WALLET (read-only — writes via Cloud Functions)
// ═══════════════════════════════════════════════════════════════════════════

export async function getWallet(uid: string): Promise<FirestoreWallet | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.wallets, uid));
  return snap.exists() ? (snap.data() as FirestoreWallet) : null;
}

export function subscribeToWallet(
  uid: string,
  callback: (wallet: FirestoreWallet | null) => void
): Unsubscribe {
  return onSnapshot(doc(firestore, COLLECTIONS.wallets, uid), (snap) => {
    callback(snap.exists() ? (snap.data() as FirestoreWallet) : null);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// TRADES & ORDERS (read own — writes via Cloud Functions)
// ═══════════════════════════════════════════════════════════════════════════

export async function getUserTrades(uid: string, limitCount = 50): Promise<FirestoreTrade[]> {
  const q = query(
    collection(firestore, COLLECTIONS.trades),
    where("userId", "==", uid),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as FirestoreTrade)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
}

export function subscribeToUserTrades(
  uid: string,
  callback: (trades: FirestoreTrade[]) => void,
  limitCount = 20
): Unsubscribe {
  const q = query(
    collection(firestore, COLLECTIONS.trades),
    where("userId", "==", uid),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs
        .map((d) => d.data() as FirestoreTrade)
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        })
    );
  });
}

export async function getUserOrders(uid: string, limitCount = 50): Promise<FirestoreTrade[]> {
  const q = query(
    collection(firestore, COLLECTIONS.orders),
    where("userId", "==", uid),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as FirestoreTrade)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSACTIONS (deposits, withdrawals, transfers — read own)
// ═══════════════════════════════════════════════════════════════════════════

export async function getUserTransactions(
  uid: string,
  limitCount = 50
): Promise<FirestoreTransaction[]> {
  const q = query(
    collection(firestore, COLLECTIONS.transactions),
    where("userId", "==", uid),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => d.data() as FirestoreTransaction)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
}

export function subscribeToUserTransactions(
  uid: string,
  callback: (txs: FirestoreTransaction[]) => void,
  limitCount = 20
): Unsubscribe {
  const q = query(
    collection(firestore, COLLECTIONS.transactions),
    where("userId", "==", uid),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs
        .map((d) => d.data() as FirestoreTransaction)
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        })
    );
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

export async function getUserNotifications(
  uid: string,
  limitCount = 50
): Promise<FirestoreNotification[]> {
  const q = query(
    collection(firestore, COLLECTIONS.notifications),
    where("userId", "==", uid),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as FirestoreNotification)
    .sort((a, b) => {
      const aTime = a.createdAt?.toMillis?.() ?? 0;
      const bTime = b.createdAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
}

export function subscribeToNotifications(
  uid: string,
  callback: (notifs: FirestoreNotification[]) => void,
  limitCount = 20
): Unsubscribe {
  const q = query(
    collection(firestore, COLLECTIONS.notifications),
    where("userId", "==", uid),
    limit(limitCount)
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as FirestoreNotification)
        .sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() ?? 0;
          const bTime = b.createdAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        })
    );
  });
}

export async function markNotificationRead(uid: string, notifId: string): Promise<void> {
  await updateDoc(doc(firestore, COLLECTIONS.notifications, notifId), {
    isRead: true,
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// FINANCIAL OPERATIONS (via Next.js API routes — server-side validation)
//
// On Spark plan (no billing), Cloud Functions cannot be deployed.
// These calls go to Next.js API routes (/api/trade, /api/withdraw, etc.)
// which use the Firebase Admin SDK to perform secure Firestore transactions.
// ═══════════════════════════════════════════════════════════════════════════

export interface TradeParams {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price?: number;
  orderType?: "market" | "limit" | "stop_limit";
}

export interface WithdrawParams {
  asset: string;
  amount: number;
  address: string;
  network: string;
}

export interface DepositParams {
  asset: string;
  amount: number;
  txHash?: string;
}

export interface TransferParams {
  asset: string;
  amount: number;
  fromWallet: "spot" | "funding" | "earn" | "futures";
  toWallet: "spot" | "funding" | "earn" | "futures";
}

async function callApi(route: string, params: unknown) {
  const { auth } = await import("./firebase");
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required");
  }
  const idToken = await user.getIdToken();

  const resp = await fetch(`/api/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify(params),
  });

  const data = await resp.json();
  if (!resp.ok) {
    throw new Error(data.error || `Request failed: ${resp.status}`);
  }
  return data;
}

export async function executeTradeCall(params: TradeParams) {
  return callApi("trade", params) as Promise<{ success: boolean; tradeId: string }>;
}

export async function processWithdrawCall(params: WithdrawParams) {
  return callApi("withdraw", params) as Promise<{ success: boolean; transactionId: string }>;
}

export async function processDepositCall(params: DepositParams) {
  return callApi("deposit", params) as Promise<{ success: boolean; transactionId: string }>;
}

export async function processTransferCall(params: TransferParams) {
  return callApi("transfer", params) as Promise<{ success: boolean; transactionId: string }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// PUBLIC DATA (market stats, announcements — readable by anyone)
// ═══════════════════════════════════════════════════════════════════════════

export async function getPublicDocument(name: string): Promise<Record<string, unknown> | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.public, name));
  return snap.exists() ? (snap.data() as Record<string, unknown>) : null;
}

export function subscribeToPublicDocument(
  name: string,
  callback: (data: Record<string, unknown> | null) => void
): Unsubscribe {
  return onSnapshot(doc(firestore, COLLECTIONS.public, name), (snap) => {
    callback(snap.exists() ? (snap.data() as Record<string, unknown>) : null);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// SUPPORT TICKETS
// ═══════════════════════════════════════════════════════════════════════════

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: "low" | "medium" | "high";
  status: "open" | "pending" | "resolved" | "closed";
  message: string;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export async function createSupportTicket(
  uid: string,
  data: Omit<SupportTicket, "id" | "userId" | "status" | "createdAt">
): Promise<string> {
  const ref = doc(collection(firestore, COLLECTIONS.supportTickets));
  await setDoc(ref, {
    ...data,
    userId: uid,
    status: "open",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getUserSupportTickets(uid: string): Promise<SupportTicket[]> {
  const q = query(
    collection(firestore, COLLECTIONS.supportTickets),
    where("userId", "==", uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SupportTicket);
}

// ═══════════════════════════════════════════════════════════════════════════
// PRICE ALERTS
// ═══════════════════════════════════════════════════════════════════════════

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  condition: "above" | "below" | "crosses";
  targetPrice: number;
  currentPrice: number;
  isActive: boolean;
  triggeredAt: ReturnType<typeof serverTimestamp> | null;
  createdAt: ReturnType<typeof serverTimestamp>;
}

export async function getUserPriceAlerts(uid: string): Promise<PriceAlert[]> {
  const q = query(
    collection(firestore, COLLECTIONS.priceAlerts),
    where("userId", "==", uid)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PriceAlert);
}

export async function createPriceAlert(
  uid: string,
  data: Omit<PriceAlert, "id" | "userId" | "isActive" | "triggeredAt" | "createdAt">
): Promise<string> {
  const ref = doc(collection(firestore, COLLECTIONS.priceAlerts));
  await setDoc(ref, {
    ...data,
    userId: uid,
    isActive: true,
    triggeredAt: null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deletePriceAlert(alertId: string): Promise<void> {
  await deleteDoc(doc(firestore, COLLECTIONS.priceAlerts, alertId));
}

// ═══════════════════════════════════════════════════════════════════════════
// P2P LISTINGS (read public, write own)
// ═══════════════════════════════════════════════════════════════════════════

export interface P2PListing {
  id: string;
  userId: string;
  merchantName: string;
  type: "buy" | "sell";
  asset: string;
  fiat: string;
  price: number;
  amount: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: string[];
  status: "active" | "inactive";
  createdAt: ReturnType<typeof serverTimestamp>;
}

export async function getActiveP2PListings(limitCount = 50): Promise<P2PListing[]> {
  const q = query(
    collection(firestore, COLLECTIONS.p2pListings),
    where("status", "==", "active"),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as P2PListing);
}

export async function createP2PListing(
  uid: string,
  data: Omit<P2PListing, "id" | "userId" | "status" | "createdAt">
): Promise<string> {
  const ref = doc(collection(firestore, COLLECTIONS.p2pListings));
  await setDoc(ref, {
    ...data,
    userId: uid,
    status: "active",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
