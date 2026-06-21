'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
import { mockP2PListings, formatPrice } from '@/lib/mock-data';
import {
  ArrowLeft,
  Search,
  Star,
  Shield,
  Clock,
  CheckCircle2,
  Filter,
  ChevronDown,
  MessageCircle,
  Send,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import type { P2PListing } from '@/types';

type P2PSide = 'buy' | 'sell';
type FiatCurrency = 'USD' | 'EUR' | 'SAR' | 'AED';

const paymentMethodIcons: Record<string, string> = {
  'Bank Transfer': '🏦',
  'Zelle': '💳',
  'PayPal': '🅿️',
  'Venmo': '💰',
  'Wire': '🏦',
  'STC Pay': '📱',
};

// Quick chat messages for P2P
const quickMessageKeys = [
  'p2p.quickMsg1',
  'p2p.quickMsg2',
  'p2p.quickMsg3',
  'p2p.quickMsg4',
  'p2p.quickMsg5',
];

// Online status data for merchants (simulated)
function isMerchantOnline(userId: string): boolean {
  // Deterministic: users starting with letters A-M are "online"
  const first = userId.charAt(0);
  return first.localeCompare('N', undefined, { sensitivity: 'base' }) < 0;
}

// ── Mini Chat Preview Component ────────────────────────────────────────────
function MiniChatPreview({ merchantName, onClose }: { merchantName: string; onClose: () => void }) {
  const { t } = useTranslation();
  const { isRTL } = useAppStore();
  const quickMessages = quickMessageKeys.map((k) => t(k));
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; time: string }>>([
    { text: t('p2p.chatWithMerchant').replace('{name}', merchantName), isUser: false, time: t('p2p.now') },
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      { text: text.trim(), isUser: true, time: t('p2p.now') },
    ]);
    setInputVal('');
    // Simulate auto-reply after a short delay
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: t('p2p.thanksReachingOut'), isUser: false, time: t('p2p.now') },
      ]);
    }, 1200);
  };

  return (
    <motion.div
      initial={{ x: isRTL ? -300 : 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: isRTL ? -300 : 300, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute end-0 top-0 bottom-0 w-72 bg-card border-s border-border flex flex-col z-20"
    >
      {/* Chat header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary" dir="ltr">
            {merchantName.slice(0, 2)}
          </div>
          <span className="text-xs font-semibold text-foreground">{merchantName}</span>
          <div className="w-1.5 h-1.5 rounded-full bg-success online-indicator" />
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors h-9 w-9 flex items-center justify-center rounded-md" aria-label={t('common.close')}>
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Chat messages */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-2.5 py-1.5 rounded-lg text-[11px] ${
                  msg.isUser
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Quick messages */}
      <div className="px-2 pb-1">
        <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
          {quickMessages.map((qm) => (
            <button
              key={qm}
              onClick={() => handleSend(qm)}
              className="shrink-0 px-2 py-1 rounded-full bg-secondary text-[10px] text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border"
            >
              {qm}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-2 py-2 border-t border-border">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputVal); }}
          placeholder={t('p2p.typeMessage')}
          className="h-7 text-[11px] bg-secondary border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
        />
        <button
          onClick={() => handleSend(inputVal)}
          className="w-9 h-9 rounded-md bg-primary flex items-center justify-center shrink-0 hover:bg-primary/90 transition-colors"
          aria-label={t('p2p.chat')}
        >
          <Send className="h-3 w-3 text-background" />
        </button>
      </div>
    </motion.div>
  );
}

export default function P2PView() {
  const { navigateTo, isRTL } = useAppStore();
  const { t } = useTranslation();
  const { formatNum, includesCI } = useLocaleFmt();
  const [side, setSide] = useState<P2PSide>('buy');
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>('USD');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [chatOpenFor, setChatOpenFor] = useState<string | null>(null);

  const filteredListings = mockP2PListings.filter((l) => {
    if (l.side !== side && side === 'buy' && l.side !== 'sell') return false;
    if (l.side !== side && side === 'sell' && l.side !== 'buy') return false;
    if (l.fiatCurrency !== fiatCurrency) return false;
    if (searchQuery && !includesCI(l.user, searchQuery)) return false;
    return true;
  });

  // For buy, show sellers. For sell, show buyers.
  const displayListings = filteredListings;

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9 lg:hidden"
            onClick={() => navigateTo('more')}
            aria-label={t('common.back')}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('p2p.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('p2p.subtitle')}</p>
          </div>
        </div>

        {/* Buy/Sell Toggle */}
        <div className="flex gap-0 bg-card rounded-lg p-1">
          <button
            onClick={() => setSide('buy')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
              side === 'buy'
                ? 'bg-success text-background'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('p2p.buy')}
          </button>
          <button
            onClick={() => setSide('sell')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 ${
              side === 'sell'
                ? 'bg-destructive text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t('p2p.sell')}
          </button>
        </div>

        {/* Fiat Currency Selector & Search */}
        <div className="flex gap-2">
          <Select value={fiatCurrency} onValueChange={(v) => setFiatCurrency(v as FiatCurrency)}>
            <SelectTrigger className="w-24 bg-secondary border-border text-foreground text-xs h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-secondary border-border">
              {(['USD', 'EUR', 'SAR', 'AED'] as FiatCurrency[]).map((c) => (
                <SelectItem key={c} value={c} className="text-foreground text-xs">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex-1 relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('p2p.searchMerchant')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9 bg-secondary border-border text-foreground placeholder:text-muted-foreground h-9 text-xs focus:border-primary"
            />
          </div>
        </div>

        {/* Payment Method Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant="outline"
            size="sm"
            className={`border-border text-[10px] h-7 shrink-0 ${
              paymentFilter === 'all'
                ? 'bg-secondary text-primary border-primary/30'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
            onClick={() => setPaymentFilter('all')}
          >
            {t('p2p.all')}
          </Button>
          {['Bank Transfer', 'Zelle', 'PayPal', 'Venmo', 'STC Pay', 'Wire'].map((method) => (
            <Button
              key={method}
              variant="outline"
              size="sm"
              className={`border-border text-[10px] h-7 shrink-0 ${
                paymentFilter === method
                  ? 'bg-secondary text-primary border-primary/30'
                  : 'text-muted-foreground hover:bg-secondary'
              }`}
              onClick={() => setPaymentFilter(method)}
            >
              {paymentMethodIcons[method] || '💳'} {method}
            </Button>
          ))}
        </div>

        {/* P2P Listings */}
        <div className="space-y-3">
          {displayListings.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">{t('p2p.noListings')} {fiatCurrency}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('p2p.tryDifferent')}</p>
              </CardContent>
            </Card>
          ) : (
            displayListings.map((listing) => (
              <Card key={listing.id} className="bg-card border-border hover:border-primary/20 transition-colors card-depth relative overflow-hidden">
                <CardContent className="p-4">
                  {/* Merchant Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-xs font-bold text-primary" dir="ltr">
                            {listing.user.slice(0, 2)}
                          </span>
                        </div>
                        {/* Online status indicator - green/gray based on merchant */}
                        <div className={`absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full border-2 border-border ${isMerchantOnline(listing.user) ? 'bg-success online-indicator' : 'bg-muted-foreground'}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground">{listing.user}</span>
                          {/* Online/Offline status text */}
                          <span className={`text-[10px] font-medium flex items-center gap-0.5 ${isMerchantOnline(listing.user) ? 'text-success' : 'text-muted-foreground'}`}>
                            <span className={`w-1 h-1 rounded-full ${isMerchantOnline(listing.user) ? 'bg-success online-indicator' : 'bg-muted-foreground'}`} />
                            {isMerchantOnline(listing.user) ? t('p2p.online') : t('p2p.offline')}
                          </span>
                          {/* Verified merchant badge */}
                          {listing.completionRate >= 98 && (
                            <div className="flex items-center gap-0.5 px-1 py-0.5 bg-success/10 rounded-full badge-shimmer">
                              <Shield className="h-3 w-3 text-success" />
                              <span className="text-[10px] text-success font-bold">{t('p2p.verified')}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span>{listing.ordersCount} {t('p2p.orders')}</span>
                          <span>·</span>
                          <span className="text-success">{listing.completionRate}% {t('p2p.completionRate')}</span>
                        </div>
                        {/* Completion rate progress bar */}
                        <div className="completion-rate-bar mt-1 w-24">
                          <div
                            className="completion-rate-fill"
                            style={{
                              width: `${listing.completionRate}%`,
                              background: listing.completionRate >= 98 ? '#0ECB81' : listing.completionRate >= 95 ? '#F0B90B' : '#848E9C',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-foreground tabular-nums gradient-text-gold">
                        {listing.fiatCurrency === 'SAR' || listing.fiatCurrency === 'AED'
                          ? formatPrice(listing.price)
                          : formatPrice(listing.price)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{listing.fiatCurrency}/{listing.asset}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t('p2p.available')}</p>
                      <p className="text-xs text-foreground font-medium tabular-nums">
                        {formatNum(listing.available)} {listing.asset}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t('p2p.limit')}</p>
                      <p className="text-xs text-foreground font-medium tabular-nums">
                        {listing.minAmount}-{listing.maxAmount} {listing.fiatCurrency}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">{t('p2p.payment')}</p>
                      <p className="text-xs text-foreground font-medium truncate">
                        {listing.paymentMethods.join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Payment Methods, Chat & Trade Button */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {listing.paymentMethods.map((method) => (
                        <Badge
                          key={method}
                          variant="outline"
                          className="text-[10px] border-border text-muted-foreground h-5 px-1.5"
                        >
                          {paymentMethodIcons[method] || '💳'} {method}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* Chat Button */}
                      <button
                        onClick={() => setChatOpenFor(chatOpenFor === listing.id ? null : listing.id)}
                        className={`h-8 px-3 rounded-md text-xs font-medium flex items-center gap-1 transition-all duration-200 ${
                          chatOpenFor === listing.id
                            ? 'bg-primary text-background'
                            : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {t('p2p.chat')}
                      </button>
                      <Button
                        className={`text-xs h-8 px-5 font-semibold ${
                          listing.side === 'sell'
                            ? 'bg-success hover:bg-success/90 text-background'
                            : 'bg-destructive hover:bg-destructive/90 text-white'
                        }`}
                      >
                        {listing.side === 'sell' ? t('p2p.buy') : t('p2p.sell')} {listing.asset}
                      </Button>
                    </div>
                  </div>

                  {/* Inline Chat Preview */}
                  <AnimatePresence>
                    {chatOpenFor === listing.id && (
                      <MiniChatPreview
                        merchantName={listing.user}
                        onClose={() => setChatOpenFor(null)}
                      />
                    )}
                  </AnimatePresence>

                  {/* Terms */}
                  {listing.terms && (
                    <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border">
                      💬 {listing.terms}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <Card className="bg-card/50 border-border">
          <CardContent className="p-3">
            <p className="text-[10px] text-muted-foreground text-center">
              {t('p2p.disclaimer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
