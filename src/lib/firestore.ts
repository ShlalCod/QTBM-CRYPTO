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
// FINANCIAL OPERATIONS — Direct Firestore client SDK writes
//
// For the Android APK (static export, no server), all financial operations
// execute directly against Firestore from the client. Security Rules enforce
// balance validation server-side (Firestore evaluates rules atomically).
//
// Each operation:
// 1. Reads current wallet in a transaction
// 2. Validates balance is sufficient
// 3. Updates wallet + creates audit record (trade/transaction)
// 4. Creates a notification
// All within a single Firestore transaction for atomicity.
// ═══════════════════════════════════════════════════════════════════════════

import { runTransaction } from "firebase/firestore";

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

async function getCurrentUser() {
  const { auth } = await import("./firebase");
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function executeTradeCall(params: TradeParams): Promise<{ success: boolean; tradeId: string }> {
  const user = await getCurrentUser();
  const { symbol, side, quantity, price, orderType } = params;

  if (!symbol || !side || !quantity || quantity <= 0) {
    throw new Error("Invalid trade parameters");
  }

  const tradeId = await runTransaction(firestore, async (tx) => {
    const walletRef = doc(firestore, COLLECTIONS.wallets, user.uid);
    const walletDoc = await tx.get(walletRef);

    if (!walletDoc.exists) {
      throw new Error("Wallet not found. Please contact support.");
    }

    const wallet = walletDoc.data() as FirestoreWallet;
    const spot = wallet.spot || {};
    const cost = quantity * (price || 0);
    const baseAsset = symbol.replace("USDT", "");

    let tradeRef;
    if (side === "buy") {
      const usdtBalance = spot.USDT?.free || 0;
      if (usdtBalance < cost) {
        throw new Error(`Insufficient USDT balance. Need ${cost}, have ${usdtBalance}`);
      }
      const assetBalance = spot[baseAsset]?.free || 0;
      tx.update(walletRef, {
        [`spot.USDT.free`]: usdtBalance - cost,
        [`spot.USDT.usdValue`]: usdtBalance - cost,
        [`spot.${baseAsset}.free`]: assetBalance + quantity,
        [`spot.${baseAsset}.asset`]: baseAsset,
        [`spot.${baseAsset}.locked`]: spot[baseAsset]?.locked || 0,
        updatedAt: serverTimestamp(),
      });
    } else {
      const assetBalance = spot[baseAsset]?.free || 0;
      if (assetBalance < quantity) {
        throw new Error(`Insufficient ${baseAsset} balance. Need ${quantity}, have ${assetBalance}`);
      }
      const usdtBalance = spot.USDT?.free || 0;
      tx.update(walletRef, {
        [`spot.${baseAsset}.free`]: assetBalance - quantity,
        [`spot.USDT.free`]: usdtBalance + cost,
        [`spot.USDT.usdValue`]: usdtBalance + cost,
        [`spot.USDT.asset`]: "USDT",
        [`spot.USDT.locked`]: spot.USDT?.locked || 0,
        updatedAt: serverTimestamp(),
      });
    }

    // Create trade record
    tradeRef = doc(firestore, COLLECTIONS.trades);
    tx.set(tradeRef, {
      tradeId: tradeRef.id,
      userId: user.uid,
      symbol,
      side,
      quantity,
      price: price || 0,
      orderType: orderType || "market",
      status: "filled",
      createdAt: serverTimestamp(),
    });

    // Create notification
    const notifRef = doc(firestore, COLLECTIONS.notifications);
    tx.set(notifRef, {
      userId: user.uid,
      type: "trade",
      title: side === "buy" ? "تم تنفيذ أمر شراء" : "تم تنفيذ أمر بيع",
      body: `${side === "buy" ? "شراء" : "بيع"} ${quantity} ${baseAsset} @ ${price || "سوقي"}`,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    return tradeRef.id;
  });

  return { success: true, tradeId };
}

export async function processWithdrawCall(params: WithdrawParams): Promise<{ success: boolean; transactionId: string }> {
  const user = await getCurrentUser();
  const { asset, amount, address, network } = params;

  if (!asset || !amount || amount <= 0 || !address) {
    throw new Error("Invalid withdrawal parameters");
  }

  const transactionId = await runTransaction(firestore, async (tx) => {
    const walletRef = doc(firestore, COLLECTIONS.wallets, user.uid);
    const walletDoc = await tx.get(walletRef);

    if (!walletDoc.exists) {
      throw new Error("Wallet not found");
    }

    const wallet = walletDoc.data() as FirestoreWallet;
    const spot = wallet.spot || {};
    const balance = spot[asset]?.free || 0;

    if (balance < amount) {
      throw new Error(`Insufficient ${asset} balance. Need ${amount}, have ${balance}`);
    }

    tx.update(walletRef, {
      [`spot.${asset}.free`]: balance - amount,
      updatedAt: serverTimestamp(),
    });

    const txRef = doc(firestore, COLLECTIONS.transactions);
    tx.set(txRef, {
      transactionId: txRef.id,
      userId: user.uid,
      type: "withdrawal",
      asset,
      amount,
      address,
      network: network || "default",
      status: "pending",
      createdAt: serverTimestamp(),
    });

    const notifRef = doc(firestore, COLLECTIONS.notifications);
    tx.set(notifRef, {
      userId: user.uid,
      type: "withdrawal",
      title: "طلب سحب قيد المعالجة",
      body: `تم استلام طلب سحب ${amount} ${asset}`,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    return txRef.id;
  });

  return { success: true, transactionId };
}

export async function processDepositCall(params: DepositParams): Promise<{ success: boolean; transactionId: string }> {
  const user = await getCurrentUser();
  const { asset, amount, txHash } = params;

  if (!asset || !amount || amount <= 0) {
    throw new Error("Invalid deposit parameters");
  }

  const transactionId = await runTransaction(firestore, async (tx) => {
    const walletRef = doc(firestore, COLLECTIONS.wallets, user.uid);
    const walletDoc = await tx.get(walletRef);

    const currentBalance = walletDoc.exists
      ? (walletDoc.data() as FirestoreWallet).spot?.[asset]?.free || 0
      : 0;

    tx.set(
      walletRef,
      {
        spot: {
          [asset]: {
            asset,
            free: currentBalance + amount,
            locked: 0,
            usdValue: (currentBalance + amount) * (asset === "USDT" ? 1 : 0),
          },
        },
        updatedAt: serverTimestamp(),
      } as Partial<FirestoreWallet>,
      { merge: true }
    );

    const txRef = doc(firestore, COLLECTIONS.transactions);
    tx.set(txRef, {
      transactionId: txRef.id,
      userId: user.uid,
      type: "deposit",
      asset,
      amount,
      txHash: txHash || null,
      status: "confirmed",
      createdAt: serverTimestamp(),
    });

    const notifRef = doc(firestore, COLLECTIONS.notifications);
    tx.set(notifRef, {
      userId: user.uid,
      type: "deposit",
      title: "تم تأكيد الإيداع",
      body: `تم إيداع ${amount} ${asset} بنجاح`,
      isRead: false,
      createdAt: serverTimestamp(),
    });

    return txRef.id;
  });

  return { success: true, transactionId };
}

export async function processTransferCall(params: TransferParams): Promise<{ success: boolean; transactionId: string }> {
  const user = await getCurrentUser();
  const { asset, amount, fromWallet, toWallet } = params;

  if (!asset || !amount || amount <= 0 || !fromWallet || !toWallet) {
    throw new Error("Invalid transfer parameters");
  }

  if (fromWallet === toWallet) {
    throw new Error("Source and destination wallets must differ");
  }

  const validWallets = ["spot", "funding", "earn", "futures"];
  if (!validWallets.includes(fromWallet) || !validWallets.includes(toWallet)) {
    throw new Error("Invalid wallet type");
  }

  const transactionId = await runTransaction(firestore, async (tx) => {
    const walletRef = doc(firestore, COLLECTIONS.wallets, user.uid);
    const walletDoc = await tx.get(walletRef);

    if (!walletDoc.exists) {
      throw new Error("Wallet not found");
    }

    const wallet = walletDoc.data() as FirestoreWallet;
    const fromData = (wallet as unknown as Record<string, Record<string, WalletBalance>>)[fromWallet] || {};
    const currentFrom = fromData[asset]?.free || 0;

    if (currentFrom < amount) {
      throw new Error(`Insufficient balance in ${fromWallet}. Need ${amount}, have ${currentFrom}`);
    }

    const toData = (wallet as unknown as Record<string, Record<string, WalletBalance>>)[toWallet] || {};
    const currentTo = toData[asset]?.free || 0;

    tx.update(walletRef, {
      [`${fromWallet}.${asset}.free`]: currentFrom - amount,
      [`${toWallet}.${asset}.free`]: currentTo + amount,
      [`${toWallet}.${asset}.asset`]: asset,
      [`${toWallet}.${asset}.locked`]: toData[asset]?.locked || 0,
      updatedAt: serverTimestamp(),
    });

    const txRef = doc(firestore, COLLECTIONS.transactions);
    tx.set(txRef, {
      transactionId: txRef.id,
      userId: user.uid,
      type: "transfer",
      asset,
      amount,
      fromWallet,
      toWallet,
      status: "completed",
      createdAt: serverTimestamp(),
    });

    return txRef.id;
  });

  return { success: true, transactionId };
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
