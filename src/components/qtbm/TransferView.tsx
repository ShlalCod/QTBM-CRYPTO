'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { mockAssets, mockWalletBalances, formatPrice, getTimeAgo } from '@/lib/mock-data';
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronDown,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type WalletType = 'spot' | 'funding' | 'earn' | 'futures';

const walletOptions: { id: WalletType; labelKey: string; descriptionKey: string }[] = [
  { id: 'spot', labelKey: 'wallet.spotWallet', descriptionKey: 'wallet.tradingBalance' },
  { id: 'funding', labelKey: 'wallet.fundingWallet', descriptionKey: 'wallet.p2pDeposits' },
  { id: 'earn', labelKey: 'wallet.earnWallet', descriptionKey: 'wallet.savingsStaking' },
  { id: 'futures', labelKey: 'wallet.futuresWallet', descriptionKey: 'wallet.futuresTradingDesc' },
];

// Mock transfer history
const mockTransferHistory = [
  { id: '1', asset: 'BNB', icon: '◆', amount: 10, from: 'Spot', to: 'Funding', status: 'completed' as const, time: '2024-01-14T14:20:00Z' },
  { id: '2', asset: 'USDT', icon: '₮', amount: 5000, from: 'Funding', to: 'Spot', status: 'completed' as const, time: '2024-01-13T09:00:00Z' },
  { id: '3', asset: 'ETH', icon: 'Ξ', amount: 2.5, from: 'Spot', to: 'Earn', status: 'completed' as const, time: '2024-01-12T16:30:00Z' },
  { id: '4', asset: 'BTC', icon: '₿', amount: 0.5, from: 'Funding', to: 'Futures', status: 'processing' as const, time: '2024-01-15T11:00:00Z' },
  { id: '5', asset: 'SOL', icon: '◎', amount: 50, from: 'Earn', to: 'Spot', status: 'completed' as const, time: '2024-01-11T08:15:00Z' },
];

const statusConfig: Record<string, { color: string; bg: string; labelKey: string }> = {
  completed: { color: 'text-success', bg: 'bg-success/10', labelKey: 'wallet.completed' },
  processing: { color: 'text-primary', bg: 'bg-primary/10', labelKey: 'wallet.processing' },
  pending: { color: 'text-muted-foreground', bg: 'bg-muted-foreground/10', labelKey: 'wallet.pending' },
  failed: { color: 'text-destructive', bg: 'bg-destructive/10', labelKey: 'wallet.failed' },
};

// Get balance for a wallet type (simulate different balances per wallet)
function getWalletBalance(asset: string, walletType: WalletType): number {
  const baseBalance = mockWalletBalances.find(b => b.asset === asset);
  if (!baseBalance) return 0;
  
  const multipliers: Record<WalletType, number> = {
    spot: 0.7,
    funding: 0.2,
    earn: 0.08,
    futures: 0.02,
  };
  return baseBalance.available * multipliers[walletType];
}

export default function TransferView() {
  const { goBack } = useAppStore();
  const { t, isRTL } = useTranslation();
  const [fromWallet, setFromWallet] = useState<WalletType>('spot');
  const [toWallet, setToWallet] = useState<WalletType>('funding');
  const [selectedAsset, setSelectedAsset] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);

  const transferAssets = ['USDT', 'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE'];
  const availableBalance = getWalletBalance(selectedAsset, fromWallet);
  const numAmount = parseFloat(amount) || 0;
  const isValid = numAmount > 0 && numAmount <= availableBalance && fromWallet !== toWallet;

  const handleSwap = () => {
    setFromWallet(toWallet);
    setToWallet(fromWallet);
    setAmount('');
  };

  const handleMax = () => {
    if (availableBalance > 0) {
      setAmount(availableBalance.toFixed(6));
    }
  };

  const handleTransfer = async () => {
    if (!isValid) return;
    setIsTransferring(true);
    try {
      const { processTransferCall } = await import('@/lib/firestore');
      const result = await processTransferCall({
        asset: selectedAsset,
        amount: numAmount,
        fromWallet: fromWallet as 'spot' | 'funding' | 'earn' | 'futures',
        toWallet: toWallet as 'spot' | 'funding' | 'earn' | 'futures',
      });
      setAmount('');
      const fromLabel = t(walletOptions.find(w => w.id === fromWallet)?.labelKey || '');
      const toLabel = t(walletOptions.find(w => w.id === toWallet)?.labelKey || '');
      toast.success(
        t('wallet.transferSuccess').replace('{amount}', String(numAmount)).replace('{asset}', selectedAsset).replace('{from}', fromLabel).replace('{to}', toLabel),
        { description: `ID: ${result.transactionId}` }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transfer failed';
      toast.error(message);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="space-y-4 p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={goBack}
            aria-label={t('actions.back')}
            className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className={`h-5 w-5 text-foreground ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <h1 className="text-lg font-bold text-foreground">{t('wallet.transfer')}</h1>
        </div>

        {/* From/To Wallet Selection */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            {/* From Wallet */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">{t('wallet.from')}</label>
              <div className="relative">
                <button
                  onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); setShowAssetDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      fromWallet === 'spot' ? 'bg-primary/10 text-primary' :
                      fromWallet === 'funding' ? 'bg-success/10 text-success' :
                      fromWallet === 'earn' ? 'bg-purple/10 text-purple' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {fromWallet === 'spot' ? 'S' : fromWallet === 'funding' ? 'F' : fromWallet === 'earn' ? 'E' : 'X'}
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-semibold text-foreground">
                        {t(walletOptions.find(w => w.id === fromWallet)?.labelKey || '')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {t(walletOptions.find(w => w.id === fromWallet)?.descriptionKey || '')}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showFromDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showFromDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full start-0 end-0 mt-1 bg-card border border-border rounded-lg z-20 shadow-xl overflow-hidden"
                    >
                      {walletOptions.filter(w => w.id !== toWallet).map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => {
                            setFromWallet(wallet.id);
                            setShowFromDropdown(false);
                            setAmount('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors ${
                            fromWallet === wallet.id ? 'bg-secondary' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            wallet.id === 'spot' ? 'bg-primary/10 text-primary' :
                            wallet.id === 'funding' ? 'bg-success/10 text-success' :
                            wallet.id === 'earn' ? 'bg-purple/10 text-purple' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {wallet.id === 'spot' ? 'S' : wallet.id === 'funding' ? 'F' : wallet.id === 'earn' ? 'E' : 'X'}
                          </div>
                          <div className="text-start">
                            <p className="text-sm font-medium text-foreground">{t(wallet.labelKey)}</p>
                            <p className="text-[10px] text-muted-foreground">{t(wallet.descriptionKey)}</p>
                          </div>
                          {fromWallet === wallet.id && (
                            <CheckCircle2 className="h-4 w-4 text-primary ms-auto" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center my-2">
              <button
                onClick={handleSwap}
                aria-label={t('wallet.transfer')}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-all hover:scale-110 active:scale-95"
              >
                <ArrowUpDown className="h-4 w-4 text-primary" />
              </button>
            </div>

            {/* To Wallet */}
            <div>
              <label className="text-xs text-muted-foreground font-medium mb-2 block">{t('wallet.to')}</label>
              <div className="relative">
                <button
                  onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); setShowAssetDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      toWallet === 'spot' ? 'bg-primary/10 text-primary' :
                      toWallet === 'funding' ? 'bg-success/10 text-success' :
                      toWallet === 'earn' ? 'bg-purple/10 text-purple' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {toWallet === 'spot' ? 'S' : toWallet === 'funding' ? 'F' : toWallet === 'earn' ? 'E' : 'X'}
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-semibold text-foreground">
                        {t(walletOptions.find(w => w.id === toWallet)?.labelKey || '')}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {t(walletOptions.find(w => w.id === toWallet)?.descriptionKey || '')}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showToDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showToDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full start-0 end-0 mt-1 bg-card border border-border rounded-lg z-20 shadow-xl overflow-hidden"
                    >
                      {walletOptions.filter(w => w.id !== fromWallet).map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => {
                            setToWallet(wallet.id);
                            setShowToDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary transition-colors ${
                            toWallet === wallet.id ? 'bg-secondary' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            wallet.id === 'spot' ? 'bg-primary/10 text-primary' :
                            wallet.id === 'funding' ? 'bg-success/10 text-success' :
                            wallet.id === 'earn' ? 'bg-purple/10 text-purple' :
                            'bg-destructive/10 text-destructive'
                          }`}>
                            {wallet.id === 'spot' ? 'S' : wallet.id === 'funding' ? 'F' : wallet.id === 'earn' ? 'E' : 'X'}
                          </div>
                          <div className="text-start">
                            <p className="text-sm font-medium text-foreground">{t(wallet.labelKey)}</p>
                            <p className="text-[10px] text-muted-foreground">{t(wallet.descriptionKey)}</p>
                          </div>
                          {toWallet === wallet.id && (
                            <CheckCircle2 className="h-4 w-4 text-primary ms-auto" />
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Selection */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <label className="text-xs text-muted-foreground font-medium mb-2 block">{t('wallet.asset')}</label>
            <div className="relative">
              <button
                onClick={() => { setShowAssetDropdown(!showAssetDropdown); setShowFromDropdown(false); setShowToDropdown(false); }}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-bold">
                    {mockAssets.find(a => a.symbol === selectedAsset)?.icon || '?'}
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-semibold text-foreground">{selectedAsset}</p>
                    <p className="text-[10px] text-muted-foreground">{mockAssets.find(a => a.symbol === selectedAsset)?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {t('wallet.available')}: {availableBalance.toFixed(4)} {selectedAsset}
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showAssetDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              <AnimatePresence>
                {showAssetDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full start-0 end-0 mt-1 bg-card border border-border rounded-lg z-20 shadow-xl overflow-hidden"
                  >
                    <div className="max-h-64 overflow-y-auto">
                      {transferAssets.map((symbol) => {
                        const asset = mockAssets.find(a => a.symbol === symbol);
                        if (!asset) return null;
                        const balance = getWalletBalance(symbol, fromWallet);
                        return (
                          <button
                            key={symbol}
                            onClick={() => {
                              setSelectedAsset(symbol);
                              setShowAssetDropdown(false);
                              setAmount('');
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary transition-colors ${
                              selectedAsset === symbol ? 'bg-secondary' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-background flex items-center justify-center text-xs font-bold">
                                {asset.icon}
                              </div>
                              <div className="text-start">
                                <p className="text-sm font-medium text-foreground">{symbol}</p>
                                <p className="text-[10px] text-muted-foreground">{asset.name}</p>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground tabular-nums">{balance.toFixed(4)}</span>
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

        {/* Amount Input */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-muted-foreground font-medium">{t('trade.amount')}</label>
                <span className="text-xs text-muted-foreground">
                  {t('wallet.available')}: <span className="text-foreground tabular-nums">{availableBalance.toFixed(4)}</span> {selectedAsset}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-11 pe-16 text-sm tabular-nums focus:border-primary focus:ring-primary/20"
                />
                <button
                  onClick={handleMax}
                  aria-label={t('wallet.max')}
                  className="absolute end-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-semibold text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
                >
                  {t('wallet.max')}
                </button>
              </div>
              {numAmount > availableBalance && (
                <p className="text-[10px] text-destructive mt-1">{t('wallet.insufficientBalance')}</p>
              )}
            </div>

            {/* Transfer summary */}
            <div className="bg-secondary rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('wallet.from')}</span>
                <span className="text-foreground">{t(walletOptions.find(w => w.id === fromWallet)?.labelKey || '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('wallet.to')}</span>
                <span className="text-foreground">{t(walletOptions.find(w => w.id === toWallet)?.labelKey || '')}</span>
              </div>
              <Separator className="bg-background" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('wallet.transferAmount')}</span>
                <span className="text-success font-semibold tabular-nums">
                  {numAmount > 0 ? numAmount.toFixed(6) : '0.00'} {selectedAsset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('wallet.fee')}</span>
                <span className="text-success font-medium">{t('wallet.free')}</span>
              </div>
            </div>

            {/* Transfer button */}
            <Button
              onClick={handleTransfer}
              disabled={!isValid || isTransferring}
              className="w-full bg-primary hover:bg-primary/90 text-background font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t('wallet.transferring')}
                </>
              ) : (
                <>
                  {t('wallet.transfer')}
                  <ArrowRight className={`h-4 w-4 ms-2 ${isRTL ? 'rotate-180' : ''}`} />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{t('wallet.recentTransfers')}</h3>
            </div>

            <div className="space-y-2">
              {mockTransferHistory.map((transfer) => {
                const status = statusConfig[transfer.status];
                return (
                  <div key={transfer.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                        {transfer.icon}
                      </div>
                      <div>
                        <p className="text-sm text-foreground font-medium">
                          {transfer.amount} {transfer.asset}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <span>{transfer.from}</span>
                          <ArrowRight className={`h-2.5 w-2.5 ${isRTL ? 'rotate-180' : ''}`} />
                          <span>{transfer.to}</span>
                          <span className="ms-1">• {getTimeAgo(transfer.time)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-[10px] h-4 px-1.5 border-0 ${status.color} ${status.bg}`}>
                      {t(status.labelKey)}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
