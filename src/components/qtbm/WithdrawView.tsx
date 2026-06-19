'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockAssets, mockWalletBalances, formatPrice, getTimeAgo } from '@/lib/mock-data';
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  Shield,
  ExternalLink,
  ClipboardPaste,
  Loader2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Network data for withdrawals (with fees)
const networkMap: Record<string, { id: string; name: string; fee: number; feeAsset: string; minWithdraw: number; maxWithdraw: number }[]> = {
  BTC: [
    { id: 'btc', name: 'Bitcoin', fee: 0.0005, feeAsset: 'BTC', minWithdraw: 0.001, maxWithdraw: 500 },
  ],
  ETH: [
    { id: 'erc20', name: 'Ethereum (ERC20)', fee: 0.005, feeAsset: 'ETH', minWithdraw: 0.01, maxWithdraw: 5000 },
    { id: 'arbitrum', name: 'Arbitrum One', fee: 0.0001, feeAsset: 'ETH', minWithdraw: 0.001, maxWithdraw: 10000 },
    { id: 'optimism', name: 'Optimism', fee: 0.0001, feeAsset: 'ETH', minWithdraw: 0.001, maxWithdraw: 10000 },
  ],
  BNB: [
    { id: 'bep2', name: 'BNB Beacon Chain (BEP2)', fee: 0.0005, feeAsset: 'BNB', minWithdraw: 0.01, maxWithdraw: 5000 },
    { id: 'bep20', name: 'BNB Smart Chain (BEP20)', fee: 0.0002, feeAsset: 'BNB', minWithdraw: 0.001, maxWithdraw: 10000 },
  ],
  SOL: [
    { id: 'sol', name: 'Solana', fee: 0.01, feeAsset: 'SOL', minWithdraw: 0.1, maxWithdraw: 50000 },
  ],
  USDT: [
    { id: 'erc20', name: 'Ethereum (ERC20)', fee: 10, feeAsset: 'USDT', minWithdraw: 20, maxWithdraw: 1000000 },
    { id: 'bep20', name: 'BNB Smart Chain (BEP20)', fee: 0.8, feeAsset: 'USDT', minWithdraw: 1, maxWithdraw: 1000000 },
    { id: 'trc20', name: 'Tron (TRC20)', fee: 1, feeAsset: 'USDT', minWithdraw: 5, maxWithdraw: 1000000 },
    { id: 'sol', name: 'Solana (SPL)', fee: 0.5, feeAsset: 'USDT', minWithdraw: 1, maxWithdraw: 1000000 },
  ],
  XRP: [
    { id: 'xrp', name: 'XRP Ledger', fee: 0.25, feeAsset: 'XRP', minWithdraw: 20, maxWithdraw: 500000 },
  ],
  ADA: [
    { id: 'ada', name: 'Cardano', fee: 0.5, feeAsset: 'ADA', minWithdraw: 1, maxWithdraw: 1000000 },
  ],
  DOGE: [
    { id: 'doge', name: 'Dogecoin', fee: 5, feeAsset: 'DOGE', minWithdraw: 30, maxWithdraw: 5000000 },
  ],
};

// Mock withdrawal history
const mockWithdrawalHistory = [
  { id: '1', asset: 'USDT', icon: '₮', network: 'TRC20', amount: 100, fee: 1, status: 'completed' as const, address: 'TJYe...4kVm', time: '2024-01-14T16:00:00Z' },
  { id: '2', asset: 'BTC', icon: '₿', network: 'Bitcoin', amount: 0.1, fee: 0.0005, status: 'pending' as const, address: '1A1z...viGk', time: '2024-01-15T08:00:00Z' },
  { id: '3', asset: 'ETH', icon: 'Ξ', network: 'ERC20', amount: 2.0, fee: 0.005, status: 'processing' as const, address: '0x7a5...3c9f', time: '2024-01-15T06:30:00Z' },
  { id: '4', asset: 'BNB', icon: '◆', network: 'BEP20', amount: 15, fee: 0.0002, status: 'completed' as const, address: '0x2b8...7d1e', time: '2024-01-13T14:20:00Z' },
  { id: '5', asset: 'SOL', icon: '◎', network: 'Solana', amount: 30, fee: 0.01, status: 'failed' as const, address: '5FHw...9kNp', time: '2024-01-12T09:45:00Z' },
];

const statusConfig: Record<string, { color: string; bg: string; labelKey: string; icon: React.ElementType }> = {
  completed: { color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10', labelKey: 'wallet.completed', icon: CheckCircle2 },
  processing: { color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10', labelKey: 'wallet.processing', icon: Loader2 },
  pending: { color: 'text-[#848E9C]', bg: 'bg-[#848E9C]/10', labelKey: 'wallet.pending', icon: Clock },
  failed: { color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/10', labelKey: 'wallet.failed', icon: XCircle },
};

export default function WithdrawView() {
  const { goBack, selectedAsset } = useAppStore();
  const { t } = useTranslation();
  const [selectedSymbol, setSelectedSymbol] = useState(selectedAsset || 'BTC');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationType, setVerificationType] = useState<'email' | 'sms' | '2fa'>('email');
  const [searchQuery, setSearchQuery] = useState('');

  const withdrawAssets = ['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'XRP', 'ADA', 'DOGE'];
  const networks = networkMap[selectedSymbol] || [];
  const currentBalance = mockWalletBalances.find(b => b.asset === selectedSymbol);
  const currentNetwork = networks.find(n => n.id === selectedNetwork);

  // Set default network
  React.useEffect(() => {
    if (networks.length > 0 && !networks.find(n => n.id === selectedNetwork)) {
      setSelectedNetwork(networks[0].id);
    }
  }, [selectedSymbol, networks.length]);

  const numAmount = parseFloat(amount) || 0;
  const fee = currentNetwork?.fee || 0;
  const youReceive = Math.max(0, numAmount - fee);
  const available = currentBalance?.available || 0;
  const isValid = address.length > 10 && numAmount > 0 && numAmount <= available && youReceive > 0;
  const isAboveMin = numAmount >= (currentNetwork?.minWithdraw || 0);

  const filteredAssets = withdrawAssets.filter(symbol => {
    if (!searchQuery) return true;
    const asset = mockAssets.find(a => a.symbol === symbol);
    return symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (asset?.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleMax = () => {
    if (available > 0) {
      setAmount(available.toString());
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
      toast.success(t('wallet.addressPasted'));
    } catch {
      toast.error(t('wallet.pasteFailed'));
    }
  };

  const handleSubmit = () => {
    if (!isValid || !isAboveMin) return;
    setShowVerification(true);
    setVerificationType('email');
  };

  const handleVerifyAndSubmit = () => {
    if (verificationCode.length < 6) {
      toast.error(t('wallet.enterFullCode'));
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowVerification(false);
      setVerificationCode('');
      setAddress('');
      setAmount('');
      toast.success(t('wallet.withdrawSubmitted').replace('{amount}', String(numAmount)).replace('{asset}', selectedSymbol));
    }, 1500);
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="space-y-4 p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 crypto-header-gradient rounded-xl p-3 -mx-1">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-lg bg-[#2B3139] flex items-center justify-center hover:bg-[#363C45] transition-colors press-scale"
          >
            <ArrowLeft className="h-5 w-5 text-[#EAECEF]" />
          </button>
          <div className="w-9 h-9 rounded-lg gradient-red flex items-center justify-center text-lg font-bold text-white">
            {mockAssets.find(a => a.symbol === selectedSymbol)?.icon || '?'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#EAECEF]">{t('wallet.withdraw')}</h1>
            <p className="text-[10px] text-[#848E9C]">{selectedSymbol} • {currentNetwork?.name || t('wallet.selectNetworkPrompt')}</p>
          </div>
        </div>

        {/* Select Asset */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <label className="text-xs text-[#848E9C] font-medium mb-2 block">{t('wallet.selectAsset')}</label>
            <div className="relative">
              <button
                onClick={() => { setShowAssetDropdown(!showAssetDropdown); setShowNetworkDropdown(false); }}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#2B3139] rounded-lg hover:bg-[#363C45] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0B0E11] flex items-center justify-center text-sm font-bold">
                    {mockAssets.find(a => a.symbol === selectedSymbol)?.icon || '?'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-[#EAECEF]">{selectedSymbol}</p>
                    <p className="text-[10px] text-[#5E6673]">{mockAssets.find(a => a.symbol === selectedSymbol)?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#848E9C] tabular-nums">
                    {t('wallet.available')}: {available.toLocaleString('en-US', { maximumFractionDigits: 4 })} {selectedSymbol}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-[#848E9C] transition-transform ${showAssetDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {showAssetDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-[#1E2329] border border-[#2B3139] rounded-lg z-20 shadow-xl overflow-hidden"
                  >
                    <div className="p-2">
                      <Input
                        placeholder={t('wallet.searchAsset')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-8 text-sm"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredAssets.map((symbol) => {
                        const asset = mockAssets.find(a => a.symbol === symbol);
                        if (!asset) return null;
                        const balance = mockWalletBalances.find(b => b.asset === symbol);
                        return (
                          <button
                            key={symbol}
                            onClick={() => {
                              setSelectedSymbol(symbol);
                              setSelectedNetwork('');
                              setShowAssetDropdown(false);
                              setSearchQuery('');
                              setAmount('');
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2B3139] transition-colors ${
                              selectedSymbol === symbol ? 'bg-[#2B3139]' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#0B0E11] flex items-center justify-center text-xs font-bold">
                                {asset.icon}
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium text-[#EAECEF]">{symbol}</p>
                                <p className="text-[10px] text-[#5E6673]">{asset.name}</p>
                              </div>
                            </div>
                            {balance && (
                              <span className="text-xs text-[#848E9C] tabular-nums">
                                {balance.available.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Network Selection */}
        {networks.length > 0 && (
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4">
              <label className="text-xs text-[#848E9C] font-medium mb-2 block">{t('wallet.selectNetwork')}</label>
              <div className="grid gap-2">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => setSelectedNetwork(network.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all network-card hover-lift ${
                      selectedNetwork === network.id ? 'selected' : 'bg-[#2B3139]/50'
                    }`}
                  >
                    <div className="text-left">
                      <p className="text-sm font-medium text-[#EAECEF]">{network.name}</p>
                      <p className="text-[10px] text-[#5E6673]">
                        {t('wallet.fee')}: {network.fee} {network.feeAsset} • {t('wallet.minWithdraw')}: {network.minWithdraw} {selectedSymbol}
                      </p>
                    </div>
                    {selectedNetwork === network.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-[#F0B90B] check-pop-animate" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal Form */}
        {currentNetwork && (
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4 space-y-4">
              {/* Address Input */}
              <div>
                <label className="text-xs text-[#848E9C] font-medium mb-2 block">{t('wallet.withdrawalAddress')}</label>
                <div className="relative">
                  <Input
                    placeholder={`${selectedSymbol} ${currentNetwork.name}`}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 pr-20 text-sm font-mono focus:border-[#F0B90B] focus:ring-[#F0B90B]/20"
                  />
                  <button
                    onClick={handlePaste}
                    className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 text-[10px] text-[#F0B90B] hover:text-[#F0B90B]/80 bg-[#F0B90B]/10 rounded transition-colors"
                  >
                    <ClipboardPaste className="h-3 w-3" />
                    {t('wallet.paste')}
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-[#848E9C] font-medium">{t('trade.amount')}</label>
                  <span className="text-xs text-[#5E6673]">
                    {t('wallet.available')}: <span className="text-[#EAECEF] tabular-nums">{available.toLocaleString('en-US', { maximumFractionDigits: 4 })}</span> {selectedSymbol}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 pr-16 text-sm tabular-nums focus:border-[#F0B90B] focus:ring-[#F0B90B]/20"
                  />
                  <button
                    onClick={handleMax}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-semibold text-[#F0B90B] bg-[#F0B90B]/10 rounded hover:bg-[#F0B90B]/20 transition-colors"
                  >
                    {t('wallet.max')}
                  </button>
                </div>
                {numAmount > 0 && !isAboveMin && (
                  <p className="text-[10px] text-[#F6465D] mt-1">
                    {t('wallet.minWithdrawError').replace('{amount}', String(currentNetwork.minWithdraw)).replace('{asset}', selectedSymbol)}
                  </p>
                )}
                {numAmount > available && (
                  <p className="text-[10px] text-[#F6465D] mt-1">
                    {t('wallet.insufficientBalance')}
                  </p>
                )}
              </div>

              {/* Fee Details with animated estimation */}
              <div className="space-y-2 bg-[#2B3139] rounded-lg p-3 glow-border fee-animate fee-slide-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#848E9C]">{t('wallet.networkFee')}</span>
                  <span className="text-[#EAECEF] tabular-nums neon-glow">{fee} {currentNetwork.feeAsset}</span>
                </div>
                <Separator className="bg-[#0B0E11]" />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#848E9C]">{t('wallet.youWillReceive')}</span>
                  <span className="text-[#0ECB81] font-semibold tabular-nums neon-glow-green">
                    {youReceive > 0 ? youReceive.toFixed(6) : '0.00'} {selectedSymbol}
                  </span>
                </div>
                {currentBalance && youReceive > 0 && (
                  <>
                    <Separator className="bg-[#0B0E11]" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#848E9C]">{t('wallet.usdValueLabel')}</span>
                      <span className="text-[#EAECEF] tabular-nums">
                        ${formatPrice(youReceive * (currentBalance.usdValue / currentBalance.total))}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Warning with animated icon */}
              <div className="p-3 bg-[#F6465D]/5 border border-[#F6465D]/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#F6465D] shrink-0 mt-0.5 warning-animate" />
                  <ul className="text-[11px] text-[#848E9C] space-y-1">
                    <li>• {t('wallet.withdrawWarning1').replace('{network}', currentNetwork.name)}</li>
                    <li>• {t('wallet.withdrawWarning2')}</li>
                    <li>• {t('wallet.withdrawWarning3').replace('{amount}', String(currentNetwork.minWithdraw)).replace('{asset}', selectedSymbol)}</li>
                  </ul>
                </div>
              </div>

              {/* Gradient Submit Button with Hover Glow */}
              <Button
                onClick={handleSubmit}
                disabled={!isValid || !isAboveMin}
                className="w-full gradient-submit-btn text-[#0B0E11] font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {t('wallet.withdrawAsset').replace('{asset}', selectedSymbol)}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Withdrawal History */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#EAECEF]">{t('wallet.recentWithdrawals')}</h3>
              <button className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 flex items-center gap-1 transition-colors">
                {t('wallet.viewAll')} <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2 fancy-scrollbar max-h-72 overflow-y-auto">
              {mockWithdrawalHistory.map((withdrawal) => {
                const status = statusConfig[withdrawal.status];
                const StatusIcon = status.icon;
                return (
                  <div key={withdrawal.id} className="flex items-center justify-between py-2.5 border-b border-[#2B3139] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2B3139] flex items-center justify-center text-sm font-bold">
                        {withdrawal.icon}
                      </div>
                      <div>
                        <p className="text-sm text-[#EAECEF] font-medium">
                          -{withdrawal.amount} {withdrawal.asset}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#5E6673]">{withdrawal.network}</span>
                          <span className="text-[10px] text-[#5E6673]">•</span>
                          <span className="text-[10px] text-[#5E6673]">{withdrawal.address}</span>
                          <span className="text-[10px] text-[#5E6673]">•</span>
                          <span className="text-[10px] text-[#5E6673]">{getTimeAgo(withdrawal.time)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`text-[9px] h-4 px-1.5 border-0 ${status.color} ${status.bg}`}>
                        <StatusIcon className={`h-2.5 w-2.5 mr-0.5 ${withdrawal.status === 'processing' ? 'animate-spin' : ''}`} />
                        {t(status.labelKey)}
                      </Badge>
                      <p className="text-[10px] text-[#5E6673] mt-0.5">{t('wallet.fee')}: {withdrawal.fee} {withdrawal.asset}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      {/* Security Verification Dialog */}
      <Dialog open={showVerification} onOpenChange={setShowVerification}>
        <DialogContent className="bg-[#1E2329] border-[#2B3139] text-[#EAECEF] max-w-sm frosted-glass">
          <DialogHeader>
            <DialogTitle className="text-[#EAECEF]">{t('wallet.securityVerification')}</DialogTitle>
          </DialogHeader>

          {/* Step Progress Indicator */}
          <div className="flex items-center gap-1 mb-3">
            {['email', 'sms', '2fa'].map((type, idx) => (
              <div key={type} className="flex-1 flex items-center gap-1">
                <div className={`h-1.5 flex-1 rounded-full transition-all ${
                  verificationType === type
                    ? 'bg-[#F0B90B] progress-fill-animate'
                    : idx < ['email', 'sms', '2fa'].indexOf(verificationType)
                    ? 'bg-[#0ECB81]'
                    : 'bg-[#2B3139]'
                }`} />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-xs text-[#848E9C]">
              {t('wallet.verifyDesc')}
            </p>

            {/* Verification type tabs */}
            <div className="flex gap-1 bg-[#2B3139] rounded-lg p-1">
              {[
                { id: 'email' as const, label: t('wallet.email') },
                { id: 'sms' as const, label: t('wallet.sms') },
                { id: '2fa' as const, label: t('wallet.google2fa') },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setVerificationType(tab.id)}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                    verificationType === tab.id
                      ? 'bg-[#0B0E11] text-[#F0B90B]'
                      : 'text-[#848E9C] hover:text-[#EAECEF]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Verification code input */}
            <div>
              <label className="text-xs text-[#848E9C] font-medium mb-2 block">
                {verificationType === 'email' ? t('wallet.emailCode') : verificationType === 'sms' ? t('wallet.smsCode') : t('wallet.googleAuthCode')}
              </label>
              <Input
                placeholder={t('wallet.enterCode')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 text-center text-lg tracking-[0.3em] font-mono focus:border-[#F0B90B] focus:ring-[#F0B90B]/20"
                maxLength={6}
              />
              {verificationType !== '2fa' && (
                <button className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 mt-2 transition-colors">
                  {t('wallet.sendCode')}
                </button>
              )}
            </div>

            {/* Withdrawal summary */}
            <div className="bg-[#2B3139] rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">{t('trade.amount')}</span>
                <span className="text-[#EAECEF] tabular-nums">{numAmount} {selectedSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">{t('wallet.network')}</span>
                <span className="text-[#EAECEF]">{currentNetwork?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">{t('wallet.address')}</span>
                <span className="text-[#EAECEF] font-mono text-[10px]">{address.slice(0, 8)}...{address.slice(-6)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <div className="w-full space-y-2">
              <Button
                onClick={handleVerifyAndSubmit}
                disabled={verificationCode.length < 6 || isSubmitting}
                className="w-full bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-semibold h-10 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('wallet.processing')}
                  </>
                ) : (
                  t('wallet.confirmWithdrawal')
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowVerification(false)}
                className="w-full border-[#2B3139] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9"
              >
                {t('trade.cancel')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}
