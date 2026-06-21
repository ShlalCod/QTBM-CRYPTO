/**
 * QTBM CRYPTO — Execute Trade API (replaces Cloud Function)
 *
 * On Spark plan (no billing), Cloud Functions cannot be deployed.
 * This Next.js API route provides the same server-side validation
 * and Firestore transaction logic, but runs in the Next.js server.
 *
 * Security: verifies the Firebase ID token from the Authorization header,
 * then performs the trade in a Firestore transaction using the Admin SDK.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify auth token
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.substring(7);
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // 2. Parse and validate input
    const body = await req.json();
    const { symbol, side, quantity, price, orderType } = body;

    if (!symbol || !side || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid trade parameters' },
        { status: 400 }
      );
    }

    if (side !== 'buy' && side !== 'sell') {
      return NextResponse.json({ error: 'Invalid side' }, { status: 400 });
    }

    // 3. Execute trade in a Firestore transaction
    const result = await adminDb.runTransaction(async (tx) => {
      const walletRef = adminDb.collection('wallets').doc(uid);
      const walletDoc = await tx.get(walletRef);

      if (!walletDoc.exists) {
        throw new Error('Wallet not found');
      }

      const wallet = walletDoc.data()!;
      const spot = wallet.spot || {};
      const cost = quantity * (price || 0);
      const baseAsset = symbol.replace('USDT', '');

      if (side === 'buy') {
        const usdtBalance = spot.USDT?.free || 0;
        if (usdtBalance < cost) {
          throw new Error('Insufficient USDT balance');
        }
        const assetBalance = spot[baseAsset]?.free || 0;
        tx.update(walletRef, {
          [`spot.USDT.free`]: usdtBalance - cost,
          [`spot.USDT.usdValue`]: (usdtBalance - cost),
          [`spot.${baseAsset}.free`]: assetBalance + quantity,
          [`spot.${baseAsset}.asset`]: baseAsset,
          [`spot.${baseAsset}.locked`]: spot[baseAsset]?.locked || 0,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        const assetBalance = spot[baseAsset]?.free || 0;
        if (assetBalance < quantity) {
          throw new Error(`Insufficient ${baseAsset} balance`);
        }
        const usdtBalance = spot.USDT?.free || 0;
        tx.update(walletRef, {
          [`spot.${baseAsset}.free`]: assetBalance - quantity,
          [`spot.USDT.free`]: usdtBalance + cost,
          [`spot.USDT.usdValue`]: usdtBalance + cost,
          [`spot.USDT.asset`]: 'USDT',
          [`spot.USDT.locked`]: spot.USDT?.locked || 0,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      // Create trade record
      const tradeRef = adminDb.collection('trades').doc();
      tx.set(tradeRef, {
        tradeId: tradeRef.id,
        userId: uid,
        symbol,
        side,
        quantity,
        price: price || 0,
        orderType: orderType || 'market',
        status: 'filled',
        createdAt: FieldValue.serverTimestamp(),
      });

      // Create notification
      const notifRef = adminDb.collection('notifications').doc();
      tx.set(notifRef, {
        userId: uid,
        type: 'trade',
        title: side === 'buy' ? 'تم تنفيذ أمر شراء' : 'تم تنفيذ أمر بيع',
        body: `${side === 'buy' ? 'شراء' : 'بيع'} ${quantity} ${baseAsset} @ ${price || 'سوقي'}`,
        isRead: false,
        createdAt: FieldValue.serverTimestamp(),
      });

      return { tradeId: tradeRef.id };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Trade failed';
    const status = message.includes('Insufficient') || message.includes('not found')
      ? 400
      : message.includes('Unauthorized')
      ? 401
      : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
