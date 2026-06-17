import { NextResponse } from 'next/server';
import { mockP2PListings } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const side = searchParams.get('side');
  const fiatCurrency = searchParams.get('fiat');
  const paymentMethod = searchParams.get('payment');

  let filtered = [...mockP2PListings];

  if (side) {
    filtered = filtered.filter((l) => l.side === side);
  }
  if (fiatCurrency) {
    filtered = filtered.filter((l) => l.fiatCurrency === fiatCurrency);
  }
  if (paymentMethod) {
    filtered = filtered.filter((l) =>
      l.paymentMethods.some((pm) => pm.toLowerCase().includes(paymentMethod.toLowerCase()))
    );
  }

  return NextResponse.json({
    listings: filtered,
    fiatCurrencies: ['USD', 'EUR', 'SAR', 'AED'],
    paymentMethods: ['Bank Transfer', 'Zelle', 'PayPal', 'Venmo', 'Wire', 'STC Pay'],
  });
}
