/**
 * QTBM CRYPTO — Firebase Cloud Functions (SEC-004)
 *
 * All sensitive financial operations (trade, deposit, withdraw, transfer)
 * MUST go through these callable functions. The client never writes to
 * Firestore wallet/trade/order collections directly.
 *
 * Deploy: firebase deploy --only functions
 */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize admin SDK
admin.initializeApp();
const db = admin.firestore();

// ─── Helper: verify auth ─────────────────────────────────────────────────
function requireAuth(context: functions.https.CallableContext): admin.auth.UserRecord {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "Authentication required.");
  }
  return context.auth as unknown as admin.auth.UserRecord;
}

// ─── executeTrade ─────────────────────────────────────────────────────────
export const executeTrade = functions.https.onCall(async (data, context) => {
  const auth = requireAuth(context);
  const uid = auth.uid;
  const { symbol, side, quantity, price, orderType } = data;

  if (!symbol || !side || !quantity || quantity <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Missing or invalid trade parameters.");
  }

  const result = await db.runTransaction(async (tx) => {
    const walletRef = db.collection("wallets").doc(uid);
    const walletDoc = await tx.get(walletRef);

    if (!walletDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Wallet not found.");
    }

    const wallet = walletDoc.data()!;
    const cost = quantity * (price || 0);

    if (side === "buy") {
      const usdtBalance = wallet.balances?.USDT || 0;
      if (usdtBalance < cost) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient USDT balance.");
      }
      tx.update(walletRef, {
        "balances.USDT": usdtBalance - cost,
        [`balances.${symbol.replace("USDT", "")}`]:
          (wallet.balances?.[symbol.replace("USDT", "")] || 0) + quantity,
      });
    } else if (side === "sell") {
      const assetBalance = wallet.balances?.[symbol.replace("USDT", "")] || 0;
      if (assetBalance < quantity) {
        throw new functions.https.HttpsError("failed-precondition", "Insufficient asset balance.");
      }
      tx.update(walletRef, {
        [`balances.${symbol.replace("USDT", "")}`]: assetBalance - quantity,
        "balances.USDT": (wallet.balances?.USDT || 0) + cost,
      });
    }

    const tradeRef = db.collection("trades").doc();
    tx.set(tradeRef, {
      tradeId: tradeRef.id,
      userId: uid,
      symbol,
      side,
      quantity,
      price,
      orderType: orderType || "market",
      status: "filled",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { tradeId: tradeRef.id };
  });

  return { success: true, ...result };
});

// ─── processWithdraw ──────────────────────────────────────────────────────
export const processWithdraw = functions.https.onCall(async (data, context) => {
  const auth = requireAuth(context);
  const uid = auth.uid;
  const { asset, amount, address, network } = data;

  if (!asset || !amount || amount <= 0 || !address) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid withdrawal parameters.");
  }

  const result = await db.runTransaction(async (tx) => {
    const walletRef = db.collection("wallets").doc(uid);
    const walletDoc = await tx.get(walletRef);

    if (!walletDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Wallet not found.");
    }

    const wallet = walletDoc.data()!;
    const balance = wallet.balances?.[asset] || 0;

    if (balance < amount) {
      throw new functions.https.HttpsError("failed-precondition", "Insufficient balance.");
    }

    tx.update(walletRef, {
      [`balances.${asset}`]: balance - amount,
    });

    const txRef = db.collection("transactions").doc();
    tx.set(txRef, {
      transactionId: txRef.id,
      userId: uid,
      type: "withdrawal",
      asset,
      amount,
      address,
      network,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { transactionId: txRef.id };
  });

  return { success: true, ...result };
});

// ─── processDeposit ───────────────────────────────────────────────────────
export const processDeposit = functions.https.onCall(async (data, context) => {
  const auth = requireAuth(context);
  const uid = auth.uid;
  const { asset, amount, txHash } = data;

  if (!asset || !amount || amount <= 0) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid deposit parameters.");
  }

  const result = await db.runTransaction(async (tx) => {
    const walletRef = db.collection("wallets").doc(uid);
    const walletDoc = await tx.get(walletRef);

    const currentBalance = walletDoc.exists
      ? walletDoc.data()!.balances?.[asset] || 0
      : 0;

    tx.set(
      walletRef,
      {
        balances: { [asset]: currentBalance + amount },
      },
      { merge: true }
    );

    const txRef = db.collection("transactions").doc();
    tx.set(txRef, {
      transactionId: txRef.id,
      userId: uid,
      type: "deposit",
      asset,
      amount,
      txHash: txHash || null,
      status: "confirmed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { transactionId: txRef.id };
  });

  return { success: true, ...result };
});

// ─── processTransfer ──────────────────────────────────────────────────────
export const processTransfer = functions.https.onCall(async (data, context) => {
  const auth = requireAuth(context);
  const uid = auth.uid;
  const { asset, amount, fromWallet, toWallet } = data;

  if (!asset || !amount || amount <= 0 || !fromWallet || !toWallet) {
    throw new functions.https.HttpsError("invalid-argument", "Invalid transfer parameters.");
  }

  const result = await db.runTransaction(async (tx) => {
    const walletRef = db.collection("wallets").doc(uid);
    const walletDoc = await tx.get(walletRef);

    if (!walletDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Wallet not found.");
    }

    const wallet = walletDoc.data()!;
    const fromKey = `${fromWallet}.${asset}`;
    const toKey = `${toWallet}.${asset}`;
    const fromBalance = (wallet as Record<string, unknown>)[fromWallet] as Record<string, number> | undefined;
    const currentFrom = fromBalance?.[asset] || 0;

    if (currentFrom < amount) {
      throw new functions.https.HttpsError("failed-precondition", "Insufficient balance in source wallet.");
    }

    const toBalance = (wallet as Record<string, unknown>)[toWallet] as Record<string, number> | undefined;
    const currentTo = toBalance?.[asset] || 0;

    tx.update(walletRef, {
      [fromKey]: currentFrom - amount,
      [toKey]: currentTo + amount,
    });

    const txRef = db.collection("transactions").doc();
    tx.set(txRef, {
      transactionId: txRef.id,
      userId: uid,
      type: "transfer",
      asset,
      amount,
      fromWallet,
      toWallet,
      status: "completed",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { transactionId: txRef.id };
  });

  return { success: true, ...result };
});
