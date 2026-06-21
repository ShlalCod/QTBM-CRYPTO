'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { mockMarketPairs, mockAssets, formatPrice, formatNumber, generateSparkline } from '@/lib/mock-data';
import { Star, Search, ArrowUpDown, TrendingUp, TrendingDown, Globe, BarChart3, Coins, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/lib/i18n';

type SortField = 'symbol' | 'price' | 'change' | 'volume';
type SortDir = 'asc' | 'desc';

// Mini area chart SVG component (replaces sparkline with area fill)
function MiniAreaChart({ data, positive }: { data: number[]; positive: boolean }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  const color = positive ? '#0ECB81' : '#F6465D';
  return (
    <svg width={w} height={h} className="shrink-0" dir="ltr">
      <defs>
        <linearGradient id={`area-${positive ? 'g' : 'r'}-${data[0]}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill={`url(#area-${positive ? 'g' : 'r'}-${data[0]})`}
        points={`0,${h} ${points} ${w},${h}`}
      />
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Live price cell with flash animation
function LivePriceCell({ symbol, fallbackPrice }: { symbol: string; fallbackPrice: number }) {
  const { livePrices, priceDirection } = useAppStore();
  const price = livePrices[symbol] || fallbackPrice;
  const direction = priceDirection[symbol] || null;
  // Compute flash class directly (no setState in effect)
  const flashClass = direction === 'up' ? 'price-flash-up' : direction === 'down' ? 'price-flash-down' : '';

  return (
    <span
      key={price}
      className={`text-sm font-medium text-foreground tabular-nums price-transition ${flashClass}`}
    >
      {formatPrice(price)}
    </span>
  );
}

const TABS = [
  { id: 'favorites', label: '★' },
  { id: 'usdt', label: 'USDT' },
  { id: 'btc', label: 'BTC' },
  { id: 'eth', label: 'ETH' },
  { id: 'bnb', label: 'BNB' },
  { id: 'heatmap', label: '🔥 ' },
  { id: 'new', label: 'New' },
  { id: 'gainers', label: 'Gainers' },
  { id: 'losers', label: 'Losers' },
];

export default function MarketsView() {
  const { t } = useTranslation();
  const { navigateTo, favorites, toggleFavorite, setSelectedMarket, searchQuery, setSearchQuery, livePrices, priceDirection } = useAppStore();  const [tab, setTab] = useState('usdt');
  const [sortField, setSortField] = useState<SortField>('volume');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [heatmapFilter, setHeatmapFilter] = useState<'all' | 'gainers' | 'losers'>('all');

  // Live-enhanced market pairs
  const livePairs = useMemo(() => {
    return mockMarketPairs.map((pair) => {
      const livePrice = livePrices[pair.symbol];
      return livePrice ? { ...pair, price: livePrice } : pair;
    });
  }, [livePrices]);

  // Pre-compute sparkline data for all pairs (stable across renders)
  const sparklineCache = useMemo(() => {
    const cache: Record<string, number[]> = {};
    mockMarketPairs.forEach(pair => {
      cache[pair.symbol] = generateSparkline(pair);
    });
    return cache;
  }, []);

  // New listings (arbitrary: ARB, OP, APT, IMX)
  const newAssets = ['ARB', 'OP', 'APT', 'IMX'];

  const filteredPairs = useMemo(() => {
    let pairs = livePairs.filter(pair => {
      const matchesSearch = searchQuery
        ? pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pair.baseAsset.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      switch (tab) {
        case 'favorites':
          return matchesSearch && favorites.includes(pair.baseAsset);
        case 'usdt':
          return matchesSearch && pair.quoteAsset === 'USDT';
        case 'btc':
          return matchesSearch && pair.quoteAsset === 'BTC';
        case 'eth':
          return matchesSearch && pair.quoteAsset === 'ETH';
        case 'bnb':
          return matchesSearch && pair.quoteAsset === 'BNB';
        case 'new':
          return matchesSearch && newAssets.includes(pair.baseAsset) && pair.quoteAsset === 'USDT';
        case 'gainers':
          return matchesSearch && pair.changePercent > 0;
        case 'losers':
          return matchesSearch && pair.changePercent < 0;
        default:
          return matchesSearch;
      }
    });

    // Sort
    pairs = [...pairs].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'symbol':
          cmp = a.baseAsset.localeCompare(b.baseAsset);
          break;
        case 'price':
          cmp = a.price - b.price;
          break;
        case 'change':
          cmp = a.changePercent - b.changePercent;
          break;
        case 'volume':
          cmp = a.quoteVolume - b.quoteVolume;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    // For gainers, always sort by change descending
    if (tab === 'gainers') {
      pairs.sort((a, b) => b.changePercent - a.changePercent);
    }
    // For losers, always sort by change ascending (most negative first)
    if (tab === 'losers') {
      pairs.sort((a, b) => a.changePercent - b.changePercent);
    }

    return pairs;
  }, [searchQuery, tab, sortField, sortDir, favorites, livePairs]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handlePairClick = (symbol: string) => {
    setSelectedMarket(symbol);
    navigateTo('trade');
  };

  // Max volume for volume bar scaling
  const maxVolume = Math.max(...livePairs.map(p => p.quoteVolume), 1);

  // ── Heatmap Component ────────────────────────────────────────────────────────
  const heatmapData = useMemo(() => {
    const usdtPairs = livePairs.filter(p => p.quoteAsset === 'USDT');
    let filtered = usdtPairs;
    if (heatmapFilter === 'gainers') filtered = usdtPairs.filter(p => p.changePercent > 0);
    if (heatmapFilter === 'losers') filtered = usdtPairs.filter(p => p.changePercent < 0);
    // Sort by volume for sizing
    return filtered.sort((a, b) => b.quoteVolume - a.quoteVolume).slice(0, 20);
  }, [livePairs, heatmapFilter]);

  const renderHeatmap = () => {
    if (heatmapData.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <BarChart3 className="h-8 w-8 mb-2 text-secondary" />
          <p className="text-sm">{t('markets.noHeatmapData')}</p>
        </div>
      );
    }

    const totalVolume = heatmapData.reduce((sum, p) => sum + p.quoteVolume, 0);
    const svgW = 600;
    const svgH = 300;
    const gap = 3;
    const cols = 5;
    const rows = Math.ceil(heatmapData.length / cols);
    const cellW = (svgW - (cols + 1) * gap) / cols;
    const cellH = (svgH - (rows + 1) * gap) / rows;

    // Compute color based on change percent
    const getCellColor = (change: number) => {
      if (change > 5) return '#0ECB81';
      if (change > 2) return 'rgba(14,203,129,0.7)';
      if (change > 0) return 'rgba(14,203,129,0.45)';
      if (change > -2) return 'rgba(246,70,93,0.45)';
      if (change > -5) return 'rgba(246,70,93,0.7)';
      return '#F6465D';
    };

    // Get cell size factor based on volume
    const getCellHeight = (volume: number) => {
      const ratio = volume / (totalVolume / heatmapData.length);
      return Math.max(cellH * 0.6, cellH * Math.min(ratio, 1.4));
    };

    let yOffset = gap;

    return (
      <div>
        {/* Gainers/Losers Filter Bar */}
        <div className="flex gap-2 mb-3 px-4">
          {(['all', 'gainers', 'losers'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setHeatmapFilter(f)}
              className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
                heatmapFilter === f
                  ? f === 'gainers' ? 'bg-success/15 text-success border border-success/30'
                    : f === 'losers' ? 'bg-destructive/15 text-destructive border border-destructive/30'
                    : 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-card text-muted-foreground border border-border hover:text-foreground'
              }`}
            >
              {f === 'all' ? t('markets.all') : f === 'gainers' ? `▲ ${t('markets.gainersShort')}` : `▼ ${t('markets.losersShort')}`}
            </button>
          ))}
        </div>

        <div className="px-4 pb-4">
          <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="w-full" style={{ maxHeight: '300px' }} dir="ltr">
            {heatmapData.map((pair, idx) => {
              const col = idx % cols;
              const row = Math.floor(idx / cols);
              const x = gap + col * (cellW + gap);
              const cH = getCellHeight(pair.quoteVolume);
              const y = row === 0 ? gap : yOffset;
              if (col === 0 && row > 0) yOffset += gap;
              const actualY = gap + row * (cellH + gap) + (cellH - cH) / 2;
              const color = getCellColor(pair.changePercent);

              return (
                <g key={pair.symbol}>
                  <rect
                    x={x}
                    y={actualY}
                    width={cellW}
                    height={cH}
                    rx={4}
                    fill={color}
                    opacity={0.85}
                    className="heatmap-cell"
                  />
                  <text
                    x={x + cellW / 2}
                    y={actualY + cH / 2 - 6}
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {pair.baseAsset}
                  </text>
                  <text
                    x={x + cellW / 2}
                    y={actualY + cH / 2 + 8}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.85)"
                    fontSize="9"
                  >
                    {pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Stats
  const totalMarketCap = mockAssets.reduce((acc, a) => acc + a.marketCap, 0);
  const totalVolume = livePairs.reduce((acc, p) => acc + p.quoteVolume, 0);
  const btcDominance = ((mockAssets[0].marketCap / totalMarketCap) * 100);

  return (
    <div className="flex flex-col h-full">
      {/* Stats Banner */}
      <div className="px-4 pt-3 pb-2 border-b border-border">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Globe className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">{t('markets.marketCap')}</p>
              <p className="text-xs text-foreground font-semibold tabular-nums">{formatNumber(totalMarketCap, 1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-success/10 flex items-center justify-center shrink-0">
              <BarChart3 className="h-3.5 w-3.5 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">{t('markets.volume')}</p>
              <p className="text-xs text-foreground font-semibold tabular-nums">{formatNumber(totalVolume, 1)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Coins className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">{t('markets.btcDominance')}</p>
              <p className="text-xs text-foreground font-semibold tabular-nums">{btcDominance.toFixed(1)}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-success/10 flex items-center justify-center shrink-0">
              <Activity className="h-3.5 w-3.5 text-success" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground leading-tight">{t('markets.activeMarkets')}</p>
              <p className="text-xs text-foreground font-semibold tabular-nums">{mockMarketPairs.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-3 pb-1">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('markets.searchPlaceholder')}
            aria-label={t('actions.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 bg-card border-border text-foreground placeholder:text-muted-foreground h-9 text-sm focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2">
        <div className="flex gap-1 overflow-x-auto no-scrollbar touch-pan-x">
          {TABS.map((tabItem) => {
            const labelText =
              tabItem.id === 'heatmap' ? `${tabItem.label}${t('markets.heatmap')}` :
              tabItem.id === 'new' ? t('common.new') :
              tabItem.id === 'gainers' ? t('markets.gainersShort') :
              tabItem.id === 'losers' ? t('markets.losersShort') :
              tabItem.label;
            return (
              <button
                key={tabItem.id}
                onClick={() => setTab(tabItem.id)}
                className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors card-depth ${
                  tab === tabItem.id
                    ? 'bg-secondary gradient-text-gold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                {labelText}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Header */}
      <div className="flex items-center px-4 py-1.5 text-[11px] text-muted-foreground border-b border-border">
        <div className="w-5 shrink-0 text-center">#</div>
        <div className="w-8 shrink-0" />
        <button onClick={() => handleSort('symbol')} className="flex items-center gap-0.5 flex-1 text-start hover:text-muted-foreground min-w-0">
          <span className="truncate">{t('markets.pair')}</span>
          <ArrowUpDown className="h-2.5 w-2.5 shrink-0" />
        </button>
        <button onClick={() => handleSort('price')} className="flex items-center gap-0.5 w-24 text-end hover:text-muted-foreground shrink-0">
          <span>{t('markets.price')}</span>
          <ArrowUpDown className="h-2.5 w-2.5 shrink-0" />
        </button>
        <div className="w-20 shrink-0 hidden sm:block" /> {/* Sparkline placeholder */}
        <button onClick={() => handleSort('change')} className="flex items-center gap-0.5 w-16 text-end hover:text-muted-foreground shrink-0">
          <span>{t('markets.24h')}</span>
          <ArrowUpDown className="h-2.5 w-2.5 shrink-0" />
        </button>
        <button onClick={() => handleSort('volume')} className="flex items-center gap-0.5 w-20 text-end hover:text-muted-foreground shrink-0">
          <span>{t('markets.volume')}</span>
          <ArrowUpDown className="h-2.5 w-2.5 shrink-0" />
        </button>
      </div>

      {/* Market List / Heatmap */}
      {tab === 'heatmap' ? (
        <div className="flex-1">
          {renderHeatmap()}
        </div>
      ) : (
      <ScrollArea className="flex-1">
        <div className="px-4">
          {filteredPairs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              {tab === 'favorites' ? (
                <>
                  <Star className="h-8 w-8 mb-2 text-secondary" />
                  <p className="text-sm">{t('markets.noFavorites')}</p>
                  <p className="text-xs mt-1">{t('markets.starToAdd')}</p>
                </>
              ) : (
                <p className="text-sm">{t('markets.noResults')}</p>
              )}
            </div>
          )}
          {filteredPairs.map((pair, rankIdx) => {
            const isFav = favorites.includes(pair.baseAsset);
            const isPositive = pair.changePercent >= 0;
            const sparkData = sparklineCache[pair.symbol];
            const isHot = Math.abs(pair.changePercent) >= 3;

            return (
              <div
                key={pair.symbol}
                role="button"
                tabIndex={0}
                onClick={() => handlePairClick(pair.symbol)}
                className="w-full flex items-center py-2.5 border-b border-border/40 hover:bg-card/50 transition-colors group cursor-pointer"
              >
                {/* Market cap rank number */}
                <div className="w-5 shrink-0 text-center text-[10px] text-muted-foreground tabular-nums">{rankIdx + 1}</div>

                {/* Favorite */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(pair.baseAsset);
                  }}
                  className={`w-8 shrink-0 transition-colors ${isFav ? 'text-primary' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                >
                  <Star className={`h-3.5 w-3.5 ${isFav ? 'fill-current' : ''}`} />
                </button>

                {/* Pair name */}
                <div className="flex-1 text-start min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">{pair.baseAsset}</span>
                    <span className="text-[11px] text-muted-foreground">/{pair.quoteAsset}</span>
                    {/* Hot badge */}
                    {isHot && (
                      <Badge className="text-[10px] h-3.5 px-1 bg-destructive/15 text-destructive border-0 hot-badge badge-shimmer font-bold">
                        {t('markets.hot')}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Price - with live flash */}
                <div className="w-24 text-end shrink-0">
                  <LivePriceCell symbol={pair.symbol} fallbackPrice={pair.price} />
                </div>

                {/* Mini Area Chart - hidden on very small screens */}
                <div className="w-20 shrink-0 hidden sm:flex items-center justify-end">
                  <MiniAreaChart data={sparkData} positive={isPositive} />
                </div>

                {/* 24h Change */}
                <div className="w-16 text-end shrink-0">
                  <span className={`text-xs font-semibold tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {isPositive ? '+' : ''}{pair.changePercent.toFixed(2)}%
                  </span>
                </div>

                {/* Volume Bar */}
                <div className="w-20 text-end shrink-0">
                  <span className="text-[11px] text-muted-foreground tabular-nums">{formatNumber(pair.quoteVolume)}</span>
                  <div className="volume-bar-bg mt-0.5">
                    <div
                      className="volume-bar-fill"
                      style={{ width: `${Math.min(100, (pair.quoteVolume / maxVolume) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      )}
    </div>
  );
}
