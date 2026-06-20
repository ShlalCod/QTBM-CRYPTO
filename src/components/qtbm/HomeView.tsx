'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockAssets, mockWalletBalances, formatPrice, formatNumber } from '@/lib/mock-data';
import {
  TrendingUp,
  TrendingDown,
  Star,
  ArrowRight,
  Shield,
  Zap,
  Gift,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  ShoppingCart,
  Megaphone,
  Tag,
  AlertCircle,
  Percent,
  BarChart3,
  Gauge,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Animated number component
function AnimatedNumber({ value, format, duration = 800 }: { value: number; format: (v: number) => string; duration?: number }) {
  const [display, setDisplay] = useState(format(value));

  useEffect(() => {
    const start = performance.now();
    const startValue = parseFloat(display.replace(/[^0-9.-]/g, '')) || 0;
    const diff = value - startValue;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(format(startValue + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span className="tabular-nums">{display}</span>;
}

// Deterministic seeded random for SSR compatibility
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Mini sparkline SVG - deterministic to avoid hydration mismatch
function MiniSparkline({ positive, width = 80, height = 32, seed = 1 }: { positive: boolean; width?: number; height?: number; seed?: number }) {
  const points = React.useMemo(() => {
    const pts: string[] = [];
    let y = height / 2;
    for (let i = 0; i <= 12; i++) {
      const x = (i / 12) * width;
      const delta = (seededRandom(seed + i * 17) - (positive ? 0.4 : 0.6)) * 6;
      y = Math.max(4, Math.min(height - 4, y + delta));
      pts.push(`${x},${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [positive, width, height, seed]);

  const color = positive ? '#0ECB81' : '#F6465D';

  return (
    <svg width={width} height={height} className="shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Live price display with flash
function LivePrice({ symbol, fallbackPrice }: { symbol: string; fallbackPrice: number }) {
  const { livePrices, priceDirection } = useAppStore();
  const price = livePrices[symbol] || livePrices[symbol + 'USDT'] || fallbackPrice;
  const direction = priceDirection[symbol] || priceDirection[symbol + 'USDT'] || null;
  const flashClass = direction === 'up' ? 'price-flash-up' : direction === 'down' ? 'price-flash-down' : '';

  return (
    <span
      key={price}
      className={`tabular-nums price-transition ${flashClass}`}
    >
      {formatPrice(price)}
    </span>
  );
}

// ── Fear and Greed Index Gauge Widget ────────────────────────────────────────
function FearAndGreedGauge({ value = 72, t }: { value?: number; t: (key: string) => string }) {
  // Clamp value 0-100
  const clamped = Math.max(0, Math.min(100, value));

  // Determine label and color
  let label = t('home.neutral');
  let color = '#F0B90B';
  if (clamped <= 25) { label = t('home.extremeFear'); color = '#F6465D'; }
  else if (clamped <= 45) { label = t('home.fear'); color = '#E8706E'; }
  else if (clamped <= 55) { label = t('home.neutral'); color = '#F0B90B'; }
  else if (clamped <= 75) { label = t('home.greed'); color = '#5CC98A'; }
  else { label = t('home.extremeGreed'); color = '#0ECB81'; }

  // SVG semi-circle gauge
  const svgW = 200;
  const svgH = 120;
  const cx = svgW / 2;
  const cy = svgH - 10;
  const r = 80;

  // Arc angle: 0 (left, fear) to 180 (right, greed)
  const angleDeg = (clamped / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  // Needle endpoint (0 = left = π, 180 = right = 0)
  const needleAngle = Math.PI - angleRad;
  const nx = cx + r * 0.8 * Math.cos(needleAngle);
  const ny = cy - r * 0.8 * Math.sin(needleAngle);

  // Background arc segments
  const arcPath = (startDeg: number, endDeg: number) => {
    const s = ((180 - endDeg) * Math.PI) / 180;
    const e = ((180 - startDeg) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(s);
    const y1 = cy - r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy - r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <Card className="glass-card border-[#2B3139]/30 animate-fade-scale">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Gauge className="h-4 w-4 text-[#F0B90B]" />
          <h3 className="text-sm font-semibold text-[#EAECEF]">{t('home.fearGreedIndex')}</h3>
        </div>
        <div className="flex items-center justify-center">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-[220px]">
            {/* Background arcs (colored segments) */}
            <path d={arcPath(0, 36)} fill="none" stroke="#F6465D" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
            <path d={arcPath(36, 72)} fill="none" stroke="#E8706E" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
            <path d={arcPath(72, 108)} fill="none" stroke="#F0B90B" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
            <path d={arcPath(108, 144)} fill="none" stroke="#5CC98A" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
            <path d={arcPath(144, 180)} fill="none" stroke="#0ECB81" strokeWidth="10" strokeLinecap="round" opacity="0.6" />
            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const tAngle = Math.PI - ((tick / 100) * 180 * Math.PI) / 180;
              const tx1 = cx + (r + 8) * Math.cos(tAngle);
              const ty1 = cy - (r + 8) * Math.sin(tAngle);
              const tx2 = cx + (r + 14) * Math.cos(tAngle);
              const ty2 = cy - (r + 14) * Math.sin(tAngle);
              return <line key={tick} x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#5E6673" strokeWidth="1.5" />;
            })}
            {/* Needle */}
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" className="gauge-needle" style={{ '--gauge-angle': `${angleDeg}deg` } as React.CSSProperties} />
            {/* Center dot */}
            <circle cx={cx} cy={cy} r="4" fill={color} />
            {/* Value text */}
            <text x={cx} y={cy - 24} textAnchor="middle" fill={color} fontSize="22" fontWeight="bold" fontFamily="system-ui">
              {clamped}
            </text>
            {/* Labels */}
            <text x={cx - r - 8} y={cy + 16} textAnchor="middle" fill="#F6465D" fontSize="8" opacity="0.7">{t('home.fear')}</text>
            <text x={cx + r + 8} y={cy + 16} textAnchor="middle" fill="#0ECB81" fontSize="8" opacity="0.7">{t('home.greed')}</text>
          </svg>
        </div>
        <div className="text-center mt-1">
          <span className="text-sm font-bold" style={{ color }}>{label}</span>
          <p className="text-[10px] text-[#707785] mt-0.5">{t('home.marketSentimentIndicator')}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Loading shimmer component
function HomeSkeleton() {
  return (
    <div className="space-y-5 p-4 pb-6">
      {/* Portfolio skeleton */}
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="skeleton-text skeleton-text-w-25 h-3" />
          <div className="skeleton skeleton-circle w-6 h-6" />
        </div>
        <div className="skeleton-text skeleton-text-w-50 h-8" />
        <div className="skeleton-text skeleton-text-w-25 h-3" />
        <div className="grid grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 py-2">
              <div className="skeleton skeleton-circle w-9 h-9" />
              <div className="skeleton-text w-12 h-2" />
            </div>
          ))}
        </div>
      </div>
      {/* Market highlights skeleton */}
      <div className="space-y-3">
        <div className="skeleton-text skeleton-text-w-25 h-4" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton w-[180px] h-24 shrink-0 rounded-xl" />
          ))}
        </div>
      </div>
      {/* Earn promo skeleton */}
      <div className="skeleton h-20 rounded-xl" />
      {/* Watchlist skeleton */}
      <div className="space-y-2">
        <div className="skeleton-text skeleton-text-w-25 h-4" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton h-12 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export default function HomeView() {
  const { navigateTo, favorites, toggleFavorite, user, livePrices, priceDirection, isRTL } = useAppStore();
  const { t } = useTranslation();
  const [showBalance, setShowBalance] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Show shimmer on first render
  useEffect(() => {
    const timer = setTimeout(() => setIsFirstLoad(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Portfolio calculations - use live prices when available
  const totalBalance = useMemo(() => {
    return mockWalletBalances.reduce((sum, b) => {
      const liveKey = b.asset + 'USDT';
      const livePrice = livePrices[liveKey] || b.usdValue / b.total;
      return sum + b.total * livePrice;
    }, 0);
  }, [livePrices]);

  const totalBtc = mockWalletBalances.reduce((sum, b) => sum + b.btcValue, 0);
  const change24h = totalBalance * 0.0186;
  const changePercent = 1.86;

  // Get live-enhanced assets
  const liveAssets = useMemo(() => {
    return mockAssets.map((asset) => {
      const symbolKey = asset.symbol + 'USDT';
      const livePrice = livePrices[symbolKey] || asset.price;
      const direction = priceDirection[symbolKey];
      return { ...asset, price: livePrice, _direction: direction };
    });
  }, [livePrices, priceDirection]);

  const trendingAssets = [...liveAssets].sort((a, b) => Math.abs(b.changePercent24h) - Math.abs(a.changePercent24h)).slice(0, 5);
  const topGainers = [...liveAssets].sort((a, b) => b.changePercent24h - a.changePercent24h).slice(0, 3);
  const topLosers = [...liveAssets].sort((a, b) => a.changePercent24h - b.changePercent24h).slice(0, 3);

  // Watchlist - use favorites from store, fallback to top assets
  const watchlistAssets = favorites.length > 0
    ? liveAssets.filter(a => favorites.includes(a.symbol))
    : liveAssets.slice(0, 5);

  const handleAssetClick = useCallback((symbol: string) => {
    useAppStore.getState().setSelectedAsset(symbol);
    navigateTo('trade');
  }, [navigateTo]);

  // Announcements data - using i18n
  const announcements = [
    { id: '1', type: 'listing' as const, title: t('home.ann1Title'), time: '2h ago', badge: t('home.ann1Badge'), badgeColor: 'bg-[#0ECB81]/10 text-[#0ECB81]' },
    { id: '2', type: 'promotion' as const, title: t('home.ann2Title'), time: '5h ago', badge: t('home.ann2Badge'), badgeColor: 'bg-[#F0B90B]/10 text-[#F0B90B]' },
    { id: '3', type: 'system' as const, title: t('home.ann3Title'), time: '1d ago', badge: t('home.ann3Badge'), badgeColor: 'bg-[#848E9C]/10 text-[#848E9C]' },
  ];

  const announcementIcons: Record<string, React.ReactNode> = {
    listing: <Tag className="h-4 w-4 text-[#0ECB81]" />,
    promotion: <Megaphone className="h-4 w-4 text-[#F0B90B]" />,
    system: <AlertCircle className="h-4 w-4 text-[#848E9C]" />,
  };

  if (isFirstLoad) {
    return <HomeSkeleton />;
  }

  return (
    <div className="space-y-5 p-4 pb-6 wave-bg">
      {/* ============ Animated Stats Ticker Bar ============ */}
      <div className="overflow-hidden bg-[#1E2329] rounded-lg border border-[#2B3139] py-1.5">
        <div className="ticker-scroll whitespace-nowrap inline-flex">
          {/* Duplicate content for seamless loop */}
          {[0, 1].map((dup) => (
            <span key={dup} className="inline-flex items-center gap-6 text-[10px] text-[#848E9C] font-medium px-4">
              <span className="flex items-center gap-1">
                <span className="text-[#F0B90B]">{t('home.spotVolume')}:</span>
                <span className="text-[#EAECEF] tabular-nums">$2.4B</span>
              </span>
              <span className="text-[#2B3139]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[#F0B90B]">{t('home.btcDominance')}:</span>
                <span className="text-[#EAECEF] tabular-nums">52.3%</span>
              </span>
              <span className="text-[#2B3139]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[#F0B90B]">{t('home.activeTraders')}:</span>
                <span className="text-[#EAECEF] tabular-nums">1.2M</span>
              </span>
              <span className="text-[#2B3139]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[#F0B90B]">{t('home.totalMarketCap')}:</span>
                <span className="text-[#EAECEF] tabular-nums">$2.1T</span>
              </span>
              <span className="text-[#2B3139]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[#F0B90B]">{t('home.ethGas')}:</span>
                <span className="text-[#EAECEF] tabular-nums">12 Gwei</span>
              </span>
              <span className="text-[#2B3139]">|</span>
              <span className="flex items-center gap-1">
                <span className="text-[#F0B90B]">{t('home.fearGreedIndex')}:</span>
                <span className="text-[#0ECB81] tabular-nums">72 ({t('home.greed')})</span>
              </span>
              <span className="text-[#2B3139]">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ Portfolio Summary Card with Glass Morphism ============ */}
      <Card className="glass-card border-[#2B3139]/40 overflow-hidden relative animate-fade-scale">
        {/* Decorative gradient circles with floating animation */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#F0B90B]/5 rounded-full blur-2xl pointer-events-none animate-float" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#0ECB81]/5 rounded-full blur-2xl pointer-events-none" style={{ animationDelay: '1s' }} />
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer pointer-events-none rounded-xl" />
        {/* Particle/star background effect */}
        <div className="particle" style={{ top: '15%', left: '20%', animationDelay: '0s' }} />
        <div className="particle" style={{ top: '35%', left: '70%', animationDelay: '1s' }} />
        <div className="particle" style={{ top: '60%', left: '45%', animationDelay: '2s' }} />
        <div className="particle" style={{ top: '25%', left: '85%', animationDelay: '0.5s' }} />
        <div className="particle" style={{ top: '75%', left: '15%', animationDelay: '1.5s' }} />
        <div className="particle" style={{ top: '50%', left: '55%', animationDelay: '2.5s' }} />
        <CardContent className="p-5 relative">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[#848E9C] font-medium">
              {user.isAuthenticated ? t('home.estimatedBalance') : t('home.portfolioValue')}
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-[#5E6673] hover:text-[#848E9C] transition-colors p-1 rounded-md hover:bg-[#2B3139]/50"
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-bold gradient-text-gold">
              {showBalance ? (
                <>
                  $<AnimatedNumber value={totalBalance} format={(v) => formatPrice(v)} />
                </>
              ) : (
                '****'
              )}
            </span>
            {/* Total portfolio change badge (24h) */}
            {showBalance && (
              <Badge className={`text-[10px] h-5 px-1.5 border-0 mb-1 ${
                changePercent >= 0
                  ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                  : 'bg-[#F6465D]/15 text-[#F6465D]'
              }`}>
                {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#5E6673] floating-label">
              ≈ {showBalance ? totalBtc.toFixed(4) : '****'} BTC
            </span>
            {showBalance && (
              <div className="flex items-center gap-1">
                {changePercent >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-[#0ECB81]" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-[#F6465D]" />
                )}
                <span className={`text-xs font-medium ${changePercent >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {changePercent >= 0 ? '+' : ''}
                  <AnimatedNumber value={change24h} format={(v) => '$' + formatPrice(Math.abs(v))} />
                  ({changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons with gradient borders */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { icon: ArrowDownRight, label: t('actions.deposit'), view: 'deposit' as const },
              { icon: ArrowUpRight, label: t('actions.withdraw'), view: 'withdraw' as const },
              { icon: ArrowLeftRight, label: t('actions.transfer'), view: 'transfer' as const },
              { icon: ShoppingCart, label: t('wallet.buyCrypto'), view: 'trade' as const },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigateTo(action.view)}
                  className="flex flex-col items-center gap-2 py-2.5 px-1 rounded-xl transition-all duration-200 press-scale hover-lift gradient-border bg-[#2B3139]/40 hover:bg-[#2B3139]/70"
                >
                  <div className="w-9 h-9 rounded-full bg-[#F0B90B]/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-[#F0B90B]" />
                  </div>
                  <span className="text-[10px] text-[#848E9C] font-medium">{action.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ============ Fear & Greed Index Gauge ============ */}
      <FearAndGreedGauge value={72} t={t} />

      {/* ============ Market Highlights ============ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#F0B90B]" />
            <h3 className="text-sm font-semibold text-[#EAECEF]">{t('home.marketHighlights')}</h3>
          </div>
          <button
            onClick={() => navigateTo('markets')}
            className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 flex items-center gap-1 transition-colors"
          >
            {t('home.viewAll')} <ArrowRight className="h-3 w-3 rtl-flip" />
          </button>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {trendingAssets.map((asset, index) => (
              <Card
                key={asset.id}
                className="glass-card card-depth border-[#2B3139]/30 shrink-0 w-[180px] cursor-pointer hover:border-[#F0B90B]/30 transition-all duration-300 perspective-card animate-slide-in-bottom"
                style={{ animationDelay: `${index * 0.06}s` }}
                onClick={() => handleAssetClick(asset.symbol)}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#2B3139]/60 flex items-center justify-center text-xs font-bold backdrop-blur-sm">
                        {asset.icon}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#EAECEF]">{asset.symbol}</span>
                        <span className="text-[10px] text-[#5E6673] block">/USDT</span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] h-5 px-1.5 border-0 ${
                      asset.changePercent24h >= 0
                        ? 'bg-[#0ECB81]/10 text-[#0ECB81]'
                        : 'bg-[#F6465D]/10 text-[#F6465D]'
                    }`}>
                      {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                    </Badge>
                  </div>
                  {/* Trending arrow icon animation + price + sparkline */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {asset.changePercent24h >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-[#0ECB81] trending-bounce-up" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-[#F6465D] trending-bounce-down" />
                      )}
                      <span className="text-sm font-bold text-[#EAECEF] tabular-nums">
                        <LivePrice symbol={asset.symbol} fallbackPrice={asset.price} />
                      </span>
                    </div>
                    <MiniSparkline positive={asset.changePercent24h >= 0} width={52} height={24} seed={asset.id.charCodeAt(0)} />
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#5E6673]">
                    <span>{t('home.volume')} {formatNumber(asset.volume24h)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>
      </div>

      {/* ============ Earn Promo Banner with Animated Shimmer Gradient ============ */}
      <Card className="gradient-border bg-gradient-to-r from-[#1E2329] via-[#2B3139] to-[#1E2329] border-0 overflow-hidden relative cursor-pointer hover:shadow-lg hover:shadow-[#F0B90B]/10 transition-all duration-300 animate-fade-scale" onClick={() => navigateTo('earn')}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#F0B90B]/5 via-transparent to-[#F0B90B]/5 pointer-events-none" />
        <div className="absolute inset-0 shimmer-gradient pointer-events-none" />
        <CardContent className="p-4 flex items-center gap-3 relative">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F0B90B]/20 to-[#F0B90B]/5 rounded-2xl flex items-center justify-center shrink-0 animate-float">
            <Percent className="h-6 w-6 text-[#F0B90B]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-[#EAECEF]">{t('home.earnUpTo')} 12% {t('home.apy')}</p>
            <p className="text-xs text-[#848E9C] mt-0.5">{t('home.stakeAndEarn')}</p>
          </div>
          <Button
            className="gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-8 px-4 text-xs shrink-0 shadow-md shadow-[#F0B90B]/20 press-scale"
            onClick={(e) => { e.stopPropagation(); navigateTo('earn'); }}
          >
            {t('home.earnNow')}
          </Button>
        </CardContent>
      </Card>

      <Separator className="bg-[#2B3139]/60" />

      {/* ============ Watchlist ============ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[#F0B90B]" />
            <h3 className="text-sm font-semibold text-[#EAECEF]">{t('home.watchlist')}</h3>
          </div>
          <button
            onClick={() => navigateTo('markets')}
            className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 flex items-center gap-1 transition-colors"
          >
            {t('home.edit')} <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        {watchlistAssets.length > 0 ? (
          <div className="space-y-1">
            <AnimatePresence>
              {watchlistAssets.map((asset, index) => (
                <motion.div
                  key={asset.id}
                  role="button"
                  tabIndex={0}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => handleAssetClick(asset.symbol)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAssetClick(asset.symbol); }}
                  className="w-full flex items-center justify-between py-2.5 px-2 hover:bg-[#1E2329]/60 rounded-lg transition-all duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(asset.symbol);
                      }}
                      className="text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors"
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-[#2B3139]/60 flex items-center justify-center text-sm font-bold shrink-0 backdrop-blur-sm">
                      {asset.icon}
                    </div>
                    <div className={`text-${isRTL ? 'right' : 'left'}`}>
                      <p className="text-sm font-semibold text-[#EAECEF]">{asset.symbol}</p>
                      <p className="text-[10px] text-[#5E6673]">{asset.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MiniSparkline positive={asset.changePercent24h >= 0} width={48} height={20} seed={asset.id.charCodeAt(0) + 100} />
                    <div className={`text-${isRTL ? 'left' : 'right'} min-w-[80px]`}>
                      <p className="text-sm font-semibold text-[#EAECEF] tabular-nums">
                        <LivePrice symbol={asset.symbol} fallbackPrice={asset.price} />
                      </p>
                      <p className={`text-xs font-medium ${
                        asset.changePercent24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                      }`}>
                        {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <Card className="glass-card border-[#2B3139]/30">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 text-[#5E6673] mx-auto mb-2" />
              <p className="text-sm text-[#848E9C]">{t('home.noFavorites')}</p>
              <Button
                variant="outline"
                className="mt-3 border-[#2B3139] text-[#F0B90B] hover:bg-[#2B3139] text-xs h-8"
                onClick={() => navigateTo('markets')}
              >
                {t('home.addFavorites')}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ============ Top Movers ============ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#EAECEF]">{t('home.topMovers')}</h3>
          <button
            onClick={() => navigateTo('markets')}
            className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 flex items-center gap-1 transition-colors"
          >
            {t('home.viewAll')} <ArrowRight className="h-3 w-3 rtl-flip" />
          </button>
        </div>
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-2">
            {[...topGainers, ...topLosers].map((asset) => (
              <Card
                key={asset.id}
                className="glass-card border-[#2B3139]/30 shrink-0 w-36 cursor-pointer hover:border-[#F0B90B]/30 transition-all duration-300 press-scale hover-lift"
                onClick={() => handleAssetClick(asset.symbol)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-sm">{asset.icon}</span>
                    <span className="text-xs font-semibold text-[#EAECEF]">{asset.symbol}</span>
                  </div>
                  <p className="text-sm font-bold text-[#EAECEF] tabular-nums">
                    <LivePrice symbol={asset.symbol} fallbackPrice={asset.price} />
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {asset.changePercent24h >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-[#0ECB81]" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-[#F6465D]" />
                    )}
                    <p className={`text-xs font-medium ${
                      asset.changePercent24h >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                    }`}>
                      {asset.changePercent24h >= 0 ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1" />
        </ScrollArea>
      </div>

      {/* ============ Announcements ============ */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#0ECB81] pulse-green" />
            <h3 className="text-sm font-semibold text-[#EAECEF]">{t('home.announcements')}</h3>
          </div>
          <button className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 flex items-center gap-1 transition-colors">
            {t('home.more')} <ChevronRight className="h-3 w-3" />
          </button>
        </div>
        <Card className="glass-card border-[#2B3139]/30">
          <CardContent className="p-0">
            <div className="divide-y divide-[#2B3139]/40">
              {announcements.map((ann) => (
                <button
                  key={ann.id}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-[#2B3139]/30 transition-colors text-start"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#2B3139]/50 flex items-center justify-center shrink-0 backdrop-blur-sm">
                    {announcementIcons[ann.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#EAECEF] truncate">{ann.title}</p>
                    <p className="text-[10px] text-[#5E6673] mt-0.5">{ann.time}</p>
                  </div>
                  <Badge className={`text-[10px] h-5 px-1.5 border-0 shrink-0 ${ann.badgeColor}`}>
                    {ann.badge}
                  </Badge>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ Quick Access - Feature Grid ============ */}
      <div>
        <h3 className="text-sm font-semibold text-[#EAECEF] mb-3">{t('home.quickAccess')}</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: TrendingUp, label: t('nav.markets'), desc: t('home.explorePairs'), view: 'markets' as const, color: 'text-[#0ECB81]', bgColor: 'bg-[#0ECB81]/10' },
            { icon: Shield, label: t('nav.earn'), desc: `${t('home.earnUpTo')} 12% ${t('home.apy')}`, view: 'earn' as const, color: 'text-[#F0B90B]', bgColor: 'bg-[#F0B90B]/10' },
            { icon: Zap, label: t('nav.trade'), desc: t('home.spotAndMargin'), view: 'trade' as const, color: 'text-[#F0B90B]', bgColor: 'bg-[#F0B90B]/10' },
            { icon: Gift, label: t('home.rewards'), desc: t('home.claimBonuses'), view: 'launchpad' as const, color: 'text-[#F6465D]', bgColor: 'bg-[#F6465D]/10' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="glass-card border-[#2B3139]/30 cursor-pointer hover:border-[#F0B90B]/20 transition-all duration-300 press-scale hover-lift"
                onClick={() => navigateTo(item.view)}
              >
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center mb-2.5`}>
                    <Icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-[#EAECEF]">{item.label}</p>
                  <p className="text-[10px] text-[#5E6673] mt-0.5">{item.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
