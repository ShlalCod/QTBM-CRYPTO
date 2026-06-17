'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { formatPrice, formatNumber } from '@/lib/mock-data';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  AlertTriangle,
  Shield,
  DollarSign,
  ArrowRightLeft,
  CircleDollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

type MarginSide = 'buy' | 'sell';
type MarginType = 'limit' | 'market';
type MarginMode = 'cross' | 'isolated';

const marginAssets = [
  { asset: 'BTC', name: 'Bitcoin', icon: '₿', price: 67432, available: 0.9876, borrowed: 0.5, interest: 0.00125, interestRate: 0.000375 },
  { asset: 'ETH', name: 'Ethereum', icon: 'Ξ', price: 3521, available: 12.345, borrowed: 5, interest: 0.015, interestRate: 0.0003 },
  { asset: 'BNB', name: 'BNB', icon: '◆', price: 598, available: 40, borrowed: 10, interest: 0.03, interestRate: 0.0003 },
  { asset: 'SOL', name: 'Solana', icon: '◎', price: 178, available: 100, borrowed: 0, interest: 0, interestRate: 0.00045 },
  { asset: 'USDT', name: 'Tether', icon: '₮', price: 1, available: 22150, borrowed: 5000, interest: 1.5, interestRate: 0.0003 },
];

const mockMarginPositions = [
  { id: '1', asset: 'BTC', side: 'long' as const, size: 0.5, entryPrice: 65800, currentPrice: 67432, leverage: 3, margin: 10967, pnl: 816, roe: 7.44, liqPrice: 43867, mode: 'cross' as const },
  { id: '2', asset: 'ETH', side: 'short' as const, size: 5, entryPrice: 3600, currentPrice: 3521, leverage: 5, margin: 3600, pnl: 395, roe: 10.97, liqPrice: 4320, mode: 'isolated' as const },
];

const mockBorrowHistory = [
  { id: '1', asset: 'USDT', amount: 5000, action: 'borrow', interestRate: 0.0003, date: '2024-01-12 14:30' },
  { id: '2', asset: 'BTC', amount: 0.5, action: 'borrow', interestRate: 0.000375, date: '2024-01-10 09:15' },
  { id: '3', asset: 'USDT', amount: 2000, action: 'repay', interestRate: 0, date: '2024-01-08 16:45' },
  { id: '4', asset: 'ETH', amount: 5, action: 'borrow', interestRate: 0.0003, date: '2024-01-05 11:20' },
];

export default function MarginView() {
  const { goBack, livePrices } = useAppStore();

  const [selectedAsset, setSelectedAsset] = useState(marginAssets[0]);
  const [activeTab, setActiveTab] = useState<'trade' | 'borrow' | 'repay'>('trade');
  const [side, setSide] = useState<MarginSide>('buy');
  const [orderType, setOrderType] = useState<MarginType>('limit');
  const [marginMode, setMarginMode] = useState<MarginMode>('cross');
  const [marginLeverage, setMarginLeverage] = useState(3);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [tradePrice, setTradePrice] = useState('');
  const [tradeAmount, setTradeAmount] = useState('');

  const currentPrice = livePrices[`${selectedAsset.asset}USDT`] || selectedAsset.price;
  const priceNum = parseFloat(tradePrice) || currentPrice;
  const amountNum = parseFloat(tradeAmount) || 0;
  const totalCost = priceNum * amountNum;
  const marginRequired = totalCost / marginLeverage;

  // Risk level calculation (mock)
  const totalEquity = 125000;
  const totalBorrowed = 35000;
  const riskRatio = totalBorrowed / totalEquity;
  const riskLevel = riskRatio < 0.3 ? 'safe' : riskRatio < 0.6 ? 'moderate' : 'danger';
  const riskPercent = Math.min(riskRatio * 100, 100);

  const totalInterest = marginAssets.reduce((sum, a) => sum + a.interest, 0);
  const totalBorrowedUSD = marginAssets.reduce((sum, a) => sum + a.borrowed * a.price, 0);

  return (
    <div className="flex flex-col h-full bg-[#0B0E11]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B3139] shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]" onClick={goBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-[#EAECEF]">Margin Trading</h1>
            <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[9px] px-1.5 py-0 h-4 font-semibold">
              3x-5x
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-[#5E6673]" />
          <span className="text-[10px] text-[#5E6673]">Risk: </span>
          <span className={`text-[10px] font-semibold risk-meter-animate ${
            riskLevel === 'safe' ? 'text-[#0ECB81] glow-pulse-green' : riskLevel === 'moderate' ? 'text-[#F0B90B] glow-pulse-yellow' : 'text-[#F6465D] glow-pulse-red'
          }`}>
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3 max-w-4xl mx-auto">
          {/* Margin Account Summary */}
          <div className="bg-[#1E2329] rounded-lg p-4">
            <h2 className="text-xs font-semibold text-[#848E9C] mb-3 flex items-center gap-1.5">
              <CircleDollarSign className="h-3.5 w-3.5" />
              Margin Account Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-[#5E6673]">Total Equity</span>
                <p className="text-base font-bold text-[#EAECEF] tabular-nums mt-0.5">{formatPrice(totalEquity)}</p>
                <p className="text-[9px] text-[#5E6673]">USD</p>
              </div>
              <div>
                <span className="text-[10px] text-[#5E6673]">Total Borrowed</span>
                <p className="text-base font-bold text-[#F6465D] tabular-nums mt-0.5">{formatPrice(totalBorrowedUSD)}</p>
                <p className="text-[9px] text-[#5E6673]">USD</p>
              </div>
              <div>
                <span className="text-[10px] text-[#5E6673]">Total Interest</span>
                <p className="text-base font-bold text-[#F0B90B] tabular-nums mt-0.5">{totalInterest.toFixed(4)}</p>
                <p className="text-[9px] text-[#5E6673]">Accrued</p>
              </div>
              <div>
                <span className="text-[10px] text-[#5E6673]">Margin Level</span>
                <p className="text-base font-bold text-[#0ECB81] tabular-nums mt-0.5">{(totalEquity / totalBorrowedUSD * 100).toFixed(0)}%</p>
                <p className="text-[9px] text-[#5E6673]">Health</p>
              </div>
            </div>

            {/* Risk Level Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[9px] text-[#5E6673] mb-1">
                <span>Risk Level</span>
                <span className={`font-semibold ${riskLevel === 'safe' ? 'text-[#0ECB81]' : riskLevel === 'moderate' ? 'text-[#F0B90B]' : 'text-[#F6465D]'}`}>
                  {riskPercent.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-[#2B3139] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 risk-meter-animate ${
                    riskLevel === 'safe' ? 'bg-gradient-to-r from-[#0ECB81] to-[#0ECB81]/80' : riskLevel === 'moderate' ? 'bg-gradient-to-r from-[#0ECB81] via-[#F0B90B] to-[#F0B90B]/80' : 'bg-gradient-to-r from-[#F0B90B] via-[#F6465D] to-[#F6465D]/80'
                  }`}
                  style={{ width: `${riskPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[8px] text-[#5E6673]">
                <span>Safe</span>
                <span>Moderate</span>
                <span>Danger</span>
              </div>
            </div>

            {riskLevel === 'danger' && (
              <div className="mt-3 bg-[#F6465D]/5 border border-[#F6465D]/20 rounded p-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-[#F6465D] shrink-0" />
                <span className="text-[10px] text-[#F6465D]">Warning: Your margin level is dangerously low. Consider repaying loans or adding collateral.</span>
              </div>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1 bg-[#1E2329] rounded-lg p-1">
            {(['trade', 'borrow', 'repay'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all duration-200 tab-spring-transition touch-feedback ${
                  activeTab === tab
                    ? 'bg-[#2B3139] text-[#F0B90B] wallet-tab-pop'
                    : 'text-[#5E6673] hover:text-[#848E9C]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Trade Tab */}
          {activeTab === 'trade' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Asset Selector */}
              <div className="bg-[#1E2329] rounded-lg p-3">
                <label className="text-[10px] text-[#5E6673] mb-1.5 block">Select Asset</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {marginAssets.map((a) => (
                    <button
                      key={a.asset}
                      onClick={() => setSelectedAsset(a)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors ${
                        selectedAsset.asset === a.asset ? 'bg-[#2B3139] text-[#EAECEF]' : 'text-[#848E9C] hover:bg-[#2B3139]/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{a.icon}</span>
                        <span className="font-medium">{a.asset}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#848E9C] tabular-nums">{a.available.toFixed(4)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Panel */}
              <div className="bg-[#1E2329] rounded-lg p-3">
                {/* Buy/Sell Toggle */}
                <div className="flex gap-1 mb-3">
                  <button
                    onClick={() => setSide('buy')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                      side === 'buy'
                        ? 'bg-[#0ECB81] text-white shadow-lg shadow-[#0ECB81]/20'
                        : 'bg-[#2B3139] text-[#5E6673] hover:text-[#848E9C]'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    Buy / Long
                  </button>
                  <button
                    onClick={() => setSide('sell')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                      side === 'sell'
                        ? 'bg-[#F6465D] text-white shadow-lg shadow-[#F6465D]/20'
                        : 'bg-[#2B3139] text-[#5E6673] hover:text-[#848E9C]'
                    }`}
                  >
                    <TrendingDown className="h-4 w-4 inline mr-1" />
                    Sell / Short
                  </button>
                </div>

                {/* Margin Mode + Leverage */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1 flex-1">
                    {(['cross', 'isolated'] as MarginMode[]).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setMarginMode(mode)}
                        className={`flex-1 py-1.5 rounded text-[10px] font-medium transition-colors ${
                          marginMode === mode
                            ? 'bg-[#F0B90B]/15 text-[#F0B90B] border border-[#F0B90B]/30'
                            : 'bg-[#2B3139] text-[#5E6673] border border-transparent'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {[3, 5].map((lev) => (
                      <button
                        key={lev}
                        onClick={() => setMarginLeverage(lev)}
                        className={`px-3 py-1.5 rounded text-[10px] font-medium transition-colors ${
                          marginLeverage === lev
                            ? 'bg-[#F0B90B] text-[#0B0E11]'
                            : 'bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Order Type */}
                <div className="flex gap-1 mb-2">
                  {(['limit', 'market'] as MarginType[]).map((type) => (
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

                {/* Price */}
                {orderType === 'limit' && (
                  <div className="mb-2">
                    <label className="text-[10px] text-[#5E6673]">Price</label>
                    <div className="flex items-center bg-[#2B3139] rounded h-8 px-2 mt-0.5">
                      <button onClick={() => setTradePrice(formatPrice(Math.max(0, priceNum - (currentPrice * 0.001))))} className="text-[#5E6673] hover:text-[#EAECEF] shrink-0">
                        <Minus className="h-3 w-3" />
                      </button>
                      <Input
                        type="number"
                        value={tradePrice}
                        onChange={(e) => setTradePrice(e.target.value)}
                        placeholder={formatPrice(currentPrice)}
                        className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 mx-1.5 focus:ring-0 focus:outline-none tabular-nums text-center"
                      />
                      <button onClick={() => setTradePrice(formatPrice(priceNum + (currentPrice * 0.001)))} className="text-[#5E6673] hover:text-[#EAECEF] shrink-0">
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">USDT</span>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="mb-2">
                  <label className="text-[10px] text-[#5E6673]">Amount</label>
                  <div className="flex items-center bg-[#2B3139] rounded h-8 px-2 mt-0.5">
                    <Input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.00"
                      className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-[#3B4451]"
                    />
                    <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">{selectedAsset.asset}</span>
                  </div>
                </div>

                {/* Margin Summary */}
                {amountNum > 0 && (
                  <div className="bg-[#0B0E11] rounded p-2 space-y-1 mb-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#5E6673]">Total</span>
                      <span className="text-[#EAECEF] tabular-nums">{formatPrice(totalCost)} USDT</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#5E6673]">Margin Required</span>
                      <span className="text-[#F0B90B] tabular-nums font-medium">{formatPrice(marginRequired)} USDT</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#5E6673]">Leverage</span>
                      <span className="text-[#EAECEF] tabular-nums">{marginLeverage}x</span>
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full font-semibold h-10 text-sm ${
                    side === 'buy'
                      ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white'
                      : 'bg-[#F6465D] hover:bg-[#F6465D]/90 text-white'
                  }`}
                >
                  {side === 'buy' ? 'Buy / Long' : 'Sell / Short'} {selectedAsset.asset}
                </Button>
              </div>
            </div>
          )}

          {/* Borrow Tab */}
          {activeTab === 'borrow' && (
            <div className="bg-[#1E2329] rounded-lg p-4 max-w-lg">
              <h3 className="text-sm font-semibold text-[#EAECEF] mb-3 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-[#F0B90B]" />
                Borrow Asset
              </h3>

              {/* Asset Select */}
              <div className="mb-3">
                <label className="text-[10px] text-[#5E6673]">Asset</label>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {marginAssets.map((a) => (
                    <button
                      key={a.asset}
                      onClick={() => setSelectedAsset(a)}
                      className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                        selectedAsset.asset === a.asset
                          ? 'bg-[#F0B90B] text-[#0B0E11]'
                          : 'bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      {a.icon} {a.asset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Borrow Amount */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#5E6673]">Borrow Amount</span>
                  <span className="text-[#848E9C]">Available: {selectedAsset.available.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex items-center bg-[#2B3139] rounded h-9 px-2">
                  <Input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-[#3B4451]"
                  />
                  <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">{selectedAsset.asset}</span>
                </div>
              </div>

              {/* Interest Info */}
              <div className="bg-[#0B0E11] rounded p-2.5 space-y-1.5 mb-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#5E6673]">Daily Interest Rate</span>
                  <span className="text-[#F0B90B] tabular-nums">{(selectedAsset.interestRate * 100).toFixed(4)}%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#5E6673]">Hourly Interest</span>
                  <span className="text-[#848E9C] tabular-nums">{(parseFloat(borrowAmount) * selectedAsset.interestRate / 24).toFixed(6)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#5E6673]">Outstanding Debt</span>
                  <span className="text-[#F6465D] tabular-nums">{selectedAsset.borrowed.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#5E6673]">Accrued Interest</span>
                  <span className="text-[#F0B90B] tabular-nums">{selectedAsset.interest.toFixed(6)} {selectedAsset.asset}</span>
                </div>
              </div>

              <Button className="w-full bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-semibold h-10 text-sm">
                Borrow {selectedAsset.asset}
              </Button>
            </div>
          )}

          {/* Repay Tab */}
          {activeTab === 'repay' && (
            <div className="bg-[#1E2329] rounded-lg p-4 max-w-lg">
              <h3 className="text-sm font-semibold text-[#EAECEF] mb-3 flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-[#0ECB81]" />
                Repay Loan
              </h3>

              {/* Asset Select */}
              <div className="mb-3">
                <label className="text-[10px] text-[#5E6673]">Asset</label>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {marginAssets.filter(a => a.borrowed > 0).map((a) => (
                    <button
                      key={a.asset}
                      onClick={() => setSelectedAsset(a)}
                      className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                        selectedAsset.asset === a.asset
                          ? 'bg-[#0ECB81] text-[#0B0E11]'
                          : 'bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
                      }`}
                    >
                      {a.icon} {a.asset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Repay Amount */}
              <div className="mb-3">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-[#5E6673]">Repay Amount</span>
                  <span className="text-[#848E9C]">Debt: {selectedAsset.borrowed.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex items-center bg-[#2B3139] rounded h-9 px-2">
                  <Input
                    type="number"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-[#3B4451]"
                  />
                  <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">{selectedAsset.asset}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[9px] text-[#F0B90B] hover:text-[#F0B90B] hover:bg-[#F0B90B]/10 ml-1"
                    onClick={() => setRepayAmount((selectedAsset.borrowed + selectedAsset.interest).toFixed(6))}
                  >
                    MAX
                  </Button>
                </div>
              </div>

              {/* Repay Summary */}
              <div className="bg-[#0B0E11] rounded p-2.5 space-y-1.5 mb-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#5E6673]">Outstanding Principal</span>
                  <span className="text-[#F6465D] tabular-nums">{selectedAsset.borrowed.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#5E6673]">Interest to Repay</span>
                  <span className="text-[#F0B90B] tabular-nums">{selectedAsset.interest.toFixed(6)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#5E6673]">Total to Repay</span>
                  <span className="text-[#EAECEF] tabular-nums font-medium">{(selectedAsset.borrowed + selectedAsset.interest).toFixed(4)} {selectedAsset.asset}</span>
                </div>
              </div>

              <Button className="w-full bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white font-semibold h-10 text-sm">
                Repay {selectedAsset.asset}
              </Button>
            </div>
          )}

          {/* Open Margin Positions */}
          <div className="bg-[#1E2329] rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2B3139]">
              <span className="text-xs font-semibold text-[#848E9C]">Margin Positions</span>
              <Badge className="bg-[#2B3139] text-[#848E9C] border-0 text-[9px] px-1.5 py-0 h-4">{mockMarginPositions.length}</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#5E6673] border-b border-[#2B3139]/50">
                    <th className="text-left py-2 px-3 font-medium">Asset</th>
                    <th className="text-left py-2 px-3 font-medium">Side</th>
                    <th className="text-right py-2 px-3 font-medium">Size</th>
                    <th className="text-right py-2 px-3 font-medium">Entry</th>
                    <th className="text-right py-2 px-3 font-medium">Current</th>
                    <th className="text-right py-2 px-3 font-medium">Margin</th>
                    <th className="text-right py-2 px-3 font-medium">PnL</th>
                    <th className="text-right py-2 px-3 font-medium">ROE%</th>
                    <th className="text-left py-2 px-3 font-medium">Mode</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMarginPositions.map((pos) => {
                    const liveP = livePrices[`${pos.asset}USDT`] || pos.currentPrice;
                    const posPnl = pos.side === 'long'
                      ? (liveP - pos.entryPrice) * pos.size
                      : (pos.entryPrice - liveP) * pos.size;
                    return (
                      <tr key={pos.id} className="border-b border-[#2B3139]/30 hover:bg-[#2B3139]/30">
                        <td className="py-2.5 px-3">
                          <span className="text-[#EAECEF] font-medium">{pos.asset}</span>
                          <span className="text-[8px] text-[#F0B90B] ml-1">{pos.leverage}x</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-semibold ${pos.side === 'long' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                            {pos.side === 'long' ? 'Long' : 'Short'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#EAECEF] tabular-nums">{pos.size}</td>
                        <td className="py-2.5 px-3 text-right text-[#848E9C] tabular-nums">{formatPrice(pos.entryPrice)}</td>
                        <td className="py-2.5 px-3 text-right text-[#EAECEF] tabular-nums">{formatPrice(liveP)}</td>
                        <td className="py-2.5 px-3 text-right text-[#848E9C] tabular-nums">{formatPrice(pos.margin)}</td>
                        <td className={`py-2.5 px-3 text-right font-medium tabular-nums ${posPnl >= 0 ? 'text-[#0ECB81] pnl-glow-profit' : 'text-[#F6465D] pnl-glow-loss'}`}>
                          {posPnl >= 0 ? '+' : ''}{formatPrice(posPnl)}
                        </td>
                        <td className={`py-2.5 px-3 text-right font-medium tabular-nums ${pos.roe >= 0 ? 'text-[#0ECB81] pnl-glow-profit' : 'text-[#F6465D] pnl-glow-loss'}`}>
                          {pos.roe >= 0 ? '+' : ''}{pos.roe.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge className={`text-[8px] px-1.5 py-0 h-3.5 border-0 font-medium ${
                            pos.mode === 'cross' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' : 'bg-[#848E9C]/10 text-[#848E9C]'
                          }`}>
                            {pos.mode.charAt(0).toUpperCase() + pos.mode.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Borrow History */}
          <div className="bg-[#1E2329] rounded-lg">
            <div className="px-3 py-2.5 border-b border-[#2B3139]">
              <span className="text-xs font-semibold text-[#848E9C]">Borrow & Repay History</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-[#5E6673] border-b border-[#2B3139]/50">
                    <th className="text-left py-2 px-3 font-medium">Asset</th>
                    <th className="text-left py-2 px-3 font-medium">Action</th>
                    <th className="text-right py-2 px-3 font-medium">Amount</th>
                    <th className="text-right py-2 px-3 font-medium">Interest Rate</th>
                    <th className="text-right py-2 px-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBorrowHistory.map((record) => (
                    <tr key={record.id} className="border-b border-[#2B3139]/30 hover:bg-[#2B3139]/30">
                      <td className="py-2 px-3 text-[#EAECEF] font-medium">{record.asset}</td>
                      <td className="py-2 px-3">
                        <Badge className={`text-[9px] px-1.5 py-0 h-4 border-0 font-medium ${
                          record.action === 'borrow' ? 'bg-[#F6465D]/10 text-[#F6465D]' : 'bg-[#0ECB81]/10 text-[#0ECB81]'
                        }`}>
                          {record.action.charAt(0).toUpperCase() + record.action.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-right text-[#EAECEF] tabular-nums">{record.amount}</td>
                      <td className="py-2 px-3 text-right text-[#848E9C] tabular-nums">{(record.interestRate * 100).toFixed(4)}%</td>
                      <td className="py-2 px-3 text-right text-[#5E6673]">{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-[#F0B90B]/5 border border-[#F0B90B]/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-[#F0B90B] shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-[#F0B90B] font-medium">Margin Trading Notice</p>
              <p className="text-[10px] text-[#848E9C] mt-0.5">
                Margin trading amplifies both gains and losses. Interest accrues hourly on borrowed assets.
                Monitor your margin level closely to avoid liquidation.
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
