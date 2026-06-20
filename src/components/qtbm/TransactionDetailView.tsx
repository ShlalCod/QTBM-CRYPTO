'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Repeat,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  Hash,
  FileText,
  Link2,
  Shield,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type TxType = 'Deposit' | 'Withdraw' | 'Trade' | 'Transfer';
type TxStatus = 'Completed' | 'Pending' | 'Processing' | 'Failed';

// ── Mock Data ────────────────────────────────────────────────────────────────
const mockTransaction = {
  type: 'Deposit' as TxType,
  status: 'Completed' as TxStatus,
  hash: '0x7a4f2c8b1e3d5a6f9c0b2d4e6a8c1e3f5b7d9a0c2e4f6b8d0a2c4e6f8b0d2a4',
  from: '0x1234...5678',
  fromFull: '0x1234567890abcdef1234567890abcdef12345678',
  to: '0xabcd...ef01',
  toFull: '0xabcdef0123456789abcdef0123456789abcdef01',
  amount: 0.5234,
  asset: 'ETH',
  amountUsd: 1842.51,
  networkFee: 0.0023,
  networkFeeUsd: 8.12,
  platformFee: 0,
  platformFeeUsd: 0,
  gasFee: 0.0018,
  gasFeeUsd: 6.35,
  confirmations: 128,
  totalConfirmations: 12,
  timestamp: '2025-03-05T14:32:15Z',
  memo: 'Deposit from external wallet',
  blockNumber: 19452134,
  network: 'Ethereum (ERC-20)',
  explorerUrl: '#',
};

const txTypeConfig: Record<TxType, { icon: typeof ArrowUpRight; color: string; bg: string }> = {
  Deposit: { icon: ArrowDownLeft, color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10' },
  Withdraw: { icon: ArrowUpRight, color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/10' },
  Trade: { icon: Repeat, color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
  Transfer: { icon: ArrowLeftRight, color: 'text-[#627EEA]', bg: 'bg-[#627EEA]/10' },
};

const statusConfig: Record<TxStatus, { color: string; bg: string }> = {
  Completed: { color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10' },
  Pending: { color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10' },
  Processing: { color: 'text-[#627EEA]', bg: 'bg-[#627EEA]/10' },
  Failed: { color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/10' },
};

// ── Animated Number ──────────────────────────────────────────────────────────
function AnimatedNumber({ value, decimals = 4, prefix = '', suffix = '' }: {
  value: number; decimals?: number; prefix?: string; suffix?: string;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(eased * value);
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
    return () => { start = 0; };
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{displayed.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── Time Ago ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string, t: (key: string) => string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}${t('transactionDetail.daysAgo')}`;
  if (hours > 0) return `${hours}${t('transactionDetail.hoursAgo')}`;
  if (minutes > 0) return `${minutes}${t('transactionDetail.minutesAgo')}`;
  return t('transactionDetail.justNow');
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function TransactionDetailView() {
  const { goBack } = useAppStore();
  const { t } = useTranslation();
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedFrom, setCopiedFrom] = useState(false);
  const [copiedTo, setCopiedTo] = useState(false);
  const [showFullFrom, setShowFullFrom] = useState(false);
  const [showFullTo, setShowFullTo] = useState(false);

  const tx = mockTransaction;
  const typeConfig = txTypeConfig[tx.type];
  const statusConf = statusConfig[tx.status];
  const TypeIcon = typeConfig.icon;

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9 w-9"
            onClick={goBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold text-[#EAECEF]">{t('transactionDetail.title')}</h1>
        </div>

        {/* Transaction Type & Status Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="glass-card rounded-xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', typeConfig.bg)}>
                    <TypeIcon className={cn('h-6 w-6', typeConfig.color)} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#EAECEF]">{tx.type}</h2>
                    <p className="text-xs text-[#848E9C]">{tx.network}</p>
                  </div>
                </div>
                <Badge className={cn('text-xs border-0 px-3 py-1 font-semibold', statusConf.bg, statusConf.color)}>
                  {tx.status}
                </Badge>
              </div>

              {/* Amount Display */}
              <div className="text-center py-4">
                <motion.div
                  className="text-4xl font-bold text-[#EAECEF]"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <AnimatedNumber value={tx.amount} decimals={4} suffix={` ${tx.asset}`} />
                </motion.div>
                <p className="text-lg text-[#848E9C] mt-1 tabular-nums">
                  ≈ ${tx.amountUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Transaction Hash */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Hash className="h-4 w-4 text-[#F0B90B] shrink-0" />
                  <span className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium shrink-0">{t('transactionDetail.txHash')}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(tx.hash, setCopiedHash)}
                  className="flex items-center gap-1.5 text-[#F0B90B] hover:text-[#F0B90B]/80 transition-colors shrink-0"
                >
                  {copiedHash ? (
                    <CheckCircle2 className="h-4 w-4 text-[#0ECB81]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="text-xs font-medium">{copiedHash ? t('common.success') : t('actions.copy')}</span>
                </button>
              </div>
              <p className="text-xs text-[#848E9C] font-mono mt-2 break-all leading-relaxed">
                {tx.hash}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* From / To Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4 space-y-3">
              {/* From */}
              <div>
                <span className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium">{t('transactionDetail.from')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <p
                    className="text-sm text-[#EAECEF] font-mono cursor-pointer hover:text-[#F0B90B] transition-colors"
                    onClick={() => setShowFullFrom(!showFullFrom)}
                  >
                    {showFullFrom ? tx.fromFull : tx.from}
                  </p>
                  <button
                    onClick={() => copyToClipboard(tx.fromFull, setCopiedFrom)}
                    className="text-[#848E9C] hover:text-[#F0B90B] transition-colors"
                  >
                    {copiedFrom ? <CheckCircle2 className="h-3.5 w-3.5 text-[#0ECB81]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-[#2B3139] flex items-center justify-center">
                  <ArrowDownLeft className="h-4 w-4 text-[#0ECB81]" />
                </div>
              </div>

              {/* To */}
              <div>
                <span className="text-[10px] text-[#5E6673] uppercase tracking-wider font-medium">{t('transactionDetail.to')}</span>
                <div className="flex items-center gap-2 mt-1">
                  <p
                    className="text-sm text-[#EAECEF] font-mono cursor-pointer hover:text-[#F0B90B] transition-colors"
                    onClick={() => setShowFullTo(!showFullTo)}
                  >
                    {showFullTo ? tx.toFull : tx.to}
                  </p>
                  <button
                    onClick={() => copyToClipboard(tx.toFull, setCopiedTo)}
                    className="text-[#848E9C] hover:text-[#F0B90B] transition-colors"
                  >
                    {copiedTo ? <CheckCircle2 className="h-3.5 w-3.5 text-[#0ECB81]" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fee Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-[#EAECEF] mb-3">{t('transactionDetail.feeBreakdown')}</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848E9C]">{t('transactionDetail.networkFee')}</span>
                  <span className="text-xs text-[#EAECEF] tabular-nums">{tx.networkFee} ETH (${tx.networkFeeUsd.toFixed(2)})</span>
                </div>
                <Separator className="bg-[#2B3139]/50" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848E9C]">{t('transactionDetail.platformFee')}</span>
                  <span className="text-xs text-[#0ECB81] tabular-nums">{tx.platformFee > 0 ? `$${tx.platformFeeUsd.toFixed(2)}` : t('transactionDetail.free')}</span>
                </div>
                <Separator className="bg-[#2B3139]/50" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#848E9C]">{t('transactionDetail.gasFee')}</span>
                  <span className="text-xs text-[#EAECEF] tabular-nums">{tx.gasFee} ETH (${tx.gasFeeUsd.toFixed(2)})</span>
                </div>
                <Separator className="bg-[#2B3139]" />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-[#EAECEF]">{t('transactionDetail.totalFee')}</span>
                  <span className="text-xs font-semibold text-[#F0B90B] tabular-nums">
                    ${(tx.networkFeeUsd + tx.platformFeeUsd + tx.gasFeeUsd).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Block Confirmations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#0ECB81]" />
                  <span className="text-xs font-semibold text-[#EAECEF]">{t('transactionDetail.confirmations')}</span>
                </div>
                <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-0 text-[10px] font-semibold">
                  {tx.confirmations} / {tx.totalConfirmations}+
                </Badge>
              </div>

              <div className="h-2 bg-[#2B3139] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#0ECB81] to-[#0ECB81]/80"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((tx.confirmations / tx.totalConfirmations) * 100, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[10px] text-[#5E6673] mt-1.5">
                {tx.confirmations >= tx.totalConfirmations
                  ? t('transactionDetail.fullyConfirmed')
                  : t('transactionDetail.confirming')
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timestamp & Block */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#848E9C]" />
                  <span className="text-xs text-[#848E9C]">{t('transactionDetail.timestamp')}</span>
                </div>
                <div className="text-end">
                  <p className="text-xs text-[#EAECEF]">{formatTimestamp(tx.timestamp)}</p>
                  <p className="text-[10px] text-[#5E6673]">{timeAgo(tx.timestamp, t)}</p>
                </div>
              </div>
              <Separator className="bg-[#2B3139]/50" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-[#848E9C]" />
                  <span className="text-xs text-[#848E9C]">{t('transactionDetail.blockNumber')}</span>
                </div>
                <span className="text-xs text-[#EAECEF] font-mono tabular-nums">#{tx.blockNumber.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Memo/Note */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-[#848E9C]" />
                <span className="text-xs text-[#848E9C]">{t('transactionDetail.memo')}</span>
              </div>
              <p className="text-sm text-[#EAECEF]">{tx.memo}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Explorer Link */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Button
            variant="outline"
            className="w-full border-[#2B3139] text-[#F0B90B] hover:bg-[#F0B90B]/10 hover:border-[#F0B90B]/30 h-11 press-scale"
          >
            <ExternalLink className="h-4 w-4 me-2" />
            {t('transactionDetail.viewOnExplorer')}
          </Button>
        </motion.div>

        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
