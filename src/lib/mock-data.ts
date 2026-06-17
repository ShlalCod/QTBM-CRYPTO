// Mock data for QTBM BANK - simulates real market data
import type { CryptoAsset, MarketPair, WalletBalance, CandleData, OrderBookEntry, EarnProduct, P2PListing, LaunchProject, Notification, Order, TradeRecord, Transaction, SupportTicket, FAQ, EarnSubscription } from '@/types';

export const mockAssets: CryptoAsset[] = [
  { id: '1', symbol: 'BTC', name: 'Bitcoin', icon: '₿', price: 67432.18, change24h: 1234.56, changePercent24h: 1.86, high24h: 68250.00, low24h: 65800.00, volume24h: 28543200000, marketCap: 1325000000000, isFavorite: true },
  { id: '2', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 3521.45, change24h: 45.67, changePercent24h: 1.31, high24h: 3580.00, low24h: 3420.00, volume24h: 15432000000, marketCap: 423000000000, isFavorite: true },
  { id: '3', symbol: 'BNB', name: 'BNB', icon: '◆', price: 598.23, change24h: -12.45, changePercent24h: -2.04, high24h: 618.00, low24h: 590.00, volume24h: 1823000000, marketCap: 89200000000, isFavorite: true },
  { id: '4', symbol: 'SOL', name: 'Solana', icon: '◎', price: 178.92, change24h: 8.34, changePercent24h: 4.89, high24h: 185.00, low24h: 168.00, volume24h: 3421000000, marketCap: 79800000000, isFavorite: true },
  { id: '5', symbol: 'XRP', name: 'XRP', icon: '✕', price: 0.6234, change24h: -0.0156, changePercent24h: -2.44, high24h: 0.6480, low24h: 0.6100, volume24h: 1543000000, marketCap: 34200000000 },
  { id: '6', symbol: 'ADA', name: 'Cardano', icon: '♢', price: 0.4521, change24h: 0.0123, changePercent24h: 2.80, high24h: 0.4680, low24h: 0.4320, volume24h: 543000000, marketCap: 16100000000 },
  { id: '7', symbol: 'DOGE', name: 'Dogecoin', icon: 'Ð', price: 0.1234, change24h: 0.0045, changePercent24h: 3.78, high24h: 0.1290, low24h: 0.1170, volume24h: 1234000000, marketCap: 17800000000 },
  { id: '8', symbol: 'AVAX', name: 'Avalanche', icon: '▲', price: 35.67, change24h: -1.23, changePercent24h: -3.33, high24h: 37.80, low24h: 34.50, volume24h: 654000000, marketCap: 13200000000 },
  { id: '9', symbol: 'DOT', name: 'Polkadot', icon: '●', price: 7.23, change24h: 0.15, changePercent24h: 2.12, high24h: 7.45, low24h: 6.98, volume24h: 321000000, marketCap: 9800000000 },
  { id: '10', symbol: 'MATIC', name: 'Polygon', icon: '⬡', price: 0.7234, change24h: -0.0234, changePercent24h: -3.13, high24h: 0.7560, low24h: 0.7000, volume24h: 432000000, marketCap: 7100000000 },
  { id: '11', symbol: 'LINK', name: 'Chainlink', icon: '⬡', price: 14.56, change24h: 0.78, changePercent24h: 5.66, high24h: 15.20, low24h: 13.50, volume24h: 567000000, marketCap: 8500000000 },
  { id: '12', symbol: 'UNI', name: 'Uniswap', icon: '🦄', price: 7.89, change24h: 0.23, changePercent24h: 3.00, high24h: 8.15, low24h: 7.50, volume24h: 234000000, marketCap: 5900000000 },
  { id: '13', symbol: 'ATOM', name: 'Cosmos', icon: '⚛', price: 8.92, change24h: -0.34, changePercent24h: -3.68, high24h: 9.45, low24h: 8.60, volume24h: 198000000, marketCap: 3400000000 },
  { id: '14', symbol: 'LTC', name: 'Litecoin', icon: 'Ł', price: 84.32, change24h: 2.15, changePercent24h: 2.61, high24h: 86.50, low24h: 81.00, volume24h: 456000000, marketCap: 6300000000 },
  { id: '15', symbol: 'NEAR', name: 'NEAR Protocol', icon: 'Ⓝ', price: 5.67, change24h: 0.34, changePercent24h: 6.38, high24h: 5.90, low24h: 5.20, volume24h: 345000000, marketCap: 6100000000 },
  { id: '16', symbol: 'APT', name: 'Aptos', icon: '⚡', price: 8.45, change24h: -0.56, changePercent24h: -6.22, high24h: 9.20, low24h: 8.10, volume24h: 267000000, marketCap: 3800000000 },
  { id: '17', symbol: 'ARB', name: 'Arbitrum', icon: '🔵', price: 1.12, change24h: 0.05, changePercent24h: 4.67, high24h: 1.18, low24h: 1.05, volume24h: 345000000, marketCap: 3200000000 },
  { id: '18', symbol: 'OP', name: 'Optimism', icon: '🔴', price: 2.34, change24h: 0.12, changePercent24h: 5.41, high24h: 2.45, low24h: 2.18, volume24h: 198000000, marketCap: 2700000000 },
  { id: '19', symbol: 'FIL', name: 'Filecoin', icon: '📄', price: 5.89, change24h: -0.23, changePercent24h: -3.76, high24h: 6.20, low24h: 5.60, volume24h: 156000000, marketCap: 2100000000 },
  { id: '20', symbol: 'IMX', name: 'Immutable', icon: '⭐', price: 1.56, change24h: 0.08, changePercent24h: 5.41, high24h: 1.62, low24h: 1.45, volume24h: 89000000, marketCap: 1900000000 },
];

export const mockMarketPairs: MarketPair[] = [
  // USDT pairs
  { symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT', price: 67432.18, change: 1234.56, changePercent: 1.86, high: 68250.00, low: 65800.00, volume: 2854320, quoteVolume: 192345000000 },
  { symbol: 'ETHUSDT', baseAsset: 'ETH', quoteAsset: 'USDT', price: 3521.45, change: 45.67, changePercent: 1.31, high: 3580.00, low: 3420.00, volume: 1543200, quoteVolume: 54321000000 },
  { symbol: 'BNBUSDT', baseAsset: 'BNB', quoteAsset: 'USDT', price: 598.23, change: -12.45, changePercent: -2.04, high: 618.00, low: 590.00, volume: 182300, quoteVolume: 10905000000 },
  { symbol: 'SOLUSDT', baseAsset: 'SOL', quoteAsset: 'USDT', price: 178.92, change: 8.34, changePercent: 4.89, high: 185.00, low: 168.00, volume: 342100, quoteVolume: 61209000000 },
  { symbol: 'XRPUSDT', baseAsset: 'XRP', quoteAsset: 'USDT', price: 0.6234, change: -0.0156, changePercent: -2.44, high: 0.6480, low: 0.6100, volume: 1543000, quoteVolume: 961000000 },
  { symbol: 'ADAUSDT', baseAsset: 'ADA', quoteAsset: 'USDT', price: 0.4521, change: 0.0123, changePercent: 2.80, high: 0.4680, low: 0.4320, volume: 543000, quoteVolume: 245000000 },
  { symbol: 'DOGEUSDT', baseAsset: 'DOGE', quoteAsset: 'USDT', price: 0.1234, change: 0.0045, changePercent: 3.78, high: 0.1290, low: 0.1170, volume: 1234000, quoteVolume: 152000000 },
  { symbol: 'AVAXUSDT', baseAsset: 'AVAX', quoteAsset: 'USDT', price: 35.67, change: -1.23, changePercent: -3.33, high: 37.80, low: 34.50, volume: 65400, quoteVolume: 2332000000 },
  { symbol: 'DOTUSDT', baseAsset: 'DOT', quoteAsset: 'USDT', price: 7.23, change: 0.15, changePercent: 2.12, high: 7.45, low: 6.98, volume: 321000, quoteVolume: 2318000000 },
  { symbol: 'LINKUSDT', baseAsset: 'LINK', quoteAsset: 'USDT', price: 14.56, change: 0.78, changePercent: 5.66, high: 15.20, low: 13.50, volume: 567000, quoteVolume: 8256000000 },
  { symbol: 'MATICUSDT', baseAsset: 'MATIC', quoteAsset: 'USDT', price: 0.7234, change: -0.0234, changePercent: -3.13, high: 0.7560, low: 0.7000, volume: 432000, quoteVolume: 312300000 },
  { symbol: 'UNIUSDT', baseAsset: 'UNI', quoteAsset: 'USDT', price: 7.89, change: 0.23, changePercent: 3.00, high: 8.15, low: 7.50, volume: 234000, quoteVolume: 1846000000 },
  { symbol: 'ATOMUSDT', baseAsset: 'ATOM', quoteAsset: 'USDT', price: 8.92, change: -0.34, changePercent: -3.68, high: 9.45, low: 8.60, volume: 198000, quoteVolume: 1766000000 },
  { symbol: 'LTCUSDT', baseAsset: 'LTC', quoteAsset: 'USDT', price: 84.32, change: 2.15, changePercent: 2.61, high: 86.50, low: 81.00, volume: 456000, quoteVolume: 3845000000 },
  { symbol: 'NEARUSDT', baseAsset: 'NEAR', quoteAsset: 'USDT', price: 5.67, change: 0.34, changePercent: 6.38, high: 5.90, low: 5.20, volume: 345000, quoteVolume: 1956000000 },
  { symbol: 'APTUSDT', baseAsset: 'APT', quoteAsset: 'USDT', price: 8.45, change: -0.56, changePercent: -6.22, high: 9.20, low: 8.10, volume: 267000, quoteVolume: 2256000000 },
  { symbol: 'ARBUSDT', baseAsset: 'ARB', quoteAsset: 'USDT', price: 1.12, change: 0.05, changePercent: 4.67, high: 1.18, low: 1.05, volume: 345000, quoteVolume: 3864000000 },
  { symbol: 'OPUSDT', baseAsset: 'OP', quoteAsset: 'USDT', price: 2.34, change: 0.12, changePercent: 5.41, high: 2.45, low: 2.18, volume: 198000, quoteVolume: 463300000 },
  { symbol: 'FILUSDT', baseAsset: 'FIL', quoteAsset: 'USDT', price: 5.89, change: -0.23, changePercent: -3.76, high: 6.20, low: 5.60, volume: 156000, quoteVolume: 918800000 },
  { symbol: 'IMXUSDT', baseAsset: 'IMX', quoteAsset: 'USDT', price: 1.56, change: 0.08, changePercent: 5.41, high: 1.62, low: 1.45, volume: 89000, quoteVolume: 138840000 },
  // BTC pairs
  { symbol: 'ETHBTC', baseAsset: 'ETH', quoteAsset: 'BTC', price: 0.05223, change: 0.00034, changePercent: 0.65, high: 0.05310, low: 0.05100, volume: 32100, quoteVolume: 1677000000 },
  { symbol: 'BNBBTC', baseAsset: 'BNB', quoteAsset: 'BTC', price: 0.00887, change: -0.00029, changePercent: -3.17, high: 0.00925, low: 0.00870, volume: 45600, quoteVolume: 405000000 },
  { symbol: 'SOLBTC', baseAsset: 'SOL', quoteAsset: 'BTC', price: 0.002653, change: 0.000089, changePercent: 3.47, high: 0.002740, low: 0.002510, volume: 123400, quoteVolume: 327000000 },
  { symbol: 'XRBPBTC', baseAsset: 'XRP', quoteAsset: 'BTC', price: 0.00000925, change: -0.00000037, changePercent: -3.84, high: 0.00000975, low: 0.00000890, volume: 567000, quoteVolume: 52400000 },
  { symbol: 'ADABTC', baseAsset: 'ADA', quoteAsset: 'BTC', price: 0.00000671, change: 0.00000015, changePercent: 2.29, high: 0.00000695, low: 0.00000640, volume: 234000, quoteVolume: 15700000 },
  // ETH pairs
  { symbol: 'BNBETH', baseAsset: 'BNB', quoteAsset: 'ETH', price: 0.16984, change: -0.00528, changePercent: -3.01, high: 0.17640, low: 0.16720, volume: 18900, quoteVolume: 112500000 },
  { symbol: 'SOLETH', baseAsset: 'SOL', quoteAsset: 'ETH', price: 0.05080, change: 0.00172, changePercent: 3.51, high: 0.05240, low: 0.04810, volume: 78500, quoteVolume: 399000000 },
  { symbol: 'LINKETH', baseAsset: 'LINK', quoteAsset: 'ETH', price: 0.004134, change: 0.000198, changePercent: 5.03, high: 0.004350, low: 0.003880, volume: 45600, quoteVolume: 188000000 },
  // BNB pairs
  { symbol: 'SOLBNB', baseAsset: 'SOL', quoteAsset: 'BNB', price: 0.29916, change: 0.01538, changePercent: 5.42, high: 0.31200, low: 0.28050, volume: 34500, quoteVolume: 61700000 },
  { symbol: 'CAKEBNB', baseAsset: 'CAKE', quoteAsset: 'BNB', price: 0.00567, change: 0.00034, changePercent: 6.38, high: 0.00600, low: 0.00520, volume: 56700, quoteVolume: 32100000 },
];

// Generate sparkline data for each market pair
// Deterministic seeded random for SSR compatibility
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateSparkline(pair: MarketPair): number[] {
  const points: number[] = [];
  let price = pair.price * (1 - pair.changePercent / 100 * 0.5);
  // Use pair symbol as seed for deterministic results
  const seedBase = pair.symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  for (let i = 0; i < 24; i++) {
    const volatility = pair.price * 0.005;
    price += (seededRandom(seedBase + i * 7) - 0.48) * volatility;
    price = Math.max(price * 0.95, Math.min(price * 1.05, price));
    points.push(price);
  }
  // Ensure the last point is close to the current price
  points[points.length - 1] = pair.price;
  return points;
}

export const mockWalletBalances: WalletBalance[] = [
  { asset: 'USDT', name: 'Tether USD', icon: '₮', total: 25430.50, available: 22150.30, locked: 3280.20, usdValue: 25430.50, btcValue: 0.3769 },
  { asset: 'BTC', name: 'Bitcoin', icon: '₿', total: 1.2345, available: 0.9876, locked: 0.2469, usdValue: 83234.56, btcValue: 1.2345 },
  { asset: 'ETH', name: 'Ethereum', icon: 'Ξ', total: 15.678, available: 12.345, locked: 3.333, usdValue: 55204.55, btcValue: 0.8189 },
  { asset: 'BNB', name: 'BNB', icon: '◆', total: 45.67, available: 40.00, locked: 5.67, usdValue: 27317.54, btcValue: 0.4050 },
  { asset: 'SOL', name: 'Solana', icon: '◎', total: 120.50, available: 100.00, locked: 20.50, usdValue: 21557.06, btcValue: 0.3195 },
  { asset: 'XRP', name: 'XRP', icon: '✕', total: 5000.00, available: 4500.00, locked: 500.00, usdValue: 3117.00, btcValue: 0.0462 },
  { asset: 'ADA', name: 'Cardano', icon: '♢', total: 8000.00, available: 7000.00, locked: 1000.00, usdValue: 3616.80, btcValue: 0.0536 },
  { asset: 'DOGE', name: 'Dogecoin', icon: 'Ð', total: 25000.00, available: 20000.00, locked: 5000.00, usdValue: 3085.00, btcValue: 0.0457 },
];

export const mockCandleData: CandleData[] = (() => {
  const data: CandleData[] = [];
  const now = Math.floor(Date.now() / 1000);
  let price = 67432.18;
  for (let i = 200; i >= 0; i--) {
    const time = now - i * 3600;
    const change = (Math.random() - 0.48) * 500;
    const open = price;
    price += change;
    const close = price;
    const high = Math.max(open, close) + Math.random() * 300;
    const low = Math.min(open, close) - Math.random() * 300;
    data.push({
      time,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.round(Math.random() * 500 + 100),
    });
  }
  return data;
})();

export const mockOrderBook: { bids: OrderBookEntry[]; asks: OrderBookEntry[] } = (() => {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  let bidTotal = 0;
  let askTotal = 0;
  const basePrice = 67432.18;
  
  for (let i = 0; i < 15; i++) {
    const bidPrice = basePrice - (i + 1) * 12.5;
    const bidQty = Math.random() * 2 + 0.1;
    bidTotal += bidQty * bidPrice;
    bids.push({ price: bidPrice, quantity: bidQty, total: bidTotal });
    
    const askPrice = basePrice + (i + 1) * 12.5;
    const askQty = Math.random() * 2 + 0.1;
    askTotal += askQty * askPrice;
    asks.push({ price: askPrice, quantity: askQty, total: askTotal });
  }
  
  return { bids, asks };
})();

// Dynamic date helper - generates dates relative to now
const ago = (minutes: number) => new Date(Date.now() - minutes * 60000).toISOString();

export const mockOrders: Order[] = [
  { id: '1', market: 'BTCUSDT', type: 'limit', side: 'buy', price: 65000, quantity: 0.5, filledQty: 0, status: 'pending', createdAt: ago(15) },
  { id: '2', market: 'ETHUSDT', type: 'limit', side: 'sell', price: 3600, quantity: 5, filledQty: 2.5, status: 'partially_filled', createdAt: ago(90) },
  { id: '3', market: 'BNBUSDT', type: 'market', side: 'buy', price: undefined, quantity: 10, filledQty: 10, status: 'filled', createdAt: ago(360) },
  { id: '4', market: 'SOLUSDT', type: 'stop_limit', side: 'sell', price: 170, quantity: 50, filledQty: 0, status: 'pending', createdAt: ago(480) },
  { id: '5', market: 'BTCUSDT', type: 'limit', side: 'buy', price: 62000, quantity: 1, filledQty: 1, status: 'filled', createdAt: ago(1440) },
];

export const mockTrades: TradeRecord[] = [
  { id: '1', market: 'BTCUSDT', side: 'buy', price: 67432.18, quantity: 0.25, fee: 0.00025, feeAsset: 'BTC', total: 16858.05, createdAt: ago(20) },
  { id: '2', market: 'ETHUSDT', side: 'sell', price: 3521.45, quantity: 2.5, fee: 8.80, feeAsset: 'USDT', total: 8803.63, createdAt: ago(120) },
  { id: '3', market: 'BNBUSDT', side: 'buy', price: 598.23, quantity: 10, fee: 5.98, feeAsset: 'BNB', total: 5982.30, createdAt: ago(360) },
  { id: '4', market: 'SOLUSDT', side: 'buy', price: 175.50, quantity: 20, fee: 3.51, feeAsset: 'SOL', total: 3510.00, createdAt: ago(480) },
  { id: '5', market: 'BTCUSDT', side: 'sell', price: 68000.00, quantity: 0.1, fee: 6.80, feeAsset: 'USDT', total: 6800.00, createdAt: ago(1440) },
];

export const mockEarnProducts: EarnProduct[] = [
  { id: '1', asset: 'USDT', icon: '₮', type: 'flexible', apr: 5.2, minAmount: 0, available: 1000000 },
  { id: '2', asset: 'BTC', icon: '₿', type: 'flexible', apr: 1.5, minAmount: 0.001, available: 500 },
  { id: '3', asset: 'ETH', icon: 'Ξ', type: 'flexible', apr: 2.1, minAmount: 0.01, available: 3000 },
  { id: '4', asset: 'BNB', icon: '◆', type: 'locked', apr: 8.5, duration: 30, minAmount: 0.1, available: 2000 },
  { id: '5', asset: 'BNB', icon: '◆', type: 'locked', apr: 12.5, duration: 90, minAmount: 0.1, available: 1500 },
  { id: '6', asset: 'SOL', icon: '◎', type: 'locked', apr: 7.8, duration: 60, minAmount: 1, available: 10000 },
  { id: '7', asset: 'DOT', icon: '●', type: 'staking', apr: 15.2, minAmount: 1, available: 50000 },
  { id: '8', asset: 'ADA', icon: '♢', type: 'staking', apr: 5.5, minAmount: 10, available: 100000 },
  { id: '9', asset: 'USDT', icon: '₮', type: 'locked', apr: 9.8, duration: 120, minAmount: 100, available: 500000 },
  { id: '10', asset: 'ETH', icon: 'Ξ', type: 'locked', apr: 4.5, duration: 60, minAmount: 0.1, available: 2000 },
];

export const mockP2PListings: P2PListing[] = [
  { id: '1', user: 'CryptoTrader99', asset: 'USDT', fiatCurrency: 'USD', price: 1.002, minAmount: 100, maxAmount: 5000, available: 15000, side: 'sell', paymentMethods: ['Bank Transfer', 'Zelle'], terms: 'Fast release after payment confirmation', completionRate: 98.5, ordersCount: 1250 },
  { id: '2', user: 'FastPay_USA', asset: 'USDT', fiatCurrency: 'USD', price: 1.001, minAmount: 50, maxAmount: 10000, available: 25000, side: 'sell', paymentMethods: ['PayPal', 'Venmo'], terms: 'Instant release', completionRate: 99.1, ordersCount: 2340 },
  { id: '3', user: 'BuyerKing', asset: 'USDT', fiatCurrency: 'USD', price: 0.998, minAmount: 200, maxAmount: 3000, available: 8000, side: 'buy', paymentMethods: ['Bank Transfer'], terms: 'Wire transfer only', completionRate: 97.2, ordersCount: 890 },
  { id: '4', user: 'DigitalGold', asset: 'BTC', fiatCurrency: 'USD', price: 67500, minAmount: 500, maxAmount: 50000, available: 2.5, side: 'sell', paymentMethods: ['Bank Transfer', 'Wire'], terms: 'Verified accounts only', completionRate: 99.5, ordersCount: 567 },
  { id: '5', user: 'SAR_Dealer', asset: 'USDT', fiatCurrency: 'SAR', price: 3.76, minAmount: 500, maxAmount: 20000, available: 30000, side: 'sell', paymentMethods: ['STC Pay', 'Bank Transfer'], terms: 'STC Pay preferred', completionRate: 96.8, ordersCount: 432 },
];

export const mockLaunchProjects: LaunchProject[] = [
  { id: '1', name: 'QuantumChain', symbol: 'QTC', icon: '⚡', description: 'Next-gen quantum-resistant blockchain', type: 'launchpad', tokenPrice: 0.15, totalSupply: 1000000000, minCommit: 100, maxCommit: 5000, startAt: ago(4320), endAt: new Date(Date.now() + 7*24*3600000).toISOString(), status: 'active' },
  { id: '2', name: 'MetaVerse AI', symbol: 'MVAI', icon: '🤖', description: 'AI-powered metaverse infrastructure', type: 'launchpool', tokenPrice: 0.05, totalSupply: 500000000, minCommit: 50, startAt: new Date(Date.now() + 3*24*3600000).toISOString(), endAt: new Date(Date.now() + 30*24*3600000).toISOString(), status: 'upcoming' },
  { id: '3', name: 'GreenEnergy Token', symbol: 'GET', icon: '🌿', description: 'Renewable energy trading on blockchain', type: 'airdrop', tokenPrice: 0, totalSupply: 200000000, minCommit: 0, startAt: ago(2880), endAt: new Date(Date.now() + 14*24*3600000).toISOString(), status: 'active' },
];

export function formatNumber(num: number, decimals = 2): string {
  if (num >= 1e9) return (num / 1e9).toFixed(decimals) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(decimals) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(decimals) + 'K';
  return num.toFixed(decimals);
}

export function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  if (price >= 0.01) return price.toFixed(4);
  return price.toFixed(8);
}

export function formatUSD(value: number): string {
  return '$' + formatPrice(value);
}

export const mockTransactions: Transaction[] = [
  { id: '1', type: 'deposit', asset: 'ETH', icon: 'Ξ', amount: 0.5, usdValue: 1760.73, description: 'Ethereum Deposit', status: 'confirmed', createdAt: ago(10) },
  { id: '2', type: 'withdrawal', asset: 'USDT', icon: '₮', amount: -100, usdValue: 100, description: 'USDT Withdrawal', status: 'completed', createdAt: ago(360) },
  { id: '3', type: 'trade', asset: 'BTC', icon: '₿', amount: 0.25, usdValue: 16858.05, description: 'Buy BTC/USDT', status: 'confirmed', createdAt: ago(20) },
  { id: '4', type: 'trade', asset: 'ETH', icon: 'Ξ', amount: -2.5, usdValue: 8803.63, description: 'Sell ETH/USDT', status: 'confirmed', createdAt: ago(120) },
  { id: '5', type: 'transfer', asset: 'BNB', icon: '◆', amount: 10, usdValue: 5982.30, description: 'Spot → Funding Transfer', status: 'confirmed', createdAt: ago(480) },
  { id: '6', type: 'earn', asset: 'USDT', icon: '₮', amount: 12.50, usdValue: 12.50, description: 'Flexible Earn Reward', status: 'confirmed', createdAt: ago(1440) },
  { id: '7', type: 'deposit', asset: 'USDT', icon: '₮', amount: 5000, usdValue: 5000, description: 'USDT Deposit via Bank', status: 'processing', createdAt: ago(5) },
  { id: '8', type: 'trade', asset: 'SOL', icon: '◎', amount: 20, usdValue: 3510.00, description: 'Buy SOL/USDT', status: 'confirmed', createdAt: ago(480) },
  { id: '9', type: 'withdrawal', asset: 'BTC', icon: '₿', amount: -0.1, usdValue: 6743.22, description: 'BTC Withdrawal', status: 'pending', createdAt: ago(240) },
  { id: '10', type: 'fee', asset: 'BNB', icon: '◆', amount: -0.05, usdValue: 29.91, description: 'Trading Fee', status: 'confirmed', createdAt: ago(360) },
];

export const mockEarnSubscriptions: EarnSubscription[] = [
  { id: '1', productId: '1', asset: 'USDT', icon: '₮', amount: 5000, apr: 5.2, type: 'flexible', accruedRewards: 12.50, startDate: ago(8640), status: 'active' },
  { id: '2', productId: '5', asset: 'BNB', icon: '◆', amount: 20, apr: 12.5, type: 'locked', accruedRewards: 1.85, startDate: ago(7200), endDate: new Date(Date.now() + 60*24*3600000).toISOString(), status: 'active' },
  { id: '3', productId: '7', asset: 'DOT', icon: '●', amount: 500, apr: 15.2, type: 'staking', accruedRewards: 8.76, startDate: ago(20160), status: 'active' },
];

export const mockSupportTickets: SupportTicket[] = [
  { id: '1', subject: 'Withdrawal delayed', category: 'Withdrawal', status: 'open', createdAt: ago(30), updatedAt: ago(10), lastMessage: 'My withdrawal has been pending for 6 hours' },
  { id: '2', subject: 'Cannot verify KYC', category: 'Verification', status: 'in_progress', createdAt: ago(720), updatedAt: ago(240), lastMessage: 'We are reviewing your documents' },
  { id: '3', subject: 'Incorrect trade fee', category: 'Trading', status: 'resolved', createdAt: ago(4320), updatedAt: ago(2880), lastMessage: 'The fee has been corrected and credited back' },
];

export const mockFAQs: FAQ[] = [
  { id: '1', question: 'How do I deposit crypto?', answer: 'Go to Wallet > Deposit, select the crypto you want to deposit, and send it to the provided address. Make sure to only send the correct crypto to the correct network.', category: 'Deposit' },
  { id: '2', question: 'How long do withdrawals take?', answer: 'Withdrawal times vary by crypto. BTC and ETH typically take 10-30 minutes. Some withdrawals require manual review which can take up to 24 hours.', category: 'Withdrawal' },
  { id: '3', question: 'What is KYC and why do I need it?', answer: 'KYC (Know Your Customer) is a verification process required by regulations. It helps protect your account and allows higher withdrawal limits.', category: 'Verification' },
  { id: '4', question: 'How do I enable 2FA?', answer: 'Go to More > Security Center > 2FA. Scan the QR code with an authenticator app like Google Authenticator. Save the backup key in a safe place.', category: 'Security' },
  { id: '5', question: 'What are the trading fees?', answer: 'Spot trading fee is 0.1% for both maker and taker. Using BNB for fee payment gives a 25% discount. VIP users enjoy lower fees.', category: 'Trading' },
  { id: '6', question: 'How does Earn work?', answer: 'QTBM Earn allows you to earn interest on your crypto holdings. Flexible products let you redeem anytime, while locked products offer higher APY for a fixed duration.', category: 'Earn' },
  { id: '7', question: 'How to trade on P2P?', answer: 'Go to P2P Trading, select Buy or Sell, choose a fiat currency and payment method. Browse listings and click Trade to start a transaction.', category: 'P2P' },
  { id: '8', question: 'What is Launchpad?', answer: 'QTBM Launchpad is a token launch platform where you can participate in new token sales. Use BNB or other supported tokens to commit.', category: 'Launchpad' },
];

export const mockNotifications: Notification[] = [
  { id: '1', type: 'security', title: 'New Login Detected', message: 'Your account was accessed from a new device in London, UK', isRead: false, createdAt: ago(5) },
  { id: '2', type: 'trade', title: 'Order Filled', message: 'Your buy order for 0.25 BTC has been filled at $67,432.18', isRead: false, createdAt: ago(15) },
  { id: '3', type: 'deposit', title: 'Deposit Confirmed', message: '0.5 ETH has been credited to your account', isRead: true, createdAt: ago(360) },
  { id: '4', type: 'system', title: 'System Maintenance', message: 'Scheduled maintenance on Jan 20, 2024 from 02:00-04:00 UTC', isRead: true, createdAt: ago(720) },
  { id: '5', type: 'promotion', title: 'Earn Up to 12% APY', message: 'Lock your BNB for 90 days and earn up to 12% APY', isRead: false, createdAt: ago(1440) },
  { id: '6', type: 'security', title: 'Password Changed', message: 'Your account password was changed successfully', isRead: true, createdAt: ago(2160) },
  { id: '7', type: 'trade', title: 'Limit Order Placed', message: 'Buy order for 0.5 BTC at $65,000 has been placed', isRead: false, createdAt: ago(25) },
  { id: '8', type: 'withdrawal', title: 'Withdrawal Processing', message: 'Your withdrawal of 0.1 BTC is being processed', isRead: false, createdAt: ago(240) },
  { id: '9', type: 'system', title: 'New Feature: Staking', message: 'You can now stake DOT and ADA directly from your wallet', isRead: true, createdAt: ago(2880) },
  { id: '10', type: 'promotion', title: 'Referral Bonus', message: 'Earn $10 for each friend who signs up and trades', isRead: true, createdAt: ago(4320) },
  { id: '11', type: 'security', title: '2FA Enabled', message: 'Two-factor authentication has been enabled on your account', isRead: true, createdAt: ago(8640) },
  { id: '12', type: 'trade', title: 'Stop Order Triggered', message: 'Your stop-limit sell order for SOL was triggered at $170', isRead: false, createdAt: ago(480) },
];

export function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
