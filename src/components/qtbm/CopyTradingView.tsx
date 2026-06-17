'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Star,
  Crown,
  BarChart3,
  Settings2,
  AlertTriangle,
  StopCircle,
  ChevronRight,
  Zap,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

// ===== Data =====

interface Trader {
  id: string;
  name: string;
  roi: number;
  winRate: number;
  copiers: number;
  risk: 'Low' | 'Medium' | 'High' | 'Very High';
  assets: string[];
  sparklineUp: boolean;
  color: string;
}

const topTraders: Trader[] = [
  { id: '1', name: 'CryptoMaster99', roi: 245.6, winRate: 78, copiers: 1200, risk: 'Medium', assets: ['BTC', 'ETH', 'SOL'], sparklineUp: true, color: '#F0B90B' },
  { id: '2', name: 'WhaleHunter', roi: 189.3, winRate: 72, copiers: 890, risk: 'High', assets: ['BTC', 'BNB'], sparklineUp: true, color: '#0ECB81' },
  { id: '3', name: 'SteadyGains', roi: 67.8, winRate: 85, copiers: 2100, risk: 'Low', assets: ['ETH', 'DOT', 'AVAX'], sparklineUp: true, color: '#627EEA' },
  { id: '4', name: 'DeFiTrader', roi: 156.2, winRate: 69, copiers: 650, risk: 'High', assets: ['UNI', 'LINK', 'AAVE'], sparklineUp: true, color: '#F6465D' },
  { id: '5', name: 'SafeYield', roi: 34.5, winRate: 91, copiers: 3400, risk: 'Low', assets: ['BTC', 'USDT'], sparklineUp: true, color: '#0ECB81' },
  { id: '6', name: 'MoonShot', roi: 412.1, winRate: 58, copiers: 420, risk: 'Very High', assets: ['DOGE', 'SHIB', 'PEPE'], sparklineUp: true, color: '#F6465D' },
];

interface ActiveCopy {
  id: string;
  traderName: string;
  invested: number;
  pnl: number;
  pnlPercent: number;
  daysActive: number;
  openPositions: number;
  color: string;
}

const activeCopies: ActiveCopy[] = [
  { id: '1', traderName: 'CryptoMaster99', invested: 3000, pnl: 612, pnlPercent: 20.4, daysActive: 15, openPositions: 3, color: '#F0B90B' },
  { id: '2', traderName: 'SteadyGains', invested: 2500, pnl: 175, pnlPercent: 7.0, daysActive: 30, openPositions: 1, color: '#627EEA' },
  { id: '3', traderName: 'WhaleHunter', invested: 3000, pnl: -152, pnlPercent: -5.1, daysActive: 7, openPositions: 5, color: '#0ECB81' },
];

interface ClosedCopy {
  id: string;
  traderName: string;
  invested: number;
  finalPnl: number;
  duration: string;
  reason: 'manual' | 'stop_loss';
  color: string;
}

const closedCopies: ClosedCopy[] = [
  { id: '1', traderName: 'RiskyTrader', invested: 1000, finalPnl: -250, duration: '12 days', reason: 'stop_loss', color: '#F6465D' },
  { id: '2', traderName: 'AlphaSeeker', invested: 2000, finalPnl: 340, duration: '45 days', reason: 'manual', color: '#F0B90B' },
];

interface LeaderboardEntry {
  rank: number;
  name: string;
  roi: number;
  winRate: number;
  copiers: number;
  risk: 'Low' | 'Medium' | 'High' | 'Very High';
  sparklineUp: boolean;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, name: 'MoonShot', roi: 412.1, winRate: 58, copiers: 420, risk: 'Very High', sparklineUp: true },
  { rank: 2, name: 'CryptoMaster99', roi: 245.6, winRate: 78, copiers: 1200, risk: 'Medium', sparklineUp: true },
  { rank: 3, name: 'DeFiTrader', roi: 156.2, winRate: 69, copiers: 650, risk: 'High', sparklineUp: true },
  { rank: 4, name: 'WhaleHunter', roi: 189.3, winRate: 72, copiers: 890, risk: 'High', sparklineUp: true },
  { rank: 5, name: 'SteadyGains', roi: 67.8, winRate: 85, copiers: 2100, risk: 'Low', sparklineUp: true },
  { rank: 6, name: 'SafeYield', roi: 34.5, winRate: 91, copiers: 3400, risk: 'Low', sparklineUp: true },
  { rank: 7, name: 'NFTWhale', roi: 98.4, winRate: 64, copiers: 310, risk: 'High', sparklineUp: true },
  { rank: 8, name: 'AltCoinKing', roi: 76.2, winRate: 71, copiers: 580, risk: 'Medium', sparklineUp: true },
  { rank: 9, name: 'YieldFarmer', roi: 55.9, winRate: 80, copiers: 920, risk: 'Low', sparklineUp: true },
  { rank: 10, name: 'LeveragePro', roi: 320.5, winRate: 52, copiers: 180, risk: 'Very High', sparklineUp: true },
];

// ===== SVG Sparkline Generator =====

function generateSparklinePoints(up: boolean, width = 80, height = 28, points = 20): string {
  const pts: string[] = [];
  let y = height * (up ? 0.8 : 0.2);
  for (let i = 0; i < points; i++) {
    const x = (i / (points - 1)) * width;
    const trend = up ? -0.04 : 0.04;
    const noise = (Math.sin(i * 1.2 + 0.5) * 0.15 + Math.cos(i * 0.8) * 0.1) * height;
    y = Math.max(2, Math.min(height - 2, y + trend * height + noise * 0.3));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

function MiniSparkline({ up, color, width = 80, height = 28 }: { up: boolean; color: string; width?: number; height?: number }) {
  const points = generateSparklinePoints(up, width, height);
  const areaPoints = points + ` ${width},${height} 0,${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ===== Animated Counter Component =====
function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <span className="tabular-nums">{count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count}</span>;
}

// ===== PnL Overview Chart =====

function PnlOverviewChart() {
  const width = 200;
  const height = 50;
  const pts: string[] = [];
  let y = height * 0.75;
  for (let i = 0; i < 30; i++) {
    const x = (i / 29) * width;
    y += -0.6 + Math.sin(i * 0.3) * 3 + Math.cos(i * 0.15) * 2;
    y = Math.max(4, Math.min(height - 4, y));
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const areaPoints = pts.join(' ') + ` ${width},${height} 0,${height}`;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id="pnl-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0ECB81" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0ECB81" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#pnl-grad)" />
      <polyline points={pts.join(' ')} fill="none" stroke="#0ECB81" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ===== Risk Badge Helper =====

function getRiskBadge(risk: Trader['risk']) {
  switch (risk) {
    case 'Low':
      return { bg: 'bg-[#0ECB81]/10', text: 'text-[#0ECB81]', border: 'border-[#0ECB81]/20' };
    case 'Medium':
      return { bg: 'bg-[#F0B90B]/10', text: 'text-[#F0B90B]', border: 'border-[#F0B90B]/20' };
    case 'High':
      return { bg: 'bg-[#F6465D]/10', text: 'text-[#F6465D]', border: 'border-[#F6465D]/20' };
    case 'Very High':
      return { bg: 'bg-[#F6465D]/15', text: 'text-[#F6465D]', border: 'border-[#F6465D]/30' };
  }
}

// ===== Main Component =====

export default function CopyTradingView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'topTraders' | 'myCopies' | 'leaderboard'>('topTraders');
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('500');
  const [copyMode, setCopyMode] = useState<'fixed' | 'proportional'>('fixed');
  const [maxPositionSize, setMaxPositionSize] = useState([50]);
  const [stopLoss, setStopLoss] = useState('20');
  const [takeProfit, setTakeProfit] = useState('50');

  const tabs = [
    { id: 'topTraders' as const, label: t('copyTrading.topTraders') },
    { id: 'myCopies' as const, label: t('copyTrading.myCopies') },
    { id: 'leaderboard' as const, label: t('copyTrading.leaderboard') },
  ];

  const handleCopyClick = (trader: Trader) => {
    setSelectedTrader(trader);
    setCopyDialogOpen(true);
  };

  const handleStartCopying = () => {
    setCopyDialogOpen(false);
    setSelectedTrader(null);
  };

  // ===== Render =====
  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 w-8"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-[#EAECEF]">{t('copyTrading.title')}</h1>
          <Badge className="bg-gradient-to-r from-[#0ECB81] to-[#0ECB81]/70 text-white border-0 text-[9px] px-2 py-0.5 font-bold">
            Beta
          </Badge>
        </div>

        {/* Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#0ECB81]/40 via-[#F0B90B]/30 to-[#0ECB81]/40 p-[1px]">
            <div className="w-full h-full rounded-xl bg-[#1E2329]" />
          </div>
          <Card className="bg-[#1E2329]/80 backdrop-blur-xl border-0 relative overflow-hidden glass-card">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0ECB81]/8 via-transparent to-[#F0B90B]/5" />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-[#F0B90B]" />
                <h2 className="text-sm font-semibold text-[#EAECEF]">Copy Trading Overview</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Total PnL */}
                <div className="bg-[#0B0E11]/50 rounded-xl p-3">
                  <p className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1">{t('copyTrading.pnl')}</p>
                  <p className="text-lg font-bold text-[#0ECB81] neon-glow-green">+$1,234.50</p>
                  <p className="text-[10px] text-[#0ECB81]">+18.5%</p>
                </div>
                {/* Active Copies */}
                <div className="bg-[#0B0E11]/50 rounded-xl p-3">
                  <p className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1">Active Copies</p>
                  <p className="text-lg font-bold text-[#EAECEF]">3</p>
                  <p className="text-[10px] text-[#848E9C]">traders</p>
                </div>
                {/* Total Invested */}
                <div className="bg-[#0B0E11]/50 rounded-xl p-3">
                  <p className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1">{t('copyTrading.invested')}</p>
                  <p className="text-lg font-bold text-[#F0B90B]">$8,500.00</p>
                  <p className="text-[10px] text-[#848E9C]">total</p>
                </div>
                {/* Avg ROI */}
                <div className="bg-[#0B0E11]/50 rounded-xl p-3">
                  <p className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1">Avg. ROI</p>
                  <p className="text-lg font-bold text-[#0ECB81]">+12.3%</p>
                  <p className="text-[10px] text-[#0ECB81]">30d</p>
                </div>
              </div>

              {/* Mini PnL Chart */}
              <div className="bg-[#0B0E11]/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium">Cumulative PnL (30d)</p>
                  <TrendingUp className="h-3.5 w-3.5 text-[#0ECB81]" />
                </div>
                <PnlOverviewChart />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1E2329] rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-[#F0B90B] text-[#0B0E11] shadow-md shadow-[#F0B90B]/20'
                  : 'text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'topTraders' && (
            <motion.div
              key="topTraders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {topTraders.map((trader, idx) => (
                <TraderCard
                  key={trader.id}
                  trader={trader}
                  index={idx}
                  onCopy={() => handleCopyClick(trader)}
                  t={t}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'myCopies' && (
            <motion.div
              key="myCopies"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-3"
            >
              {/* Active Copies */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-[#0ECB81]" />
                  <h3 className="text-sm font-medium text-[#EAECEF]">Active Copies</h3>
                </div>
                {activeCopies.map((copy, idx) => (
                  <ActiveCopyCard key={copy.id} copy={copy} index={idx} t={t} />
                ))}
              </div>

              {/* Closed Copies */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StopCircle className="h-4 w-4 text-[#5E6673]" />
                  <h3 className="text-sm font-medium text-[#848E9C]">Closed Copies</h3>
                </div>
                {closedCopies.map((copy, idx) => (
                  <ClosedCopyCard key={copy.id} copy={copy} index={idx} t={t} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <LeaderboardTab t={t} onCopy={(trader) => {
                const found = topTraders.find(t => t.name === trader);
                if (found) handleCopyClick(found);
              }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Copy Trader Dialog */}
      <AnimatePresence>
        {copyDialogOpen && selectedTrader && (
          <CopyTraderDialog
            trader={selectedTrader}
            investmentAmount={investmentAmount}
            setInvestmentAmount={setInvestmentAmount}
            copyMode={copyMode}
            setCopyMode={setCopyMode}
            maxPositionSize={maxPositionSize}
            setMaxPositionSize={setMaxPositionSize}
            stopLoss={stopLoss}
            setStopLoss={setStopLoss}
            takeProfit={takeProfit}
            setTakeProfit={setTakeProfit}
            onStart={handleStartCopying}
            onClose={() => setCopyDialogOpen(false)}
            t={t}
          />
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}

// ===== Sub-Components =====

function TraderCard({ trader, index, onCopy, t }: { trader: Trader; index: number; onCopy: () => void; t: (key: string) => string }) {
  const riskStyle = getRiskBadge(trader.risk);
  const isVerified = trader.winRate >= 85;
  const isTopTrader = trader.roi > 100;
  const riskDotColor = trader.risk === 'Low' ? '#0ECB81' : trader.risk === 'Medium' ? '#F0B90B' : '#F6465D';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className="group"
    >
      <Card className={cn(
        "bg-[#1E2329] border-[#2B3139] transition-all duration-300 glass-card relative overflow-hidden",
        "hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-2px]",
        isTopTrader && 'trader-card-glow'
      )}>
        {/* Animated Gradient Left Border */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl',
          isTopTrader
            ? 'bg-gradient-to-b from-[#FFD700] via-[#F0B90B] to-[#FFD700] animate-gradient-shift bg-[length:100%_200%]'
            : 'bg-gradient-to-b from-[#C0C0C0] via-[#A0A0A0] to-[#C0C0C0]'
        )} />
        <CardContent className="p-4 pl-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative"
                style={{ backgroundColor: trader.color + '20' }}
              >
                <span className="text-sm font-bold" style={{ color: trader.color }}>
                  {trader.name.slice(0, 2).toUpperCase()}
                </span>
                {/* Risk Dot */}
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1E2329]"
                  style={{ backgroundColor: riskDotColor }}
                  title={`Risk: ${trader.risk}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[#EAECEF]">{trader.name}</span>
                  {isVerified && (
                    <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[8px] px-1.5 py-0 h-4 gap-0.5">
                      <Check className="h-2.5 w-2.5" />
                      Verified
                    </Badge>
                  )}
                  {/* Top Trader Badge with Shimmer */}
                  {isTopTrader && (
                    <Badge className="bg-gradient-to-r from-[#FFD700]/20 to-[#F0B90B]/20 text-[#FFD700] border-[#FFD700]/30 text-[8px] px-1.5 py-0 h-4 gap-0.5 shimmer relative overflow-hidden">
                      <Crown className="h-2.5 w-2.5" />
                      Top
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Users className="h-3 w-3 text-[#5E6673]" />
                  <span className="text-[10px] text-[#5E6673]">
                    <AnimatedCounter target={trader.copiers} /> {t('copyTrading.copiers')}
                  </span>
                </div>
              </div>
            </div>

            {/* ROI Badge */}
            <Badge
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 border-0',
                trader.roi > 0 ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'
              )}
            >
              {trader.roi > 0 ? '+' : ''}{trader.roi}% ROI
            </Badge>
          </div>

          {/* Win Rate Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[#5E6673]">{t('copyTrading.winRate')}</span>
              <span className={cn('text-[10px] font-semibold', trader.winRate >= 70 ? 'text-[#0ECB81]' : 'text-[#F0B90B]')}>
                {trader.winRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${trader.winRate}%` }}
                transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  trader.winRate >= 80 ? 'bg-gradient-to-r from-[#0ECB81]/70 to-[#0ECB81]' : trader.winRate >= 60 ? 'bg-gradient-to-r from-[#F0B90B]/70 to-[#F0B90B]' : 'bg-gradient-to-r from-[#F6465D]/70 to-[#F6465D]'
                )}
              />
            </div>
          </div>

          {/* Sparkline + Risk + Assets */}
          <div className="flex items-center gap-3 mb-3">
            <MiniSparkline up={trader.sparklineUp} color={trader.roi > 0 ? '#0ECB81' : '#F6465D'} width={60} height={22} />
            <Badge className={cn('text-[9px] font-semibold px-2 py-0.5 border', riskStyle.bg, riskStyle.text, riskStyle.border)}>
              {trader.risk === 'Very High' && (
                <span className="inline-block animate-pulse mr-0.5">&#9679;</span>
              )}
              {t('copyTrading.riskLevel')}: {trader.risk}
            </Badge>
          </div>

          {/* Assets */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {trader.assets.map((asset) => (
              <span
                key={asset}
                className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#2B3139] text-[#848E9C]"
              >
                {asset}
              </span>
            ))}
          </div>

          {/* Follow Button with gradient and press-scale */}
          <Button
            className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-9 text-sm press-scale shadow-md shadow-[#F0B90B]/20 hover:shadow-lg hover:shadow-[#F0B90B]/30"
            onClick={onCopy}
          >
            <Copy className="h-4 w-4 mr-1.5" />
            {t('copyTrading.copyTrader')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActiveCopyCard({ copy, index, t }: { copy: ActiveCopy; index: number; t: (key: string) => string }) {
  const isPositive = copy.pnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className="mb-3"
    >
      <Card className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/15 transition-all glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: copy.color + '20' }}
              >
                <span className="text-xs font-bold" style={{ color: copy.color }}>
                  {copy.traderName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#EAECEF]">{t('copyTrading.copyTrader')}: {copy.traderName}</p>
                <p className="text-[10px] text-[#5E6673]">{copy.daysActive} days active &bull; {copy.openPositions} open positions</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn('text-sm font-bold', isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]')}>
                {isPositive ? '+' : ''}${copy.pnl.toLocaleString()}
              </p>
              <p className={cn('text-[10px] font-medium', isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]')}>
                {isPositive ? '+' : ''}{copy.pnlPercent}%
              </p>
            </div>
          </div>

          {/* PnL Bar */}
          <div className="w-full h-1.5 bg-[#2B3139] rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(copy.pnlPercent), 100)}%` }}
              transition={{ duration: 0.6, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
              className={cn('h-full rounded-full', isPositive ? 'bg-[#0ECB81]' : 'bg-[#F6465D]')}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#5E6673]">{t('copyTrading.invested')}: ${copy.invested.toLocaleString()}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] border-[#2B3139] text-[#848E9C] hover:bg-[#2B3139] hover:text-[#EAECEF] px-3"
              >
                <Settings2 className="h-3 w-3 mr-1" />
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] border-[#F6465D]/30 text-[#F6465D] hover:bg-[#F6465D]/10 hover:border-[#F6465D]/50 px-3"
              >
                <StopCircle className="h-3 w-3 mr-1" />
                {t('copyTrading.stopCopy')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ClosedCopyCard({ copy, index, t }: { copy: ClosedCopy; index: number; t: (key: string) => string }) {
  const isPositive = copy.finalPnl >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: 'easeOut' }}
      className="mb-2"
    >
      <Card className="bg-[#1E2329]/60 border-[#2B3139]/70 glass-card">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 opacity-60"
                style={{ backgroundColor: copy.color + '15' }}
              >
                <span className="text-[10px] font-bold opacity-60" style={{ color: copy.color }}>
                  {copy.traderName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-[#848E9C]">{copy.traderName}</p>
                <p className="text-[9px] text-[#5E6673]">{copy.duration} &bull; {copy.reason === 'manual' ? 'Manual Close' : 'Stop Loss'}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn('text-xs font-semibold', isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]')}>
                {isPositive ? '+' : ''}${copy.finalPnl} {t('copyTrading.pnl')}
              </p>
              <p className="text-[9px] text-[#5E6673]">{t('copyTrading.invested')}: ${copy.invested}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LeaderboardTab({ t, onCopy }: { t: (key: string) => string; onCopy: (name: string) => void }) {
  return (
    <Card className="bg-[#1E2329] border-[#2B3139] glass-card overflow-hidden">
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-[#2B3139] bg-[#0B0E11]/30">
          <span className="col-span-1 text-[9px] text-[#5E6673] font-semibold uppercase">#</span>
          <span className="col-span-3 text-[9px] text-[#5E6673] font-semibold uppercase">Trader</span>
          <span className="col-span-2 text-[9px] text-[#5E6673] font-semibold uppercase text-right">{t('copyTrading.roi')}</span>
          <span className="col-span-2 text-[9px] text-[#5E6673] font-semibold uppercase text-right">{t('copyTrading.winRate')}</span>
          <span className="col-span-2 text-[9px] text-[#5E6673] font-semibold uppercase text-right">{t('copyTrading.copiers')}</span>
          <span className="col-span-2 text-[9px] text-[#5E6673] font-semibold uppercase text-right">Chart</span>
        </div>

        {/* Table Body */}
        {leaderboardData.map((entry, idx) => {
          const riskStyle = getRiskBadge(entry.risk);
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04, ease: 'easeOut' }}
              className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-[#2B3139]/50 hover:bg-[#2B3139]/30 transition-colors cursor-pointer items-center"
              onClick={() => onCopy(entry.name)}
            >
              <span className="col-span-1">
                {entry.rank <= 3 ? (
                  <Crown className={cn('h-4 w-4', entry.rank === 1 ? 'text-[#F0B90B]' : entry.rank === 2 ? 'text-[#C0C0C0]' : 'text-[#CD7F32]')} />
                ) : (
                  <span className="text-[10px] text-[#5E6673] font-medium">{entry.rank}</span>
                )}
              </span>
              <span className="col-span-3 text-[11px] font-medium text-[#EAECEF] truncate">{entry.name}</span>
              <span className={cn('col-span-2 text-[11px] font-semibold text-right', entry.roi > 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]')}>
                +{entry.roi}%
              </span>
              <span className="col-span-2 text-[10px] text-[#848E9C] text-right">{entry.winRate}%</span>
              <span className="col-span-2 text-[10px] text-[#848E9C] text-right">{entry.copiers >= 1000 ? (entry.copiers / 1000).toFixed(1) + 'K' : entry.copiers}</span>
              <span className="col-span-2 flex justify-end">
                <MiniSparkline up={entry.sparklineUp} color={entry.roi > 0 ? '#0ECB81' : '#F6465D'} width={40} height={16} />
              </span>
            </motion.div>
          );
        })}

        {/* Current User Rank */}
        <div className="px-4 py-3 bg-[#F0B90B]/5 border-t border-[#F0B90B]/20">
          <div className="grid grid-cols-12 gap-1 items-center">
            <span className="col-span-1 text-[10px] text-[#F0B90B] font-bold">#156</span>
            <span className="col-span-3 text-[11px] font-medium text-[#F0B90B]">You</span>
            <span className="col-span-2 text-[11px] font-semibold text-[#0ECB81] text-right">+12.3%</span>
            <span className="col-span-2 text-[10px] text-[#848E9C] text-right">—</span>
            <span className="col-span-2 text-[10px] text-[#848E9C] text-right">—</span>
            <span className="col-span-2 flex justify-end">
              <ChevronRight className="h-3.5 w-3.5 text-[#F0B90B]" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CopyTraderDialog({
  trader,
  investmentAmount,
  setInvestmentAmount,
  copyMode,
  setCopyMode,
  maxPositionSize,
  setMaxPositionSize,
  stopLoss,
  setStopLoss,
  takeProfit,
  setTakeProfit,
  onStart,
  onClose,
  t,
}: {
  trader: Trader;
  investmentAmount: string;
  setInvestmentAmount: (v: string) => void;
  copyMode: 'fixed' | 'proportional';
  setCopyMode: (v: 'fixed' | 'proportional') => void;
  maxPositionSize: number[];
  setMaxPositionSize: (v: number[]) => void;
  stopLoss: string;
  setStopLoss: (v: string) => void;
  takeProfit: string;
  setTakeProfit: (v: string) => void;
  onStart: () => void;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const riskStyle = getRiskBadge(trader.risk);
  const amount = parseFloat(investmentAmount) || 0;
  const isValidAmount = amount >= 100 && amount <= 10000;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#1E2329] border border-[#2B3139] rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="sticky top-0 bg-[#1E2329] border-b border-[#2B3139] px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: trader.color + '20' }}
            >
              <span className="text-sm font-bold" style={{ color: trader.color }}>
                {trader.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#EAECEF]">{trader.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] font-semibold', trader.roi > 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]')}>
                  ROI +{trader.roi}%
                </span>
                <Badge className={cn('text-[8px] px-1.5 py-0 border', riskStyle.bg, riskStyle.text, riskStyle.border)}>
                  {trader.risk}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#5E6673] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {/* Investment Amount */}
          <div>
            <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">
              Investment Amount ($100 - $10,000)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E6673] text-sm">$</span>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className={cn(
                  'pl-7 bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] h-10 text-sm',
                  !isValidAmount && investmentAmount ? 'border-[#F6465D]/50 focus:border-[#F6465D]' : 'focus:border-[#F0B90B]'
                )}
                placeholder="Enter amount"
              />
            </div>
            {!isValidAmount && investmentAmount && (
              <p className="text-[10px] text-[#F6465D] mt-1">Amount must be between $100 and $10,000</p>
            )}
          </div>

          {/* Copy Mode */}
          <div>
            <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">
              Copy Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCopyMode('fixed')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all border',
                  copyMode === 'fixed'
                    ? 'bg-[#F0B90B]/10 border-[#F0B90B]/30 text-[#F0B90B]'
                    : 'bg-[#0B0E11]/30 border-[#2B3139] text-[#848E9C] hover:bg-[#2B3139]/50'
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mx-auto mb-1" />
                Fixed Amount
              </button>
              <button
                onClick={() => setCopyMode('proportional')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all border',
                  copyMode === 'proportional'
                    ? 'bg-[#F0B90B]/10 border-[#F0B90B]/30 text-[#F0B90B]'
                    : 'bg-[#0B0E11]/30 border-[#2B3139] text-[#848E9C] hover:bg-[#2B3139]/50'
                )}
              >
                <BarChart3 className="h-3.5 w-3.5 mx-auto mb-1" />
                Proportional
              </button>
            </div>
          </div>

          {/* Max Position Size */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium">
                Max Position Size
              </label>
              <span className="text-[11px] font-semibold text-[#F0B90B]">{maxPositionSize[0]}%</span>
            </div>
            <Slider
              value={maxPositionSize}
              onValueChange={setMaxPositionSize}
              max={100}
              min={10}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-[#5E6673]">10%</span>
              <span className="text-[9px] text-[#5E6673]">100%</span>
            </div>
          </div>

          {/* Stop Loss & Take Profit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">
                Stop Loss (%)
              </label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="bg-[#0B0E11]/50 border-[#2B3139] text-[#F6465D] h-9 text-sm focus:border-[#F6465D]"
                placeholder="20"
              />
            </div>
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-1.5 block">
                Take Profit (%)
              </label>
              <Input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="bg-[#0B0E11]/50 border-[#2B3139] text-[#0ECB81] h-9 text-sm focus:border-[#0ECB81]"
                placeholder="50"
              />
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-[#F6465D]/5 border border-[#F6465D]/15 rounded-lg p-3 flex gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#F6465D] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[#848E9C] leading-relaxed">
              Copy trading involves significant risk. Past performance does not guarantee future results. You may lose some or all of your invested capital. Only invest what you can afford to lose.
            </p>
          </div>

          {/* Start Copying Button */}
          <Button
            className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] font-bold h-11 text-sm press-scale shadow-lg shadow-[#F0B90B]/20"
            onClick={onStart}
            disabled={!isValidAmount}
          >
            <Copy className="h-4 w-4 mr-2" />
            {t('copyTrading.startCopy')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
