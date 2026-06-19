'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowDownUp,
  ChevronDown,
  Settings2,
  Check,
  AlertTriangle,
  Route,
  Clock,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SwapToken {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  icon: string;
}

const tokens: SwapToken[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.5, price: 67500, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', balance: 3.2, price: 3450, icon: 'Ξ' },
  { symbol: 'BNB', name: 'BNB', balance: 12.5, price: 580, icon: '◆' },
  { symbol: 'SOL', name: 'Solana', balance: 45, price: 172, icon: '◎' },
  { symbol: 'USDT', name: 'Tether', balance: 15000, price: 1, icon: '₮' },
  { symbol: 'XRP', name: 'Ripple', balance: 8000, price: 0.62, icon: '✕' },
  { symbol: 'ADA', name: 'Cardano', balance: 15000, price: 0.45, icon: '₳' },
  { symbol: 'DOGE', name: 'Dogecoin', balance: 50000, price: 0.165, icon: 'Ð' },
];

const slippageOptions = [
  { label: '0.1%', value: 0.001 },
  { label: '0.5%', value: 0.005 },
  { label: '1%', value: 0.01 },
];

const recentSwaps = [
  { id: '1', from: 'BTC', to: 'ETH', fromAmt: 0.05, toAmt: 0.98, time: '2 min ago', status: 'completed' },
  { id: '2', from: 'USDT', to: 'SOL', fromAmt: 1000, toAmt: 5.81, time: '15 min ago', status: 'completed' },
  { id: '3', from: 'ETH', to: 'BNB', fromAmt: 1.5, toAmt: 8.92, time: '1 hr ago', status: 'completed' },
  { id: '4', from: 'BNB', to: 'USDT', fromAmt: 5, toAmt: 2900, time: '3 hrs ago', status: 'completed' },
];

function TokenSelector({
  isOpen,
  onClose,
  onSelect,
  exclude,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (token: SwapToken) => void;
  exclude: string;
  title: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-[#1E2329] border border-[#2B3139] rounded-2xl overflow-hidden glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
              <h3 className="text-sm font-semibold text-[#EAECEF]">{title}</h3>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-[#848E9C]" onClick={onClose}>
                ✕
              </Button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {tokens
                .filter((tk) => tk.symbol !== exclude)
                .map((tk) => (
                  <button
                    key={tk.symbol}
                    onClick={() => {
                      onSelect(tk);
                      onClose();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#2B3139] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2B3139] flex items-center justify-center text-sm font-bold text-[#F0B90B]">
                      {tk.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[#EAECEF]">{tk.symbol}</p>
                      <p className="text-[10px] text-[#5E6673]">{tk.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#EAECEF]">{tk.balance.toFixed(4)}</p>
                      <p className="text-[10px] text-[#5E6673]">${(tk.balance * tk.price).toFixed(2)}</p>
                    </div>
                  </button>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SwapView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [fromToken, setFromToken] = useState<SwapToken>(tokens[0]);
  const [toToken, setToToken] = useState<SwapToken>(tokens[4]);
  const [fromAmount, setFromAmount] = useState('');
  const [showSlippage, setShowSlippage] = useState(false);
  const [slippage, setSlippage] = useState(0.005);
  const [customSlippage, setCustomSlippage] = useState('');
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [swapComplete, setSwapComplete] = useState(false);

  const toAmount = fromAmount
    ? ((parseFloat(fromAmount) * fromToken.price) / toToken.price).toFixed(6)
    : '';
  const exchangeRate = (fromToken.price / toToken.price).toFixed(6);
  const priceImpact = fromAmount
    ? parseFloat(fromAmount) > fromToken.balance * 0.3
      ? parseFloat(fromAmount) > fromToken.balance * 0.6
        ? 4.2
        : 1.8
      : 0.3
    : 0;

  const impactColor =
    priceImpact < 1 ? 'text-[#0ECB81]' : priceImpact < 3 ? 'text-[#F0B90B]' : 'text-[#F6465D]';
  const impactBg =
    priceImpact < 1 ? 'bg-[#0ECB81]/10' : priceImpact < 3 ? 'bg-[#F0B90B]/10' : 'bg-[#F6465D]/10';

  const networkFee = 0.0005;
  const platformFee = fromAmount ? parseFloat(fromAmount) * 0.001 : 0;
  const minReceived = toAmount
    ? (parseFloat(toAmount) * (1 - slippage)).toFixed(6)
    : '';

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setSwapComplete(false);
    setNeedsApproval(true);
  };

  const handleApprove = () => {
    setIsApproving(true);
    setTimeout(() => {
      setIsApproving(false);
      setNeedsApproval(false);
    }, 1500);
  };

  const handleSwap = () => {
    setIsSwapping(true);
    setTimeout(() => {
      setIsSwapping(false);
      setSwapComplete(true);
      setTimeout(() => {
        setFromAmount('');
        setSwapComplete(false);
        setNeedsApproval(true);
      }, 3000);
    }, 2000);
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 w-8"
              onClick={goBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-[#EAECEF]">{t('swap.title')}</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 ${showSlippage ? 'text-[#F0B90B]' : 'text-[#848E9C]'} hover:text-[#F0B90B] hover:bg-[#F0B90B]/10`}
            onClick={() => setShowSlippage(!showSlippage)}
          >
            <Settings2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Slippage Settings */}
        <AnimatePresence>
          {showSlippage && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-medium text-[#848E9C]">{t('swap.slippageTolerance')}</p>
                  <div className="flex items-center gap-2">
                    {slippageOptions.map((opt) => (
                      <button
                        key={opt.label}
                        onClick={() => {
                          setSlippage(opt.value);
                          setCustomSlippage('');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          slippage === opt.value && !customSlippage
                            ? 'bg-[#F0B90B] text-[#0B0E11]'
                            : 'bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                    <div className="flex-1 relative">
                      <Input
                        placeholder={t('swap.custom')}
                        value={customSlippage}
                        onChange={(e) => {
                          setCustomSlippage(e.target.value);
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val > 0 && val <= 50) {
                            setSlippage(val / 100);
                          }
                        }}
                        className="bg-[#2B3139] border-[#3B4451] text-[#EAECEF] h-8 text-xs"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[#5E6673]">%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Card */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card overflow-hidden relative">
          {/* Decorative gradient */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F0B90B] via-[#0ECB81] to-[#F0B90B]" />
          <CardContent className="p-4 space-y-3">
            {/* From Token */}
            <div className="bg-[#0B0E11]/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium">{t('swap.from')}</span>
                <span className="text-[10px] text-[#5E6673]">
                  {t('swap.balance')}: <span className="text-[#848E9C]">{fromToken.balance.toFixed(4)} {fromToken.symbol}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                    setSwapComplete(false);
                  }}
                  className="flex-1 bg-transparent border-0 text-xl font-semibold text-[#EAECEF] placeholder:text-[#3E444D] p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  onClick={() => setShowFromSelector(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2B3139] hover:bg-[#3B4451] transition-colors shrink-0"
                >
                  <div className="w-5 h-5 rounded-full bg-[#F0B90B]/20 flex items-center justify-center text-[10px] font-bold text-[#F0B90B]">
                    {fromToken.icon}
                  </div>
                  <span className="text-sm font-medium text-[#EAECEF]">{fromToken.symbol}</span>
                  <ChevronDown className="h-3 w-3 text-[#848E9C]" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E6673]">
                  ≈ ${fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : '0.00'}
                </span>
                <button
                  onClick={() => setFromAmount(fromToken.balance.toString())}
                  className="text-[10px] text-[#F0B90B] font-medium hover:underline"
                >
                  {t('trade.max')}
                </button>
              </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex items-center justify-center -my-1">
              <motion.button
                onClick={handleSwapDirection}
                whileTap={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-9 h-9 rounded-full bg-[#2B3139] border border-[#3B4451] flex items-center justify-center hover:bg-[#3B4451] hover:border-[#F0B90B]/30 transition-all"
              >
                <ArrowDownUp className="h-4 w-4 text-[#F0B90B]" />
              </motion.button>
            </div>

            {/* To Token */}
            <div className="bg-[#0B0E11]/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium">{t('swap.to')}</span>
                <span className="text-[10px] text-[#5E6673]">
                  {t('swap.balance')}: <span className="text-[#848E9C]">{toToken.balance.toFixed(4)} {toToken.symbol}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xl font-semibold text-[#EAECEF] placeholder:text-[#3E444D] p-0">
                  {toAmount || <span className="text-[#3E444D]">0.0</span>}
                </div>
                <button
                  onClick={() => setShowToSelector(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#2B3139] hover:bg-[#3B4451] transition-colors shrink-0"
                >
                  <div className="w-5 h-5 rounded-full bg-[#0ECB81]/20 flex items-center justify-center text-[10px] font-bold text-[#0ECB81]">
                    {toToken.icon}
                  </div>
                  <span className="text-sm font-medium text-[#EAECEF]">{toToken.symbol}</span>
                  <ChevronDown className="h-3 w-3 text-[#848E9C]" />
                </button>
              </div>
              <span className="text-[10px] text-[#5E6673]">
                ≈ ${toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : '0.00'}
              </span>
            </div>

            {/* Exchange Rate - Always visible */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 pt-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-[#5E6673]">{t('swap.exchangeRate')}</span>
                <span className="text-[11px] text-[#848E9C]">1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}</span>
              </div>
              {/* Additional swap details when amount is entered */}
              {fromAmount && parseFloat(fromAmount) > 0 && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#5E6673]">{t('swap.priceImpact')}</span>
                    <span className={`text-[11px] font-medium ${impactColor}`}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  {priceImpact >= 3 && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${impactBg}`}>
                      <AlertTriangle className="h-3 w-3 text-[#F6465D]" />
                      <span className="text-[10px] text-[#F6465D]">{t('swap.highImpact')}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#5E6673]">{t('swap.minReceived')}</span>
                    <span className="text-[11px] text-[#848E9C]">{minReceived} {toToken.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#5E6673]">{t('swap.networkFee')}</span>
                    <span className="text-[11px] text-[#848E9C]">~{networkFee} {fromToken.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#5E6673]">{t('swap.platformFee')}</span>
                    <span className="text-[11px] text-[#848E9C]">{platformFee.toFixed(6)} {fromToken.symbol} (0.1%)</span>
                  </div>
                  {/* Route */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[#5E6673]">{t('swap.route')}</span>
                    <div className="flex items-center gap-1">
                      <Route className="h-3 w-3 text-[#F0B90B]" />
                      <span className="text-[11px] text-[#848E9C]">
                        {fromToken.symbol === 'BTC' && toToken.symbol !== 'USDT'
                          ? `${fromToken.symbol} → USDT → ${toToken.symbol}`
                          : `${fromToken.symbol} → ${toToken.symbol}`}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </motion.div>

            {/* Action Button */}
            <div className="pt-2">
              {!fromAmount || parseFloat(fromAmount) <= 0 ? (
                <Button className="w-full h-12 bg-[#2B3139] text-[#5E6673] cursor-not-allowed rounded-xl text-sm font-semibold" disabled>
                  {t('swap.enterAmount')}
                </Button>
              ) : needsApproval ? (
                <Button
                  className="w-full h-12 gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold rounded-xl text-sm shadow-md shadow-[#F0B90B]/20 press-scale"
                  onClick={handleApprove}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0E11]/30 border-t-[#0B0E11] rounded-full animate-spin mr-2" />
                      {t('swap.approving')}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {t('swap.approve')} {fromToken.symbol}
                    </>
                  )}
                </Button>
              ) : swapComplete ? (
                <Button className="w-full h-12 bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white font-semibold rounded-xl text-sm" disabled>
                  <Check className="h-4 w-4 mr-2" />
                  {t('swap.swapComplete')}
                </Button>
              ) : (
                <Button
                  className="w-full h-12 gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold rounded-xl text-sm shadow-md shadow-[#F0B90B]/20 press-scale"
                  onClick={handleSwap}
                  disabled={isSwapping}
                >
                  {isSwapping ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#0B0E11]/30 border-t-[#0B0E11] rounded-full animate-spin mr-2" />
                      {t('swap.swapping')}
                    </>
                  ) : (
                    t('swap.swapButton')
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Swaps */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#5E6673]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('swap.recentSwaps')}</h3>
            </div>
            <div className="space-y-2">
              {recentSwaps.map((swap) => (
                <div
                  key={swap.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0B0E11]/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-xs">
                      <span className="text-[#EAECEF] font-medium">{swap.fromAmt}</span>
                      <span className="text-[#848E9C] ml-1">{swap.from}</span>
                    </div>
                    <ArrowDownUp className="h-3 w-3 text-[#5E6673]" />
                    <div className="flex items-center text-xs">
                      <span className="text-[#EAECEF] font-medium">{swap.toAmt}</span>
                      <span className="text-[#848E9C] ml-1">{swap.to}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5E6673]">{swap.time}</span>
                    <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[9px] px-1.5 py-0 h-4">
                      {t('wallet.completed')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Token Selectors */}
        <TokenSelector
          isOpen={showFromSelector}
          onClose={() => setShowFromSelector(false)}
          onSelect={(tk) => {
            setFromToken(tk);
            setNeedsApproval(true);
            setSwapComplete(false);
          }}
          exclude={toToken.symbol}
          title={t('swap.selectFrom')}
        />
        <TokenSelector
          isOpen={showToSelector}
          onClose={() => setShowToSelector(false)}
          onSelect={(tk) => {
            setToToken(tk);
            setSwapComplete(false);
          }}
          exclude={fromToken.symbol}
          title={t('swap.selectTo')}
        />
      </div>
    </ScrollArea>
  );
}
