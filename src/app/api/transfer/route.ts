/**
 * QTBM CRYPTO — Process Transfer API (replaces Cloud Function)
 * Transfer between spot/funding/earn/futures wallets.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.substring(7);
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const { asset, amount, fromWallet, toWallet } = await req.json();

    if (!asset || !amount || amount <= 0 || !fromWallet || !toWallet) {
      return NextResponse.json(
        { error: 'Invalid transfer parameters' },
        { status: 400 }
      );
    }

    if (fromWallet === toWallet) {
      return NextResponse.json(
        { error: 'Source and destination wallets must differ' },
        { status: 400 }
      );
    }

    const validWallets = ['spot', 'funding', 'earn', 'futures'];
    if (!validWallets.includes(fromWallet) || !validWallets.includes(toWallet)) {
      return NextResponse.json({ error: 'Invalid wallet type' }, { status: 400 });
    }

    const result = await adminDb.runTransaction(async (tx) => {
      const walletRef = adminDb.collection('wallets').doc(uid);
      const walletDoc = await tx.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error('Wallet not found');
      }

      const wallet = walletDoc.data()!;
      const fromData = (wallet as Record<string, unknown>)[fromWallet] as
        | Record<string, { free?: number; locked?: number; usdValue?: number }>
        | undefined;
      const currentFrom = fromData?.[asset]?.free || 0;

      if (currentFrom < amount) {
        throw new Error('Insufficient balance in source wallet');
      }

      const toData = (wallet as Record<string, unknown>)[toWallet] as
        | Record<string, { free?: number; locked?: number; usdValue?: number }>
        | undefined;
      const currentTo = toData?.[asset]?.free || 0;

      tx.update(walletRef, {
        [`${fromWallet}.${asset}.free`]: currentFrom - amount,
        [`${toWallet}.${asset}.free`]: currentTo + amount,
        [`${toWallet}.${asset}.asset`]: asset,
        [`${toWallet}.${asset}.locked`]: toData?.[asset]?.locked || 0,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const txRef = adminDb.collection('transactions').doc();
      tx.set(txRef, {
        transactionId: txRef.id,
        userId: uid,
        type: 'transfer',
        asset,
        amount,
        fromWallet,
        toWallet,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp(),
      });

      return { transactionId: txRef.id };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Transfer failed';
    const status = message.includes('Insufficient') || message.includes('not found')
      ? 400
      : message.includes('Unauthorized')
      ? 401
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
