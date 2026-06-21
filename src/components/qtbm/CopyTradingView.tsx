'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '@/hooks/use-modal-a11y';
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
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
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
      return { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' };
    case 'Medium':
      return { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' };
    case 'High':
      return { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' };
    case 'Very High':
      return { bg: 'bg-destructive/15', text: 'text-destructive', border: 'border-destructive/30' };
  }
}

// ===== Main Component =====

export default function CopyTradingView() {
  const { goBack, isRTL } = useAppStore();
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
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={goBack}
            aria-label={t('common.back')}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{t('copyTrading.title')}</h1>
          <Badge className="bg-gradient-to-r from-success to-success/70 text-white border-0 text-[10px] px-2 py-0.5 font-bold">
            {t('copyTrading.beta')}
          </Badge>
        </div>

        {/* Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-success/40 via-primary/30 to-success/40 p-[1px]">
            <div className="w-full h-full rounded-xl bg-card" />
          </div>
          <Card className="bg-card/80 backdrop-blur-xl border-0 relative overflow-hidden glass-card">
            <div className="absolute inset-0 bg-gradient-to-br from-success/8 via-transparent to-primary/5" />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">{t('copyTrading.overview')}</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Total PnL */}
                <div className="bg-background/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1">{t('copyTrading.pnl')}</p>
                  <p className="text-lg font-bold text-success neon-glow-green">+$1,234.50</p>
                  <p className="text-[10px] text-success">+18.5%</p>
                </div>
                {/* Active Copies */}
                <div className="bg-background/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1">{t('copyTrading.activeCopies')}</p>
                  <p className="text-lg font-bold text-foreground">3</p>
                  <p className="text-[10px] text-muted-foreground">{t('copyTrading.traders')}</p>
                </div>
                {/* Total Invested */}
                <div className="bg-background/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1">{t('copyTrading.invested')}</p>
                  <p className="text-lg font-bold text-primary">$8,500.00</p>
                  <p className="text-[10px] text-muted-foreground">{t('copyTrading.total')}</p>
                </div>
                {/* Avg ROI */}
                <div className="bg-background/50 rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1">{t('copyTrading.avgRoi')}</p>
                  <p className="text-lg font-bold text-success">+12.3%</p>
                  <p className="text-[10px] text-success">{t('copyTrading.last30d')}</p>
                </div>
              </div>

              {/* Mini PnL Chart */}
              <div className="bg-background/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-muted-foreground tracking-wider font-medium">{t('copyTrading.cumulativePnl')}</p>
                  <TrendingUp className="h-3.5 w-3.5 text-success" />
                </div>
                <PnlOverviewChart />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-primary text-background shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
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
                  <Zap className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-medium text-foreground">{t('copyTrading.activeCopies')}</h3>
                </div>
                {activeCopies.map((copy, idx) => (
                  <ActiveCopyCard key={copy.id} copy={copy} index={idx} t={t} />
                ))}
              </div>

              {/* Closed Copies */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <StopCircle className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-muted-foreground">{t('copyTrading.closedCopies')}</h3>
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
  const { isRTL } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className="group"
    >
      <Card className={cn(
        "bg-card border-border transition-all duration-300 glass-card relative overflow-hidden",
        "hover:border-transparent hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:translate-y-[-2px]",
        isTopTrader && 'trader-card-glow'
      )}>
        {/* Animated Gradient Left Border */}
        <div className={cn(
          'absolute start-0 top-0 bottom-0 w-[3px] rounded-s-xl',
          isTopTrader
            ? 'bg-gradient-to-b from-gold via-primary to-gold animate-gradient-shift bg-[length:100%_200%]'
            : 'bg-gradient-to-b from-[#C0C0C0] via-[#A0A0A0] to-[#C0C0C0]'
        )} />
        <CardContent className="p-4 ps-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 relative"
                style={{ backgroundColor: trader.color + '20' }}
              >
                <span className="text-sm font-bold" style={{ color: trader.color }} dir="ltr">
                  {trader.name.slice(0, 2)}
                </span>
                {/* Risk Dot */}
                <div
                  className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full border-2 border-border"
                  style={{ backgroundColor: riskDotColor }}
                  title={`Risk: ${trader.risk}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground">{trader.name}</span>
                  {isVerified && (
                    <Badge className="bg-success/10 text-success border-0 text-[10px] px-1.5 py-0 h-4 gap-0.5">
                      <Check className="h-2.5 w-2.5" />
                      {t('copyTrading.verified')}
                    </Badge>
                  )}
                  {/* Top Trader Badge with Shimmer */}
                  {isTopTrader && (
                    <Badge className="bg-gradient-to-r from-gold/20 to-primary/20 text-gold border-gold/30 text-[10px] px-1.5 py-0 h-4 gap-0.5 shimmer relative overflow-hidden">
                      <Crown className="h-2.5 w-2.5" />
                      {t('copyTrading.top')}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Users className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">
                    <AnimatedCounter target={trader.copiers} /> {t('copyTrading.copiers')}
                  </span>
                </div>
              </div>
            </div>

            {/* ROI Badge */}
            <Badge
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 border-0',
                trader.roi > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}
            >
              {trader.roi > 0 ? '+' : ''}{trader.roi}% ROI
            </Badge>
          </div>

          {/* Win Rate Progress */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">{t('copyTrading.winRate')}</span>
              <span className={cn('text-[10px] font-semibold', trader.winRate >= 70 ? 'text-success' : 'text-primary')}>
                {trader.winRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${trader.winRate}%` }}
                transition={{ duration: 0.8, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
                className={cn(
                  'h-full rounded-full',
                  trader.winRate >= 80 ? 'bg-gradient-to-r from-success/70 to-success' : trader.winRate >= 60 ? 'bg-gradient-to-r from-primary/70 to-primary' : 'bg-gradient-to-r from-destructive/70 to-destructive'
                )}
              />
            </div>
          </div>

          {/* Sparkline + Risk + Assets */}
          <div className="flex items-center gap-3 mb-3">
            <MiniSparkline up={trader.sparklineUp} color={trader.roi > 0 ? '#0ECB81' : '#F6465D'} width={60} height={22} />
            <Badge className={cn('text-[10px] font-semibold px-2 py-0.5 border', riskStyle.bg, riskStyle.text, riskStyle.border)}>
              {trader.risk === 'Very High' && (
                <span className="inline-block animate-pulse me-0.5">&#9679;</span>
              )}
              {t('copyTrading.riskLevel')}: {trader.risk === 'Low' ? t('copyTrading.riskLow') : trader.risk === 'Medium' ? t('copyTrading.riskMedium') : trader.risk === 'High' ? t('copyTrading.riskHigh') : t('copyTrading.riskVeryHigh')}
            </Badge>
          </div>

          {/* Assets */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {trader.assets.map((asset) => (
              <span
                key={asset}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
              >
                {asset}
              </span>
            ))}
          </div>

          {/* Follow Button with gradient and press-scale */}
          <Button
            className="w-full gradient-yellow hover:opacity-90 text-background font-semibold h-9 text-sm press-scale shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            onClick={onCopy}
          >
            <Copy className="h-4 w-4 me-1.5" />
            {t('copyTrading.copyTrader')}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActiveCopyCard({ copy, index, t }: { copy: ActiveCopy; index: number; t: (key: string) => string }) {
  const isPositive = copy.pnl >= 0;
  const { formatNum } = useLocaleFmt();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
      className="mb-3"
    >
      <Card className="bg-card border-border hover:border-primary/15 transition-all glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: copy.color + '20' }}
              >
                <span className="text-xs font-bold" style={{ color: copy.color }} dir="ltr">
                  {copy.traderName.slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{t('copyTrading.copyTrader')}: {copy.traderName}</p>
                <p className="text-[10px] text-muted-foreground">{copy.daysActive} {t('copyTrading.daysActive')} &bull; {copy.openPositions} {t('copyTrading.openPositions')}</p>
              </div>
            </div>
            <div className="text-end">
              <p className={cn('text-sm font-bold', isPositive ? 'text-success' : 'text-destructive')}>
                {isPositive ? '+' : ''}${formatNum(copy.pnl)}
              </p>
              <p className={cn('text-[10px] font-medium', isPositive ? 'text-success' : 'text-destructive')}>
                {isPositive ? '+' : ''}{copy.pnlPercent}%
              </p>
            </div>
          </div>

          {/* PnL Bar */}
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(copy.pnlPercent), 100)}%` }}
              transition={{ duration: 0.6, delay: index * 0.06 + 0.2, ease: 'easeOut' }}
              className={cn('h-full rounded-full', isPositive ? 'bg-success' : 'bg-destructive')}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">{t('copyTrading.invested')}: ${formatNum(copy.invested)}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] border-border text-muted-foreground hover:bg-secondary hover:text-foreground px-3"
              >
                <Settings2 className="h-3 w-3 me-1" />
                {t('copyTrading.details')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50 px-3"
              >
                <StopCircle className="h-3 w-3 me-1" />
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
      <Card className="bg-card/60 border-border/70 glass-card">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 opacity-60"
                style={{ backgroundColor: copy.color + '15' }}
              >
                <span className="text-[10px] font-bold opacity-60" style={{ color: copy.color }} dir="ltr">
                  {copy.traderName.slice(0, 2)}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{copy.traderName}</p>
                <p className="text-[10px] text-muted-foreground">{copy.duration} &bull; {copy.reason === 'manual' ? t('copyTrading.manualClose') : t('copyTrading.stopLossClose')}</p>
              </div>
            </div>
            <div className="text-end">
              <p className={cn('text-xs font-semibold', isPositive ? 'text-success' : 'text-destructive')}>
                {isPositive ? '+' : ''}${copy.finalPnl} {t('copyTrading.pnl')}
              </p>
              <p className="text-[10px] text-muted-foreground">{t('copyTrading.invested')}: ${copy.invested}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LeaderboardTab({ t, onCopy }: { t: (key: string) => string; onCopy: (name: string) => void }) {
  const { isRTL } = useAppStore();
  return (
    <Card className="bg-card border-border glass-card overflow-hidden">
      <CardContent className="p-0">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border bg-background/30">
          <span className="col-span-1 text-[10px] text-muted-foreground font-semibold">#</span>
          <span className="col-span-3 text-[10px] text-muted-foreground font-semibold">{t('copyTrading.trader')}</span>
          <span className="col-span-2 text-[10px] text-muted-foreground font-semibold text-end">{t('copyTrading.roi')}</span>
          <span className="col-span-2 text-[10px] text-muted-foreground font-semibold text-end">{t('copyTrading.winRate')}</span>
          <span className="col-span-2 text-[10px] text-muted-foreground font-semibold text-end">{t('copyTrading.copiers')}</span>
          <span className="col-span-2 text-[10px] text-muted-foreground font-semibold text-end">{t('copyTrading.chart')}</span>
        </div>

        {/* Table Body */}
        {leaderboardData.map((entry, idx) => {
          const riskStyle = getRiskBadge(entry.risk);
          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04, ease: 'easeOut' }}
              className="grid grid-cols-12 gap-1 px-4 py-2.5 border-b border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer items-center"
              onClick={() => onCopy(entry.name)}
            >
              <span className="col-span-1">
                {entry.rank <= 3 ? (
                  <Crown className={cn('h-4 w-4', entry.rank === 1 ? 'text-primary' : entry.rank === 2 ? 'text-muted-foreground' : 'text-orange-700')} />
                ) : (
                  <span className="text-[10px] text-muted-foreground font-medium">{entry.rank}</span>
                )}
              </span>
              <span className="col-span-3 text-[11px] font-medium text-foreground truncate">{entry.name}</span>
              <span className={cn('col-span-2 text-[11px] font-semibold text-end', entry.roi > 0 ? 'text-success' : 'text-destructive')}>
                +{entry.roi}%
              </span>
              <span className="col-span-2 text-[10px] text-muted-foreground text-end">{entry.winRate}%</span>
              <span className="col-span-2 text-[10px] text-muted-foreground text-end">{entry.copiers >= 1000 ? (entry.copiers / 1000).toFixed(1) + 'K' : entry.copiers}</span>
              <span className="col-span-2 flex justify-end">
                <MiniSparkline up={entry.sparklineUp} color={entry.roi > 0 ? '#0ECB81' : '#F6465D'} width={40} height={16} />
              </span>
            </motion.div>
          );
        })}

        {/* Current User Rank */}
        <div className="px-4 py-3 bg-primary/10 border-t border-primary/20">
          <div className="grid grid-cols-12 gap-1 items-center">
            <span className="col-span-1 text-[10px] text-primary font-bold">#156</span>
            <span className="col-span-3 text-[11px] font-medium text-primary">{t('copyTrading.you')}</span>
            <span className="col-span-2 text-[11px] font-semibold text-success text-end">+12.3%</span>
            <span className="col-span-2 text-[10px] text-muted-foreground text-end">—</span>
            <span className="col-span-2 text-[10px] text-muted-foreground text-end">—</span>
            <span className="col-span-2 flex justify-end">
              <ChevronRight className={`h-3.5 w-3.5 text-primary ${isRTL ? 'rotate-180' : ''}`} />
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
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: true, onClose, ref: modalRef });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('copyTrading.startCopy')}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: trader.color + '20' }}
            >
              <span className="text-sm font-bold" style={{ color: trader.color }} dir="ltr">
                {trader.name.slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{trader.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-[10px] font-semibold', trader.roi > 0 ? 'text-success' : 'text-destructive')}>
                  {t('copyTrading.roi')} +{trader.roi}%
                </span>
                <Badge className={cn('text-[10px] px-1.5 py-0 border', riskStyle.bg, riskStyle.text, riskStyle.border)}>
                  {trader.risk === 'Low' ? t('copyTrading.riskLow') : trader.risk === 'Medium' ? t('copyTrading.riskMedium') : trader.risk === 'High' ? t('copyTrading.riskHigh') : t('copyTrading.riskVeryHigh')}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {/* Investment Amount */}
          <div>
            <label className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1.5 block">
              {t('copyTrading.investmentAmount')}
            </label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(e.target.value)}
                className={cn(
                  'ps-7 bg-background/50 border-border text-foreground h-10 text-sm',
                  !isValidAmount && investmentAmount ? 'border-destructive/50 focus:border-destructive' : 'focus:border-primary'
                )}
                placeholder={t('copyTrading.enterAmount')}
              />
            </div>
            {!isValidAmount && investmentAmount && (
              <p className="text-[10px] text-destructive mt-1">{t('copyTrading.amountMustBe')}</p>
            )}
          </div>

          {/* Copy Mode */}
          <div>
            <label className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1.5 block">
              {t('copyTrading.copyMode')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setCopyMode('fixed')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all border',
                  copyMode === 'fixed'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-background/30 border-border text-muted-foreground hover:bg-secondary/50'
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 mx-auto mb-1" />
                {t('copyTrading.fixedAmount')}
              </button>
              <button
                onClick={() => setCopyMode('proportional')}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium transition-all border',
                  copyMode === 'proportional'
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-background/30 border-border text-muted-foreground hover:bg-secondary/50'
                )}
              >
                <BarChart3 className="h-3.5 w-3.5 mx-auto mb-1" />
                {t('copyTrading.proportional')}
              </button>
            </div>
          </div>

          {/* Max Position Size */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] text-muted-foreground tracking-wider font-medium">
                {t('copyTrading.maxPositionSize')}
              </label>
              <span className="text-[11px] font-semibold text-primary">{maxPositionSize[0]}%</span>
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
              <span className="text-[10px] text-muted-foreground">10%</span>
              <span className="text-[10px] text-muted-foreground">100%</span>
            </div>
          </div>

          {/* Stop Loss & Take Profit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1.5 block">
                {t('copyTrading.stopLoss')}
              </label>
              <Input
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="bg-background/50 border-border text-destructive h-9 text-sm focus:border-destructive"
                placeholder="20"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground tracking-wider font-medium mb-1.5 block">
                {t('copyTrading.takeProfit')}
              </label>
              <Input
                type="number"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="bg-background/50 border-border text-success h-9 text-sm focus:border-success"
                placeholder="50"
              />
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-destructive/10 border border-destructive/15 rounded-lg p-3 flex gap-2.5">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {t('copyTrading.riskWarning')}
            </p>
          </div>

          {/* Start Copying Button */}
          <Button
            className="w-full gradient-yellow hover:opacity-90 text-background font-bold h-11 text-sm press-scale shadow-lg shadow-primary/20"
            onClick={onStart}
            disabled={!isValidAmount}
          >
            <Copy className="h-4 w-4 me-2" />
            {t('copyTrading.startCopy')}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
