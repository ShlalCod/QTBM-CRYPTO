import { NextResponse } from 'next/server';
import { mockOrders, mockTrades } from '@/lib/mock-data';
import type { Order } from '@/types';

// In-memory order storage (resets on server restart)
let openOrders: Order[] = [...mockOrders.filter(o => o.status === 'pending' || o.status === 'partially_filled')];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        openOrders,
        recentTrades: mockTrades,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { market, side, type, price, quantity, stopPrice } = body;

    if (!market || !side || !type || !quantity) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: market, side, type, quantity' },
        { status: 400 }
      );
    }

    if (!['buy', 'sell'].includes(side)) {
      return NextResponse.json(
        { success: false, error: 'Invalid side: must be "buy" or "sell"' },
        { status: 400 }
      );
    }

    if (!['market', 'limit', 'stop_limit'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type: must be "market", "limit", or "stop_limit"' },
        { status: 400 }
      );
    }

    if (type !== 'market' && !price) {
      return NextResponse.json(
        { success: false, error: 'Price is required for limit and stop_limit orders' },
        { status: 400 }
      );
    }

    if (type === 'stop_limit' && !stopPrice) {
      return NextResponse.json(
        { success: false, error: 'Stop price is required for stop_limit orders' },
        { status: 400 }
      );
    }

    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      market,
      type,
      side,
      price: type === 'market' ? undefined : parseFloat(price),
      quantity: parseFloat(quantity),
      filledQty: 0,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // For market orders, fill immediately
    if (type === 'market') {
      newOrder.filledQty = newOrder.quantity;
      newOrder.status = 'filled';
      return NextResponse.json({
        success: true,
        data: {
          order: newOrder,
          message: `Market ${side} order filled: ${quantity} ${market}`,
        },
      });
    }

    // Add to open orders
    openOrders.push(newOrder);

    return NextResponse.json({
      success: true,
      data: {
        order: newOrder,
        message: `${type === 'stop_limit' ? 'Stop-limit' : 'Limit'} ${side} order placed: ${quantity} ${market} at ${price}`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to place order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const orderIndex = openOrders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const cancelled = openOrders.splice(orderIndex, 1)[0];
    cancelled.status = 'canceled';

    return NextResponse.json({
      success: true,
      data: {
        order: cancelled,
        message: `Order ${orderId} cancelled`,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
