'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/stores/app-store';
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
  const { goBack, livePrices, priceDirection } = useAppStore();

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
    <div className="flex flex-col h-full bg-[#0B0E11]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B3139] shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#EAECEF]">Futures Trading</h1>
            <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[9px] px-1.5 py-0 h-4 font-semibold">
              PERP
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#5E6673]">Unrealized PnL</span>
          <span className={`text-sm font-bold tabular-nums ${totalUnrealizedPnl >= 0 ? 'text-[#0ECB81] pnl-glow-profit' : 'text-[#F6465D] pnl-glow-loss'}`}>
            {totalUnrealizedPnl >= 0 ? '+' : ''}{formatPrice(totalUnrealizedPnl)} USDT
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3 max-w-7xl mx-auto">
          {/* Pair Selector + Price Display */}
          <div className="bg-[#1E2329] rounded-lg p-3">
            <div className="flex flex-wrap items-center gap-4">
              {/* Pair dropdown */}
              <div className="relative">
                <button
                  onClick={() => setPairDropdown(!pairDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-[#2B3139] transition-colors"
                >
                  <span className="text-lg font-bold text-[#EAECEF]">{selectedContract.base}</span>
                  <span className="text-sm text-[#5E6673]">/{selectedContract.quote}</span>
                  <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[8px] px-1 py-0 h-3.5 font-semibold ml-1">PERP</Badge>
                  <ChevronDown className={`h-4 w-4 text-[#5E6673] transition-transform ${pairDropdown ? 'rotate-180' : ''}`} />
                </button>
                {pairDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-[#1E2329] border border-[#2B3139] rounded-lg shadow-xl z-50">
                    {perpContracts.map((c) => (
                      <button
                        key={c.symbol}
                        onClick={() => { setSelectedContract(c); setPairDropdown(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-[#2B3139] transition-colors ${
                          c.symbol === selectedContract.symbol ? 'bg-[#2B3139]/50' : ''
                        }`}
                      >
                        <span>
                          <span className="text-[#EAECEF] font-medium">{c.base}</span>
                          <span className="text-[#5E6673]">/{c.quote}</span>
                          <span className="text-[8px] text-[#F0B90B] ml-1">PERP</span>
                        </span>
                        <div className="text-right">
                          <div className="text-[#EAECEF] tabular-nums">{formatPrice(livePrices[c.symbol] || c.markPrice)}</div>
                          <div className={`text-[9px] tabular-nums ${c.fundingRate >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
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
                <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] live-dot" />
                <span className={`text-2xl font-bold tabular-nums ${direction === 'up' ? 'text-[#0ECB81]' : direction === 'down' ? 'text-[#F6465D]' : 'text-[#EAECEF]'}`}>
                  {formatPrice(livePrice)}
                </span>
              </div>

              {/* Price Stats */}
              <div className="flex flex-wrap gap-4 text-[11px]">
                <div>
                  <span className="text-[#5E6673]">Mark </span>
                  <span className="text-[#EAECEF] tabular-nums">{formatPrice(selectedContract.markPrice)}</span>
                </div>
                <div>
                  <span className="text-[#5E6673]">Index </span>
                  <span className="text-[#EAECEF] tabular-nums">{formatPrice(selectedContract.indexPrice)}</span>
                </div>
                <div>
                  <span className="text-[#5E6673]">Funding </span>
                  <span className={`tabular-nums ${selectedContract.fundingRate >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                    {selectedContract.fundingRate >= 0 ? '+' : ''}{selectedContract.fundingRate.toFixed(4)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F0B90B] funding-dot-pulse" />
                  <Clock className="h-3 w-3 text-[#5E6673]" />
                  <span className="text-[#5E6673]">Next </span>
                  <span className="text-[#F0B90B] tabular-nums font-medium">{formatCountdown(countdown)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Leverage + Position Mode */}
          <div className="bg-[#1E2329] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[#848E9C] font-medium">Leverage</span>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold text-[#F0B90B] tabular-nums">{leverage}x</span>
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
                className="w-full [&_[data-slot=slider-track]]:h-2 [&_[data-slot=slider-track]]:bg-[#2B3139] [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-[#0ECB81] [&_[data-slot=slider-range]]:via-[#F0B90B] [&_[data-slot=slider-range]]:to-[#F6465D] [&_[data-slot=slider-thumb]]:h-4 [&_[data-slot=slider-thumb]]:w-4 [&_[data-slot=slider-thumb]]:border-[#F0B90B] [&_[data-slot=slider-thumb]]:bg-[#0B0E11]"
              />
              <div className="flex justify-between mt-1.5">
                <span className="text-[9px] text-[#0ECB81]">1x</span>
                <span className="text-[9px] text-[#F0B90B]">25x</span>
                <span className="text-[9px] text-[#F6465D]">125x</span>
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
                      ? 'bg-[#F0B90B] text-[#0B0E11]'
                      : 'bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {lev}x
                </button>
              ))}
            </div>

            {/* Position Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#5E6673] mr-1">Position Mode:</span>
              {(['cross', 'isolated'] as PositionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPositionMode(mode)}
                  className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                    positionMode === mode
                      ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                      : 'bg-[#2B3139] text-[#5E6673] hover:text-[#848E9C] border border-transparent'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Placeholder + Order Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Chart Placeholder */}
            <div className="lg:col-span-2 bg-[#1E2329] rounded-lg overflow-hidden">
              <div className="relative h-64 lg:h-80 flex items-center justify-center bg-gradient-to-br from-[#0ECB81]/5 via-[#1E2329] to-[#F6465D]/5">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-10">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-[#5E6673]" style={{ top: `${(i + 1) * 11.11}%` }} />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-[#5E6673]" style={{ left: `${(i + 1) * 9.09}%` }} />
                  ))}
                </div>
                {/* Fake chart line */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
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
                  <p className="text-sm text-[#848E9C] font-medium">Futures Chart</p>
                  <p className="text-[10px] text-[#5E6673] mt-1">{selectedContract.symbol} PERP · {leverage}x Leverage</p>
                </div>
              </div>
            </div>

            {/* Order Panel */}
            <div className="bg-[#1E2329] rounded-lg p-3">
              {/* Long/Short Toggle */}
              <div className="flex gap-1 mb-3">
                <button
                  onClick={() => setSide('long')}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    side === 'long'
                      ? 'bg-[#0ECB81] text-white shadow-lg shadow-[#0ECB81]/20'
                      : 'bg-[#2B3139] text-[#5E6673] hover:text-[#848E9C]'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Long
                </button>
                <button
                  onClick={() => setSide('short')}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    side === 'short'
                      ? 'bg-[#F6465D] text-white shadow-lg shadow-[#F6465D]/20'
                      : 'bg-[#2B3139] text-[#5E6673] hover:text-[#848E9C]'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 inline mr-1" />
                  Short
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
                        ? 'bg-[#2B3139] text-[#F0B90B]'
                        : 'text-[#5E6673] hover:text-[#848E9C]'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Price Input */}
              {orderType !== 'market' && (
                <div className="mb-2">
                  <label className="text-[10px] text-[#5E6673]">
                    {orderType === 'stop' ? 'Trigger Price' : 'Price'}
                  </label>
                  <div className="flex items-center bg-[#2B3139] rounded h-9 px-2 mt-0.5">
                    <button onClick={() => setPrice(formatPrice(Math.max(0, priceNum - (livePrice * 0.001))))} className="text-[#5E6673] hover:text-[#EAECEF] shrink-0">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={formatPrice(livePrice)}
                      className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 mx-1.5 focus:ring-0 focus:outline-none tabular-nums text-center"
                    />
                    <button onClick={() => setPrice(formatPrice(priceNum + (livePrice * 0.001)))} className="text-[#5E6673] hover:text-[#EAECEF] shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">USDT</span>
                  </div>
                </div>
              )}

              {/* Amount Input */}
              <div className="mb-2">
                <label className="text-[10px] text-[#5E6673]">Amount (Contracts)</label>
                <div className="flex items-center bg-[#2B3139] rounded h-9 px-2 mt-0.5">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-[#3B4451]"
                  />
                  <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">{selectedContract.base}</span>
                </div>
              </div>

              {/* Cost & Margin */}
              {amountNum > 0 && (
                <div className="bg-[#0B0E11] rounded p-2.5 space-y-1.5 mb-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#5E6673]">Cost</span>
                    <span className="text-[#EAECEF] tabular-nums">{formatPrice(cost)} USDT</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#5E6673]">Margin ({positionMode})</span>
                    <span className="text-[#F0B90B] tabular-nums font-medium">{formatPrice(marginRequirement)} USDT</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#5E6673]">Est. Liquidation</span>
                    <span className="text-[#F6465D] tabular-nums">{formatPrice(liquidationPrice)} USDT</span>
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-[#F6465D]/80 pt-1 border-t border-[#2B3139]">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Liquidation at ~{formatPrice(liquidationPrice)} with {leverage}x leverage</span>
                  </div>
                </div>
              )}

              {/* Available Balance */}
              <div className="flex justify-between text-[10px] mb-3">
                <span className="text-[#5E6673]">Available Balance</span>
                <span className="text-[#848E9C] tabular-nums">22,150.30 USDT</span>
              </div>

              {/* Place Order Button */}
              <Button
                className={`w-full font-semibold h-11 text-sm ${
                  side === 'long'
                    ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white'
                    : 'bg-[#F6465D] hover:bg-[#F6465D]/90 text-white'
                }`}
              >
                {side === 'long' ? (
                  <><TrendingUp className="h-4 w-4 mr-1.5" />Long {selectedContract.base}</>
                ) : (
                  <><TrendingDown className="h-4 w-4 mr-1.5" />Short {selectedContract.base}</>
                )}
              </Button>
            </div>
          </div>

          {/* Positions Panel */}
          <div className="bg-[#1E2329] rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#848E9C]">Positions</span>
                <Badge className="bg-[#2B3139] text-[#848E9C] border-0 text-[9px] px-1.5 py-0 h-4">{mockFuturesPositions.length}</Badge>
              </div>
              <span className="text-[10px] text-[#5E6673]">Total Margin: {formatPrice(mockFuturesPositions.reduce((s, p) => s + p.margin, 0))} USDT</span>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#5E6673] border-b border-[#2B3139]/50">
                    <th className="text-left py-2 px-3 font-medium">Symbol</th>
                    <th className="text-left py-2 px-3 font-medium">Side</th>
                    <th className="text-right py-2 px-3 font-medium">Size</th>
                    <th className="text-right py-2 px-3 font-medium">Entry</th>
                    <th className="text-right py-2 px-3 font-medium">Mark</th>
                    <th className="text-right py-2 px-3 font-medium">Liq. Price</th>
                    <th className="text-right py-2 px-3 font-medium">Margin</th>
                    <th className="text-right py-2 px-3 font-medium">PnL</th>
                    <th className="text-right py-2 px-3 font-medium">ROE%</th>
                    <th className="text-center py-2 px-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFuturesPositions.map((pos) => {
                    const currentPnl = pos.side === 'long'
                      ? (livePrices[pos.symbol] || pos.markPrice - pos.entryPrice) * pos.size - pos.entryPrice * pos.size
                      : pos.entryPrice * pos.size - (livePrices[pos.symbol] || pos.markPrice) * pos.size;
                    return (
                      <tr key={pos.id} className="border-b border-[#2B3139]/30 hover:bg-[#2B3139]/30">
                        <td className="py-2.5 px-3">
                          <span className="text-[#EAECEF] font-medium">{pos.symbol}</span>
                          <span className="text-[8px] text-[#F0B90B] ml-1">{pos.leverage}x</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-semibold ${pos.side === 'long' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                            {pos.side === 'long' ? 'Long' : 'Short'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#EAECEF] tabular-nums">{pos.size}</td>
                        <td className="py-2.5 px-3 text-right text-[#848E9C] tabular-nums">{formatPrice(pos.entryPrice)}</td>
                        <td className="py-2.5 px-3 text-right text-[#EAECEF] tabular-nums">{formatPrice(livePrices[pos.symbol] || pos.markPrice)}</td>
                        <td className="py-2.5 px-3 text-right text-[#F6465D]/80 tabular-nums">{formatPrice(pos.liqPrice)}</td>
                        <td className="py-2.5 px-3 text-right text-[#848E9C] tabular-nums">{formatPrice(pos.margin)}</td>
                        <td className={`py-2.5 px-3 text-right font-medium tabular-nums ${currentPnl >= 0 ? 'text-[#0ECB81] pnl-glow-profit' : 'text-[#F6465D] pnl-glow-loss'}`}>
                          {currentPnl >= 0 ? '+' : ''}{formatPrice(currentPnl)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-medium tabular-nums ${currentPnl >= 0 ? 'text-[#0ECB81] pnl-glow-profit' : 'text-[#F6465D] pnl-glow-loss'}`}>
                          {currentPnl >= 0 ? '+' : ''}{((currentPnl / pos.margin) * 100).toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#F6465D] hover:text-[#F6465D] hover:bg-[#F6465D]/10">
                            Close
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
                <div key={pos.id} className="p-3 border-b border-[#2B3139]/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#EAECEF]">{pos.symbol}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        pos.side === 'long' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                      }`}>
                        {pos.side === 'long' ? 'Long' : 'Short'} {pos.leverage}x
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#F6465D] hover:text-[#F6465D] hover:bg-[#F6465D]/10">
                      Close
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div>
                      <span className="text-[#5E6673]">Size</span>
                      <p className="text-[#EAECEF] tabular-nums">{pos.size}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">Entry</span>
                      <p className="text-[#848E9C] tabular-nums">{formatPrice(pos.entryPrice)}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">Mark</span>
                      <p className="text-[#EAECEF] tabular-nums">{formatPrice(livePrices[pos.symbol] || pos.markPrice)}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">Liq. Price</span>
                      <p className="text-[#F6465D]/80 tabular-nums">{formatPrice(pos.liqPrice)}</p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">PnL</span>
                      <p className={`font-medium tabular-nums ${pos.pnl >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {pos.pnl >= 0 ? '+' : ''}{formatPrice(pos.pnl)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#5E6673]">ROE%</span>
                      <p className={`font-medium tabular-nums ${pos.roe >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                        {pos.roe >= 0 ? '+' : ''}{pos.roe.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order History */}
          <div className="bg-[#1E2329] rounded-lg">
            <div className="px-3 py-2.5 border-b border-[#2B3139]">
              <span className="text-xs font-semibold text-[#848E9C]">Order History</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#5E6673] border-b border-[#2B3139]/50">
                    <th className="text-left py-2 px-3 font-medium">Symbol</th>
                    <th className="text-left py-2 px-3 font-medium">Side</th>
                    <th className="text-left py-2 px-3 font-medium">Type</th>
                    <th className="text-right py-2 px-3 font-medium">Price</th>
                    <th className="text-right py-2 px-3 font-medium">Amount</th>
                    <th className="text-center py-2 px-3 font-medium">Status</th>
                    <th className="text-right py-2 px-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockFuturesOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[#2B3139]/30 hover:bg-[#2B3139]/30">
                      <td className="py-2 px-3 text-[#EAECEF] font-medium">{order.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`font-medium ${order.side === 'long' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                          {order.side === 'long' ? 'Long' : 'Short'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[#848E9C] capitalize">{order.type}</td>
                      <td className="py-2 px-3 text-right text-[#EAECEF] tabular-nums">{formatPrice(order.price)}</td>
                      <td className="py-2 px-3 text-right text-[#848E9C] tabular-nums">{order.amount}</td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                          order.status === 'pending' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' :
                          order.status === 'filled' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                          'bg-[#F6465D]/10 text-[#F6465D]'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right text-[#5E6673]">{order.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-[#F6465D]/5 border border-[#F6465D]/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#F6465D] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-[#F6465D] font-medium">Futures Trading Risk Warning</p>
              <p className="text-[10px] text-[#848E9C] mt-0.5">
                Futures trading involves high leverage and significant risk of loss. You may lose all of your invested capital. 
                Please ensure you fully understand the risks involved before trading.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
