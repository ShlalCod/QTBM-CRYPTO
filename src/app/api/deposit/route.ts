/**
 * QTBM CRYPTO — Process Deposit API (replaces Cloud Function)
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

    const { asset, amount, txHash } = await req.json();

    if (!asset || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid deposit parameters' },
        { status: 400 }
      );
    }

    const result = await adminDb.runTransaction(async (tx) => {
      const walletRef = adminDb.collection('wallets').doc(uid);
      const walletDoc = await tx.get(walletRef);

      const currentBalance = walletDoc.exists
        ? walletDoc.data()!.spot?.[asset]?.free || 0
        : 0;

      tx.set(
        walletRef,
        {
          spot: {
            [asset]: {
              asset,
              free: currentBalance + amount,
              locked: 0,
              usdValue: (currentBalance + amount) * (asset === 'USDT' ? 1 : 0),
            },
          },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      const txRef = adminDb.collection('transactions').doc();
      tx.set(txRef, {
        transactionId: txRef.id,
        userId: uid,
        type: 'deposit',
        asset,
        amount,
        txHash: txHash || null,
        status: 'confirmed',
        createdAt: FieldValue.serverTimestamp(),
      });

      const notifRef = adminDb.collection('notifications').doc();
      tx.set(notifRef, {
        userId: uid,
        type: 'deposit',
        title: 'تم تأكيد الإيداع',
        body: `تم إيداع ${amount} ${asset} بنجاح`,
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { transactionId: txRef.id };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Deposit failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
