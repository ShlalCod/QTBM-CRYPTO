'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Copy,
  Check,
  Share2,
  Gift,
  Users,
  Trophy,
  TrendingUp,
  QrCode,
  ExternalLink,
  ChevronRight,
  Medal,
  Star,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const referralCode = 'QTBM-7X9K2M';
const referralLink = 'https://qtbm.bank/invite/QTBM-7X9K2M';

const rewardTierKeys = [
  { nameKey: 'referral.bronzeTier', minRefs: 1, maxRefs: 5, reward: 10, color: '#CD7F32', icon: '🥉' },
  { nameKey: 'referral.silverTier', minRefs: 6, maxRefs: 20, reward: 15, color: '#C0C0C0', icon: '🥈' },
  { nameKey: 'referral.goldTier', minRefs: 21, maxRefs: 50, reward: 25, color: '#FFD700', icon: '🥇' },
  { nameKey: 'referral.diamondTier', minRefs: 51, maxRefs: 999, reward: 40, color: '#B9F2FF', icon: '💎' },
];

const referralHistory = [
  { id: '1', name: 'Ahmed K.', date: '2024-12-15', status: 'active', reward: 15 },
  { id: '2', name: 'Sara M.', date: '2024-12-10', status: 'active', reward: 15 },
  { id: '3', name: 'Omar H.', date: '2024-11-28', status: 'active', reward: 10 },
  { id: '4', name: 'Fatima R.', date: '2024-11-15', status: 'pending', reward: 0 },
  { id: '5', name: 'Yusuf A.', date: '2024-11-01', status: 'active', reward: 10 },
  { id: '6', name: 'Layla B.', date: '2024-10-20', status: 'active', reward: 10 },
  { id: '7', name: 'Khalid S.', date: '2024-10-05', status: 'active', reward: 10 },
  { id: '8', name: 'Nour D.', date: '2024-09-18', status: 'active', reward: 10 },
];

const totalInvited = 8;
const activeReferrals = 7;
const totalEarned = 80;

const currentTier = rewardTierKeys.find(
  (tier) => totalInvited >= tier.minRefs && totalInvited <= tier.maxRefs
) || rewardTierKeys[0];
const nextTier = rewardTierKeys.find(
  (tier) => tier.minRefs > totalInvited
);

const howItWorksKeys = [
  { step: 1, titleKey: 'referral.step1Title', descKey: 'referral.step1Desc' },
  { step: 2, titleKey: 'referral.step2Title', descKey: 'referral.step2Desc' },
  { step: 3, titleKey: 'referral.step3Title', descKey: 'referral.step3Desc' },
  { step: 4, titleKey: 'referral.step4Title', descKey: 'referral.step4Desc' },
];

export default function ReferralView() {
  const { goBack, isRTL } = useAppStore();
  const { t } = useTranslation();
  const { formatDate } = useLocaleFmt();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const progressToNext = nextTier
    ? ((totalInvited - currentTier.minRefs + 1) / (nextTier.minRefs - currentTier.minRefs)) * 100
    : 100;

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={goBack}
            aria-label={t('common.back')}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">{t('referral.title')}</h1>
        </div>

        {/* Animated Rewards Card */}
        <Card className="bg-card border-border overflow-hidden relative glass-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-success/5 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
          <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-primary via-[#0ECB81] to-primary" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">{t('referral.earnRewards')}</h2>
            </div>

            {/* Referral Code */}
            <div className="bg-background/50 rounded-xl p-4 mb-4">
              <p className="text-[10px] text-muted-foreground tracking-wider font-medium mb-2">{t('referral.yourCode')}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary tracking-wider" dir="ltr">{referralCode}</span>
                <Button
                  size="sm"
                  className={`h-9 px-3 text-xs font-medium transition-all ${
                    copied
                      ? 'bg-success hover:bg-success/90 text-white'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground'
                  }`}
                  onClick={handleCopyCode}
                  aria-label={t('common.copy')}
                >
                  {copied ? <Check className="h-3 w-3 me-1" /> : <Copy className="h-3 w-3 me-1" />}
                  {copied ? t('actions.copy') + '!' : t('actions.copy')}
                </Button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-28 h-28 bg-white rounded-xl flex items-center justify-center">
                <QrCode className="h-20 w-20 text-background" />
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-background/50 hover:bg-secondary transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  {copiedLink ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </div>
                <span className="text-[10px] text-muted-foreground">{t('referral.copyLink')}</span>
              </button>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(t('referral.shareMessage'))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-background/50 hover:bg-secondary transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#229ED9]/20 flex items-center justify-center text-sm font-bold text-[#229ED9]">T</div>
                <span className="text-[10px] text-muted-foreground">Telegram</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(t('referral.shareMessage') + ' ' + referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-background/50 hover:bg-secondary transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-sm font-bold text-[#25D366]">W</div>
                <span className="text-[10px] text-muted-foreground">WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(t('referral.shareMessage'))}&url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-background/50 hover:bg-secondary transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-bold text-foreground">X</div>
                <span className="text-[10px] text-muted-foreground">Twitter</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-card border-border glass-card">
            <CardContent className="p-3 text-center">
              <Users className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{totalInvited}</p>
              <p className="text-[10px] text-muted-foreground">{t('referral.totalInvited')}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border glass-card">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 text-success mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{activeReferrals}</p>
              <p className="text-[10px] text-muted-foreground">{t('referral.activeReferrals')}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border glass-card">
            <CardContent className="p-3 text-center">
              <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">${totalEarned}</p>
              <p className="text-[10px] text-muted-foreground">{t('referral.totalEarned')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Reward Tiers */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Medal className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{t('referral.rewardTiers')}</h3>
            </div>

            {/* Current Tier Progress */}
            <div className="bg-background/50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentTier.icon}</span>
                  <span className="text-xs font-medium text-foreground">{t(currentTier.nameKey)}</span>
                </div>
                {nextTier && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span>{nextTier.icon}</span>
                    <span>{t('referral.next')}: {t(nextTier.nameKey)}</span>
                  </div>
                )}
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">{totalInvited} {t('referral.referrals')}</span>
                {nextTier && (
                  <span className="text-[10px] text-muted-foreground">{nextTier.minRefs - 1} {t('referral.referrals')}</span>
                )}
              </div>
            </div>

            {/* Tier Cards */}
            <div className="space-y-2">
              {rewardTierKeys.map((tier) => {
                const isCurrentTier = tier.nameKey === currentTier.nameKey;
                const isPastTier = totalInvited > tier.maxRefs;
                return (
                  <div
                    key={tier.nameKey}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isCurrentTier
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-background/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{tier.icon}</span>
                      <div>
                        <p className={`text-xs font-medium ${isCurrentTier ? 'text-primary' : 'text-muted-foreground'}`}>
                          {t(tier.nameKey)}
                          {isCurrentTier && (
                            <Badge className="ms-2 bg-primary/20 text-primary border-0 text-[10px] px-1.5 py-0 h-3.5">
                              {t('status.active')}
                            </Badge>
                          )}
                          {isPastTier && (
                            <Check className="inline h-3 w-3 text-success ms-1" />
                          )}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{tier.minRefs}-{tier.maxRefs >= 999 ? '∞' : tier.maxRefs} {t('referral.referrals')}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isCurrentTier ? 'text-primary' : 'text-muted-foreground'}`}>
                      ${tier.reward} USDT
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Commission Rate */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{t('referral.commissionRate')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary">20%</p>
                <p className="text-[10px] text-muted-foreground">{t('referral.tradingFee')}</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-success">$10-40</p>
                <p className="text-[10px] text-muted-foreground">{t('referral.perReferral')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">{t('referral.howItWorks')}</h3>
            <div className="space-y-3">
              {howItWorksKeys.map((item, idx) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-background">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-foreground">{t(item.titleKey)}</p>
                    <p className="text-[10px] text-muted-foreground">{t(item.descKey)}</p>
                  </div>
                  {idx < howItWorksKeys.length - 1 && (
                    <div className="absolute start-6 top-9 w-px h-4 bg-secondary" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-foreground">{t('referral.history')}</h3>
              <span className="text-[10px] text-muted-foreground">{totalInvited} {t('referral.total')}</span>
            </div>
            <div className="space-y-1.5">
              {referralHistory.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                      {ref.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-foreground">{ref.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(ref.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ref.status === 'active' ? (
                      <>
                        <span className="text-xs text-success font-medium">+${ref.reward}</span>
                        <Badge className="bg-success/10 text-success border-0 text-[10px] px-1.5 py-0 h-4">
                          {t('status.active')}
                        </Badge>
                      </>
                    ) : (
                      <Badge className="bg-primary/10 text-primary border-0 text-[10px] px-1.5 py-0 h-4">
                        {t('status.pending')}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
