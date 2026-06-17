import { NextResponse } from 'next/server';

export async function GET() {
  // Mock futures data
  const perpContracts = [
    { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', fundingRate: 0.0100, indexPrice: 67400, markPrice: 67432, openInterest: 12500000000 },
    { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', fundingRate: 0.0085, indexPrice: 3518, markPrice: 3521, openInterest: 5800000000 },
    { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', fundingRate: 0.0120, indexPrice: 178.5, markPrice: 178.9, openInterest: 2100000000 },
    { symbol: 'BNBUSDT', base: 'BNB', quote: 'USDT', fundingRate: -0.0035, indexPrice: 597.8, markPrice: 598.2, openInterest: 1500000000 },
  ];

  const positions = [
    { id: '1', symbol: 'BTCUSDT', side: 'long', size: 0.5, entryPrice: 66800, leverage: 10, margin: 3340, liqPrice: 60120 },
    { id: '2', symbol: 'ETHUSDT', side: 'short', size: 5, entryPrice: 3580, leverage: 20, margin: 895, liqPrice: 3759 },
    { id: '3', symbol: 'SOLUSDT', side: 'long', size: 50, entryPrice: 172.5, leverage: 5, margin: 1725, liqPrice: 138.0 },
  ];

  const fundingHistory = [
    { timestamp: '2024-01-15 08:00:00', symbol: 'BTCUSDT', rate: 0.0100 },
    { timestamp: '2024-01-15 00:00:00', symbol: 'BTCUSDT', rate: 0.0095 },
    { timestamp: '2024-01-14 16:00:00', symbol: 'BTCUSDT', rate: 0.0102 },
    { timestamp: '2024-01-14 08:00:00', symbol: 'ETHUSDT', rate: 0.0085 },
    { timestamp: '2024-01-14 00:00:00', symbol: 'ETHUSDT', rate: 0.0078 },
  ];

  const accountInfo = {
    totalWalletBalance: 22430.50,
    totalUnrealizedPnl: 931.00,
    totalMarginBalance: 23361.50,
    availableBalance: 16470.50,
    totalInitialMargin: 5960.00,
    totalMaintenanceMargin: 2980.00,
    marginRatio: 392.6,
  };

  return NextResponse.json({
    perpContracts,
    positions,
    fundingHistory,
    accountInfo,
  });
}
