'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Vote,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Trophy,
  Users,
  BarChart3,
  CheckCircle,
  XCircle,
  ChevronRight,
  Flame,
  Minus,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

// ─── Data ───────────────────────────────────────────────────────────────────

type VoteDirection = 'for' | 'against' | 'undecided';

interface ActiveProposal {
  id: string;
  title: string;
  yourVote: VoteDirection;
  forPercent: number;
  againstPercent: number;
  daysLeft: number;
  totalVotes: string;
  summary: string;
}

interface CompletedProposal {
  id: string;
  title: string;
  passed: boolean;
  forPercent: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  vp: string;
  proposalsVoted: number;
}

interface HistoryEntry {
  id: string;
  proposalName: string;
  direction: 'for' | 'against';
  vpUsed: number;
  date: string;
  result?: 'passed' | 'failed' | 'pending';
}

type ProposalCategory = 'Fee' | 'Trading' | 'Withdrawal' | 'NFT' | 'Treasury';

const categoryBadgeColors: Record<ProposalCategory, string> = {
  Fee: 'bg-[#F0B90B]/15 text-[#F0B90B] border-[#F0B90B]/20',
  Trading: 'bg-[#0ECB81]/15 text-[#0ECB81] border-[#0ECB81]/20',
  Withdrawal: 'bg-[#627EEA]/15 text-[#627EEA] border-[#627EEA]/20',
  NFT: 'bg-[#9945FF]/15 text-[#9945FF] border-[#9945FF]/20',
  Treasury: 'bg-[#848E9C]/15 text-[#848E9C] border-[#848E9C]/20',
};

const activeProposals: (ActiveProposal & { category: ProposalCategory })[] = [
  {
    id: 'p1',
    title: 'Increase BTC/USDT Trading Fee to 0.15%',
    yourVote: 'against',
    forPercent: 45,
    againstPercent: 55,
    daysLeft: 2,
    totalVotes: '1.2M VP',
    summary: 'Proposal to adjust BTC/USDT trading fee from 0.10% to 0.15% to increase treasury reserves for platform development.',
    category: 'Fee',
  },
  {
    id: 'p2',
    title: 'Add DOGE/USDT Perpetual Contract',
    yourVote: 'for',
    forPercent: 78,
    againstPercent: 22,
    daysLeft: 5,
    totalVotes: '890K VP',
    summary: 'Add DOGE/USDT perpetual futures contract with up to 75x leverage on QTBM Futures.',
    category: 'Trading',
  },
  {
    id: 'p3',
    title: 'Reduce Minimum Withdrawal to $5',
    yourVote: 'for',
    forPercent: 92,
    againstPercent: 8,
    daysLeft: 3,
    totalVotes: '2.1M VP',
    summary: 'Lower the minimum withdrawal threshold from $10 to $5 across all supported networks.',
    category: 'Withdrawal',
  },
  {
    id: 'p4',
    title: 'Launch QTBM NFT Marketplace',
    yourVote: 'undecided',
    forPercent: 61,
    againstPercent: 39,
    daysLeft: 7,
    totalVotes: '650K VP',
    summary: 'Create a native NFT marketplace integrated with QTBM wallet for seamless trading and minting.',
    category: 'NFT',
  },
  {
    id: 'p5',
    title: 'Community Treasury Allocation Q2',
    yourVote: 'for',
    forPercent: 54,
    againstPercent: 46,
    daysLeft: 1,
    totalVotes: '3.4M VP',
    summary: 'Allocate 500,000 QTBM from community treasury for Q2 marketing, development, and partnership initiatives.',
    category: 'Treasury',
  },
];

const completedProposals: CompletedProposal[] = [
  { id: 'c1', title: 'Add SOL/USDT Margin Trading', passed: true, forPercent: 89 },
  { id: 'c2', title: 'Reduce Earn Lock Period', passed: false, forPercent: 42 },
  { id: 'c3', title: 'New P2P Payment Methods', passed: true, forPercent: 76 },
  { id: 'c4', title: 'QTBM Token Burn Mechanism', passed: true, forPercent: 94 },
  { id: 'c5', title: 'Increase Referral Bonus', passed: false, forPercent: 38 },
];

const leaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'CryptoWhale', vp: '125,800', proposalsVoted: 48 },
  { rank: 2, name: 'DiamondHands', vp: '98,450', proposalsVoted: 45 },
  { rank: 3, name: 'BNBKing', vp: '87,200', proposalsVoted: 42 },
  { rank: 4, name: 'QTBMMaster', vp: '72,300', proposalsVoted: 39 },
  { rank: 5, name: 'SatoshiJr', vp: '65,100', proposalsVoted: 36 },
];

const votingHistory: HistoryEntry[] = [
  {
    id: 'h1',
    proposalName: 'Add SOL/USDT Margin Trading',
    direction: 'for',
    vpUsed: 1200,
    date: new Date(Date.now() - 24 * 3600000).toISOString(),
    result: 'passed',
  },
  {
    id: 'h2',
    proposalName: 'Reduce Earn Lock Period',
    direction: 'for',
    vpUsed: 800,
    date: new Date(Date.now() - 72 * 3600000).toISOString(),
    result: 'failed',
  },
  {
    id: 'h3',
    proposalName: 'QTBM Token Burn Mechanism',
    direction: 'for',
    vpUsed: 2450,
    date: new Date(Date.now() - 168 * 3600000).toISOString(),
    result: 'passed',
  },
  {
    id: 'h4',
    proposalName: 'New P2P Payment Methods',
    direction: 'against',
    vpUsed: 600,
    date: new Date(Date.now() - 240 * 3600000).toISOString(),
    result: 'passed',
  },
  {
    id: 'h5',
    proposalName: 'Increase Referral Bonus',
    direction: 'against',
    vpUsed: 1500,
    date: new Date(Date.now() - 360 * 3600000).toISOString(),
    result: 'failed',
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const VOTING_POWER = 2450;
const BNB_STAKING_VP = 1500;
const QTBM_LOCK_VP = 950;

function getVpLevel(vp: number, t: (key: string) => string) {
  if (vp >= 5000) return { label: t('voting.diamond'), color: '#B9F2FF', pct: 100 };
  if (vp >= 3000) return { label: t('voting.gold'), color: '#FFD700', pct: 70 };
  if (vp >= 1500) return { label: t('voting.silver'), color: '#C0C0C0', pct: 45 };
  return { label: t('voting.bronze'), color: '#CD7F32', pct: 20 };
}

function formatDateRelative(iso: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ─── Animation Variants ─────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function VotingView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<(ActiveProposal & { category: ProposalCategory }) | null>(null);
  const [voteSlider, setVoteSlider] = useState(100);
  const [confirmStep, setConfirmStep] = useState<'choose' | 'confirm' | 'done'>('choose');
  const [pendingDirection, setPendingDirection] = useState<'for' | 'against'>('for');

  const vpLevel = getVpLevel(VOTING_POWER, t);

  const openVoteModal = (proposal: ActiveProposal & { category: ProposalCategory }) => {
    setSelectedProposal(proposal);
    setVoteSlider(100);
    setConfirmStep('choose');
    setPendingDirection('for');
    setVoteModalOpen(true);
  };

  const handleConfirmVote = () => {
    setConfirmStep('done');
    setTimeout(() => {
      setVoteModalOpen(false);
      setConfirmStep('choose');
    }, 1500);
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-8 w-8"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-[#EAECEF]">{t('voting.title')}</h1>
          <Badge className="bg-gradient-to-r from-[#F0B90B] to-[#F0B90B]/70 text-[#0B0E11] border-0 text-[10px] font-bold px-2 py-0.5 ml-auto">
            {t('voting.season')}
          </Badge>
        </div>

        {/* ── Voting Power Card ──────────────────────────────────────────── */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[#1E2329]/80 border-[#2B3139] overflow-hidden relative backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F0B90B]/8 via-transparent to-[#0ECB81]/5" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F0B90B] via-[#0ECB81] to-[#F0B90B]" />
            <CardContent className="p-5 relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-[#F0B90B]" />
                <h2 className="text-sm font-semibold text-[#EAECEF]">{t('voting.votingPower')}</h2>
              </div>

              <div className="flex items-center gap-5">
                {/* Progress Ring */}
                <div className="relative w-20 h-20 shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#2B3139" strokeWidth="6" />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="34"
                      fill="none"
                      stroke={vpLevel.color}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 34}
                      strokeDashoffset={2 * Math.PI * 34 * (1 - vpLevel.pct / 100)}
                      initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - vpLevel.pct / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[9px] font-bold uppercase" style={{ color: vpLevel.color }}>{vpLevel.label}</span>
                  </div>
                </div>

                {/* VP Details */}
                <div className="flex-1 min-w-0">
                  <p className="text-3xl font-bold text-[#F0B90B]" style={{ textShadow: '0 0 20px rgba(240,185,11,0.35)' }}>
                    {VOTING_POWER.toLocaleString()} <span className="text-base font-semibold">{t('voting.vp')}</span>
                  </p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#848E9C]">{t('voting.bnbStaking')}</span>
                      <span className="text-[#EAECEF] font-medium">{BNB_STAKING_VP.toLocaleString()} {t('voting.vp')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#848E9C]">{t('voting.qtbmLock')}</span>
                      <span className="text-[#EAECEF] font-medium">{QTBM_LOCK_VP.toLocaleString()} {t('voting.vp')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#2B3139]/60 flex items-center justify-between">
                <span className="text-[11px] text-[#848E9C]">{t('voting.votingRewards')}</span>
                <span className="text-[11px] font-semibold text-[#0ECB81]">{t('voting.estRewardsPerSeason')}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 bg-[#1E2329] rounded-xl">
          {(['active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200',
                activeTab === tab
                  ? 'bg-[#2B3139] text-[#F0B90B] shadow-sm'
                  : 'text-[#848E9C] hover:text-[#EAECEF]'
              )}
            >
              {tab === 'active' ? t('voting.activeProposals') : t('voting.completedProposals')}
            </button>
          ))}
        </div>

        {/* ── Tab Content ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {activeTab === 'active' ? (
            <motion.div
              key="active"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {activeProposals.map((proposal) => (
                <motion.div key={proposal.id} variants={cardVariants}>
                  <Card className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/20 transition-all hover-lift glass-card">
                    <CardContent className="p-4">
                      {/* Title + Category + Your Vote Badge + Voting Open Indicator */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Category Badge */}
                            <Badge className={cn('border text-[8px] px-1.5 py-0 h-4 font-semibold shrink-0', categoryBadgeColors[proposal.category])}>
                              {proposal.category}
                            </Badge>
                            {/* Voting Open Indicator */}
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] voting-open-dot" />
                              <span className="text-[8px] text-[#0ECB81] font-medium">{t('voting.votingOpen')}</span>
                            </span>
                          </div>
                          <h3 className="text-sm font-medium text-[#EAECEF] leading-tight">{proposal.title}</h3>
                        </div>
                        <Badge
                          className={cn(
                            'border-0 text-[9px] px-2 py-0.5 h-5 shrink-0 font-semibold',
                            proposal.yourVote === 'for' && 'bg-[#0ECB81]/15 text-[#0ECB81]',
                            proposal.yourVote === 'against' && 'bg-[#F6465D]/15 text-[#F6465D]',
                            proposal.yourVote === 'undecided' && 'bg-[#F0B90B]/15 text-[#F0B90B]'
                          )}
                        >
                          {proposal.yourVote === 'for' && <ThumbsUp className="h-2.5 w-2.5 mr-1" />}
                          {proposal.yourVote === 'against' && <ThumbsDown className="h-2.5 w-2.5 mr-1" />}
                          {proposal.yourVote === 'undecided' && <Minus className="h-2.5 w-2.5 mr-1" />}
                          {proposal.yourVote === 'for' ? t('voting.for') : proposal.yourVote === 'against' ? t('voting.against') : t('voting.undecided')}
                        </Badge>
                      </div>

                      {/* Vote Bars with gradient fill */}
                      <div className="space-y-2 mb-3">
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-[#0ECB81] font-medium">{t('voting.for')} {proposal.forPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#2B3139] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${proposal.forPercent}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                              className="h-full rounded-full bg-gradient-to-r from-[#0ECB81] via-[#0ECB81]/90 to-[#0ECB81]/70 vote-progress-fill"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-[10px] mb-1">
                            <span className="text-[#F6465D] font-medium">{t('voting.against')} {proposal.againstPercent}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#2B3139] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${proposal.againstPercent}%` }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                              className="h-full rounded-full bg-gradient-to-r from-[#F6465D] via-[#F6465D]/90 to-[#F6465D]/70 vote-progress-fill"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Meta Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-[10px] text-[#848E9C]">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {proposal.daysLeft} {t('voting.daysLeft')}
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            {proposal.totalVotes}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="h-7 px-3 text-[10px] font-semibold gradient-yellow hover:opacity-90 text-[#0B0E11] shadow-md shadow-[#F0B90B]/15 press-scale vote-btn-glow"
                          onClick={() => openVoteModal(proposal)}
                        >
                          <Vote className="h-3 w-3 mr-1" />
                          {t('voting.castVote')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -8 }}
              className="space-y-3"
            >
              {completedProposals.map((proposal) => (
                <motion.div key={proposal.id} variants={cardVariants}>
                  <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-sm font-medium text-[#EAECEF] leading-tight flex-1">{proposal.title}</h3>
                        <Badge
                          className={cn(
                            'border-0 text-[9px] px-2 py-0.5 h-5 shrink-0 font-semibold flex items-center gap-1',
                            proposal.passed
                              ? 'bg-[#0ECB81]/15 text-[#0ECB81]'
                              : 'bg-[#F6465D]/15 text-[#F6465D]'
                          )}
                        >
                          {proposal.passed ? (
                            <><CheckCircle className="h-2.5 w-2.5" />{t('voting.passed')}</>
                          ) : (
                            <><XCircle className="h-2.5 w-2.5" />{t('voting.failed')}</>
                          )}
                        </Badge>
                      </div>

                      {/* Result bar with animated gradient fill */}
                      <div className="w-full h-2 bg-[#2B3139] rounded-full overflow-hidden mb-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${proposal.forPercent}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={cn(
                            'h-full rounded-full vote-progress-fill',
                            proposal.passed
                              ? 'bg-gradient-to-r from-[#0ECB81] via-[#0ECB81]/90 to-[#0ECB81]/70'
                              : 'bg-gradient-to-r from-[#F6465D] via-[#F6465D]/90 to-[#F6465D]/70'
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-[#848E9C]">{proposal.forPercent}% {t('voting.for')}</span>
                        <Badge className={cn(
                          'border-0 text-[8px] px-1.5 py-0 h-4 font-semibold',
                          proposal.passed ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                        )}>
                          {proposal.passed ? `✓ ${t('voting.executed')}` : `✕ ${t('voting.rejected')}`}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Voting Leaderboard ──────────────────────────────────────────── */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-[#F0B90B]" />
                <h3 className="text-sm font-medium text-[#EAECEF]">{t('voting.leaderboard')}</h3>
              </div>

              <div className="space-y-2 mb-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#0B0E11]/30"
                  >
                    <span
                      className={cn(
                        'text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                        entry.rank === 1 && 'bg-[#FFD700]/20 text-[#FFD700]',
                        entry.rank === 2 && 'bg-[#C0C0C0]/20 text-[#C0C0C0]',
                        entry.rank === 3 && 'bg-[#CD7F32]/20 text-[#CD7F32]',
                        entry.rank > 3 && 'bg-[#2B3139] text-[#848E9C]'
                      )}
                    >
                      {entry.rank}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-[#2B3139] flex items-center justify-center text-[10px] font-bold text-[#F0B90B] shrink-0">
                      {entry.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#EAECEF] truncate">{entry.name}</p>
                      <p className="text-[9px] text-[#5E6673]">{entry.proposalsVoted} {t('voting.proposals')}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#F0B90B] shrink-0">{entry.vp} {t('voting.vp')}</span>
                  </div>
                ))}
              </div>

              {/* Your Rank */}
              <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-[#F0B90B]/5 border border-[#F0B90B]/10 mb-3">
                <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center bg-[#F0B90B]/15 text-[#F0B90B] shrink-0">
                  42
                </span>
                <div className="w-7 h-7 rounded-full bg-[#F0B90B] flex items-center justify-center text-[10px] font-bold text-[#0B0E11] shrink-0">
                  U
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#F0B90B]">{t('voting.you')}</p>
                  <p className="text-[9px] text-[#848E9C]">{t('voting.yourRank')}</p>
                </div>
                <span className="text-xs font-semibold text-[#F0B90B] shrink-0">2,450 {t('voting.vp')}</span>
              </div>

              <Button
                variant="outline"
                className="w-full border-[#2B3139] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] hover:border-[#F0B90B]/20 h-9 text-xs"
              >
                {t('voting.viewFullLeaderboard')}
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── My Voting History ───────────────────────────────────────────── */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card className="bg-[#1E2329] border-[#2B3139] glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="h-4 w-4 text-[#F0B90B]" />
                <h3 className="text-sm font-medium text-[#EAECEF]">{t('voting.myHistory')}</h3>
              </div>

              <div className="space-y-1.5 max-h-96 overflow-y-auto custom-scrollbar">
                {votingHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-[#0B0E11]/30"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-xs font-medium text-[#EAECEF] truncate">{entry.proposalName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={cn(
                            'text-[9px] font-medium',
                            entry.direction === 'for' ? 'text-[#0ECB81]' : 'text-[#F6465D]'
                          )}
                        >
                          {entry.direction === 'for' ? (
                            <ThumbsUp className="h-2.5 w-2.5 inline mr-0.5" />
                          ) : (
                            <ThumbsDown className="h-2.5 w-2.5 inline mr-0.5" />
                          )}
                          {entry.direction === 'for' ? t('voting.for') : t('voting.against')}
                        </span>
                        <span className="text-[9px] text-[#5E6673]">{entry.vpUsed.toLocaleString()} {t('voting.vp')}</span>
                        <span className="text-[9px] text-[#5E6673]">{formatDateRelative(entry.date, t)}</span>
                      </div>
                    </div>
                    {entry.result && (
                      <Badge
                        className={cn(
                          'border-0 text-[8px] px-1.5 py-0 h-4 shrink-0 font-semibold',
                          entry.result === 'passed' && 'bg-[#0ECB81]/15 text-[#0ECB81]',
                          entry.result === 'failed' && 'bg-[#F6465D]/15 text-[#F6465D]',
                          entry.result === 'pending' && 'bg-[#F0B90B]/15 text-[#F0B90B]'
                        )}
                      >
                        {entry.result === 'passed' && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                        {entry.result === 'failed' && <XCircle className="h-2.5 w-2.5 mr-0.5" />}
                        {entry.result === 'passed' ? t('voting.passed') : entry.result === 'failed' ? t('voting.failed') : t('voting.pending')}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Vote Modal / Dialog ─────────────────────────────────────────── */}
      <AnimatePresence>
        {voteModalOpen && selectedProposal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => { setVoteModalOpen(false); setConfirmStep('choose'); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm bg-[#1E2329] rounded-2xl border border-[#2B3139] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {confirmStep === 'done' ? (
                /* ── Success State ──────────────────────────────────────── */
                <div className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-14 h-14 rounded-full bg-[#0ECB81]/15 flex items-center justify-center mx-auto mb-3"
                  >
                    <CheckCircle className="h-8 w-8 text-[#0ECB81]" />
                  </motion.div>
                  <p className="text-base font-semibold text-[#EAECEF] mb-1">{t('voting.voteCast')}</p>
                  <p className="text-xs text-[#848E9C]">
                    {Math.round(VOTING_POWER * voteSlider / 100).toLocaleString()} {t('voting.vp')} {pendingDirection === 'for' ? t('voting.for') : t('voting.against').toLowerCase()}
                  </p>
                </div>
              ) : confirmStep === 'confirm' ? (
                /* ── Confirmation Step ──────────────────────────────────── */
                <div className="p-5">
                  <h3 className="text-base font-semibold text-[#EAECEF] mb-4">{t('voting.confirmVote')}</h3>

                  <div className="bg-[#0B0E11]/50 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#848E9C]">{t('voting.proposal')}</span>
                      <span className="text-[#EAECEF] font-medium text-right max-w-[200px] truncate">{selectedProposal.title}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#848E9C]">{t('voting.direction')}</span>
                      <span className={pendingDirection === 'for' ? 'text-[#0ECB81] font-medium' : 'text-[#F6465D] font-medium'}>
                        {pendingDirection === 'for' ? t('voting.for') : t('voting.against')}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#848E9C]">{t('voting.votingPower')}</span>
                      <span className="text-[#F0B90B] font-medium">{Math.round(VOTING_POWER * voteSlider / 100).toLocaleString()} {t('voting.vp')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#848E9C]">{t('voting.networkFee')}</span>
                      <span className="text-[#848E9C]">~0.001 BNB</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-[#2B3139] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-10"
                      onClick={() => setConfirmStep('choose')}
                    >
                      {t('voting.back')}
                    </Button>
                    <Button
                      className={cn(
                        'flex-1 h-10 font-semibold press-scale text-white',
                        pendingDirection === 'for'
                          ? 'bg-gradient-to-r from-[#0ECB81] to-[#0ECB81]/80 hover:opacity-90'
                          : 'bg-gradient-to-r from-[#F6465D] to-[#F6465D]/80 hover:opacity-90'
                      )}
                      onClick={handleConfirmVote}
                    >
                      {t('voting.confirm')}
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Choose Direction Step ───────────────────────────────── */
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-[#EAECEF]">{t('voting.castVote')}</h3>
                    <button
                      onClick={() => setVoteModalOpen(false)}
                      className="text-[#848E9C] hover:text-[#EAECEF] transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>

                  <p className="text-xs text-[#EAECEF] font-medium mb-1">{selectedProposal.title}</p>
                  <p className="text-[10px] text-[#848E9C] mb-4 leading-relaxed">{selectedProposal.summary}</p>

                  {/* Slider */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-[#848E9C]">{t('voting.votingPower')}</span>
                      <span className="text-xs font-semibold text-[#F0B90B]">{voteSlider}% ({Math.round(VOTING_POWER * voteSlider / 100).toLocaleString()} {t('voting.vp')})</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={voteSlider}
                      onChange={(e) => setVoteSlider(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#2B3139] rounded-full appearance-none cursor-pointer accent-[#F0B90B]
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#F0B90B] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:shadow-[#F0B90B]/30
                        [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#F0B90B] [&::-moz-range-thumb]:border-0"
                    />
                    <div className="flex justify-between text-[9px] text-[#5E6673] mt-1">
                      <span>1%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* For / Against Buttons */}
                  <div className="flex gap-3">
                    <Button
                      className="flex-1 h-10 font-semibold bg-gradient-to-r from-[#0ECB81] to-[#0ECB81]/80 hover:opacity-90 text-white press-scale"
                      onClick={() => { setPendingDirection('for'); setConfirmStep('confirm'); }}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1.5" />
                      {t('voting.for')}
                    </Button>
                    <Button
                      className="flex-1 h-10 font-semibold bg-gradient-to-r from-[#F6465D] to-[#F6465D]/80 hover:opacity-90 text-white press-scale"
                      onClick={() => { setPendingDirection('against'); setConfirmStep('confirm'); }}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1.5" />
                      {t('voting.against')}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
