import { NextResponse } from 'next/server';
import { mockMarketPairs, mockAssets } from '@/lib/mock-data';

export async function GET() {
  try {
    const stats = {
      totalMarketCap: mockAssets.reduce((acc, a) => acc + a.marketCap, 0),
      totalVolume: mockMarketPairs.reduce((acc, p) => acc + p.quoteVolume, 0),
      btcDominance: ((mockAssets[0].marketCap / mockAssets.reduce((acc, a) => acc + a.marketCap, 0)) * 100),
      activeMarkets: mockMarketPairs.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        pairs: mockMarketPairs,
        stats,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
}
