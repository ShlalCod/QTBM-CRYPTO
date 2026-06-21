'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockMarketPairs, formatPrice, formatNumber } from '@/lib/mock-data';
import {
  ArrowLeft,
  ChevronDown,
  Minus,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

type FuturesOrderType = 'limit' | 'market' | 'stop';
type FuturesSide = 'long' | 'short';
type PositionMode = 'cross' | 'isolated';

const perpContracts = [
  { symbol: 'BTCUSDT', base: 'BTC', quote: 'USDT', fundingRate: 0.0100, indexPrice: 67400, markPrice: 67432 },
  { symbol: 'ETHUSDT', base: 'ETH', quote: 'USDT', fundingRate: 0.0085, indexPrice: 3518, markPrice: 3521 },
  { symbol: 'SOLUSDT', base: 'SOL', quote: 'USDT', fundingRate: 0.0120, indexPrice: 178.5, markPrice: 178.9 },
  { symbol: 'BNBUSDT', base: 'BNB', quote: 'USDT', fundingRate: -0.0035, indexPrice: 597.8, markPrice: 598.2 },
];

const mockFuturesPositions = [
  { id: '1', symbol: 'BTCUSDT', side: 'long' as const, size: 0.5, entryPrice: 66800, markPrice: 67432, leverage: 10, margin: 3340, pnl: 316, roe: 9.46, liqPrice: 60120 },
  { id: '2', symbol: 'ETHUSDT', side: 'short' as const, size: 5, entryPrice: 3580, markPrice: 3521, leverage: 20, margin: 895, pnl: 295, roe: 32.96, liqPrice: 3759 },
  { id: '3', symbol: 'SOLUSDT', side: 'long' as const, size: 50, entryPrice: 172.5, markPrice: 178.9, leverage: 5, margin: 1725, pnl: 320, roe: 18.55, liqPrice: 138.0 },
];

const mockFuturesOrders = [
  { id: '10', symbol: 'BTCUSDT', side: 'long' as const, type: 'limit', price: 65000, amount: 0.3, status: 'pending', time: '10:30:15' },
  { id: '11', symbol: 'ETHUSDT', side: 'short' as const, type: 'stop', price: 3650, amount: 3, status: 'pending', time: '09:45:22' },
  { id: '12', symbol: 'SOLUSDT', side: 'long' as const, type: 'limit', price: 170, amount: 20, status: 'filled', time: '08:12:05' },
  { id: '13', symbol: 'BNBUSDT', side: 'short' as const, type: 'market', price: 598, amount: 8, status: 'filled', time: '07:55:33' },
  { id: '14', symbol: 'BTCUSDT', side: 'long' as const, type: 'limit', price: 64000, amount: 0.1, status: 'canceled', time: '06:22:18' },
];

export default function FuturesView() {
  const { goBack, livePrices, priceDirection, isRTL } = useAppStore();
  const { t } = useTranslation();

  const [selectedContract, setSelectedContract] = useState(perpContracts[0]);
  const [leverage, setLeverage] = useState(20);
  const [positionMode, setPositionMode] = useState<PositionMode>('cross');
  const [side, setSide] = useState<FuturesSide>('long');
  const [orderType, setOrderType] = useState<FuturesOrderType>('limit');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [pairDropdown, setPairDropdown] = useState(false);
  const [countdown, setCountdown] = useState(7 * 3600 + 23 * 60 + 45);

  // Live price for the selected contract
  const livePrice = livePrices[selectedContract.symbol] || selectedContract.markPrice;
  const direction = priceDirection[selectedContract.symbol] || null;

  // Countdown timer for next funding
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 28800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const priceNum = parseFloat(price) || livePrice;
  const amountNum = parseFloat(amount) || 0;
  const cost = amountNum * priceNum / leverage;
  const liquidationPrice = side === 'long'
    ? priceNum * (1 - 1 / leverage + 0.005)
    : priceNum * (1 + 1 / leverage - 0.005);
  const marginRequirement = cost;

  const leverageQuickButtons = [1, 5, 10, 25, 50, 100, 125];

  const totalUnrealizedPnl = mockFuturesPositions.reduce((sum, p) => sum + p.pnl, 0);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label={t('actions.back')} className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={goBack}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground">{t('trade.futuresTrading')}</h1>
            <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
              {t('futures.perpetual')}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{t('trade.unrealizedPnl')}</span>
          <span className={`text-sm font-bold tabular-nums ${totalUnrealizedPnl >= 0 ? 'text-success pnl-glow-profit' : 'text-destructive pnl-glow-loss'}`}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}{formatPrice(totalUnrealizedPnl)} USDT
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3 max-w-7xl mx-auto">
          {/* Pair Selector + Price Display */}
          <div className="bg-card rounded-lg p-3">
            <div className="flex flex-wrap items-center gap-4">
              {/* Pair dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPairDropdown(!pairDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-secondary transition-colors"
                >
                  <span className="text-lg font-bold text-foreground">{selectedContract.base}</span>
                  <span className="text-sm text-muted-foreground">/{selectedContract.quote}</span>
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1 py-0 h-3.5 font-semibold ms-1">{t('futures.perpetual')}</Badge>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${pairDropdown ? 'rotate-180' : ''}`} />
                </button>
                {pairDropdown && (
                  <div className="absolute top-full start-0 mt-1 w-56 bg-card border border-border rounded-lg shadow-xl z-50">
                    {perpContracts.map((c) => (
                      <button
                        key={c.symbol}
                        onClick={() => { setSelectedContract(c); setPairDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-secondary transition-colors ${
                          c.symbol === selectedContract.symbol ? 'bg-secondary/50' : ''
                        }`}
                      >
                        <span>
                          <span className="text-foreground font-medium">{c.base}</span>
                          <span className="text-muted-foreground">/{c.quote}</span>
                          <span className="text-[10px] text-primary ms-1">{t('futures.perpetual')}</span>
                        </span>
                        <div className="text-end">
                          <div className="text-foreground tabular-nums">{formatPrice(livePrices[c.symbol] || c.markPrice)}</div>
                          <div className={`text-[10px] tabular-nums ${c.fundingRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {c.fundingRate >= 0 ? '+' : ''}{c.fundingRate.toFixed(4)}%
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Price */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-success live-dot" />
                <span className={`text-2xl font-bold tabular-nums ${direction === 'up' ? 'text-success' : direction === 'down' ? 'text-destructive' : 'text-foreground'}`}>
                  {formatPrice(livePrice)}
                </span>
              </div>

              {/* Price Stats */}
              <div className="flex flex-wrap gap-4 text-[11px]">
                <div>
                  <span className="text-muted-foreground">{t('trade.mark')} </span>
                  <span className="text-foreground tabular-nums">{formatPrice(selectedContract.markPrice)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('trade.index')} </span>
                  <span className="text-foreground tabular-nums">{formatPrice(selectedContract.indexPrice)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">{t('trade.funding')} </span>
                  <span className={`tabular-nums ${selectedContract.fundingRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {selectedContract.fundingRate >= 0 ? '+' : ''}{selectedContract.fundingRate.toFixed(4)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary funding-dot-pulse" />
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{t('trade.next')} </span>
                  <span className="text-primary tabular-nums font-medium">{formatCountdown(countdown)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leverage + Position Mode */}
          <div className="bg-card rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">{t('trade.leverage')}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-primary tabular-nums">{leverage}x</span>
                {/* Leverage gauge arc */}
                <svg width="32" height="20" viewBox="0 0 32 20" className="shrink-0">
                  <path d="M 2 18 A 14 14 0 0 1 30 18" fill="none" stroke="#2B3139" strokeWidth="3" strokeLinecap="round" />
                  <path
                    d="M 2 18 A 14 14 0 0 1 30 18"
                    fill="none"
                    stroke={leverage <= 10 ? '#0ECB81' : leverage <= 50 ? '#F0B90B' : '#F6465D'}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(leverage / 125) * 44} 44`}
                    className="gauge-arc-animate"
                  />
                </svg>
              </div>
            </div>

            {/* Leverage Slider */}
            <div className="mb-3">
              <Slider
                value={[leverage]}
                onValueChange={([v]) => setLeverage(v)}
                min={1}
                max={125}
                step={1}
                className="w-full [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-secondary [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-success [&_[data-slot=slider-range]]:via-primary [&_[data-slot=slider-range]]:to-destructive [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:border-primary [&_[data-slot=slider-thumb]]:bg-background"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-success">1x</span>
                <span className="text-[10px] text-primary">25x</span>
                <span className="text-[10px] text-destructive">125x</span>
              </div>
            </div>

            {/* Quick Leverage Buttons */}
            <div className="flex gap-1 mb-3">
              {leverageQuickButtons.map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors ${
                    leverage === lev
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>

            {/* Position Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground me-1">{t('trade.positionMode')}:</span>
              {(['cross', 'isolated'] as PositionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPositionMode(mode)}
                  className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                    positionMode === mode
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-secondary text-muted-foreground hover:text-muted-foreground border border-transparent'
                  }`}
                >
                  {mode === 'cross' ? t('trade.cross') : t('trade.isolated')}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Placeholder + Order Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Chart Placeholder */}
            <div className="lg:col-span-2 bg-card rounded-lg overflow-hidden">
              <div className="relative h-64 lg:h-80 flex items-center justify-center bg-gradient-to-br from-success/5 via-card to-destructive/5">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-muted-foreground" style={{ top: `${(i + 1) * 11.11}%` }} />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-muted-foreground" style={{ left: `${(i + 1) * 9.09}%` }} />
                  ))}
                </div>
                {/* Fake chart line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none" dir="ltr">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ECB81" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#0ECB81" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,150 Q50,120 100,100 T200,80 T300,60 T400,40" fill="none" stroke="#0ECB81" strokeWidth="2" />
                  <path d="M0,150 Q50,120 100,100 T200,80 T300,60 T400,40 L400,200 L0,200 Z" fill="url(#chartGrad)" />
                </svg>
                <div className="relative z-10 text-center">
                  <p className="text-sm text-muted-foreground font-medium">{t('trade.futuresChart')}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{selectedContract.symbol} PERP · {leverage}x {t('trade.leverage')}</p>
                </div>
              </div>
            </div>

            {/* Order Panel */}
            <div className="bg-card rounded-lg p-3">
              {/* Long/Short Toggle */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setSide('long')}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    side === 'long'
                      ? 'bg-success text-white shadow-lg shadow-success/20'
                      : 'bg-secondary text-muted-foreground hover:text-muted-foreground'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline me-1" />
                  {t('trade.long')}
                </button>
                <button
                  onClick={() => setSide('short')}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    side === 'short'
                      ? 'bg-destructive text-white shadow-lg shadow-[#F6465D]/20'
                      : 'bg-secondary text-muted-foreground hover:text-muted-foreground'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 inline me-1" />
                  {t('trade.short')}
                </button>
              </div>

              {/* Order Type Tabs */}
              <div className="flex gap-1 mb-3">
                {(['limit', 'market', 'stop'] as FuturesOrderType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`flex-1 py-1.5 rounded text-[11px] font-medium transition-colors ${
                      orderType === type
                        ? 'bg-secondary text-primary'
                        : 'text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    {type === 'limit' ? t('trade.limit') : type === 'market' ? t('trade.market') : t('trade.stop')}
                  </button>
                ))}
              </div>

              {/* Price Input */}
              {orderType !== 'market' && (
                <div className="mb-2">
                  <label className="text-[10px] text-muted-foreground">
                    {orderType === 'stop' ? t('trade.triggerPrice') : t('trade.price')}
                  </label>
                  <div className="flex items-center bg-secondary rounded h-9 px-2 mt-0.5">
                    <button onClick={() => setPrice(formatPrice(Math.max(0, priceNum - (livePrice * 0.001))))} className="text-muted-foreground hover:text-foreground shrink-0">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={formatPrice(livePrice)}
                      className="border-0 bg-transparent text-foreground text-sm h-full p-0 mx-1.5 focus:ring-0 focus:outline-none tabular-nums text-center"
                    />
                    <button onClick={() => setPrice(formatPrice(priceNum + (livePrice * 0.001)))} className="text-muted-foreground hover:text-foreground shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] text-muted-foreground shrink-0 ms-1">USDT</span>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-2">
                <label className="text-[10px] text-muted-foreground">{t('trade.amountContracts')}</label>
                <div className="flex items-center bg-secondary rounded h-9 px-2 mt-0.5">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-0 bg-transparent text-foreground text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-muted-foreground/50"
                  />
                  <span className="text-[10px] text-muted-foreground shrink-0 ms-1">{selectedContract.base}</span>
                </div>
              </div>

              {/* Cost & Margin */}
              {amountNum > 0 && (
                <div className="bg-background rounded p-2.5 space-y-1.5 mb-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{t('trade.cost')}</span>
                    <span className="text-foreground tabular-nums">{formatPrice(cost)} USDT</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{t('trade.position')} ({positionMode === 'cross' ? t('trade.cross') : t('trade.isolated')})</span>
                    <span className="text-primary tabular-nums font-medium">{formatPrice(marginRequirement)} USDT</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-muted-foreground">{t('trade.estLiquidation')}</span>
                    <span className="text-destructive tabular-nums">{formatPrice(liquidationPrice)} USDT</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-destructive/80 pt-1 border-t border-border">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{t('trade.liqAtPrice').replace('{price}', formatPrice(liquidationPrice)).replace('{leverage}', String(leverage))}</span>
                  </div>
                </div>
              )}

              {/* Available Balance */}
              <div className="flex justify-between text-[10px] mb-3">
                <span className="text-muted-foreground">{t('trade.availableBalance')}</span>
                <span className="text-muted-foreground tabular-nums">22,150.30 USDT</span>
              </div>

              {/* Place Order Button */}
              <Button
                className={`w-full font-semibold h-11 text-sm ${
                  side === 'long'
                    ? 'bg-success hover:bg-success/90 text-white'
                    : 'bg-destructive hover:bg-destructive/90 text-white'
                }`}
              >
                {side === 'long' ? (
                  <><TrendingUp className="h-4 w-4 me-1.5" />{t('trade.long')} {selectedContract.base}</>
                ) : (
                  <><TrendingDown className="h-4 w-4 me-1.5" />{t('trade.short')} {selectedContract.base}</>
                )}
              </Button>
            </div>
          </div>

          {/* Positions Panel */}
          <div className="bg-card rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">{t('trade.positions')}</span>
                <Badge className="bg-secondary text-muted-foreground border-0 text-[10px] px-1.5 py-0 h-4">{mockFuturesPositions.length}</Badge>
              </div>
              <span className="text-[10px] text-muted-foreground">{t('trade.totalMargin')}: {formatPrice(mockFuturesPositions.reduce((s, p) => s + p.margin, 0))} USDT</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto touch-pan-x">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-start py-2 px-3 font-medium">{t('trade.symbol')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('trade.side')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.size')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.entry')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.mark')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.liqPrice')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.position')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.pnl')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.roe')}%</th>
                    <th className="text-center py-2 px-3 font-medium">{t('trade.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFuturesPositions.map((pos) => {
                    const currentPnl = pos.side === 'long'
                      ? (livePrices[pos.symbol] || pos.markPrice - pos.entryPrice) * pos.size - pos.entryPrice * pos.size
                      : pos.entryPrice * pos.size - (livePrices[pos.symbol] || pos.markPrice) * pos.size;
                    return (
                      <tr key={pos.id} className="border-b border-border/30 hover:bg-secondary/30">
                        <td className="py-2.5 px-3">
                          <span className="text-foreground font-medium">{pos.symbol}</span>
                          <span className="text-[10px] text-primary ms-1">{pos.leverage}x</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-semibold ${pos.side === 'long' ? 'text-success' : 'text-destructive'}`}>
                            {pos.side === 'long' ? t('trade.long') : t('trade.short')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-end text-foreground tabular-nums">{pos.size}</td>
                        <td className="py-2.5 px-3 text-end text-muted-foreground tabular-nums">{formatPrice(pos.entryPrice)}</td>
                        <td className="py-2.5 px-3 text-end text-foreground tabular-nums">{formatPrice(livePrices[pos.symbol] || pos.markPrice)}</td>
                        <td className="py-2.5 px-3 text-end text-destructive/80 tabular-nums">{formatPrice(pos.liqPrice)}</td>
                        <td className="py-2.5 px-3 text-end text-muted-foreground tabular-nums">{formatPrice(pos.margin)}</td>
                        <td className={`py-2.5 px-3 text-end font-medium tabular-nums ${currentPnl >= 0 ? 'text-success pnl-glow-profit' : 'text-destructive pnl-glow-loss'}`}>
                          {currentPnl >= 0 ? '+' : ''}{formatPrice(currentPnl)}
                        </td>
                        <td className={`py-2.5 px-3 text-end font-medium tabular-nums ${currentPnl >= 0 ? 'text-success pnl-glow-profit' : 'text-destructive pnl-glow-loss'}`}>
                          {currentPnl >= 0 ? '+' : ''}{((currentPnl / pos.margin) * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10">
                            {t('trade.close')}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {mockFuturesPositions.map((pos) => (
                <div key={pos.id} className="p-3 border-b border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{pos.symbol}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        pos.side === 'long' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {pos.side === 'long' ? t('trade.long') : t('trade.short')} {pos.leverage}x
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10">
                      {t('trade.close')}
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">{t('trade.size')}</span>
                      <p className="text-foreground tabular-nums">{pos.size}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('trade.entry')}</span>
                      <p className="text-muted-foreground tabular-nums">{formatPrice(pos.entryPrice)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('trade.mark')}</span>
                      <p className="text-foreground tabular-nums">{formatPrice(livePrices[pos.symbol] || pos.markPrice)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('trade.liqPrice')}</span>
                      <p className="text-destructive/80 tabular-nums">{formatPrice(pos.liqPrice)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('trade.pnl')}</span>
                      <p className={`font-medium tabular-nums ${pos.pnl >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{formatPrice(pos.pnl)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">{t('trade.roe')}%</span>
                      <p className={`font-medium tabular-nums ${pos.roe >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {pos.roe >= 0 ? '+' : ''}{pos.roe.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div className="bg-card rounded-lg">
            <div className="px-3 py-2.5 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground">{t('trade.orderHistory')}</span>
            </div>
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-start py-2 px-3 font-medium">{t('trade.symbol')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('trade.side')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('trade.type')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.price')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.amount')}</th>
                    <th className="text-center py-2 px-3 font-medium">{t('trade.status')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.time')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFuturesOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="py-2 px-3 text-foreground font-medium">{order.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`font-medium ${order.side === 'long' ? 'text-success' : 'text-destructive'}`}>
                          {order.side === 'long' ? t('trade.long') : t('trade.short')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{order.type === 'limit' ? t('trade.limit') : order.type === 'market' ? t('trade.market') : t('trade.stop')}</td>
                      <td className="py-2 px-3 text-end text-foreground tabular-nums">{formatPrice(order.price)}</td>
                      <td className="py-2 px-3 text-end text-muted-foreground tabular-nums">{order.amount}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 font-medium ${
                          order.status === 'pending' ? 'bg-primary/10 text-primary' :
                          order.status === 'filled' ? 'bg-success/10 text-success' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {order.status === 'pending' ? t('wallet.pending') : order.status === 'filled' ? t('trade.filled') : t('trade.cancel')}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-end text-muted-foreground">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-destructive font-medium">{t('trade.futuresRiskTitle')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t('trade.futuresRiskDesc')}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
