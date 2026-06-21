/**
 * QTBM CRYPTO — Process Withdraw API (replaces Cloud Function)
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

    const { asset, amount, address, network } = await req.json();

    if (!asset || !amount || amount <= 0 || !address) {
      return NextResponse.json(
        { error: 'Invalid withdrawal parameters' },
        { status: 400 }
      );
    }

    const result = await adminDb.runTransaction(async (tx) => {
      const walletRef = adminDb.collection('wallets').doc(uid);
      const walletDoc = await tx.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error('Wallet not found');
      }

      const wallet = walletDoc.data()!;
      const spot = wallet.spot || {};
      const balance = spot[asset]?.free || 0;

      if (balance < amount) {
        throw new Error('Insufficient balance');
      }

      tx.update(walletRef, {
        [`spot.${asset}.free`]: balance - amount,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const txRef = adminDb.collection('transactions').doc();
      tx.set(txRef, {
        transactionId: txRef.id,
        userId: uid,
        type: 'withdrawal',
        asset,
        amount,
        address,
        network: network || 'default',
        status: 'pending',
        createdAt: FieldValue.serverTimestamp(),
      });

      const notifRef = adminDb.collection('notifications').doc();
      tx.set(notifRef, {
        userId: uid,
        type: 'withdrawal',
        title: 'طلب سحب قيد المعالجة',
        body: `تم استلام طلب سحب ${amount} ${asset}`,
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { transactionId: txRef.id };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Withdrawal failed';
    const status = message.includes('Insufficient') || message.includes('not found')
      ? 400
      : message.includes('Unauthorized')
      ? 401
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
