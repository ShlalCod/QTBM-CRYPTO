'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Clock,
  Users,
  Flame,
  Target,
  Zap,
  Medal,
  Star,
  Swords,
  Crown,
  MessageSquare,
  Rocket,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const challenges = [
  {
    id: 'spot-master',
    nameKey: 'tradeChallenge.spotMaster',
    descriptionKey: 'tradeChallenge.spotMasterDesc',
    reward: '$500',
    participants: 540,
    icon: Target,
    color: '#0ECB81',
  },
  {
    id: 'futures-sprint',
    nameKey: 'tradeChallenge.futuresSprint',
    descriptionKey: 'tradeChallenge.futuresSprintDesc',
    reward: '$1,000',
    participants: 312,
    icon: Zap,
    color: '#F6465D',
  },
  {
    id: 'social-trader',
    nameKey: 'tradeChallenge.socialTrader',
    descriptionKey: 'tradeChallenge.socialTraderDesc',
    reward: '$250',
    participants: 89,
    icon: MessageSquare,
    color: '#627EEA',
  },
  {
    id: 'newbie-quest',
    nameKey: 'tradeChallenge.newbieQuest',
    descriptionKey: 'tradeChallenge.newbieQuestDesc',
    reward: '$100',
    participants: 1205,
    icon: Rocket,
    color: '#F0B90B',
  },
];

const leaderboardData = [
  { rank: 1, name: 'CryptoKing_99', volume: '$2,450,000', avatar: '👑', medal: 'text-gold' },
  { rank: 2, name: 'TradeMaster_X', volume: '$1,890,000', avatar: '🥈', medal: 'text-muted-foreground' },
  { rank: 3, name: 'DiamondHands', volume: '$1,650,000', avatar: '🥉', medal: 'text-orange-700' },
  { rank: 4, name: 'WhaleAlert', volume: '$1,230,000', avatar: '🐋', medal: 'text-muted-foreground' },
  { rank: 5, name: 'MoonShot_42', volume: '$980,000', avatar: '🚀', medal: 'text-muted-foreground' },
];

const myChallenges = [
  { id: 'weekly-volume', nameKey: 'tradeChallenge.weeklyVolume', progress: 25, detail: '$12,450 / $50,000' },
  { id: 'newbie-quest', nameKey: 'tradeChallenge.newbieQuest', progress: 60, detail: '3/5' },
];

const pastChallenges = [
  { id: 'past-1', nameKey: 'tradeChallenge.decemberSprint', reward: '$50', won: true },
];

export default function TradeChallengeView() {
  const { goBack, isRTL } = useAppStore();
  const { t } = useTranslation();
  const { formatNum } = useLocaleFmt();
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, minutes: 22, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 23;
          days--;
        }
        if (days < 0) {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
          <h1 className="text-lg font-semibold text-foreground">{t('tradeChallenge.title')}</h1>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/10 border border-destructive/20">
            <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
            <span className="text-[10px] font-bold text-destructive">{t('status.live')}</span>
          </div>
        </div>

        {/* Active Challenge Banner */}
        <Card className="bg-card border-border overflow-hidden relative glass-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-destructive/5 to-success/5 animate-gradient-shift" style={{ backgroundSize: '200% 200%' }} />
          <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-primary via-destructive to-success" />
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">{t('tradeChallenge.weeklyVolume')}</span>
              </div>
              <Badge className="bg-destructive/10 text-destructive border-0 text-[10px] px-1.5 py-0 h-4 font-semibold">
                {t('tradeChallenge.active')}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{t('tradeChallenge.yourVolume')}: $12,450 / $50,000</span>
                <span className="text-xs font-semibold text-primary">25%</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-primary to-destructive"
                />
              </div>
            </div>

            {/* Time Remaining */}
            <div className="flex items-center gap-1.5 mb-3">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t('tradeChallenge.timeRemaining')}:</span>
              <div className="flex items-center gap-1">
                {[
                  { value: timeLeft.days, label: 'd' },
                  { value: timeLeft.hours, label: 'h' },
                  { value: timeLeft.minutes, label: 'm' },
                  { value: timeLeft.seconds, label: 's' },
                ].map((item, idx) => (
                  <span key={idx} className="flex items-center gap-0.5">
                    <span className="text-xs font-bold text-foreground bg-background/60 px-1.5 py-0.5 rounded">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Prize Pool & Rank */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-background/50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Crown className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] text-muted-foreground tracking-wider">{t('tradeChallenge.prizePool')}</span>
                </div>
                <p className="text-lg font-bold text-primary">$10,000</p>
                <p className="text-[10px] text-muted-foreground">USDT</p>
              </div>
              <div className="bg-background/50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground tracking-wider">{t('tradeChallenge.currentRank')}</span>
                </div>
                <p className="text-lg font-bold text-foreground">#156</p>
                <p className="text-[10px] text-muted-foreground">{t('tradeChallenge.ofParticipants', { count: '2,340' })}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenge List */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{t('tradeChallenge.availableChallenges')}</h3>
            </div>
            <div className="space-y-2">
              {challenges.map((challenge) => {
                const Icon = challenge.icon;
                return (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/40 hover:bg-background/60 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${challenge.color}15` }}
                      >
                        <Icon className="h-4 w-4" style={{ color: challenge.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{t(challenge.nameKey)}</p>
                        <p className="text-[10px] text-muted-foreground">{t(challenge.descriptionKey)}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-primary font-semibold">{t('tradeChallenge.win')} {challenge.reward}</span>
                          <span className="text-[10px] text-muted-foreground">• {formatNum(challenge.participants)} {t('tradeChallenge.participants')}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="gradient-yellow hover:opacity-90 text-background font-semibold h-7 px-3 text-[10px] press-scale shrink-0"
                    >
                      {t('tradeChallenge.join')}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* My Challenges */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-success" />
              <h3 className="text-sm font-medium text-foreground">{t('tradeChallenge.myChallenges')}</h3>
            </div>
            <div className="space-y-3">
              {myChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-background/40 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-foreground">{t(challenge.nameKey)}</p>
                    <span className="text-xs font-bold text-primary">{challenge.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${challenge.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-success"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{challenge.detail}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Preview */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Medal className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium text-foreground">{t('tradeChallenge.leaderboard')}</h3>
            </div>
            <div className="space-y-1.5">
              {leaderboardData.map((trader) => (
                <div
                  key={trader.rank}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/30"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`text-sm font-bold w-5 text-center ${
                      trader.rank === 1 ? 'text-gold' :
                      trader.rank === 2 ? 'text-muted-foreground' :
                      trader.rank === 3 ? 'text-orange-700' :
                      'text-muted-foreground'
                    }`}>
                      {trader.rank <= 3 ? (
                        trader.rank === 1 ? '🥇' : trader.rank === 2 ? '🥈' : '🥉'
                      ) : (
                        `#${trader.rank}`
                      )}
                    </span>
                    <span className="text-lg">{trader.avatar}</span>
                    <span className="text-xs text-foreground font-medium">{trader.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">{trader.volume}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Past Challenges */}
        <Card className="bg-card border-border glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-foreground">{t('tradeChallenge.pastChallenges')}</h3>
            </div>
            {pastChallenges.map((challenge) => (
              <div
                key={challenge.id}
                className="flex items-center justify-between p-3 rounded-xl bg-background/30"
              >
                <div>
                  <p className="text-xs font-semibold text-foreground">{t(challenge.nameKey)}</p>
                  <p className="text-[10px] text-muted-foreground">{t('tradeChallenge.completed')}</p>
                </div>
                {challenge.won && (
                  <Badge className="bg-success/10 text-success border-0 text-[10px] px-2 py-0 h-5 font-semibold">
                    {t('tradeChallenge.won')} {challenge.reward}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
