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
  completed: { color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10', labelKey: 'wallet.completed' },
  processing: { color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10', labelKey: 'wallet.processing' },
  pending: { color: 'text-[#848E9C]', bg: 'bg-[#848E9C]/10', labelKey: 'wallet.pending' },
  failed: { color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/10', labelKey: 'wallet.failed' },
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
  const { t } = useTranslation();
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

  const handleTransfer = () => {
    if (!isValid) return;
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setAmount('');
      const fromLabel = t(walletOptions.find(w => w.id === fromWallet)?.labelKey || '');
      const toLabel = t(walletOptions.find(w => w.id === toWallet)?.labelKey || '');
      toast.success(t('wallet.transferSuccess').replace('{amount}', String(numAmount)).replace('{asset}', selectedAsset).replace('{from}', fromLabel).replace('{to}', toLabel));
    }, 1200);
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="space-y-4 p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-lg bg-[#2B3139] flex items-center justify-center hover:bg-[#363C45] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-[#EAECEF]" />
          </button>
          <h1 className="text-lg font-bold text-[#EAECEF]">{t('wallet.transfer')}</h1>
        </div>

        {/* From/To Wallet Selection */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            {/* From Wallet */}
            <div>
              <label className="text-xs text-[#848E9C] font-medium mb-2 block">{t('wallet.from')}</label>
              <div className="relative">
                <button
                  onClick={() => { setShowFromDropdown(!showFromDropdown); setShowToDropdown(false); setShowAssetDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#2B3139] rounded-lg hover:bg-[#363C45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      fromWallet === 'spot' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' :
                      fromWallet === 'funding' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                      fromWallet === 'earn' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                      'bg-[#F6465D]/10 text-[#F6465D]'
                    }`}>
                      {fromWallet === 'spot' ? 'S' : fromWallet === 'funding' ? 'F' : fromWallet === 'earn' ? 'E' : 'X'}
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-semibold text-[#EAECEF]">
                        {t(walletOptions.find(w => w.id === fromWallet)?.labelKey || '')}
                      </p>
                      <p className="text-[10px] text-[#5E6673]">
                        {t(walletOptions.find(w => w.id === fromWallet)?.descriptionKey || '')}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-[#848E9C] transition-transform ${showFromDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showFromDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-[#1E2329] border border-[#2B3139] rounded-lg z-20 shadow-xl overflow-hidden"
                    >
                      {walletOptions.filter(w => w.id !== toWallet).map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => {
                            setFromWallet(wallet.id);
                            setShowFromDropdown(false);
                            setAmount('');
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2B3139] transition-colors ${
                            fromWallet === wallet.id ? 'bg-[#2B3139]' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            wallet.id === 'spot' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' :
                            wallet.id === 'funding' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                            wallet.id === 'earn' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                            'bg-[#F6465D]/10 text-[#F6465D]'
                          }`}>
                            {wallet.id === 'spot' ? 'S' : wallet.id === 'funding' ? 'F' : wallet.id === 'earn' ? 'E' : 'X'}
                          </div>
                          <div className="text-start">
                            <p className="text-sm font-medium text-[#EAECEF]">{t(wallet.labelKey)}</p>
                            <p className="text-[10px] text-[#5E6673]">{t(wallet.descriptionKey)}</p>
                          </div>
                          {fromWallet === wallet.id && (
                            <CheckCircle2 className="h-4 w-4 text-[#F0B90B] ms-auto" />
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
                className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center hover:bg-[#363C45] transition-all hover:scale-110 active:scale-95"
              >
                <ArrowUpDown className="h-4 w-4 text-[#F0B90B]" />
              </button>
            </div>

            {/* To Wallet */}
            <div>
              <label className="text-xs text-[#848E9C] font-medium mb-2 block">{t('wallet.to')}</label>
              <div className="relative">
                <button
                  onClick={() => { setShowToDropdown(!showToDropdown); setShowFromDropdown(false); setShowAssetDropdown(false); }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-[#2B3139] rounded-lg hover:bg-[#363C45] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      toWallet === 'spot' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' :
                      toWallet === 'funding' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                      toWallet === 'earn' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                      'bg-[#F6465D]/10 text-[#F6465D]'
                    }`}>
                      {toWallet === 'spot' ? 'S' : toWallet === 'funding' ? 'F' : toWallet === 'earn' ? 'E' : 'X'}
                    </div>
                    <div className="text-start">
                      <p className="text-sm font-semibold text-[#EAECEF]">
                        {t(walletOptions.find(w => w.id === toWallet)?.labelKey || '')}
                      </p>
                      <p className="text-[10px] text-[#5E6673]">
                        {t(walletOptions.find(w => w.id === toWallet)?.descriptionKey || '')}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-[#848E9C] transition-transform ${showToDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showToDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-[#1E2329] border border-[#2B3139] rounded-lg z-20 shadow-xl overflow-hidden"
                    >
                      {walletOptions.filter(w => w.id !== fromWallet).map((wallet) => (
                        <button
                          key={wallet.id}
                          onClick={() => {
                            setToWallet(wallet.id);
                            setShowToDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#2B3139] transition-colors ${
                            toWallet === wallet.id ? 'bg-[#2B3139]' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            wallet.id === 'spot' ? 'bg-[#F0B90B]/10 text-[#F0B90B]' :
                            wallet.id === 'funding' ? 'bg-[#0ECB81]/10 text-[#0ECB81]' :
                            wallet.id === 'earn' ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' :
                            'bg-[#F6465D]/10 text-[#F6465D]'
                          }`}>
                            {wallet.id === 'spot' ? 'S' : wallet.id === 'funding' ? 'F' : wallet.id === 'earn' ? 'E' : 'X'}
                          </div>
                          <div className="text-start">
                            <p className="text-sm font-medium text-[#EAECEF]">{t(wallet.labelKey)}</p>
                            <p className="text-[10px] text-[#5E6673]">{t(wallet.descriptionKey)}</p>
                          </div>
                          {toWallet === wallet.id && (
                            <CheckCircle2 className="h-4 w-4 text-[#F0B90B] ms-auto" />
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
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <label className="text-xs text-[#848E9C] font-medium mb-2 block">{t('wallet.asset')}</label>
            <div className="relative">
              <button
                onClick={() => { setShowAssetDropdown(!showAssetDropdown); setShowFromDropdown(false); setShowToDropdown(false); }}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#2B3139] rounded-lg hover:bg-[#363C45] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0B0E11] flex items-center justify-center text-sm font-bold">
                    {mockAssets.find(a => a.symbol === selectedAsset)?.icon || '?'}
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-semibold text-[#EAECEF]">{selectedAsset}</p>
                    <p className="text-[10px] text-[#5E6673]">{mockAssets.find(a => a.symbol === selectedAsset)?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#848E9C] tabular-nums">
                    {t('wallet.available')}: {availableBalance.toFixed(4)} {selectedAsset}
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
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-[#2B3139] transition-colors ${
                              selectedAsset === symbol ? 'bg-[#2B3139]' : ''
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-full bg-[#0B0E11] flex items-center justify-center text-xs font-bold">
                                {asset.icon}
                              </div>
                              <div className="text-start">
                                <p className="text-sm font-medium text-[#EAECEF]">{symbol}</p>
                                <p className="text-[10px] text-[#5E6673]">{asset.name}</p>
                              </div>
                            </div>
                            <span className="text-xs text-[#848E9C] tabular-nums">{balance.toFixed(4)}</span>
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
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-[#848E9C] font-medium">{t('trade.amount')}</label>
                <span className="text-xs text-[#5E6673]">
                  {t('wallet.available')}: <span className="text-[#EAECEF] tabular-nums">{availableBalance.toFixed(4)}</span> {selectedAsset}
                </span>
              </div>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] h-11 pe-16 text-sm tabular-nums focus:border-[#F0B90B] focus:ring-[#F0B90B]/20"
                />
                <button
                  onClick={handleMax}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-semibold text-[#F0B90B] bg-[#F0B90B]/10 rounded hover:bg-[#F0B90B]/20 transition-colors"
                >
                  {t('wallet.max')}
                </button>
              </div>
              {numAmount > availableBalance && (
                <p className="text-[10px] text-[#F6465D] mt-1">{t('wallet.insufficientBalance')}</p>
              )}
            </div>

            {/* Transfer summary */}
            <div className="bg-[#2B3139] rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#848E9C]">{t('wallet.from')}</span>
                <span className="text-[#EAECEF]">{t(walletOptions.find(w => w.id === fromWallet)?.labelKey || '')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">{t('wallet.to')}</span>
                <span className="text-[#EAECEF]">{t(walletOptions.find(w => w.id === toWallet)?.labelKey || '')}</span>
              </div>
              <Separator className="bg-[#0B0E11]" />
              <div className="flex justify-between">
                <span className="text-[#848E9C]">{t('wallet.transferAmount')}</span>
                <span className="text-[#0ECB81] font-semibold tabular-nums">
                  {numAmount > 0 ? numAmount.toFixed(6) : '0.00'} {selectedAsset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#848E9C]">{t('wallet.fee')}</span>
                <span className="text-[#0ECB81] font-medium">{t('wallet.free')}</span>
              </div>
            </div>

            {/* Transfer button */}
            <Button
              onClick={handleTransfer}
              disabled={!isValid || isTransferring}
              className="w-full bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-semibold h-11 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransferring ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t('wallet.transferring')}
                </>
              ) : (
                <>
                  {t('wallet.transfer')}
                  <ArrowRight className="h-4 w-4 ms-2" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Transfers */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#EAECEF]">{t('wallet.recentTransfers')}</h3>
            </div>

            <div className="space-y-2">
              {mockTransferHistory.map((transfer) => {
                const status = statusConfig[transfer.status];
                return (
                  <div key={transfer.id} className="flex items-center justify-between py-2.5 border-b border-[#2B3139] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2B3139] flex items-center justify-center text-sm font-bold">
                        {transfer.icon}
                      </div>
                      <div>
                        <p className="text-sm text-[#EAECEF] font-medium">
                          {transfer.amount} {transfer.asset}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[#5E6673]">
                          <span>{transfer.from}</span>
                          <ArrowRight className="h-2.5 w-2.5" />
                          <span>{transfer.to}</span>
                          <span className="ms-1">• {getTimeAgo(transfer.time)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`text-[9px] h-4 px-1.5 border-0 ${status.color} ${status.bg}`}>
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
