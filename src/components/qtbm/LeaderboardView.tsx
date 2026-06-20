'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '@/hooks/use-modal-a11y';
import {
  ArrowLeft,
  Trophy,
  Crown,
  Medal,
  Star,
  User,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  DollarSign,
  BarChart3,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Trader {
  rank: number;
  username: string;
  avatar: string;
  verified: boolean;
  pnlPercent: number;
  totalVolume: number;
  winRate: number;
  roi: number;
  trades: number;
  isYou?: boolean;
}

const mockTraders: Trader[] = [
  { rank: 1, username: 'CryptoKing99', avatar: '👑', verified: true, pnlPercent: 342.5, totalVolume: 5230000, winRate: 89, roi: 342, trades: 456 },
  { rank: 2, username: 'WhaleHunter', avatar: '🐋', verified: true, pnlPercent: 298.3, totalVolume: 4890000, winRate: 85, roi: 298, trades: 389 },
  { rank: 3, username: 'DiamondHands', avatar: '💎', verified: true, pnlPercent: 267.1, totalVolume: 4120000, winRate: 82, roi: 267, trades: 334 },
  { rank: 4, username: 'BullRunner', avatar: '🐂', verified: true, pnlPercent: 234.8, totalVolume: 3780000, winRate: 79, roi: 234, trades: 312 },
  { rank: 5, username: 'SatoshisDeciple', avatar: '⚡', verified: false, pnlPercent: 198.6, totalVolume: 3250000, winRate: 76, roi: 198, trades: 287 },
  { rank: 6, username: 'MoonShotTrader', avatar: '🚀', verified: true, pnlPercent: 176.4, totalVolume: 2980000, winRate: 74, roi: 176, trades: 265 },
  { rank: 7, username: 'ChainAnalyst', avatar: '🔗', verified: true, pnlPercent: 154.2, totalVolume: 2560000, winRate: 72, roi: 154, trades: 243 },
  { rank: 8, username: 'LeverageLord', avatar: '⚡', verified: false, pnlPercent: 143.8, totalVolume: 2340000, winRate: 70, roi: 143, trades: 221 },
  { rank: 9, username: 'DeFiMaster', avatar: '🏦', verified: true, pnlPercent: 132.5, totalVolume: 2120000, winRate: 68, roi: 132, trades: 198 },
  { rank: 10, username: 'BlockBoss', avatar: '🧱', verified: true, pnlPercent: 121.3, totalVolume: 1890000, winRate: 67, roi: 121, trades: 176 },
  { rank: 11, username: 'TokenTrader', avatar: '🎯', verified: false, pnlPercent: 110.7, totalVolume: 1650000, winRate: 65, roi: 110, trades: 156 },
  { rank: 12, username: 'AlphaSeeker', avatar: '🔍', verified: true, pnlPercent: 98.4, totalVolume: 1430000, winRate: 63, roi: 98, trades: 134 },
  { rank: 13, username: 'QuantTrader', avatar: '📊', verified: false, pnlPercent: 87.2, totalVolume: 1210000, winRate: 61, roi: 87, trades: 112 },
  { rank: 14, username: 'FutureCap', avatar: '🔮', verified: true, pnlPercent: 76.8, totalVolume: 980000, winRate: 59, roi: 76, trades: 98 },
  { rank: 15, username: 'HodlHero', avatar: '🦸', verified: false, pnlPercent: 65.3, totalVolume: 876000, winRate: 57, roi: 65, trades: 87 },
  { rank: 16, username: 'SwingKing', avatar: '🌴', verified: false, pnlPercent: 54.9, totalVolume: 765000, winRate: 55, roi: 54, trades: 76 },
  { rank: 17, username: 'CryptoNinja', avatar: '🥷', verified: true, pnlPercent: 43.6, totalVolume: 654000, winRate: 53, roi: 43, trades: 65 },
  { rank: 18, username: 'YourAccount', avatar: '👤', verified: true, pnlPercent: 32.1, totalVolume: 543000, winRate: 51, roi: 32, trades: 54, isYou: true },
  { rank: 19, username: 'TradeWiz', avatar: '🧙', verified: false, pnlPercent: 21.7, totalVolume: 432000, winRate: 49, roi: 21, trades: 43 },
  { rank: 20, username: 'CoinCatcher', avatar: '🪙', verified: false, pnlPercent: 12.3, totalVolume: 321000, winRate: 47, roi: 12, trades: 32 },
];

const rewardTiers = [
  { rank: '1st', reward: 25000, color: '#FFD700' },
  { rank: '2nd - 3rd', reward: 10000, color: '#C0C0C0' },
  { rank: '4th - 10th', reward: 5000, color: '#CD7F32' },
  { rank: '11th - 20th', reward: 2000, color: '#F0B90B' },
  { rank: '21st - 50th', reward: 500, color: '#848E9C' },
  { rank: '51st - 100th', reward: 100, color: '#5E6673' },
];

export default function LeaderboardView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'top' | 'myRank' | 'rewards'>('top');
  const [isJoined, setIsJoined] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const joinModalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: showJoinModal, onClose: () => setShowJoinModal(false), ref: joinModalRef });
  const [countdown, setCountdown] = useState({ days: 12, hours: 8, minutes: 34, seconds: 56 });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; days--; }
        if (days < 0) { days = 0; hours = 0; minutes = 0; seconds = 0; }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const yourRank = mockTraders.find(t => t.isYou);
  const nearbyTraders = mockTraders.filter(t => t.rank >= 15 && t.rank <= 21);

  const getPodiumBorder = (rank: number) => {
    if (rank === 1) return 'border-2 border-[#FFD700]/50 podium-glow-gold';
    if (rank === 2) return 'border-2 border-[#C0C0C0]/50 podium-glow-silver';
    if (rank === 3) return 'border-2 border-[#CD7F32]/50 podium-glow-bronze';
    return 'border-[#2B3139]';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-[#FFD700]" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-[#C0C0C0]" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-[#CD7F32]" />;
    return <span className="text-sm font-bold text-[#848E9C]">#{rank}</span>;
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  const totalPrizePool = rewardTiers.reduce((acc, tier) => acc + tier.reward, 0);

  return (
    <ScrollArea className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9 w-9"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-[#F0B90B]" />
            <h1 className="text-lg font-bold text-[#EAECEF]">{t('leaderboard.title')}</h1>
          </div>
        </div>

        {/* Competition Banner */}
        <Card className="bg-gradient-to-br from-[#1E2329] via-[#2B3139] to-[#1E2329] border-[#F0B90B]/20 mb-4 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0ECB81]/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-[#F0B90B]" />
              <span className="text-xs font-semibold text-[#F0B90B] uppercase tracking-wider">{t('leaderboard.competitionName')}</span>
            </div>
            <h2 className="text-xl font-bold text-[#EAECEF] mb-2">QTBM Trading Championship S1</h2>
            
            {/* Prize Pool */}
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-5 w-5 text-[#F0B90B]" />
              <div>
                <span className="text-[10px] text-[#848E9C]">{t('leaderboard.prizePool')}</span>
                <motion.p
                  className="text-2xl font-bold text-[#F0B90B]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  $100,000
                </motion.p>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex gap-2 mb-3">
              {[
                { label: t('leaderboard.days'), value: countdown.days },
                { label: t('leaderboard.hours'), value: countdown.hours },
                { label: t('leaderboard.minutes'), value: countdown.minutes },
                { label: t('leaderboard.seconds'), value: countdown.seconds },
              ].map(item => (
                <div key={item.label} className="flex-1 bg-[#0B0E11]/60 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-[#EAECEF] font-mono">{pad(item.value)}</p>
                  <p className="text-[9px] text-[#5E6673] uppercase">{item.label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-[#848E9C] mb-1">
                <span>{t('leaderboard.competitionProgress')}</span>
                <span>67%</span>
              </div>
              <div className="h-1.5 bg-[#0B0E11]/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#F0B90B] to-[#0ECB81]"
                  initial={{ width: 0 }}
                  animate={{ width: '67%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Join Button */}
            {!isJoined ? (
              <Button
                className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-10 text-sm shadow-md shadow-[#F0B90B]/20"
                onClick={() => setShowJoinModal(true)}
              >
                <Zap className="h-4 w-4 me-1.5" />
                {t('leaderboard.joinNow')}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-[#0ECB81]">
                <CheckCircle2 className="h-4 w-4" />
                <span className="font-medium">{t('leaderboard.joined')}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tab Selector */}
        <div className="flex bg-[#1E2329] rounded-lg p-1 mb-4">
          {([
            { id: 'top' as const, label: t('leaderboard.topTraders'), icon: Trophy },
            { id: 'myRank' as const, label: t('leaderboard.myRanking'), icon: User },
            { id: 'rewards' as const, label: t('leaderboard.rewards'), icon: Star },
          ]).map(tab => (
            <button
              key={tab.id}
              className={`flex-1 py-2 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                activeTab === tab.id
                  ? 'bg-[#2B3139] text-[#F0B90B]'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'top' && (
              <div>
                {/* Podium - Top 3 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {/* 2nd Place */}
                  <div className="flex flex-col items-center pt-6">
                    <Card className={`bg-[#1E2329]/80 backdrop-blur ${getPodiumBorder(2)} shadow-lg w-full`}>
                      <CardContent className="p-3 text-center">
                        <div className="text-3xl mb-1">{mockTraders[1].avatar}</div>
                        {getRankBadge(2)}
                        <p className="text-xs font-semibold text-[#EAECEF] mt-1 truncate">{mockTraders[1].username}</p>
                        <p className="text-sm font-bold text-[#0ECB81]">+{mockTraders[1].pnlPercent}%</p>
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-[#0ECB81] rank-up-arrow"><TrendingUp className="h-2.5 w-2.5" />2</span>
                      </CardContent>
                    </Card>
                  </div>
                  {/* 1st Place */}
                  <div className="flex flex-col items-center">
                    <Card className={`bg-[#1E2329]/80 backdrop-blur ${getPodiumBorder(1)} shadow-lg shadow-[#FFD700]/20 w-full`}>
                      <CardContent className="p-3 text-center">
                        <div className="text-4xl mb-1">{mockTraders[0].avatar}</div>
                        {getRankBadge(1)}
                        <p className="text-xs font-semibold text-[#EAECEF] mt-1 truncate">{mockTraders[0].username}</p>
                        <p className="text-base font-bold text-[#0ECB81]">+{mockTraders[0].pnlPercent}%</p>
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-[#0ECB81] rank-up-arrow"><TrendingUp className="h-2.5 w-2.5" />1</span>
                      </CardContent>
                    </Card>
                  </div>
                  {/* 3rd Place */}
                  <div className="flex flex-col items-center pt-8">
                    <Card className={`bg-[#1E2329]/80 backdrop-blur ${getPodiumBorder(3)} shadow-lg w-full`}>
                      <CardContent className="p-3 text-center">
                        <div className="text-3xl mb-1">{mockTraders[2].avatar}</div>
                        {getRankBadge(3)}
                        <p className="text-xs font-semibold text-[#EAECEF] mt-1 truncate">{mockTraders[2].username}</p>
                        <p className="text-sm font-bold text-[#0ECB81]">+{mockTraders[2].pnlPercent}%</p>
                        <span className="inline-flex items-center gap-0.5 text-[9px] text-[#0ECB81] rank-up-arrow"><TrendingUp className="h-2.5 w-2.5" />3</span>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Ranked List #4-#20 */}
                <div className="space-y-2">
                  {mockTraders.slice(3).map((trader, index) => (
                    <motion.div
                      key={trader.rank}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                    >
                      <Card className={`bg-[#1E2329]/80 backdrop-blur border-[#2B3139] ${trader.isYou ? 'border-[#F0B90B]/30 border-2' : ''}`}>
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            {/* Rank */}
                            <div className="w-7 text-center">
                              <span className={`text-sm font-bold ${trader.rank <= 3 ? 'text-[#F0B90B]' : 'text-[#848E9C]'}`}>
                                {trader.rank}
                              </span>
                            </div>
                            {/* Avatar */}
                            <div className="text-xl">{trader.avatar}</div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-[#EAECEF] truncate">{trader.username}</span>
                                {trader.verified && <CheckCircle2 className="h-3.5 w-3.5 text-[#0ECB81] shrink-0" />}
                                {trader.isYou && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-gradient-to-r from-[#F0B90B]/20 to-[#F0B90B]/10 text-[#F0B90B] font-semibold border border-[#F0B90B]/30">
                                    {t('leaderboard.you')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[10px] text-[#5E6673]">{t('leaderboard.volume')}: ${(trader.totalVolume / 1000000).toFixed(1)}M</span>
                                <span className="text-[10px] text-[#5E6673]">{t('leaderboard.winRate')}: {trader.winRate}%</span>
                              </div>
                            </div>
                            {/* PnL */}
                            <div className="text-end">
                              <p className="text-sm font-bold text-[#0ECB81]">+{trader.pnlPercent}%</p>
                              <p className="text-[10px] text-[#5E6673]">ROI: {trader.roi}%</p>
                            </div>
                          </div>
                          {/* PnL Progress Bar */}
                          <div className="mt-2 h-1 bg-[#2B3139] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-gradient-to-r from-[#0ECB81]/60 to-[#0ECB81]"
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, (trader.pnlPercent / 350) * 100)}%` }}
                              transition={{ duration: 0.8, delay: index * 0.03 }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'myRank' && yourRank && (
              <div>
                {/* Your Rank Card */}
                <Card className="bg-gradient-to-br from-[#1E2329] to-[#2B3139] border-[#F0B90B]/30 shadow-lg shadow-[#F0B90B]/5 mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#F0B90B]/3" />
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{yourRank.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#EAECEF]">{t('leaderboard.rank')} #{yourRank.rank}</span>
                          <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[10px]">{t('leaderboard.you')}</Badge>
                        </div>
                        <p className="text-sm text-[#848E9C]">{yourRank.username}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      {[
                        { label: t('leaderboard.pnl'), value: `+${yourRank.pnlPercent}%`, color: 'text-[#0ECB81]' },
                        { label: t('leaderboard.volume'), value: `$${(yourRank.totalVolume / 1000).toFixed(0)}K`, color: 'text-[#EAECEF]' },
                        { label: t('leaderboard.winRate'), value: `${yourRank.winRate}%`, color: 'text-[#F0B90B]' },
                        { label: 'ROI', value: `${yourRank.roi}%`, color: 'text-[#0ECB81]' },
                        { label: t('leaderboard.trades'), value: yourRank.trades.toString(), color: 'text-[#EAECEF]' },
                        { label: t('leaderboard.estimatedReward'), value: '$2,000', color: 'text-[#F0B90B]' },
                      ].map(stat => (
                        <div key={stat.label} className="bg-[#0B0E11]/40 rounded-lg p-2.5">
                          <p className="text-[10px] text-[#5E6673]">{stat.label}</p>
                          <p className={`text-base font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Progress to Next Tier */}
                <Card className="bg-[#1E2329]/80 backdrop-blur border-[#2B3139] mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-[#848E9C]">{t('leaderboard.progressToNextTier')}</span>
                      <span className="text-xs text-[#F0B90B]">#{yourRank.rank} → #{yourRank.rank - 1}</span>
                    </div>
                    <div className="h-2 bg-[#2B3139] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#F0B90B] to-[#0ECB81]"
                        initial={{ width: 0 }}
                        animate={{ width: '73%' }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <p className="text-[10px] text-[#5E6673] mt-1.5">
                      {t('leaderboard.needMorePnl')} +{(mockTraders[yourRank.rank - 2].pnlPercent - yourRank.pnlPercent).toFixed(1)}% {t('leaderboard.toReach')} #{yourRank.rank - 1}
                    </p>
                  </CardContent>
                </Card>

                {/* Nearby Competitors */}
                <h3 className="text-xs font-semibold text-[#5E6673] uppercase tracking-wider mb-2">{t('leaderboard.nearbyCompetitors')}</h3>
                <div className="space-y-2">
                  {nearbyTraders.map(trader => (
                    <Card
                      key={trader.rank}
                      className={`bg-[#1E2329]/80 backdrop-blur border-[#2B3139] ${trader.isYou ? 'border-[#F0B90B]/30' : ''}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#848E9C] w-7 text-center">#{trader.rank}</span>
                          <span className="text-lg">{trader.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm font-semibold text-[#EAECEF] truncate">{trader.username}</span>
                              {trader.isYou && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#F0B90B]/10 text-[#F0B90B]">{t('leaderboard.you')}</span>}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-[#0ECB81]">+{trader.pnlPercent}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div>
                {/* Reward Distribution Visualization */}
                <Card className="bg-[#1E2329]/80 backdrop-blur border-[#2B3139] mb-4">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold text-[#EAECEF] mb-3">{t('leaderboard.rewardDistribution')}</h3>
                    <div className="flex items-end justify-center gap-3 h-40 mb-3">
                      {rewardTiers.map((tier, i) => {
                        const maxReward = 25000;
                        const heightPercent = (tier.reward / maxReward) * 100;
                        return (
                          <div key={tier.rank} className="flex flex-col items-center gap-1 flex-1">
                            <span className="text-[9px] text-[#848E9C] font-mono">${(tier.reward / 1000).toFixed(0)}K</span>
                            <motion.div
                              className="w-full rounded-t-md"
                              style={{ backgroundColor: tier.color + '40', borderBottom: `2px solid ${tier.color}` }}
                              initial={{ height: 0 }}
                              animate={{ height: `${heightPercent}%` }}
                              transition={{ duration: 0.6, delay: i * 0.1 }}
                            />
                            <span className="text-[8px] text-[#5E6673] text-center leading-tight">{tier.rank}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Reward Tiers Table */}
                <Card className="bg-[#1E2329]/80 backdrop-blur border-[#2B3139] mb-4">
                  <CardContent className="p-0">
                    <div className="p-3 border-b border-[#2B3139]">
                      <h3 className="text-sm font-semibold text-[#EAECEF]">{t('leaderboard.rewardTiers')}</h3>
                    </div>
                    {rewardTiers.map((tier, i) => (
                      <div key={tier.rank} className="flex items-center justify-between px-4 py-3 border-b border-[#2B3139]/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }} />
                          <span className="text-sm text-[#EAECEF]">{tier.rank}</span>
                        </div>
                        <span className="text-sm font-semibold text-[#F0B90B]">${tier.reward.toLocaleString()}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Your Estimated Reward */}
                {yourRank && (
                  <Card className="bg-gradient-to-r from-[#1E2329] to-[#2B3139] border-[#F0B90B]/20 mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-[#848E9C]">{t('leaderboard.yourEstimatedReward')}</p>
                          <p className="text-2xl font-bold text-[#F0B90B]">$2,000</p>
                          <p className="text-[10px] text-[#5E6673]">{t('leaderboard.basedOnRank')} #{yourRank.rank}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-[#F0B90B]/10 flex items-center justify-center">
                          <Star className="h-6 w-6 text-[#F0B90B]" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      {/* Join Competition Modal */}
      <AnimatePresence>
        {showJoinModal && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowJoinModal(false)}
          >
            <motion.div
              ref={joinModalRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('leaderboard.joinCompetition')}
              className="w-full max-w-sm bg-[#1E2329] border border-[#2B3139] rounded-2xl overflow-hidden gradient-border-modal"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#F0B90B]/10 flex items-center justify-center">
                  <Trophy className="h-8 w-8 text-[#F0B90B]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#EAECEF]">{t('leaderboard.joinCompetition')}</h3>
                  <p className="text-xs text-[#848E9C] mt-1">{t('leaderboard.joinDesc')}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                    <DollarSign className="h-5 w-5 text-[#F0B90B] mx-auto mb-1" />
                    <p className="text-sm font-bold text-[#F0B90B]">$100,000</p>
                    <p className="text-[9px] text-[#5E6673]">{t('leaderboard.prizePool')}</p>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                    <Users className="h-5 w-5 text-[#0ECB81] mx-auto mb-1" />
                    <p className="text-sm font-bold text-[#0ECB81]">1,247</p>
                    <p className="text-[9px] text-[#5E6673]">{t('leaderboard.participants')}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-[#2B3139] text-[#848E9C] hover:bg-[#2B3139] hover:text-[#EAECEF]"
                    onClick={() => setShowJoinModal(false)}
                  >
                    {t('actions.cancel')}
                  </Button>
                  <Button
                    className="flex-1 gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold shadow-md shadow-[#F0B90B]/20"
                    onClick={() => {
                      setIsJoined(true);
                      setShowJoinModal(false);
                    }}
                  >
                    <Zap className="h-4 w-4 me-1" />
                    {t('leaderboard.confirmJoin')}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
