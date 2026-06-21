'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '@/hooks/use-modal-a11y';
import {
  ArrowLeft,
  ArrowDown,
  ChevronDown,
  Repeat,
  Clock,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ConvertToken {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  icon: string;
}

const tokens: ConvertToken[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.5, price: 67500, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', balance: 3.2, price: 3450, icon: 'Ξ' },
  { symbol: 'BNB', name: 'BNB', balance: 12.5, price: 580, icon: '◆' },
  { symbol: 'SOL', name: 'Solana', balance: 45, price: 172, icon: '◎' },
  { symbol: 'USDT', name: 'Tether', balance: 15000, price: 1, icon: '₮' },
  { symbol: 'XRP', name: 'Ripple', balance: 8000, price: 0.62, icon: '✕' },
  { symbol: 'ADA', name: 'Cardano', balance: 15000, price: 0.45, icon: '₳' },
  { symbol: 'DOGE', name: 'Dogecoin', balance: 50000, price: 0.165, icon: 'Ð' },
];

const recentConversions = [
  { id: '1', from: 'USDT', to: 'BTC', fromAmt: 500, toAmt: 0.00741, time: '5 min ago', rate: '1 BTC = $67,500' },
  { id: '2', from: 'ETH', to: 'USDT', fromAmt: 0.5, toAmt: 1725, time: '22 min ago', rate: '1 ETH = $3,450' },
  { id: '3', from: 'BNB', to: 'SOL', fromAmt: 3, toAmt: 10.12, time: '1 hr ago', rate: '1 BNB = 3.37 SOL' },
  { id: '4', from: 'USDT', to: 'ETH', fromAmt: 2000, toAmt: 0.5797, time: '3 hrs ago', rate: '1 ETH = $3,450' },
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
  onSelect: (token: ConvertToken) => void;
  exclude: string;
  title: string;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: isOpen, onClose, ref: modalRef });

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
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm mx-4 mb-4 sm:mb-0 bg-card border border-border rounded-2xl overflow-hidden glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              <Button variant="ghost" size="icon" aria-label="Close" className="h-9 w-9 text-muted-foreground" onClick={onClose}>
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
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold text-primary">
                      {tk.icon}
                    </div>
                    <div className="flex-1 text-start">
                      <p className="text-sm font-medium text-foreground">{tk.symbol}</p>
                      <p className="text-[10px] text-muted-foreground">{tk.name}</p>
                    </div>
                    <div className="text-end">
                      <p className="text-sm text-foreground">{tk.balance.toFixed(4)}</p>
                      <p className="text-[10px] text-muted-foreground">${(tk.balance * tk.price).toFixed(2)}</p>
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

export default function ConvertView() {
  const { goBack, isRTL } = useAppStore();
  const { t, language } = useTranslation();
  const [fromToken, setFromToken] = useState<ConvertToken>(tokens[4]); // USDT
  const [toToken, setToToken] = useState<ConvertToken>(tokens[0]); // BTC
  const [fromAmount, setFromAmount] = useState('');
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertComplete, setConvertComplete] = useState(false);

  const toAmount = fromAmount
    ? ((parseFloat(fromAmount) * fromToken.price) / toToken.price).toFixed(6)
    : '';
  const exchangeRate = (fromToken.price / toToken.price).toFixed(6);
  const lastUpdated = new Date().toLocaleTimeString(language === 'ar' ? 'ar' : undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount('');
    setConvertComplete(false);
  };

  const handleConvert = () => {
    setIsConverting(true);
    setTimeout(() => {
      setIsConverting(false);
      setConvertComplete(true);
      setTimeout(() => {
        setFromAmount('');
        setConvertComplete(false);
      }, 3000);
    }, 1500);
  };

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('actions.back')}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={goBack}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{t('convert.title')}</h1>
          <Badge className="bg-success/10 text-success border-0 text-[10px] px-1.5 py-0 h-5 font-semibold">
            {t('convert.instant')}
          </Badge>
        </div>

        {/* Convert Card */}
        <Card className="bg-card border-border glass-card overflow-hidden relative">
          <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-primary via-[#0ECB81] to-primary" />
          <CardContent className="p-4 space-y-3">
            {/* From Token */}
            <div className="bg-background/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground tracking-wider font-medium">{t('convert.from')}</span>
                <span className="text-[10px] text-muted-foreground">
                  {t('convert.balance')}: <span className="text-muted-foreground">{fromToken.balance.toFixed(4)} {fromToken.symbol}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => {
                    setFromAmount(e.target.value);
                    setConvertComplete(false);
                  }}
                  className="flex-1 bg-transparent border-0 text-xl font-semibold text-foreground placeholder:text-muted-foreground/50 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <button
                  onClick={() => setShowFromSelector(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors shrink-0"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {fromToken.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground">{fromToken.symbol}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  ≈ ${fromAmount ? (parseFloat(fromAmount) * fromToken.price).toFixed(2) : '0.00'}
                </span>
                <button
                  onClick={() => setFromAmount(fromToken.balance.toString())}
                  className="text-[10px] text-primary font-medium hover:underline"
                >
                  {t('convert.max')}
                </button>
              </div>
            </div>

            {/* Convert Arrow */}
            <div className="flex items-center justify-center -my-1">
              <motion.button
                onClick={handleSwapDirection}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 rounded-full bg-secondary border border-muted-foreground/40 flex items-center justify-center hover:bg-muted hover:border-primary/30 transition-all"
              >
                <ArrowDown className="h-4 w-4 text-primary" />
              </motion.button>
            </div>

            {/* To Token */}
            <div className="bg-background/50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground tracking-wider font-medium">{t('convert.to')}</span>
                <span className="text-[10px] text-muted-foreground">
                  {t('convert.balance')}: <span className="text-muted-foreground">{toToken.balance.toFixed(4)} {toToken.symbol}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-xl font-semibold text-foreground placeholder:text-muted-foreground/50 p-0">
                  {toAmount || <span className="text-muted-foreground/50">0.0</span>}
                </div>
                <button
                  onClick={() => setShowToSelector(true)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary hover:bg-muted transition-colors shrink-0"
                >
                  <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center text-[10px] font-bold text-success">
                    {toToken.icon}
                  </div>
                  <span className="text-sm font-medium text-foreground">{toToken.symbol}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground">
                ≈ ${toAmount ? (parseFloat(toAmount) * toToken.price).toFixed(2) : '0.00'}
              </span>
            </div>

            {/* Rate Info */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{t('convert.rate')}</span>
                <span className="text-[11px] text-muted-foreground">
                  1 {fromToken.symbol} = {exchangeRate} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{t('convert.lastUpdated')}</span>
                <span className="text-[11px] text-muted-foreground">{lastUpdated}</span>
              </div>
            </div>

            {/* Convert Button */}
            <div className="pt-2">
              {!fromAmount || parseFloat(fromAmount) <= 0 ? (
                <Button className="w-full h-12 bg-secondary text-muted-foreground cursor-not-allowed rounded-xl text-sm font-semibold" disabled>
                  {t('convert.enterAmount')}
                </Button>
              ) : convertComplete ? (
                <Button className="w-full h-12 bg-success hover:bg-success/90 text-white font-semibold rounded-xl text-sm" disabled>
                  <Check className="h-4 w-4 me-2" />
                  {t('convert.convertComplete')}
                </Button>
              ) : (
                <Button
                  className="w-full h-12 gradient-yellow hover:opacity-90 text-primary-foreground font-semibold rounded-xl text-sm shadow-md shadow-primary/20 press-scale"
                  onClick={handleConvert}
                  disabled={isConverting}
                >
                  {isConverting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin me-2" />
                      {t('convert.converting')}
                    </>
                  ) : (
                    <>
                      <Repeat className="h-4 w-4 me-2" />
                      {t('convert.convertButton')}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversions */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">{t('convert.recentConversions')}</h3>
            </div>
            <div className="space-y-2">
              {recentConversions.map((conv) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center text-xs">
                      <span className="text-foreground font-medium">{conv.fromAmt}</span>
                      <span className="text-muted-foreground ms-1">{conv.from}</span>
                    </div>
                    <ArrowDown className={`h-3 w-3 text-muted-foreground ${isRTL ? '-rotate-90' : 'rotate-90'}`} />
                    <div className="flex items-center text-xs">
                      <span className="text-foreground font-medium">{conv.toAmt}</span>
                      <span className="text-muted-foreground ms-1">{conv.to}</span>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className="text-[10px] text-muted-foreground">{conv.time}</p>
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
            setConvertComplete(false);
          }}
          exclude={toToken.symbol}
          title={t('convert.selectFrom')}
        />
        <TokenSelector
          isOpen={showToSelector}
          onClose={() => setShowToSelector(false)}
          onSelect={(tk) => {
            setToToken(tk);
            setConvertComplete(false);
          }}
          exclude={fromToken.symbol}
          title={t('convert.selectTo')}
        />
      </div>
    </ScrollArea>
  );
}
