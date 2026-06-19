'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import {
  mockWalletBalances,
  mockTransactions,
  formatPrice,
  formatNumber,
  getTimeAgo,
} from '@/lib/mock-data';
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ShoppingCart,
  Wallet,
  Landmark,
  PiggyBank,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

type WalletTab = 'spot' | 'funding' | 'earn' | 'futures';

const walletTabs: { id: WalletTab; color: string; icon: React.ElementType }[] = [
  { id: 'spot', color: 'text-[#2B7DE9]', icon: Wallet },
  { id: 'funding', color: 'text-[#0ECB81]', icon: Landmark },
  { id: 'earn', color: 'text-[#F0B90B]', icon: PiggyBank },
  { id: 'futures', color: 'text-[#F6465D]', icon: Flame },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string }> = {
  confirmed: { icon: CheckCircle2, color: 'text-[#0ECB81]' },
  completed: { icon: CheckCircle2, color: 'text-[#0ECB81]' },
  processing: { icon: Loader2, color: 'text-[#F0B90B]' },
  pending: { icon: Clock, color: 'text-[#848E9C]' },
  failed: { icon: XCircle, color: 'text-[#F6465D]' },
};

const typeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  deposit: { icon: ArrowDownRight, color: 'text-[#0ECB81]', bgColor: 'bg-[#0ECB81]/10' },
  withdrawal: { icon: ArrowUpRight, color: 'text-[#F6465D]', bgColor: 'bg-[#F6465D]/10' },
  trade: { icon: ShoppingCart, color: 'text-[#F0B90B]', bgColor: 'bg-[#F0B90B]/10' },
  transfer: { icon: ArrowLeftRight, color: 'text-[#848E9C]', bgColor: 'bg-[#848E9C]/10' },
  earn: { icon: TrendingUp, color: 'text-[#0ECB81]', bgColor: 'bg-[#0ECB81]/10' },
  fee: { icon: CreditCard, color: 'text-[#F6465D]', bgColor: 'bg-[#F6465D]/10' },
};

// Animated counter component for total balance
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState('0.00');

  useEffect(() => {
    const start = performance.now();
    const startVal = 0;
    const diff = value - startVal;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(formatPrice(startVal + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span className="tabular-nums">{display}</span>;
}

// ── Transaction Flow Visualization ────────────────────────────────────────────
function TransactionFlow() {
  const { t } = useTranslation();
  const pendingDeposits = 3;
  const pendingWithdrawals = 1;
  const pendingWallet = 5;

  return (
    <div className="bg-[#1E2329] rounded-xl p-4 border border-[#2B3139]">
      <h4 className="text-xs font-semibold text-[#848E9C] mb-3">{t('wallet.transactionFlow')}</h4>
      <div className="flex items-center justify-between relative">
        {/* Deposit Node */}
        <div className="flex flex-col items-center z-10">
          <div className="w-12 h-12 rounded-full bg-[#0ECB81]/10 border-2 border-[#0ECB81]/30 flex items-center justify-center relative">
            <ArrowDownRight className="h-5 w-5 text-[#0ECB81]" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#0ECB81] text-[#0B0E11] text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center pulse-badge">
              {pendingDeposits}
            </span>
          </div>
          <span className="text-[10px] text-[#848E9C] mt-1.5 font-medium">{t('wallet.deposit')}</span>
        </div>

        {/* Flow line 1: Deposit → Wallet */}
        <div className="flex-1 mx-2 relative h-0.5">
          <div className="absolute inset-0 border-t-2 border-dashed border-[#2B3139]" />
          <div className="flow-dot" style={{ top: -3, left: '10%', animationDelay: '0s' }} />
          <div className="flow-dot" style={{ top: -3, left: '60%', animationDelay: '1s' }} />
        </div>

        {/* Wallet Node */}
        <div className="flex flex-col items-center z-10">
          <div className="w-14 h-14 rounded-full bg-[#F0B90B]/10 border-2 border-[#F0B90B]/30 flex items-center justify-center relative">
            <Wallet className="h-6 w-6 text-[#F0B90B]" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#F0B90B] text-[#0B0E11] text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center pulse-badge" style={{ animationDelay: '0.5s' }}>
              {pendingWallet}
            </span>
          </div>
          <span className="text-[10px] text-[#F0B90B] mt-1.5 font-semibold">{t('wallet.title')}</span>
        </div>

        {/* Flow line 2: Wallet → Withdraw */}
        <div className="flex-1 mx-2 relative h-0.5">
          <div className="absolute inset-0 border-t-2 border-dashed border-[#2B3139]" />
          <div className="flow-dot" style={{ top: -3, left: '30%', animationDelay: '0.5s' }} />
        </div>

        {/* Withdraw Node */}
        <div className="flex flex-col items-center z-10">
          <div className="w-12 h-12 rounded-full bg-[#F6465D]/10 border-2 border-[#F6465D]/30 flex items-center justify-center relative">
            <ArrowUpRight className="h-5 w-5 text-[#F6465D]" />
            <span className="absolute -top-1.5 -right-1.5 bg-[#F6465D] text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center pulse-badge" style={{ animationDelay: '1s' }}>
              {pendingWithdrawals}
            </span>
          </div>
          <span className="text-[10px] text-[#848E9C] mt-1.5 font-medium">{t('wallet.withdraw')}</span>
        </div>
      </div>
    </div>
  );
}

// ── Portfolio Performance 7-Day Area Chart ────────────────────────────────────
function PortfolioPerformanceChart() {
  const { t } = useTranslation();
  const data = useMemo(() => {
    // Simulated 7-day portfolio values
    const values = [42150, 42800, 41950, 43500, 43100, 44200, 44850];
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return { values, labels };
  }, []);

  const w = 300;
  const h = 80;
  const padding = { top: 8, bottom: 16, left: 4, right: 4 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const minVal = Math.min(...data.values) * 0.995;
  const maxVal = Math.max(...data.values) * 1.005;
  const range = maxVal - minVal || 1;

  const toY = (val: number) => padding.top + chartH * (1 - (val - minVal) / range);
  const toX = (i: number) => padding.left + (i / (data.values.length - 1)) * chartW;

  const linePath = data.values.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
  const areaPath = `${linePath} L${toX(data.values.length - 1)},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

  const change = data.values[data.values.length - 1] - data.values[0];
  const changePct = ((change / data.values[0]) * 100).toFixed(2);
  const isPositive = change >= 0;

  return (
    <div className="bg-[#1E2329] rounded-xl p-4 border border-[#2B3139]">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-[#848E9C]">{t('wallet.portfolioPerformance')}</h4>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="h-3 w-3 text-[#0ECB81]" />
          ) : (
            <TrendingDown className="h-3 w-3 text-[#F6465D]" />
          )}
          <span className={`text-[10px] font-semibold tabular-nums ${isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
            {isPositive ? '+' : ''}{changePct}% (7d)
          </span>
        </div>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full">
        <defs>
          <linearGradient id="miniChartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0ECB81" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0ECB81" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {/* Area fill */}
        <path d={areaPath} fill="url(#miniChartGrad)" className="mini-chart-gradient" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#0ECB81" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Latest point */}
        <circle cx={toX(data.values.length - 1)} cy={toY(data.values[data.values.length - 1])} r="3" fill="#0ECB81" />
        {/* Day labels */}
        {data.labels.map((label, i) => (
          <text key={i} x={toX(i)} y={h - 2} textAnchor="middle" fill="#5E6673" fontSize="7">{label}</text>
        ))}
      </svg>
    </div>
  );
}

// Deterministic sparkline for wallet assets
function WalletSparkline({ positive, width = 40, height = 20, seed = 1 }: { positive: boolean; width?: number; height?: number; seed?: number }) {
  const seededRandom = (s: number) => { const x = Math.sin(s) * 10000; return x - Math.floor(x); };
  const points = useMemo(() => {
    const pts: string[] = [];
    let y = height / 2;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width;
      const delta = (seededRandom(seed + i * 17) - (positive ? 0.4 : 0.6)) * 4;
      y = Math.max(2, Math.min(height - 2, y + delta));
      pts.push(`${x},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [positive, width, height, seed]);

  const color = positive ? '#0ECB81' : '#F6465D';
  return (
    <svg width={width} height={height} className="shrink-0">
      <defs>
        <linearGradient id={`wsp-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#wsp-${seed})`} points={`0,${height} ${points} ${width},${height}`} />
      <polyline fill="none" stroke={color} strokeWidth="1.2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Allocation segment type
type AllocSegment = {
  label: string;
  value: number;
  color: string;
  percent: number;
  strokeDasharray: string;
  strokeDashoffset: number;
};

// Allocation ring/donut chart
function AllocationRing({ allocations }: { allocations: { label: string; value: number; color: string }[] }) {
  const { t } = useTranslation();
  const total = allocations.reduce((s, a) => s + a.value, 0) || 1;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  // Pre-compute cumulative offsets using reduce to avoid mutation
  const segments = useMemo(() => {
    return allocations.reduce<{ offset: number; result: Array<AllocSegment> }>((acc, alloc) => {
      const percent = (alloc.value / total) * 100;
      const seg: AllocSegment = {
        ...alloc,
        percent,
        strokeDasharray: `${(percent / 100) * circumference} ${circumference}`,
        strokeDashoffset: -(acc.offset / 100) * circumference,
      };
      return { offset: acc.offset + percent, result: [...acc.result, seg] };
    }, { offset: 0, result: [] }).result;
  }, [allocations, total, circumference]);

  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="8"
            strokeDasharray={seg.strokeDasharray}
            strokeDashoffset={seg.strokeDashoffset}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[10px] text-[#848E9C] font-medium">{t('wallet.portfolio')}</span>
      </div>
    </div>
  );
}

export default function WalletView() {
  const { t } = useTranslation();
  const { navigateTo } = useAppStore();
  const [showBalance, setShowBalance] = useState(true);
  const [activeTab, setActiveTab] = useState<WalletTab>('spot');
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [showSmallAssets, setShowSmallAssets] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const totalBalance = mockWalletBalances.reduce((sum, b) => sum + b.usdValue, 0);
  const totalBtc = mockWalletBalances.reduce((sum, b) => sum + b.btcValue, 0);
  const pnl24h = totalBalance * 0.0234;
  const pnlPercent = 2.34;

  const smallAssetThreshold = 10;
  const majorAssets = mockWalletBalances.filter((b) => b.usdValue >= smallAssetThreshold);
  const smallAssets = mockWalletBalances.filter((b) => b.usdValue < smallAssetThreshold);
  const displayAssets = showSmallAssets ? [...majorAssets, ...smallAssets] : majorAssets;

  // Find the active tab config for coloring
  const activeTabConfig = walletTabs.find((t) => t.id === activeTab)!;
  const TabIcon = activeTabConfig.icon;

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="space-y-4 p-4 max-w-4xl mx-auto">
        {/* Transaction Flow Visualization */}
        <TransactionFlow />

        {/* Total Balance Card - Enhanced with gradient border animation */}
        <Card className="bg-gradient-to-br from-[#1E2329] via-[#1E2329] to-[#2B3139] border-[#2B3139] overflow-hidden relative wave-bg gradient-border-animate card-shine">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F0B90B]/[0.04] rounded-full -translate-y-1/2 translate-x-1/3 blur-xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#0ECB81]/[0.03] rounded-full translate-y-1/2 -translate-x-1/4 blur-xl pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F0B90B]/[0.02] via-transparent to-[#0ECB81]/[0.02] pointer-events-none" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#848E9C] floating-label">{t('wallet.estimatedBalance')}</span>
                <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${activeTabConfig.color} bg-current/10`}>
                  <TabIcon className={`h-2.5 w-2.5 ${activeTabConfig.color}`} />
                  <span className={`text-[9px] font-medium ${activeTabConfig.color}`}>{t('wallet.' + activeTabConfig.id)}</span>
                </div>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-[#5E6673] hover:text-[#848E9C] transition-colors"
              >
                {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex items-end gap-2 mb-1 animate-count-up">
              <span className="text-3xl font-bold gradient-text-gold">
                {showBalance ? <><span className="inline-flex items-center">$<AnimatedCounter value={totalBalance} /></span></> : '****'}
              </span>
              <span className="text-sm text-[#848E9C] mb-1">USD</span>
            </div>
            <p className="text-xs text-[#5E6673] tabular-nums mb-2">
              ≈ {showBalance ? totalBtc.toFixed(4) : '****'} BTC
            </p>
            <div className="flex items-center gap-1.5">
              {showBalance ? (
                <>
                  {pnl24h >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-[#0ECB81]" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5 text-[#F6465D]" />
                  )}
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      pnl24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}
                  >
                    {pnl24h >= 0 ? '+' : ''}
                    {formatPrice(pnl24h)} ({pnlPercent >= 0 ? '+' : ''}
                    {pnlPercent}%)
                  </span>
                </>
              ) : (
                <span className="text-xs text-[#5E6673]">{t('wallet.pnl24h')}: ****</span>
              )}
              <span className="text-[10px] text-[#5E6673] ml-1">{t('wallet.pnl24h')}</span>
            </div>
            {/* Allocation ring chart */}
            <div className="flex items-center gap-4 mt-3">
              <AllocationRing
                allocations={majorAssets.slice(0, 5).map((b) => ({
                  label: b.asset,
                  value: b.usdValue,
                  color: b.asset === 'BTC' ? '#F0B90B' : b.asset === 'ETH' ? '#627EEA' : b.asset === 'BNB' ? '#0ECB81' : b.asset === 'SOL' ? '#9945FF' : '#2B7DE9',
                }))}
              />
              <div className="flex flex-col gap-1">
                {majorAssets.slice(0, 5).map((b) => (
                  <div key={b.asset} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      b.asset === 'BTC' ? 'bg-[#F0B90B]' : b.asset === 'ETH' ? 'bg-[#627EEA]' : b.asset === 'BNB' ? 'bg-[#0ECB81]' : b.asset === 'SOL' ? 'bg-[#9945FF]' : 'bg-[#2B7DE9]'
                    }`} />
                    <span className="text-[10px] text-[#848E9C]">{b.asset}</span>
                    <span className="text-[10px] text-[#5E6673] tabular-nums">{((b.usdValue / totalBalance) * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Tabs - with colored indicators and micro-animations */}
        <div className="flex gap-1 bg-[#1E2329] rounded-lg p-1">
          {walletTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md transition-all duration-200 touch-feedback ${
                  isActive
                    ? `bg-[#2B3139] ${tab.color} shadow-sm wallet-tab-pop`
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t('wallet.' + tab.id)}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: ArrowDownRight, labelKey: 'wallet.deposit', view: 'deposit' as const, color: 'text-[#0ECB81]' },
            { icon: ArrowUpRight, labelKey: 'wallet.withdraw', view: 'withdraw' as const, color: 'text-[#F6465D]' },
            { icon: ArrowLeftRight, labelKey: 'wallet.transfer', view: 'transfer' as const, color: 'text-[#F0B90B]' },
            { icon: CreditCard, labelKey: 'wallet.buyCrypto', view: 'trade' as const, color: 'text-[#848E9C]' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.labelKey}
                onClick={() => navigateTo(action.view)}
                className="flex flex-col items-center gap-1.5 py-3 rounded-lg bg-[#1E2329] hover:bg-[#2B3139] transition-colors active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center">
                  <Icon className={`h-5 w-5 ${action.color}`} />
                </div>
                <span className="text-[10px] text-[#848E9C] font-medium">{t(action.labelKey)}</span>
              </button>
            );
          })}
        </div>

        {/* Earn Banner */}
        <Card
          className="bg-gradient-to-r from-[#1E2329] to-[#2B3139] border-[#2B3139] cursor-pointer hover:border-[#F0B90B]/30 transition-colors"
          onClick={() => navigateTo('earn')}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F0B90B]/10 rounded-full flex items-center justify-center shrink-0">
              <Shield className="h-5 w-5 text-[#F0B90B]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#EAECEF]">{t('wallet.earnUpToApy')}</p>
              <p className="text-xs text-[#848E9C]">{t('wallet.stakeAndEarn')}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-[#F0B90B] hover:text-[#F0B90B]/80 text-xs shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                navigateTo('earn');
              }}
            >
              {t('wallet.go')} →
            </Button>
          </CardContent>
        </Card>

        {/* Portfolio Performance Chart */}
        <PortfolioPerformanceChart />

        {/* Asset List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-[#EAECEF]">
              {activeTab === 'spot' ? t('wallet.spotAssets') : activeTab === 'funding' ? t('wallet.fundingAssets') : activeTab === 'earn' ? t('wallet.earnAssets') : t('wallet.futuresAssets')}
            </h3>
            <div className="flex items-center gap-2">
              {smallAssets.length > 0 && (
                <button
                  onClick={() => setShowSmallAssets(!showSmallAssets)}
                  className="text-[10px] text-[#F0B90B] hover:text-[#F0B90B]/80 flex items-center gap-1"
                >
                  {showSmallAssets ? t('wallet.hide') : t('wallet.show')} {t('wallet.smallAssets').toLowerCase()}
                  {showSmallAssets ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Asset Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-1.5 text-[10px] text-[#5E6673] font-medium uppercase tracking-wider">
            <div className="col-span-4">{t('wallet.asset')}</div>
            <div className="col-span-2 text-right">{t('wallet.available')}</div>
            <div className="col-span-2 text-right">{t('wallet.value')}</div>
            <div className="col-span-4 text-right">{t('wallet.trend7d')}</div>
          </div>

          <div className="space-y-0.5">
            {displayAssets.map((balance) => {
              const isExpanded = expandedAsset === balance.asset;
              return (
                <div key={balance.asset}>
                  <button
                    onClick={() => setExpandedAsset(isExpanded ? null : balance.asset)}
                    className="w-full grid grid-cols-12 gap-2 px-3 py-3 hover:bg-[#1E2329] rounded-lg transition-all duration-200 items-center card-depth touch-feedback asset-row-gradient"
                    style={{ '--asset-color': balance.asset === 'BTC' ? '#F0B90B' : balance.asset === 'ETH' ? '#627EEA' : balance.asset === 'BNB' ? '#0ECB81' : balance.asset === 'SOL' ? '#9945FF' : balance.asset === 'XRP' ? '#23292F' : balance.asset === 'ADA' ? '#0033AD' : balance.asset === 'DOGE' ? '#C3A634' : balance.asset === 'AVAX' ? '#E84142' : balance.asset === 'DOT' ? '#E6007A' : balance.asset === 'USDT' ? '#26A17B' : '#2B7DE9' } as React.CSSProperties}
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2B3139] flex items-center justify-center text-sm font-medium">
                        {balance.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#EAECEF]">{balance.asset}</p>
                        <p className="text-[10px] text-[#5E6673]">{balance.name}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-xs text-[#EAECEF] tabular-nums">
                        {showBalance ? balance.available.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '****'}
                      </p>
                      <p className="text-[10px] text-[#5E6673] tabular-nums">
                        / {showBalance ? balance.total.toLocaleString('en-US', { maximumFractionDigits: 4 }) : '****'}
                      </p>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-xs text-[#EAECEF] tabular-nums">
                        {showBalance ? `$${formatPrice(balance.usdValue)}` : '****'}
                      </p>
                    </div>
                    {/* 7d price trend sparkline */}
                    <div className="col-span-4 flex items-center justify-end">
                      <WalletSparkline
                        positive={balance.asset !== 'USDT'}
                        width={60}
                        height={20}
                        seed={balance.asset.charCodeAt(0) + balance.asset.charCodeAt(Math.min(1, balance.asset.length - 1)) * 7}
                      />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-[#1E2329] rounded-lg p-4 mx-2 mb-2 space-y-3 animate-slide-up">
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-[#5E6673]">{t('wallet.available')}</span>
                              <p className="text-[#EAECEF] font-medium tabular-nums mt-0.5">
                                {balance.available} {balance.asset}
                              </p>
                            </div>
                            <div>
                              <span className="text-[#5E6673]">{t('wallet.inOrder')}</span>
                              <p className="text-[#EAECEF] font-medium tabular-nums mt-0.5">
                                {balance.locked} {balance.asset}
                              </p>
                            </div>
                            <div>
                              <span className="text-[#5E6673]">{t('wallet.usdValue')}</span>
                              <p className="text-[#EAECEF] font-medium tabular-nums mt-0.5">
                                ${formatPrice(balance.usdValue)}
                              </p>
                            </div>
                            <div>
                              <span className="text-[#5E6673]">{t('wallet.btcValue')}</span>
                              <p className="text-[#EAECEF] font-medium tabular-nums mt-0.5">
                                {balance.btcValue.toFixed(6)} BTC
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              className="flex-1 bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-[#0B0E11] text-xs h-8 font-semibold"
                              onClick={() => {
                                useAppStore.getState().setSelectedAsset(balance.asset);
                                navigateTo('trade');
                              }}
                            >
                              {t('actions.trade')}
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139] text-xs h-8"
                              onClick={() => {
                                useAppStore.getState().setSelectedAsset(balance.asset);
                                navigateTo('deposit');
                              }}
                            >
                              {t('wallet.deposit')}
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 border-[#2B3139] text-[#EAECEF] hover:bg-[#2B3139] text-xs h-8"
                              onClick={() => {
                                useAppStore.getState().setSelectedAsset(balance.asset);
                                navigateTo('withdraw');
                              }}
                            >
                              {t('wallet.withdraw')}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaction History - Enhanced */}
        <div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between mb-3"
          >
            <h3 className="text-sm font-semibold text-[#EAECEF]">{t('wallet.transactionHistory')}</h3>
            {showHistory ? (
              <ChevronUp className="h-4 w-4 text-[#5E6673]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#5E6673]" />
            )}
          </button>

          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <Card className="bg-[#1E2329] border-[#2B3139]">
                  <CardContent className="p-0">
                    <div className="divide-y divide-[#2B3139]">
                      {mockTransactions.map((tx) => {
                        const TypeIcon = typeConfig[tx.type]?.icon || CreditCard;
                        const typeColor = typeConfig[tx.type]?.color || 'text-[#848E9C]';
                        const typeBg = typeConfig[tx.type]?.bgColor || 'bg-[#848E9C]/10';
                        const StatusIcon = statusConfig[tx.status]?.icon || Clock;
                        const statusColor = statusConfig[tx.status]?.color || 'text-[#848E9C]';
                        const statusLabel = t('wallet.' + tx.status);
                        const isIncoming = tx.amount >= 0;

                        return (
                          <div key={tx.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#2B3139]/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full ${typeBg} flex items-center justify-center`}>
                                <TypeIcon className={`h-4 w-4 ${typeColor}`} />
                              </div>
                              <div>
                                <p className="text-sm text-[#EAECEF] font-medium">{tx.description}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-[#5E6673]">
                                    {getTimeAgo(tx.createdAt)}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`h-4 px-1.5 text-[9px] border-0 ${statusColor} bg-current/10`}
                                  >
                                    <StatusIcon className={`h-2.5 w-2.5 mr-0.5 ${statusColor}`} />
                                    {statusLabel}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-sm font-semibold tabular-nums ${
                                  isIncoming ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                                }`}
                              >
                                {isIncoming ? '+' : ''}
                                {tx.amount} {tx.asset}
                              </p>
                              <p className={`text-[10px] tabular-nums ${
                                isIncoming ? 'text-[#0ECB81]/60' : 'text-[#F6465D]/60'
                              }`}>
                                {isIncoming ? '+' : '-'}${formatPrice(Math.abs(tx.usdValue))}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom padding for mobile nav */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
