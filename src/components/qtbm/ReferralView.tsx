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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const referralCode = 'QTBM-7X9K2M';
const referralLink = 'https://qtbm.bank/invite/QTBM-7X9K2M';

const rewardTiers = [
  { name: 'Bronze', minRefs: 1, maxRefs: 5, reward: 10, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', minRefs: 6, maxRefs: 20, reward: 15, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold', minRefs: 21, maxRefs: 50, reward: 25, color: '#FFD700', icon: '🥇' },
  { name: 'Diamond', minRefs: 51, maxRefs: 999, reward: 40, color: '#B9F2FF', icon: '💎' },
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

const currentTier = rewardTiers.find(
  (tier) => totalInvited >= tier.minRefs && totalInvited <= tier.maxRefs
) || rewardTiers[0];
const nextTier = rewardTiers.find(
  (tier) => tier.minRefs > totalInvited
);

const howItWorks = [
  { step: 1, title: 'Share your link', desc: 'Send your unique referral link to friends' },
  { step: 2, title: 'They register', desc: 'Your friend signs up using your link' },
  { step: 3, title: 'They trade', desc: 'Your friend completes their first trade' },
  { step: 4, title: 'You earn', desc: 'Both you and your friend receive rewards' },
];

export default function ReferralView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
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
          <h1 className="text-lg font-semibold text-[#EAECEF]">{t('referral.title')}</h1>
        </div>

        {/* Animated Rewards Card */}
        <Card className="bg-[#1E2329] border-[#2B3139] overflow-hidden relative glass-card">
          <div className="absolute inset-0 bg-gradient-to-br from-[#F0B90B]/10 via-transparent to-[#0ECB81]/5 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#F0B90B] via-[#0ECB81] to-[#F0B90B]" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="h-5 w-5 text-[#F0B90B]" />
              <h2 className="text-base font-semibold text-[#EAECEF]">{t('referral.earnRewards')}</h2>
            </div>

            {/* Referral Code */}
            <div className="bg-[#0B0E11]/50 rounded-xl p-4 mb-4">
              <p className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium mb-2">{t('referral.yourCode')}</p>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-[#F0B90B] tracking-wider">{referralCode}</span>
                <Button
                  size="sm"
                  className={`h-8 px-3 text-xs font-medium transition-all ${
                    copied
                      ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white'
                      : 'bg-[#2B3139] hover:bg-[#3B4451] text-[#EAECEF]'
                  }`}
                  onClick={handleCopyCode}
                >
                  {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                  {copied ? t('actions.copy') + '!' : t('actions.copy')}
                </Button>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="flex justify-center mb-4">
              <div className="w-28 h-28 bg-white rounded-xl flex items-center justify-center">
                <QrCode className="h-20 w-20 text-[#0B0E11]" />
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#0B0E11]/50 hover:bg-[#2B3139] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#2B3139] flex items-center justify-center">
                  {copiedLink ? <Check className="h-4 w-4 text-[#0ECB81]" /> : <Copy className="h-4 w-4 text-[#848E9C]" />}
                </div>
                <span className="text-[9px] text-[#848E9C]">{t('referral.copyLink')}</span>
              </button>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent('Join QTBM BANK and earn crypto rewards!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#0B0E11]/50 hover:bg-[#2B3139] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#229ED9]/20 flex items-center justify-center text-sm font-bold text-[#229ED9]">T</div>
                <span className="text-[9px] text-[#848E9C]">Telegram</span>
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent('Join QTBM BANK and earn crypto rewards! ' + referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#0B0E11]/50 hover:bg-[#2B3139] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/20 flex items-center justify-center text-sm font-bold text-[#25D366]">W</div>
                <span className="text-[9px] text-[#848E9C]">WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Join QTBM BANK and earn crypto rewards!')}&url=${encodeURIComponent(referralLink)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-[#0B0E11]/50 hover:bg-[#2B3139] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#EAECEF]/10 flex items-center justify-center text-sm font-bold text-[#EAECEF]">X</div>
                <span className="text-[9px] text-[#848E9C]">Twitter</span>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-3 text-center">
              <Users className="h-4 w-4 text-[#F0B90B] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#EAECEF]">{totalInvited}</p>
              <p className="text-[9px] text-[#5E6673]">{t('referral.totalInvited')}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-4 w-4 text-[#0ECB81] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#EAECEF]">{activeReferrals}</p>
              <p className="text-[9px] text-[#5E6673]">{t('referral.activeReferrals')}</p>
            </CardContent>
          </Card>
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-3 text-center">
              <Trophy className="h-4 w-4 text-[#F0B90B] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#EAECEF]">${totalEarned}</p>
              <p className="text-[9px] text-[#5E6673]">{t('referral.totalEarned')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Reward Tiers */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Medal className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('referral.rewardTiers')}</h3>
            </div>

            {/* Current Tier Progress */}
            <div className="bg-[#0B0E11]/50 rounded-xl p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{currentTier.icon}</span>
                  <span className="text-xs font-medium text-[#EAECEF]">{currentTier.name}</span>
                </div>
                {nextTier && (
                  <div className="flex items-center gap-1 text-[10px] text-[#5E6673]">
                    <span>{nextTier.icon}</span>
                    <span>{t('referral.next')}: {nextTier.name}</span>
                  </div>
                )}
              </div>
              <div className="w-full h-2 bg-[#2B3139] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-[#F0B90B] to-[#0ECB81]"
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[9px] text-[#5E6673]">{totalInvited} {t('referral.referrals')}</span>
                {nextTier && (
                  <span className="text-[9px] text-[#5E6673]">{nextTier.minRefs - 1} {t('referral.referrals')}</span>
                )}
              </div>
            </div>

            {/* Tier Cards */}
            <div className="space-y-2">
              {rewardTiers.map((tier) => {
                const isCurrentTier = tier.name === currentTier.name;
                const isPastTier = totalInvited > tier.maxRefs;
                return (
                  <div
                    key={tier.name}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                      isCurrentTier
                        ? 'bg-[#F0B90B]/10 border border-[#F0B90B]/20'
                        : 'bg-[#0B0E11]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{tier.icon}</span>
                      <div>
                        <p className={`text-xs font-medium ${isCurrentTier ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`}>
                          {tier.name}
                          {isCurrentTier && (
                            <Badge className="ml-2 bg-[#F0B90B]/20 text-[#F0B90B] border-0 text-[8px] px-1.5 py-0 h-3.5">
                              {t('status.active')}
                            </Badge>
                          )}
                          {isPastTier && (
                            <Check className="inline h-3 w-3 text-[#0ECB81] ml-1" />
                          )}
                        </p>
                        <p className="text-[9px] text-[#5E6673]">{tier.minRefs}-{tier.maxRefs >= 999 ? '∞' : tier.maxRefs} {t('referral.referrals')}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isCurrentTier ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`}>
                      ${tier.reward} USDT
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Commission Rate */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('referral.commissionRate')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0B0E11]/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#F0B90B]">20%</p>
                <p className="text-[9px] text-[#5E6673]">{t('referral.tradingFee')}</p>
              </div>
              <div className="bg-[#0B0E11]/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-[#0ECB81]">$10-40</p>
                <p className="text-[9px] text-[#5E6673]">{t('referral.perReferral')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-[#EAECEF] mb-3">{t('referral.howItWorks')}</h3>
            <div className="space-y-3">
              {howItWorks.map((item, idx) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[#F0B90B] to-[#F0B90B]/60 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#0B0E11]">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#EAECEF]">{item.title}</p>
                    <p className="text-[10px] text-[#5E6673]">{item.desc}</p>
                  </div>
                  {idx < howItWorks.length - 1 && (
                    <div className="absolute left-6 top-9 w-px h-4 bg-[#2B3139]" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-[#EAECEF]">{t('referral.history')}</h3>
              <span className="text-[10px] text-[#5E6673]">{totalInvited} {t('referral.total')}</span>
            </div>
            <div className="space-y-1.5">
              {referralHistory.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#0B0E11]/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#2B3139] flex items-center justify-center text-[10px] font-bold text-[#848E9C]">
                      {ref.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-[#EAECEF]">{ref.name}</p>
                      <p className="text-[9px] text-[#5E6673]">{ref.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ref.status === 'active' ? (
                      <>
                        <span className="text-xs text-[#0ECB81] font-medium">+${ref.reward}</span>
                        <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[8px] px-1.5 py-0 h-4">
                          {t('status.active')}
                        </Badge>
                      </>
                    ) : (
                      <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[8px] px-1.5 py-0 h-4">
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
