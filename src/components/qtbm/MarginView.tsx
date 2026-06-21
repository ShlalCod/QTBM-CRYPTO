'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
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
  const { goBack, livePrices, isRTL } = useAppStore();
  const { t } = useTranslation();

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
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label={t('actions.back')} className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={goBack}>
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-foreground">{t('trade.marginTradingTitle')}</h1>
            <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
              3x-5x
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">{t('trade.risk')}: </span>
          <span className={`text-[10px] font-semibold risk-meter-animate ${
            riskLevel === 'safe' ? 'text-success glow-pulse-green' : riskLevel === 'moderate' ? 'text-primary glow-pulse-yellow' : 'text-destructive glow-pulse-red'
          }`}>
            {riskLevel === 'safe' ? t('trade.safe') : riskLevel === 'moderate' ? t('trade.moderate') : t('trade.danger')}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3 max-w-4xl mx-auto">
          {/* Margin Account Summary */}
          <div className="bg-card rounded-lg p-4">
            <h2 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <CircleDollarSign className="h-3.5 w-3.5" />
              {t('trade.accountSummary')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-muted-foreground">{t('trade.totalEquity')}</span>
                <p className="text-base font-bold text-foreground tabular-nums mt-0.5">{formatPrice(totalEquity)}</p>
                <p className="text-[10px] text-muted-foreground">USD</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">{t('trade.totalBorrowed')}</span>
                <p className="text-base font-bold text-destructive tabular-nums mt-0.5">{formatPrice(totalBorrowedUSD)}</p>
                <p className="text-[10px] text-muted-foreground">USD</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">{t('trade.totalInterest')}</span>
                <p className="text-base font-bold text-primary tabular-nums mt-0.5">{totalInterest.toFixed(4)}</p>
                <p className="text-[10px] text-muted-foreground">{t('trade.accrued')}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">{t('trade.marginLevel')}</span>
                <p className="text-base font-bold text-success tabular-nums mt-0.5">{(totalEquity / totalBorrowedUSD * 100).toFixed(0)}%</p>
                <p className="text-[10px] text-muted-foreground">{t('trade.health')}</p>
              </div>
            </div>

            {/* Risk Level Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>{t('trade.riskLevel')}</span>
                <span className={`font-semibold ${riskLevel === 'safe' ? 'text-success' : riskLevel === 'moderate' ? 'text-primary' : 'text-destructive'}`}>
                  {riskPercent.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 risk-meter-animate ${
                    riskLevel === 'safe' ? 'bg-gradient-to-r from-success to-success/80' : riskLevel === 'moderate' ? 'bg-gradient-to-r from-success via-primary to-primary/80' : 'bg-gradient-to-r from-primary via-destructive to-destructive/80'
                  }`}
                  style={{ width: `${riskPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                <span>{t('trade.safe')}</span>
                <span>{t('trade.moderate')}</span>
                <span>{t('trade.danger')}</span>
              </div>
            </div>

            {riskLevel === 'danger' && (
              <div className="mt-3 bg-destructive/10 border border-destructive/20 rounded p-2 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                <span className="text-[10px] text-destructive">{t('trade.marginWarning')}</span>
              </div>
            )}
          </div>

          {/* Tab Selector */}
          <div className="flex gap-1 bg-card rounded-lg p-1">
            {(['trade', 'borrow', 'repay'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-md text-xs font-medium transition-all duration-200 tab-spring-transition touch-feedback ${
                  activeTab === tab
                    ? 'bg-secondary text-primary wallet-tab-pop'
                    : 'text-muted-foreground hover:text-muted-foreground'
                }`}
              >
                {tab === 'trade' ? t('trade.title') : tab === 'borrow' ? t('trade.borrow') : t('trade.repay')}
              </button>
            ))}
          </div>

          {/* Trade Tab */}
          {activeTab === 'trade' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Asset Selector */}
              <div className="bg-card rounded-lg p-3">
                <label className="text-[10px] text-muted-foreground mb-1.5 block">{t('trade.selectAsset')}</label>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {marginAssets.map((a) => (
                    <button
                      key={a.asset}
                      onClick={() => setSelectedAsset(a)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors ${
                        selectedAsset.asset === a.asset ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{a.icon}</span>
                        <span className="font-medium">{a.asset}</span>
                      </div>
                      <div className="text-end">
                        <span className="text-muted-foreground tabular-nums">{a.available.toFixed(4)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Panel */}
              <div className="bg-card rounded-lg p-3">
                {/* Buy/Sell Toggle */}
                <div className="flex gap-1 mb-3">
                  <button
                    onClick={() => setSide('buy')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                      side === 'buy'
                        ? 'bg-success text-white shadow-lg shadow-success/20'
                        : 'bg-secondary text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 inline me-1" />
                    {t('trade.buyLong')}
                  </button>
                  <button
                    onClick={() => setSide('sell')}
                    className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                      side === 'sell'
                        ? 'bg-destructive text-white shadow-lg shadow-[#F6465D]/20'
                        : 'bg-secondary text-muted-foreground hover:text-muted-foreground'
                    }`}
                  >
                    <TrendingDown className="h-4 w-4 inline me-1" />
                    {t('trade.sellShort')}
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
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-secondary text-muted-foreground border border-transparent'
                        }`}
                      >
                        {mode === 'cross' ? t('trade.cross') : t('trade.isolated')}
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
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
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
                          ? 'bg-secondary text-primary'
                          : 'text-muted-foreground hover:text-muted-foreground'
                      }`}
                    >
                      {type === 'limit' ? t('trade.limit') : type === 'market' ? t('trade.market') : t('trade.stop')}
                    </button>
                  ))}
                </div>

                {/* Price */}
                {orderType === 'limit' && (
                  <div className="mb-2">
                    <label className="text-[10px] text-muted-foreground">{t('trade.price')}</label>
                    <div className="flex items-center bg-secondary rounded h-8 px-2 mt-0.5">
                      <button onClick={() => setTradePrice(formatPrice(Math.max(0, priceNum - (currentPrice * 0.001))))} className="text-muted-foreground hover:text-foreground shrink-0">
                        <Minus className="h-3 w-3" />
                      </button>
                      <Input
                        type="number"
                        value={tradePrice}
                        onChange={(e) => setTradePrice(e.target.value)}
                        placeholder={formatPrice(currentPrice)}
                        className="border-0 bg-transparent text-foreground text-sm h-full p-0 mx-1.5 focus:ring-0 focus:outline-none tabular-nums text-center"
                      />
                      <button onClick={() => setTradePrice(formatPrice(priceNum + (currentPrice * 0.001)))} className="text-muted-foreground hover:text-foreground shrink-0">
                        <Plus className="h-3 w-3" />
                      </button>
                      <span className="text-[10px] text-muted-foreground shrink-0 ms-1">USDT</span>
                    </div>
                  </div>
                )}

                {/* Amount */}
                <div className="mb-2">
                  <label className="text-[10px] text-muted-foreground">{t('trade.amount')}</label>
                  <div className="flex items-center bg-secondary rounded h-8 px-2 mt-0.5">
                    <Input
                      type="number"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                      placeholder="0.00"
                      className="border-0 bg-transparent text-foreground text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-muted-foreground/50"
                    />
                    <span className="text-[10px] text-muted-foreground shrink-0 ms-1">{selectedAsset.asset}</span>
                  </div>
                </div>

                {/* Margin Summary */}
                {amountNum > 0 && (
                  <div className="bg-background rounded p-2 space-y-1 mb-2">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{t('trade.total')}</span>
                      <span className="text-foreground tabular-nums">{formatPrice(totalCost)} USDT</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{t('trade.marginRatio')}</span>
                      <span className="text-primary tabular-nums font-medium">{formatPrice(marginRequired)} USDT</span>
                    </div>
                    <div className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground">{t('trade.leverage')}</span>
                      <span className="text-foreground tabular-nums">{marginLeverage}x</span>
                    </div>
                  </div>
                )}

                <Button
                  className={`w-full font-semibold h-10 text-sm ${
                    side === 'buy'
                      ? 'bg-success hover:bg-success/90 text-white'
                      : 'bg-destructive hover:bg-destructive/90 text-white'
                  }`}
                >
                  {side === 'buy' ? t('trade.buyLong') : t('trade.sellShort')} {selectedAsset.asset}
                </Button>
              </div>
            </div>
          )}

          {/* Borrow Tab */}
          {activeTab === 'borrow' && (
            <div className="bg-card rounded-lg p-4 max-w-lg">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <DollarSign className="h-4 w-4 text-primary" />
                {t('trade.borrowAsset')}
              </h3>

              {/* Asset Select */}
              <div className="mb-3">
                <label className="text-[10px] text-muted-foreground">{t('trade.asset')}</label>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {marginAssets.map((a) => (
                    <button
                      key={a.asset}
                      onClick={() => setSelectedAsset(a)}
                      className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                        selectedAsset.asset === a.asset
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
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
                  <span className="text-muted-foreground">{t('trade.borrowAmount')}</span>
                  <span className="text-muted-foreground">{t('trade.available')}: {selectedAsset.available.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex items-center bg-secondary rounded h-9 px-2">
                  <Input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-0 bg-transparent text-foreground text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-muted-foreground/50"
                  />
                  <span className="text-[10px] text-muted-foreground shrink-0 ms-1">{selectedAsset.asset}</span>
                </div>
              </div>

              {/* Interest Info */}
              <div className="bg-background rounded p-2.5 space-y-1.5 mb-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{t('trade.dailyInterestRate')}</span>
                  <span className="text-primary tabular-nums">{(selectedAsset.interestRate * 100).toFixed(4)}%</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{t('trade.hourlyInterest')}</span>
                  <span className="text-muted-foreground tabular-nums">{(parseFloat(borrowAmount) * selectedAsset.interestRate / 24).toFixed(6)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{t('trade.outstandingDebt')}</span>
                  <span className="text-destructive tabular-nums">{selectedAsset.borrowed.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{t('trade.accruedInterest')}</span>
                  <span className="text-primary tabular-nums">{selectedAsset.interest.toFixed(6)} {selectedAsset.asset}</span>
                </div>
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 text-sm">
                {t('trade.borrow')} {selectedAsset.asset}
              </Button>
            </div>
          )}

          {/* Repay Tab */}
          {activeTab === 'repay' && (
            <div className="bg-card rounded-lg p-4 max-w-lg">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <ArrowRightLeft className="h-4 w-4 text-success" />
                {t('trade.repayLoan')}
              </h3>

              {/* Asset Select */}
              <div className="mb-3">
                <label className="text-[10px] text-muted-foreground">{t('trade.asset')}</label>
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {marginAssets.filter(a => a.borrowed > 0).map((a) => (
                    <button
                      key={a.asset}
                      onClick={() => setSelectedAsset(a)}
                      className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                        selectedAsset.asset === a.asset
                          ? 'bg-success text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
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
                  <span className="text-muted-foreground">{t('trade.repayAmount')}</span>
                  <span className="text-muted-foreground">{t('trade.debt')}: {selectedAsset.borrowed.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex items-center bg-secondary rounded h-9 px-2">
                  <Input
                    type="number"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(e.target.value)}
                    placeholder="0.00"
                    className="border-0 bg-transparent text-foreground text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-muted-foreground/50"
                  />
                  <span className="text-[10px] text-muted-foreground shrink-0 ms-1">{selectedAsset.asset}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-primary hover:text-primary hover:bg-primary/10 ms-1"
                    onClick={() => setRepayAmount((selectedAsset.borrowed + selectedAsset.interest).toFixed(6))}
                  >
                    {t('trade.max')}
                  </Button>
                </div>
              </div>

              {/* Repay Summary */}
              <div className="bg-background rounded p-2.5 space-y-1.5 mb-3">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{t('trade.outstandingPrincipal')}</span>
                  <span className="text-destructive tabular-nums">{selectedAsset.borrowed.toFixed(4)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{t('trade.interestToRepay')}</span>
                  <span className="text-primary tabular-nums">{selectedAsset.interest.toFixed(6)} {selectedAsset.asset}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">{t('trade.totalToRepay')}</span>
                  <span className="text-foreground tabular-nums font-medium">{(selectedAsset.borrowed + selectedAsset.interest).toFixed(4)} {selectedAsset.asset}</span>
                </div>
              </div>

              <Button className="w-full bg-success hover:bg-success/90 text-white font-semibold h-10 text-sm">
                {t('trade.repay')} {selectedAsset.asset}
              </Button>
            </div>
          )}

          {/* Open Margin Positions */}
          <div className="bg-card rounded-lg">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground">{t('trade.marginPositions')}</span>
              <Badge className="bg-secondary text-muted-foreground border-0 text-[10px] px-1.5 py-0 h-4">{mockMarginPositions.length}</Badge>
            </div>
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-start py-2 px-3 font-medium">{t('trade.asset')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('trade.side')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.size')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.entry')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.current')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.position')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.pnl')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.roe')}%</th>
                    <th className="text-start py-2 px-3 font-medium">{t('trade.positionMode')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMarginPositions.map((pos) => {
                    const liveP = livePrices[`${pos.asset}USDT`] || pos.currentPrice;
                    const posPnl = pos.side === 'long'
                      ? (liveP - pos.entryPrice) * pos.size
                      : (pos.entryPrice - liveP) * pos.size;
                    return (
                      <tr key={pos.id} className="border-b border-border/30 hover:bg-secondary/30">
                        <td className="py-2.5 px-3">
                          <span className="text-foreground font-medium">{pos.asset}</span>
                          <span className="text-[10px] text-primary ms-1">{pos.leverage}x</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`font-semibold ${pos.side === 'long' ? 'text-success' : 'text-destructive'}`}>
                            {pos.side === 'long' ? t('trade.long') : t('trade.short')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-end text-foreground tabular-nums">{pos.size}</td>
                        <td className="py-2.5 px-3 text-end text-muted-foreground tabular-nums">{formatPrice(pos.entryPrice)}</td>
                        <td className="py-2.5 px-3 text-end text-foreground tabular-nums">{formatPrice(liveP)}</td>
                        <td className="py-2.5 px-3 text-end text-muted-foreground tabular-nums">{formatPrice(pos.margin)}</td>
                        <td className={`py-2.5 px-3 text-end font-medium tabular-nums ${posPnl >= 0 ? 'text-success pnl-glow-profit' : 'text-destructive pnl-glow-loss'}`}>
                          {posPnl >= 0 ? '+' : ''}{formatPrice(posPnl)}
                        </td>
                        <td className={`py-2.5 px-3 text-end font-medium tabular-nums ${pos.roe >= 0 ? 'text-success pnl-glow-profit' : 'text-destructive pnl-glow-loss'}`}>
                          {pos.roe >= 0 ? '+' : ''}{pos.roe.toFixed(2)}%
                        </td>
                        <td className="py-2.5 px-3">
                          <Badge className={`text-[10px] px-1.5 py-0 h-3.5 border-0 font-medium ${
                            pos.mode === 'cross' ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10 text-muted-foreground'
                          }`}>
                            {pos.mode === 'cross' ? t('trade.cross') : t('trade.isolated')}
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
          <div className="bg-card rounded-lg">
            <div className="px-3 py-2.5 border-b border-border">
              <span className="text-xs font-semibold text-muted-foreground">{t('trade.borrowRepayHistory')}</span>
            </div>
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/50">
                    <th className="text-start py-2 px-3 font-medium">{t('trade.asset')}</th>
                    <th className="text-start py-2 px-3 font-medium">{t('trade.action')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.amount')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.interestRate')}</th>
                    <th className="text-end py-2 px-3 font-medium">{t('trade.date')}</th>
                  </tr>
                </thead>
                <tbody>
                  {mockBorrowHistory.map((record) => (
                    <tr key={record.id} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="py-2 px-3 text-foreground font-medium">{record.asset}</td>
                      <td className="py-2 px-3">
                        <Badge className={`text-[10px] px-1.5 py-0 h-4 border-0 font-medium ${
                          record.action === 'borrow' ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'
                        }`}>
                          {record.action === 'borrow' ? t('trade.borrow') : t('trade.repay')}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-end text-foreground tabular-nums">{record.amount}</td>
                      <td className="py-2 px-3 text-end text-muted-foreground tabular-nums">{(record.interestRate * 100).toFixed(4)}%</td>
                      <td className="py-2 px-3 text-end text-muted-foreground">{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Risk Warning */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] text-primary font-medium">{t('trade.marginNoticeTitle')}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {t('trade.marginNoticeDesc')}
              </p>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
