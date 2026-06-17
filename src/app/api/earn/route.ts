import { NextResponse } from 'next/server';
import { mockEarnProducts, mockEarnSubscriptions } from '@/lib/mock-data';

export async function GET() {
  const totalEarned = mockEarnSubscriptions.reduce((sum, s) => sum + s.accruedRewards, 0);

  return NextResponse.json({
    products: mockEarnProducts,
    subscriptions: mockEarnSubscriptions,
    summary: {
      totalEarned,
      activeSubscriptions: mockEarnSubscriptions.filter((s) => s.status === 'active').length,
      highestApr: Math.max(...mockEarnProducts.map((p) => p.apr)),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, amount } = body;

    if (!productId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    const product = mockEarnProducts.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: String(Date.now()),
        productId,
        asset: product.asset,
        amount,
        apr: product.apr,
        type: product.type,
        accruedRewards: 0,
        startDate: new Date().toISOString(),
        status: 'active',
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
