import { NextResponse } from 'next/server';
import { mockWalletBalances, mockTransactions } from '@/lib/mock-data';

export async function GET() {
  const totalBalance = mockWalletBalances.reduce((sum, b) => sum + b.usdValue, 0);
  const totalBtc = mockWalletBalances.reduce((sum, b) => sum + b.btcValue, 0);

  return NextResponse.json({
    balances: mockWalletBalances,
    transactions: mockTransactions,
    summary: {
      totalBalance,
      totalBtc,
      pnl24h: totalBalance * 0.0234,
      pnlPercent24h: 2.34,
      assetCount: mockWalletBalances.length,
    },
  });
}
