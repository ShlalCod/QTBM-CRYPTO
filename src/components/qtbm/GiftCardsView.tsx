'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Gift,
  CreditCard,
  PartyPopper,
  Heart,
  Sparkles,
  Snowflake,
  Send,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Star,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const assets = ['BTC', 'ETH', 'BNB', 'USDT', 'SOL'];

const presetAmounts = ['$25', '$50', '$100', '$250', '$500', 'Custom'];

const themes = [
  { id: 'birthday', nameKey: 'giftCards.birthday', icon: PartyPopper, gradient: 'from-[#F0B90B] to-[#F6465D]', pattern: '🎂' },
  { id: 'thankyou', nameKey: 'giftCards.thankYou', icon: Heart, gradient: 'from-[#0ECB81] to-[#F0B90B]', pattern: '💝' },
  { id: 'congrats', nameKey: 'giftCards.congratulations', icon: Sparkles, gradient: 'from-[#627EEA] to-[#F0B90B]', pattern: '🎉' },
  { id: 'holiday', nameKey: 'giftCards.holiday', icon: Snowflake, gradient: 'from-[#229ED9] to-[#0ECB81]', pattern: '❄️' },
];

const myGiftCards = [
  { id: '1', asset: 'BTC', amount: 50, theme: 'birthday', message: 'Happy Birthday! 🎂', status: 'Redeemed', direction: 'sent', date: '2024-12-20' },
  { id: '2', asset: 'ETH', amount: 100, theme: 'thankyou', message: 'Thanks for everything!', status: 'Pending', direction: 'sent', date: '2025-01-05' },
  { id: '3', asset: 'USDT', amount: 25, theme: 'congrats', message: 'Congrats on your graduation!', status: 'Claimed', direction: 'received', date: '2024-12-28' },
];

const howItWorks = [
  { step: 1, titleKey: 'giftCards.stepCreate', descKey: 'giftCards.stepCreateDesc', icon: Gift },
  { step: 2, titleKey: 'giftCards.stepShare', descKey: 'giftCards.stepShareDesc', icon: Send },
  { step: 3, titleKey: 'giftCards.stepRedeem', descKey: 'giftCards.stepRedeemDesc', icon: CreditCard },
];

export default function GiftCardsView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [amount, setAmount] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('$50');
  const [message, setMessage] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('birthday');
  const [redeemCode, setRedeemCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const handlePresetAmount = (preset: string) => {
    setSelectedPreset(preset);
    if (preset !== 'Custom') {
      setAmount(preset.replace('$', ''));
    } else {
      setAmount('');
    }
  };

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => setCreating(false), 2000);
  };

  const handleRedeem = () => {
    setRedeemCode('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeTheme = themes.find((th) => th.id === selectedTheme)!;
  const displayAmount = selectedPreset === 'Custom' ? amount || '0' : selectedPreset.replace('$', '');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Redeemed':
      case 'Claimed':
        return 'bg-[#0ECB81]/10 text-[#0ECB81]';
      case 'Pending':
        return 'bg-[#F0B90B]/10 text-[#F0B90B]';
      default:
        return 'bg-[#2B3139] text-[#848E9C]';
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 w-8"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-[#EAECEF]">{t('giftCards.title')}</h1>
          <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[9px] px-1.5 py-0 h-5 font-semibold">
            {t('common.new')}
          </Badge>
        </div>

        {/* Featured Promo Card */}
        <Card className="bg-[#1E2329] border-[#2B3139] overflow-hidden relative glass-card">
          <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme.gradient} opacity-10`} />
          <div className="absolute inset-0 shimmer-gradient" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="h-5 w-5 text-[#F0B90B]" />
              <span className="text-xs text-[#F0B90B] font-semibold uppercase tracking-wider">
                {t('giftCards.sendCryptoGift')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#EAECEF] mb-1">
              {t('giftCards.sendCryptoGift')}
            </h2>
            <p className="text-xs text-[#848E9C] mb-3">
              {t('giftCards.sendCryptoDesc')}
            </p>
            <div className="w-20 h-20 rounded-xl bg-[#0B0E11]/50 flex items-center justify-center text-4xl">
              {activeTheme.pattern}
            </div>
          </CardContent>
        </Card>

        {/* Create Gift Card Section */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('giftCards.createGiftCard')}</h3>
            </div>

            {/* Asset Selector */}
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-2 block">
                {t('giftCards.selectAsset')}
              </label>
              <div className="flex gap-2">
                {assets.map((asset) => (
                  <button
                    key={asset}
                    onClick={() => setSelectedAsset(asset)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedAsset === asset
                        ? 'bg-[#F0B90B] text-[#0B0E11]'
                        : 'bg-[#2B3139] text-[#848E9C] hover:bg-[#3B4451]'
                    }`}
                  >
                    {asset}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Presets */}
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-2 block">
                {t('trade.amount')}
              </label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePresetAmount(preset)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                      selectedPreset === preset
                        ? 'bg-[#F0B90B] text-[#0B0E11]'
                        : 'bg-[#2B3139] text-[#848E9C] hover:bg-[#3B4451]'
                    }`}
                  >
                    {preset === 'Custom' ? t('giftCards.custom') : preset}
                  </button>
                ))}
              </div>
              {selectedPreset === 'Custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C] text-sm">$</span>
                    <Input
                      type="number"
                      placeholder={t('giftCards.enterAmount')}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-7 bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] h-10 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Custom Message */}
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-2 block">
                {t('giftCards.message')} ({message.length}/100)
              </label>
              <Input
                placeholder={t('giftCards.messagePlaceholder')}
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                className="bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] h-10 text-sm"
              />
            </div>

            {/* Theme Selector */}
            <div>
              <label className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-2 block">
                {t('giftCards.cardDesign')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {themes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`relative rounded-xl p-2 text-center transition-all ${
                        selectedTheme === theme.id
                          ? 'ring-2 ring-[#F0B90B] ring-offset-1 ring-offset-[#1E2329]'
                          : ''
                      }`}
                    >
                      <div className={`w-full h-14 rounded-lg bg-gradient-to-br ${theme.gradient} mb-1.5 flex items-center justify-center`}>
                        <span className="text-lg">{theme.pattern}</span>
                      </div>
                      <span className="text-[9px] text-[#848E9C] font-medium">{t(theme.nameKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gift Card Preview */}
            <div className="rounded-xl overflow-hidden relative">
              <div className={`absolute inset-0 bg-gradient-to-br ${activeTheme.gradient} opacity-20`} />
              <div className="relative bg-[#0B0E11]/80 border border-[#2B3139] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-[#F0B90B]" />
                    <span className="text-[9px] text-[#848E9C] uppercase tracking-wider">{t('giftCards.qtbmGiftCard')}</span>
                  </div>
                  <span className="text-lg">{activeTheme.pattern}</span>
                </div>
                <div className="mb-2">
                  <p className="text-2xl font-bold text-[#EAECEF]">${displayAmount}</p>
                  <p className="text-xs text-[#F0B90B] font-semibold">{selectedAsset}</p>
                </div>
                {message && (
                  <p className="text-[11px] text-[#848E9C] italic">&ldquo;{message}&rdquo;</p>
                )}
              </div>
            </div>

            {/* Create Button */}
            <Button
              className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-11 text-sm shadow-md shadow-[#F0B90B]/20 press-scale"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-4 h-4 border-2 border-[#0B0E11] border-t-transparent rounded-full mr-2"
                />
              ) : null}
              {creating ? t('giftCards.creating') : t('giftCards.createGiftCard')}
            </Button>
          </CardContent>
        </Card>

        {/* My Gift Cards */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('giftCards.myGiftCards')}</h3>
            </div>
            <div className="space-y-2">
              {myGiftCards.map((card) => {
                const theme = themes.find((t) => t.id === card.theme)!;
                return (
                  <div
                    key={card.id}
                    className="rounded-xl overflow-hidden relative"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-5`} />
                    <div className="relative flex items-center justify-between p-3 bg-[#0B0E11]/40 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-sm`}>
                          {theme.pattern}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#EAECEF]">
                            {card.asset} ${card.amount} - {t(theme.nameKey)}
                          </p>
                          <p className="text-[9px] text-[#5E6673] truncate max-w-[180px]">
                            {card.message}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`${getStatusColor(card.status)} text-[8px] px-1.5 py-0 h-4 border-0`}>
                          {card.status === 'Redeemed' ? t('giftCards.redeemed') : card.status === 'Pending' ? t('giftCards.pending') : card.status === 'Claimed' ? t('giftCards.claimed') : card.status}
                        </Badge>
                        <span className="text-[8px] text-[#5E6673]">{card.date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Redeem Gift Card */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-4 w-4 text-[#0ECB81]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('giftCards.redeemGiftCard')}</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={t('giftCards.enterCode')}
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                className="bg-[#0B0E11]/50 border-[#2B3139] text-[#EAECEF] h-10 text-sm font-mono uppercase tracking-wider"
              />
              <Button
                className="gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-10 px-4 text-sm press-scale shrink-0"
                onClick={handleRedeem}
                disabled={!redeemCode.trim()}
              >
                {t('giftCards.redeem')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-[#EAECEF] mb-3">{t('giftCards.howItWorks')}</h3>
            <div className="space-y-3">
              {howItWorks.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-[#F0B90B] to-[#F0B90B]/60 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-[#0B0E11]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-[#EAECEF]">{t(item.titleKey)}</p>
                      <p className="text-[10px] text-[#5E6673]">{t(item.descKey)}</p>
                    </div>
                    {idx < howItWorks.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-[#2B3139] shrink-0 mt-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
