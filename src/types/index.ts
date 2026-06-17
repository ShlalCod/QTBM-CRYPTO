// ============ QTBM BANK Types ============

export interface CryptoAsset {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  isFavorite?: boolean;
}

export interface MarketPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  quoteVolume: number;
}

export interface WalletBalance {
  asset: string;
  name: string;
  icon: string;
  total: number;
  available: number;
  locked: number;
  usdValue: number;
  btcValue: number;
}

export interface Order {
  id: string;
  market: string;
  type: 'market' | 'limit' | 'stop_limit' | 'stop_market';
  side: 'buy' | 'sell';
  price?: number;
  quantity: number;
  filledQty: number;
  status: 'pending' | 'partially_filled' | 'filled' | 'canceled';
  createdAt: string;
}

export interface TradeRecord {
  id: string;
  market: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  feeAsset: string;
  total: number;
  createdAt: string;
}

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

export interface EarnProduct {
  id: string;
  asset: string;
  icon: string;
  type: 'flexible' | 'locked' | 'staking';
  apr: number;
  duration?: number;
  minAmount: number;
  maxAmount?: number;
  available: number;
}

export interface P2PListing {
  id: string;
  user: string;
  asset: string;
  fiatCurrency: string;
  price: number;
  minAmount: number;
  maxAmount: number;
  available: number;
  side: 'buy' | 'sell';
  paymentMethods: string[];
  terms?: string;
  completionRate: number;
  ordersCount: number;
}

export interface Notification {
  id: string;
  type: 'security' | 'trade' | 'deposit' | 'withdrawal' | 'system' | 'promotion';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'transfer' | 'earn' | 'fee';
  asset: string;
  icon: string;
  amount: number;
  usdValue: number;
  description: string;
  status: 'pending' | 'confirmed' | 'failed' | 'processing' | 'completed';
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  lastMessage: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface EarnSubscription {
  id: string;
  productId: string;
  asset: string;
  icon: string;
  amount: number;
  apr: number;
  type: 'flexible' | 'locked' | 'staking';
  accruedRewards: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'matured' | 'redeemed';
}

export interface LaunchProject {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  description?: string;
  type: 'launchpad' | 'launchpool' | 'airdrop';
  tokenPrice: number;
  totalSupply: number;
  minCommit: number;
  maxCommit?: number;
  startAt: string;
  endAt: string;
  status: 'upcoming' | 'active' | 'completed';
}

export type AppView = 
  | 'home' 
  | 'markets' 
  | 'trade' 
  | 'wallet' 
  | 'more'
  | 'earn'
  | 'p2p'
  | 'launchpad'
  | 'profile'
  | 'settings'
  | 'notifications'
  | 'support'
  | 'kyc'
  | 'login'
  | 'register'
  | 'asset-detail'
  | 'deposit'
  | 'withdraw'
  | 'transfer'
  | 'order-history'
  | 'trade-history'
  | 'staking'
  | 'futures'
  | 'margin'
  | 'admin'
  | 'ai-chat'
  | 'swap'
  | 'referral'
  | 'portfolio-analytics'
  | 'copy-trading'
  | 'voting'
  | 'price-alerts'
  | 'leaderboard'
  | 'news-feed'
  | 'transaction-detail'
  | 'strategy-bot'
  | 'savings-goals'
  | 'convert'
  | 'gift-cards'
  | 'tax-report'
  | 'trade-challenge'
  | 'nft-gallery'
  | 'defi-dashboard'
  | 'social-feed';

export interface UserState {
  id?: string;
  email?: string;
  name?: string;
  avatar?: string;
  role: string;
  status: string;
  twoFactorEnabled: boolean;
  isAuthenticated: boolean;
  kycStatus: string;
}
