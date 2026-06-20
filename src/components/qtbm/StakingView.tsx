'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '@/hooks/use-modal-a11y';
import {
  ArrowLeft,
  Coins,
  TrendingUp,
  Clock,
  Award,
  Calculator,
  Star,
  Lock,
  Unlock,
  ChevronRight,
  X,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

// ── Types ────────────────────────────────────────────────────────────────────
type StakingTab = 'active' | 'available' | 'history';

interface ActivePosition {
  asset: string;
  icon: string;
  amount: number;
  apy: number;
  rewardsEarned: number;
  rewardsUsd: number;
  totalDays: number;
  daysRemaining: number;
}

interface AvailableAsset {
  asset: string;
  icon: string;
  maxAmount: number;
  baseApy: number;
  lockPeriods: number[];
  minAmount: number;
}

interface RewardEntry {
  id: string;
  date: string;
  asset: string;
  amount: string;
  usdValue: string;
  type: 'Staking Reward' | 'Auto-compound';
}

interface StakingHistoryEntry {
  id: string;
  date: string;
  asset: string;
  icon: string;
  type: 'Stake' | 'Unstake' | 'Claim Reward';
  amount: string;
  status: 'Completed' | 'Pending' | 'Unbonding';
  lockPeriod: string;
}

// ── Mock Data ────────────────────────────────────────────────────────────────
const activePositions: ActivePosition[] = [
  { asset: 'ETH', icon: '⟠', amount: 2.5, apy: 5.2, rewardsEarned: 0.08, rewardsUsd: 272, totalDays: 90, daysRemaining: 45 },
  { asset: 'SOL', icon: '◎', amount: 50, apy: 7.8, rewardsEarned: 2.1, rewardsUsd: 367, totalDays: 60, daysRemaining: 30 },
  { asset: 'BNB', icon: '◆', amount: 15, apy: 12.5, rewardsEarned: 0.45, rewardsUsd: 269, totalDays: 90, daysRemaining: 60 },
  { asset: 'ADA', icon: '₳', amount: 5000, apy: 4.2, rewardsEarned: 52, rewardsUsd: 21, totalDays: 180, daysRemaining: 90 },
];

const availableAssets: AvailableAsset[] = [
  { asset: 'BTC', icon: '₿', maxAmount: 0.5, baseApy: 3.2, lockPeriods: [30, 60, 90, 120], minAmount: 0.01 },
  { asset: 'ETH', icon: '⟠', maxAmount: 2.5, baseApy: 5.2, lockPeriods: [30, 60, 90, 120], minAmount: 0.1 },
  { asset: 'SOL', icon: '◎', maxAmount: 50, baseApy: 7.8, lockPeriods: [30, 60, 90, 120], minAmount: 1 },
  { asset: 'DOT', icon: '●', maxAmount: 200, baseApy: 14.2, lockPeriods: [30, 60, 90, 120], minAmount: 5 },
  { asset: 'AVAX', icon: '▲', maxAmount: 100, baseApy: 9.5, lockPeriods: [30, 60, 90, 120], minAmount: 0.5 },
  { asset: 'ATOM', icon: '⚛', maxAmount: 300, baseApy: 21.5, lockPeriods: [30, 60, 90, 120], minAmount: 1 },
];

const rewardsHistory: RewardEntry[] = Array.from({ length: 10 }, (_, i) => ({
  id: String(i + 1),
  date: new Date(Date.now() - (i + 1) * 3600000 * (6 + i)).toISOString(),
  asset: ['ETH', 'SOL', 'BNB', 'ADA', 'DOT', 'AVAX', 'ATOM', 'BTC', 'ETH', 'SOL'][i],
  amount: ['0.0032', '0.84', '0.018', '5.2', '2.1', '0.45', '1.3', '0.00015', '0.0041', '0.92'][i],
  usdValue: ['$10.88', '$147', '$10.77', '$2.18', '$12.60', '$16.20', '$31.20', '$14.25', '$13.94', '$161'][i],
  type: (i % 3 === 0 ? 'Auto-compound' : 'Staking Reward') as 'Staking Reward' | 'Auto-compound',
}));

const stakingHistoryData: StakingHistoryEntry[] = [
  { id: 'h1', date: '2025-03-01', asset: 'ETH', icon: '⟠', type: 'Stake', amount: '2.5 ETH', status: 'Completed', lockPeriod: '90 days' },
  { id: 'h2', date: '2025-02-28', asset: 'SOL', icon: '◎', type: 'Stake', amount: '50 SOL', status: 'Completed', lockPeriod: '60 days' },
  { id: 'h3', date: '2025-02-27', asset: 'BNB', icon: '◆', type: 'Claim Reward', amount: '0.018 BNB', status: 'Completed', lockPeriod: '-' },
  { id: 'h4', date: '2025-02-25', asset: 'DOT', icon: '●', type: 'Stake', amount: '100 DOT', status: 'Completed', lockPeriod: '120 days' },
  { id: 'h5', date: '2025-02-20', asset: 'ADA', icon: '₳', type: 'Unstake', amount: '3000 ADA', status: 'Unbonding', lockPeriod: '14 days remaining' },
  { id: 'h6', date: '2025-02-18', asset: 'AVAX', icon: '▲', type: 'Stake', amount: '25 AVAX', status: 'Completed', lockPeriod: '90 days' },
  { id: 'h7', date: '2025-02-15', asset: 'ATOM', icon: '⚛', type: 'Claim Reward', amount: '5.4 ATOM', status: 'Completed', lockPeriod: '-' },
  { id: 'h8', date: '2025-02-10', asset: 'BTC', icon: '₿', type: 'Stake', amount: '0.1 BTC', status: 'Pending', lockPeriod: '30 days' },
];

// ── Helper ───────────────────────────────────────────────────────────────────
function getApyForLockPeriod(baseApy: number, lockDays: number): number {
  const multiplier = lockDays === 30 ? 1 : lockDays === 60 ? 1.15 : lockDays === 90 ? 1.3 : 1.45;
  return parseFloat((baseApy * multiplier).toFixed(1));
}

// ── Unstake Modal ────────────────────────────────────────────────────────────
function UnstakeModal({
  position,
  onClose,
  onConfirm,
  t,
}: {
  position: ActivePosition;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}) {
  const [cooldown, setCooldown] = useState(5);
  const [confirmed, setConfirmed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: true, onClose, ref: modalRef });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('staking.unstake')}
        className="w-full max-w-sm bg-[#1E2329] border border-[#2B3139] rounded-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
          <h3 className="text-base font-semibold text-[#EAECEF]">{t('staking.unstake')}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#848E9C] hover:text-[#EAECEF]" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {confirmed ? (
            <motion.div
              className="flex flex-col items-center py-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 className="h-12 w-12 text-[#0ECB81] mb-3" />
              <p className="text-lg font-semibold text-[#0ECB81]">{t('staking.unstakeSuccess')}</p>
              <p className="text-xs text-[#848E9C] mt-1">{t('staking.unstakeNote')}</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-[#0B0E11]/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center text-lg">{position.icon}</div>
                <div>
                  <p className="text-sm font-semibold text-[#EAECEF]">{position.amount} {position.asset}</p>
                  <p className="text-xs text-[#848E9C]">{position.apy}% APY</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-[#F6465D]/5 border border-[#F6465D]/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-[#F6465D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#F6465D] font-medium">{t('staking.unstakeWarning')}</p>
                  <p className="text-[10px] text-[#848E9C] mt-1">{t('staking.unstakeCooldown')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                  <p className="text-[10px] text-[#5E6673]">{t('staking.rewards')}</p>
                  <p className="text-sm font-semibold text-[#0ECB81]">+{position.rewardsEarned} {position.asset}</p>
                </div>
                <div className="bg-[#0B0E11]/50 rounded-lg p-3">
                  <p className="text-[10px] text-[#5E6673]">{t('staking.lockPeriod')}</p>
                  <p className="text-sm font-semibold text-[#EAECEF]">{position.daysRemaining}d {t('staking.remaining')}</p>
                </div>
              </div>

              <Button
                className="w-full gradient-red hover:opacity-90 text-white font-semibold h-11"
                disabled={cooldown > 0}
                onClick={handleConfirm}
              >
                {cooldown > 0 ? (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {t('staking.confirmUnstake')} ({cooldown}s)
                  </span>
                ) : (
                  t('staking.confirmUnstake')
                )}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Stake Dialog ─────────────────────────────────────────────────────────────
function StakeDialog({
  asset,
  icon,
  apy,
  minAmount,
  onClose,
  onConfirm,
  t,
}: {
  asset: string;
  icon: string;
  apy: number;
  minAmount: number;
  onClose: () => void;
  onConfirm: () => void;
  t: (key: string) => string;
}) {
  const [amount, setAmount] = useState('');
  const [lockDays, setLockDays] = useState(30);
  const [confirmed, setConfirmed] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: true, onClose, ref: modalRef });
  const effectiveApy = getApyForLockPeriod(apy, lockDays);
  const numAmount = parseFloat(amount) || 0;
  const dailyReward = numAmount * (effectiveApy / 100) / 365;
  const weeklyReward = dailyReward * 7;
  const monthlyReward = dailyReward * 30;
  const yearlyReward = numAmount * (effectiveApy / 100);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onConfirm();
    }, 1500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('staking.stakeNow')}
        className="w-full max-w-sm bg-[#1E2329] border border-[#2B3139] rounded-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#2B3139]">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-[#F0B90B]" />
            <h3 className="text-base font-semibold text-[#EAECEF]">{t('staking.stakeNow')}</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-[#848E9C] hover:text-[#EAECEF]" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {confirmed ? (
            <motion.div
              className="flex flex-col items-center py-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle2 className="h-12 w-12 text-[#0ECB81] mb-3" />
              <p className="text-lg font-semibold text-[#0ECB81]">{t('staking.stakeSuccess')}</p>
              <p className="text-xs text-[#848E9C] mt-1">{numAmount} {asset} {t('staking.staked')}</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-center gap-3 p-3 bg-[#0B0E11]/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center text-lg">{icon}</div>
                <div>
                  <p className="text-sm font-semibold text-[#EAECEF]">{asset}</p>
                  <Badge className="text-[9px] border-0 h-4 px-1.5 bg-[#0ECB81]/10 text-[#0ECB81] font-semibold">
                    {effectiveApy}% APY
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#5E6673] mb-1 block">{t('staking.stakeAmount')}</label>
                <div className="relative">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] h-11 text-base focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 pe-16"
                    placeholder={`${t('staking.min')} ${minAmount}`}
                  />
                  <span className="absolute end-3 top-1/2 -translate-y-1/2 text-xs text-[#848E9C] font-medium">{asset}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#5E6673] mb-1 block">{t('staking.lockPeriod')}</label>
                <div className="flex gap-1 bg-[#0B0E11]/50 rounded-lg p-1">
                  {[30, 60, 90, 120].map((d) => (
                    <button
                      key={d}
                      onClick={() => setLockDays(d)}
                      className={cn(
                        'flex-1 py-2 text-xs font-medium rounded-md transition-all',
                        lockDays === d ? 'bg-[#F0B90B] text-[#0B0E11] shadow-sm' : 'text-[#848E9C] hover:text-[#EAECEF]'
                      )}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              </div>

              {numAmount > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#0B0E11]/50 rounded-lg p-2.5 text-center">
                    <p className="text-[9px] text-[#5E6673]">{t('staking.daily')}</p>
                    <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+{dailyReward.toFixed(4)}</p>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-2.5 text-center">
                    <p className="text-[9px] text-[#5E6673]">{t('staking.weekly')}</p>
                    <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+{weeklyReward.toFixed(4)}</p>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-2.5 text-center">
                    <p className="text-[9px] text-[#5E6673]">{t('staking.monthly')}</p>
                    <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+{monthlyReward.toFixed(4)}</p>
                  </div>
                  <div className="bg-[#0B0E11]/50 rounded-lg p-2.5 text-center">
                    <p className="text-[9px] text-[#5E6673]">{t('staking.yearly')}</p>
                    <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+{yearlyReward.toFixed(4)}</p>
                  </div>
                </div>
              )}

              <Button
                className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-11 shadow-md shadow-[#F0B90B]/20"
                onClick={handleConfirm}
                disabled={numAmount < minAmount}
              >
                <Lock className="h-4 w-4 me-1.5" />
                {t('staking.confirmStake')}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Sub-Components ───────────────────────────────────────────────────────────

function StakingOverviewCard({ t, autoCompound }: { t: (key: string) => string; autoCompound: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 34, s: 12 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="glass-card rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 rounded-xl gradient-border pointer-events-none" />
      <CardContent className="relative p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Coins className="h-3.5 w-3.5 text-[#F0B90B]" />
              <span className="text-[10px] text-[#848E9C] uppercase tracking-wider font-medium">
                {t('staking.totalStaked')}
              </span>
            </div>
            <p className="text-xl font-bold text-[#EAECEF] tabular-nums">$12,450.00</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Award className="h-3.5 w-3.5 text-[#0ECB81]" />
              <span className="text-[10px] text-[#848E9C] uppercase tracking-wider font-medium">
                {t('staking.totalRewards')}
              </span>
            </div>
            <p className="text-xl font-bold text-[#0ECB81] tabular-nums">$342.50</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-3.5 w-3.5 text-[#F0B90B]" />
              <span className="text-[10px] text-[#848E9C] uppercase tracking-wider font-medium">
                {t('staking.averageApy')}
              </span>
            </div>
            <p className="text-xl font-bold text-[#F0B90B] tabular-nums">8.5%</p>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-[#0ECB81]" />
              <span className="text-[10px] text-[#848E9C] uppercase tracking-wider font-medium">
                {t('staking.nextReward')}
              </span>
            </div>
            <p className="text-xl font-bold text-[#EAECEF] tabular-nums">
              {timeLeft.h}h {String(timeLeft.m).padStart(2, '0')}m
            </p>
            <p className="text-[9px] text-[#5E6673] tabular-nums">
              {String(timeLeft.s).padStart(2, '0')}s
            </p>
          </div>
        </div>

        {/* Auto-Compound Status */}
        <div className="mt-4 flex items-center justify-between p-3 bg-[#0B0E11]/40 rounded-lg border border-[#2B3139]/50">
          <div className="flex items-center gap-2">
            <RotateCcw className={`h-4 w-4 ${autoCompound ? 'text-[#0ECB81]' : 'text-[#5E6673]'}`} />
            <div>
              <p className="text-xs font-medium text-[#EAECEF]">{t('staking.autoCompound')}</p>
              <p className="text-[9px] text-[#5E6673]">{t('staking.autoCompoundDesc')}</p>
            </div>
          </div>
          <Badge className={`text-[9px] border-0 h-5 px-1.5 ${autoCompound ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#5E6673]/10 text-[#5E6673]'}`}>
            {autoCompound ? t('status.active') : t('status.inactive')}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveStakingTab({
  positions,
  t,
  onUnstake,
  onStakeNow,
}: {
  positions: ActivePosition[];
  t: (key: string) => string;
  onUnstake: (pos: ActivePosition) => void;
  onStakeNow: (asset: AvailableAsset) => void;
}) {
  return (
    <div className="space-y-3">
      {positions.map((pos, idx) => {
        const progress = ((pos.totalDays - pos.daysRemaining) / pos.totalDays) * 100;
        return (
          <motion.div
            key={pos.asset}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
          >
            <Card className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/15 transition-all hover-lift">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center text-lg">
                      {pos.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#EAECEF]">{pos.amount} {pos.asset}</span>
                        <Badge className="text-[9px] border-0 h-4 px-1.5 bg-[#0ECB81]/10 text-[#0ECB81] font-semibold">
                          {pos.apy}% APY
                        </Badge>
                      </div>
                      <span className="text-[10px] text-[#5E6673]">{t('staking.stake')} &middot; {pos.totalDays}d {t('staking.dLock')}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#F6465D]/30 text-[#F6465D] hover:bg-[#F6465D]/10 hover:border-[#F6465D]/50 text-[11px] h-7 px-3 press-scale"
                    onClick={() => onUnstake(pos)}
                  >
                    {t('staking.unstake')}
                  </Button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[10px] text-[#5E6673]">{t('staking.rewards')}</p>
                    <p className="text-sm font-semibold text-[#0ECB81] tabular-nums">
                      +{pos.rewardsEarned} {pos.asset}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="text-[10px] text-[#5E6673]">{t('staking.usdEquivalent')}</p>
                    <p className="text-sm font-medium text-[#EAECEF] tabular-nums">${pos.rewardsUsd}</p>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-[#5E6673]">{pos.daysRemaining} {t('staking.days')} {t('staking.remaining')}</span>
                    <span className="text-[#848E9C]">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                    <div
                      className="apy-progress-bar"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {/* Stake Now Button */}
      <Button
        className="w-full gradient-yellow hover:opacity-90 text-[#0B0E11] font-semibold h-11 shadow-md shadow-[#F0B90B]/20"
        onClick={() => onStakeNow(availableAssets[1])}
      >
        <Lock className="h-4 w-4 me-1.5" />
        {t('staking.stakeNow')}
      </Button>
    </div>
  );
}

function AvailableStakeTab({
  assets,
  t,
  onStakeNow,
}: {
  assets: AvailableAsset[];
  t: (key: string) => string;
  onStakeNow: (asset: AvailableAsset) => void;
}) {
  const [lockPeriod, setLockPeriod] = useState(30);
  const lockTabs = [30, 60, 90, 120];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-[#1E2329] rounded-lg p-1">
        {lockTabs.map((days) => (
          <button
            key={days}
            onClick={() => setLockPeriod(days)}
            className={cn(
              'flex-1 py-2 text-xs font-medium rounded-md transition-all duration-200',
              lockPeriod === days
                ? 'bg-[#2B3139] text-[#F0B90B] shadow-sm'
                : 'text-[#848E9C] hover:text-[#EAECEF]'
            )}
          >
            {days}d
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {assets.map((asset, idx) => {
          const effectiveApy = getApyForLockPeriod(asset.baseApy, lockPeriod);
          const isHot = effectiveApy >= 10;
          return (
            <motion.div
              key={asset.asset}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
            >
              <Card className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/15 transition-all hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center text-lg">
                        {asset.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#EAECEF]">{asset.asset}</span>
                          <Badge className="text-[9px] border-0 h-4 px-1.5 bg-[#0ECB81]/10 text-[#0ECB81] font-semibold">
                            {effectiveApy}% APY
                          </Badge>
                          {isHot && (
                            <Badge className="text-[8px] border-0 h-4 px-1.5 bg-[#F6465D]/15 text-[#F6465D] hot-badge font-bold">
                              {t('staking.popular')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-[#5E6673]">
                          {t('staking.upTo')} {asset.maxAmount} {asset.asset} &middot; {t('staking.min')} {asset.minAmount} {asset.asset}
                        </p>
                      </div>
                    </div>
                    <Button
                      className="gradient-yellow hover:opacity-90 text-[#0B0E11] text-xs h-8 px-4 font-semibold press-scale"
                      onClick={() => onStakeNow(asset)}
                    >
                      {t('staking.stake')}
                    </Button>
                  </div>

                  <div>
                    <div className="flex justify-between text-[9px] text-[#5E6673] mb-1">
                      <span>{t('staking.apyLevel')}</span>
                      <span className="text-[#0ECB81]">{Math.round(Math.min(effectiveApy / 25 * 100, 100))}%</span>
                    </div>
                    <div className="h-1 bg-[#2B3139] rounded-full overflow-hidden">
                      <div
                        className="apy-progress-bar"
                        style={{ width: `${Math.min(effectiveApy / 25 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RewardsHistoryTab({ t }: { t: (key: string) => string }) {
  return (
    <div className="space-y-0">
      <div className="grid grid-cols-5 gap-2 px-3 py-2 text-[9px] text-[#5E6673] uppercase tracking-wider font-semibold">
        <span>{t('staking.date')}</span>
        <span>{t('staking.asset')}</span>
        <span className="text-end">{t('staking.amount')}</span>
        <span className="text-end">{t('staking.usd')}</span>
        <span className="text-end">{t('staking.type')}</span>
      </div>
      <Separator className="bg-[#2B3139]" />

      {rewardsHistory.map((entry, idx) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.04 }}
        >
          <div className="grid grid-cols-5 gap-2 px-3 py-2.5 text-xs hover:bg-[#1E2329]/50 transition-colors">
            <span className="text-[#848E9C] tabular-nums text-[11px]">
              {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <span className="text-[#EAECEF] font-medium">{entry.asset}</span>
            <span className="text-end text-[#0ECB81] tabular-nums text-[11px]">+{entry.amount}</span>
            <span className="text-end text-[#EAECEF] tabular-nums text-[11px]">{entry.usdValue}</span>
            <span className="text-end">
              <Badge
                className={cn(
                  'text-[8px] border-0 h-4 px-1.5 font-medium',
                  entry.type === 'Auto-compound'
                    ? 'bg-[#F0B90B]/10 text-[#F0B90B]'
                    : 'bg-[#0ECB81]/10 text-[#0ECB81]'
                )}
              >
                {entry.type === 'Auto-compound' ? t('staking.auto') : t('staking.reward')}
              </Badge>
            </span>
          </div>
          {idx < rewardsHistory.length - 1 && <Separator className="bg-[#2B3139]/50" />}
        </motion.div>
      ))}
    </div>
  );
}

function StakingHistoryTab({ t }: { t: (key: string) => string }) {
  const statusColors: Record<string, string> = {
    Completed: 'bg-[#0ECB81]/10 text-[#0ECB81]',
    Pending: 'bg-[#F0B90B]/10 text-[#F0B90B]',
    Unbonding: 'bg-[#F6465D]/10 text-[#F6465D]',
  };
  const typeIcons: Record<string, React.ReactNode> = {
    Stake: <Lock className="h-3.5 w-3.5 text-[#0ECB81]" />,
    Unstake: <Unlock className="h-3.5 w-3.5 text-[#F6465D]" />,
    'Claim Reward': <Award className="h-3.5 w-3.5 text-[#F0B90B]" />,
  };

  return (
    <div className="space-y-3">
      {stakingHistoryData.map((entry, idx) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2B3139] flex items-center justify-center">
                  {typeIcons[entry.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#EAECEF]">{entry.type}</span>
                      <Badge className={cn('text-[8px] border-0 h-4 px-1.5 font-medium', statusColors[entry.status])}>
                        {entry.status}
                      </Badge>
                    </div>
                    <span className="text-sm font-semibold text-[#EAECEF] tabular-nums">{entry.amount}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-[#5E6673]">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {entry.lockPeriod !== '-' && (
                      <span className="text-[10px] text-[#848E9C]">{entry.lockPeriod}</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function StakingCalculator({ t }: { t: (key: string) => string }) {
  const [amount, setAmount] = useState('1000');
  const [selectedAsset, setSelectedAsset] = useState('ETH');
  const [selectedLock, setSelectedLock] = useState(60);

  const asset = availableAssets.find((a) => a.asset === selectedAsset) || availableAssets[1];
  const effectiveApy = getApyForLockPeriod(asset.baseApy, selectedLock);
  const numAmount = parseFloat(amount) || 0;
  const dailyReward = numAmount * (effectiveApy / 100) / 365;
  const monthlyReward = dailyReward * 30;
  const yearlyReward = numAmount * (effectiveApy / 100);

  return (
    <Card className="glass-card rounded-xl overflow-hidden relative">
      <div className="absolute inset-0 rounded-xl gradient-border pointer-events-none" />
      <CardContent className="relative p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-4 w-4 text-[#F0B90B]" />
          <h3 className="text-sm font-semibold text-[#EAECEF]">{t('staking.calculator')}</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-[#5E6673] mb-1 block">{t('staking.amountUsd')}</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] h-9 text-sm focus:border-[#F0B90B] focus:ring-[#F0B90B]/20"
              placeholder={t('staking.enterAmount')}
            />
          </div>

          <div>
            <label className="text-[10px] text-[#5E6673] mb-1 block">{t('staking.asset')}</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full bg-[#2B3139] border border-[#2B3139] text-[#EAECEF] h-9 text-sm rounded-md px-3 focus:border-[#F0B90B] focus:outline-none"
            >
              {availableAssets.map((a) => (
                <option key={a.asset} value={a.asset}>
                  {a.icon} {a.asset}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-[#5E6673] mb-1 block">{t('staking.lockPeriod')}</label>
            <div className="flex gap-1 bg-[#2B3139] rounded-lg p-1">
              {[30, 60, 90, 120].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedLock(d)}
                  className={cn(
                    'flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all',
                    selectedLock === d
                      ? 'bg-[#1E2329] text-[#F0B90B] shadow-sm'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs bg-[#2B3139] rounded-lg px-3 py-2">
            <span className="text-[#848E9C]">{t('staking.effectiveApy')}</span>
            <span className="text-[#0ECB81] font-bold tabular-nums">{effectiveApy}%</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#2B3139] rounded-lg p-2.5 text-center">
              <p className="text-[9px] text-[#5E6673]">{t('staking.daily')}</p>
              <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+${dailyReward.toFixed(2)}</p>
            </div>
            <div className="bg-[#2B3139] rounded-lg p-2.5 text-center">
              <p className="text-[9px] text-[#5E6673]">{t('staking.monthly')}</p>
              <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+${monthlyReward.toFixed(2)}</p>
            </div>
            <div className="bg-[#2B3139] rounded-lg p-2.5 text-center">
              <p className="text-[9px] text-[#5E6673]">{t('staking.yearly')}</p>
              <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+${yearlyReward.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function StakingView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<StakingTab>('active');
  const [autoCompound, setAutoCompound] = useState(true);
  const [unstakeTarget, setUnstakeTarget] = useState<ActivePosition | null>(null);
  const [stakeTarget, setStakeTarget] = useState<AvailableAsset | null>(null);

  const tabs: { id: StakingTab; label: string }[] = useMemo(() => [
    { id: 'active', label: t('staking.activeStaking') },
    { id: 'available', label: t('staking.availableStake') },
    { id: 'history', label: t('staking.rewardsHistory') },
  ], [t]);

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9 w-9 lg:hidden"
              onClick={goBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-[#EAECEF]">{t('staking.title')}</h1>
              <p className="text-xs text-[#848E9C]">{t('staking.earnPassive')}</p>
            </div>
          </div>
          <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-0 text-[10px] px-2.5 py-1 font-semibold">
            <Lock className="h-3 w-3 me-1" />
            $12,450 {t('staking.totalStaked')}
          </Badge>
        </div>

        {/* Staking Overview Card */}
        <StakingOverviewCard t={t} autoCompound={autoCompound} />

        {/* Auto-Compound Toggle */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F0B90B]/10 flex items-center justify-center">
                  <RotateCcw className="h-4 w-4 text-[#F0B90B]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#EAECEF]">{t('staking.autoCompound')}</p>
                  <p className="text-[10px] text-[#848E9C] flex items-center gap-1">
                    {t('staking.autoCompoundDesc')}
                    <Info className="h-3 w-3 text-[#5E6673] cursor-help" />
                  </p>
                </div>
              </div>
              <Switch
                checked={autoCompound}
                onCheckedChange={setAutoCompound}
                className="data-[state=checked]:bg-[#0ECB81]"
              />
            </div>
            {autoCompound && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-2.5 bg-[#0ECB81]/5 border border-[#0ECB81]/10 rounded-lg"
              >
                <p className="text-[10px] text-[#0ECB81]">{t('staking.autoCompoundBenefit')}</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1E2329] rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 py-2.5 text-xs font-medium rounded-md transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-[#2B3139] text-[#F0B90B] shadow-sm'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              )}
            >
              {tab.label}
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
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'active' && (
              <ActiveStakingTab
                positions={activePositions}
                t={t}
                onUnstake={(pos) => setUnstakeTarget(pos)}
                onStakeNow={(asset) => setStakeTarget(asset)}
              />
            )}
            {activeTab === 'available' && (
              <AvailableStakeTab
                assets={availableAssets}
                t={t}
                onStakeNow={(asset) => setStakeTarget(asset)}
              />
            )}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <RewardsHistoryTab t={t} />
                <Separator className="bg-[#2B3139]" />
                <div>
                  <h3 className="text-sm font-semibold text-[#EAECEF] mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#F0B90B]" />
                    {t('staking.stakingHistory')}
                  </h3>
                  <StakingHistoryTab t={t} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Separator className="bg-[#2B3139]" />

        {/* Staking Calculator */}
        <StakingCalculator t={t} />
      </div>

      {/* Unstake Modal */}
      <AnimatePresence>
        {unstakeTarget && (
          <UnstakeModal
            position={unstakeTarget}
            t={t}
            onClose={() => setUnstakeTarget(null)}
            onConfirm={() => setUnstakeTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Stake Dialog */}
      <AnimatePresence>
        {stakeTarget && (
          <StakeDialog
            asset={stakeTarget.asset}
            icon={stakeTarget.icon}
            apy={stakeTarget.baseApy}
            minAmount={stakeTarget.minAmount}
            t={t}
            onClose={() => setStakeTarget(null)}
            onConfirm={() => setStakeTarget(null)}
          />
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
