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
  QrCode,
  ChevronDown,
  Shield,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Mock network data per asset
const networkMap: Record<string, { id: string; name: string; fee: string; minDeposit: string; confirmations: number }[]> = {
  BTC: [
    { id: 'btc', name: 'Bitcoin', fee: 'free', minDeposit: '0.0001 BTC', confirmations: 1 },
  ],
  ETH: [
    { id: 'erc20', name: 'Ethereum (ERC20)', fee: 'free', minDeposit: '0.001 ETH', confirmations: 12 },
    { id: 'arbitrum', name: 'Arbitrum One', fee: 'free', minDeposit: '0.0001 ETH', confirmations: 1 },
    { id: 'optimism', name: 'Optimism', fee: 'free', minDeposit: '0.0001 ETH', confirmations: 1 },
  ],
  BNB: [
    { id: 'bep2', name: 'BNB Beacon Chain (BEP2)', fee: 'free', minDeposit: '0.01 BNB', confirmations: 1 },
    { id: 'bep20', name: 'BNB Smart Chain (BEP20)', fee: 'free', minDeposit: '0.001 BNB', confirmations: 1 },
  ],
  SOL: [
    { id: 'sol', name: 'Solana', fee: 'free', minDeposit: '0.01 SOL', confirmations: 1 },
  ],
  USDT: [
    { id: 'erc20', name: 'Ethereum (ERC20)', fee: 'free', minDeposit: '1 USDT', confirmations: 12 },
    { id: 'bep20', name: 'BNB Smart Chain (BEP20)', fee: 'free', minDeposit: '0.01 USDT', confirmations: 1 },
    { id: 'trc20', name: 'Tron (TRC20)', fee: 'free', minDeposit: '1 USDT', confirmations: 20 },
    { id: 'sol', name: 'Solana (SPL)', fee: 'free', minDeposit: '0.01 USDT', confirmations: 1 },
  ],
  XRP: [
    { id: 'xrp', name: 'XRP Ledger', fee: 'free', minDeposit: '0.1 XRP', confirmations: 1 },
  ],
  ADA: [
    { id: 'ada', name: 'Cardano', fee: 'free', minDeposit: '1 ADA', confirmations: 15 },
  ],
  DOGE: [
    { id: 'doge', name: 'Dogecoin', fee: 'free', minDeposit: '1 DOGE', confirmations: 6 },
  ],
};

// Generate realistic deposit address
function generateAddress(network: string): string {
  const chars = '0123456789abcdef';
  const prefixes: Record<string, string> = {
    btc: '1',
    erc20: '0x',
    bep2: 'bnb1',
    bep20: '0x',
    trc20: 'T',
    sol: '',
    xrp: 'r',
    ada: 'addr1',
    doge: 'D',
    arbitrum: '0x',
    optimism: '0x',
  };
  const prefix = prefixes[network] || '0x';
  const len = network === 'btc' ? 34 : network === 'sol' ? 44 : network === 'trc20' ? 34 : 40;
  let addr = prefix;
  for (let i = 0; i < len - prefix.length; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

// Mock deposit history
const mockDepositHistory = [
  { id: '1', asset: 'BTC', icon: '₿', network: 'Bitcoin', amount: 0.25, status: 'confirmed' as const, txHash: '0x3a7f...8b2c', time: '2024-01-15T10:30:00Z', confirmations: '6/1' },
  { id: '2', asset: 'ETH', icon: 'Ξ', network: 'ERC20', amount: 1.5, status: 'processing' as const, txHash: '0x9c2d...4e1f', time: '2024-01-15T09:15:00Z', confirmations: '4/12' },
  { id: '3', asset: 'USDT', icon: '₮', network: 'TRC20', amount: 5000, status: 'confirmed' as const, txHash: '0x1b8e...7a3d', time: '2024-01-14T16:00:00Z', confirmations: '20/20' },
  { id: '4', asset: 'BNB', icon: '◆', network: 'BEP20', amount: 10, status: 'pending' as const, txHash: '0x5f3c...2d8a', time: '2024-01-15T14:00:00Z', confirmations: '0/1' },
  { id: '5', asset: 'SOL', icon: '◎', network: 'Solana', amount: 50, status: 'confirmed' as const, txHash: '0x2d9a...6c4b', time: '2024-01-13T11:00:00Z', confirmations: '1/1' },
];

const statusConfig: Record<string, { color: string; bg: string; labelKey: string }> = {
  confirmed: { color: 'text-success', bg: 'bg-success/10', labelKey: 'wallet.confirmed' },
  completed: { color: 'text-success', bg: 'bg-success/10', labelKey: 'wallet.completed' },
  processing: { color: 'text-primary', bg: 'bg-primary/10', labelKey: 'wallet.processing' },
  pending: { color: 'text-muted-foreground', bg: 'bg-muted-foreground/10', labelKey: 'wallet.pending' },
  failed: { color: 'text-destructive', bg: 'bg-destructive/10', labelKey: 'wallet.failed' },
};

export default function DepositView() {
  const { goBack, selectedAsset } = useAppStore();
  const { t, isRTL, language } = useTranslation();
  const [selectedSymbol, setSelectedSymbol] = useState(selectedAsset || 'BTC');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [depositAddress, setDepositAddress] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const depositAssets = ['BTC', 'ETH', 'BNB', 'SOL', 'USDT', 'XRP', 'ADA', 'DOGE'];
  const networks = networkMap[selectedSymbol] || [];
  
  // Set default network when asset changes
  React.useEffect(() => {
    if (networks.length > 0 && !networks.find(n => n.id === selectedNetwork)) {
      setSelectedNetwork(networks[0].id);
    }
  }, [selectedSymbol, networks.length]);

  // Generate address when network changes
  React.useEffect(() => {
    if (selectedNetwork) {
      setDepositAddress(generateAddress(selectedNetwork));
    }
  }, [selectedNetwork]);

  const currentNetwork = networks.find(n => n.id === selectedNetwork);
  const currentAsset = mockAssets.find(a => a.symbol === selectedSymbol);

  const filteredAssets = depositAssets.filter(symbol => {
    if (!searchQuery) return true;
    const asset = mockAssets.find(a => a.symbol === symbol);
    return symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (asset?.name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      toast.success(t('wallet.addressCopied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('wallet.copyFailed'));
    }
  };

  const handleRefreshAddress = () => {
    setDepositAddress(generateAddress(selectedNetwork));
    toast.success(t('wallet.newAddressGenerated'));
  };

  // PERF-001: deterministic QR grid pattern derived from depositAddress —
  // previously Math.random() caused 64 cells to re-render on every render.
  const qrPattern = useMemo(() => {
    if (!depositAddress) return Array<boolean>(64).fill(false);
    return Array.from({ length: 64 }, (_, i) => {
      const charCode = depositAddress.charCodeAt(i % depositAddress.length);
      // simple deterministic pseudo-random: combine char code, position, and a prime
      return ((charCode * 31 + i * 7 + 13) % 100) > 50;
    });
  }, [depositAddress]);

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="space-y-4 p-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 crypto-header-gradient rounded-xl p-3 -mx-1">
          <button
            onClick={goBack}
            aria-label={t('actions.back')}
            className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors press-scale"
          >
            <ArrowLeft className={`h-5 w-5 text-foreground ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <div className="w-9 h-9 rounded-lg gradient-yellow flex items-center justify-center text-lg font-bold text-background">
            {mockAssets.find(a => a.symbol === selectedSymbol)?.icon || '?'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('wallet.deposit')}</h1>
            <p className="text-[10px] text-muted-foreground">{selectedSymbol} • {currentNetwork?.name || t('wallet.selectNetworkPrompt')}</p>
          </div>
        </div>

        {/* Select Asset */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <label className="text-xs text-muted-foreground font-medium mb-2 block">{t('wallet.selectAsset')}</label>
            <div className="relative">
              <button
                onClick={() => { setShowAssetDropdown(!showAssetDropdown); setShowNetworkDropdown(false); }}
                className="w-full flex items-center justify-between px-4 py-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-sm font-bold">
                    {mockAssets.find(a => a.symbol === selectedSymbol)?.icon || '?'}
                  </div>
                  <div className="text-start">
                    <p className="text-sm font-semibold text-foreground">{selectedSymbol}</p>
                    <p className="text-[10px] text-muted-foreground">{mockAssets.find(a => a.symbol === selectedSymbol)?.name}</p>
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showAssetDropdown ? 'rotate-180' : ''}`} />
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
                    <div className="p-2">
                      <Input
                        placeholder={t('wallet.searchAsset')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-secondary border-border text-foreground placeholder:text-muted-foreground h-8 text-sm"
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
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 hover:bg-secondary transition-colors ${
                              selectedSymbol === symbol ? 'bg-secondary' : ''
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
                            {balance && (
                              <span className="text-xs text-muted-foreground tabular-nums" dir="ltr">
                                {balance.available.toLocaleString(language, { maximumFractionDigits: 4 })} {symbol}
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
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <label className="text-xs text-muted-foreground font-medium mb-2 block">{t('wallet.selectNetwork')}</label>
              {/* Network Cards */}
              <div className="grid gap-2 mb-3">
                {networks.map((network) => (
                  <button
                    key={network.id}
                    onClick={() => setSelectedNetwork(network.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all network-card hover-lift ${
                      selectedNetwork === network.id ? 'selected' : 'bg-secondary/50'
                    }`}
                  >
                    <div className="text-start">
                      <p className="text-sm font-medium text-foreground">{network.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t('wallet.deposit')}: {network.minDeposit} • {t('wallet.fee')}: {network.fee === 'free' ? t('wallet.free') : network.fee}</p>
                    </div>
                    {selectedNetwork === network.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-primary check-pop-animate" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              {/* Network info */}
              {currentNetwork && (
                <div className="grid grid-cols-3 gap-2 text-xs slide-up-enter">
                  <div className="bg-secondary rounded-lg p-2.5 card-hover-effect">
                    <span className="text-muted-foreground block">{t('wallet.minDeposit')}</span>
                    <span className="text-foreground font-medium mt-0.5 block">{currentNetwork.minDeposit}</span>
                  </div>
                  <div className="bg-secondary rounded-lg p-2.5 card-hover-effect">
                    <span className="text-muted-foreground block">{t('wallet.depositFee')}</span>
                    <span className="text-success font-medium mt-0.5 block neon-glow-green">{currentNetwork.fee === 'free' ? t('wallet.free') : currentNetwork.fee}</span>
                  </div>
                  <div className="bg-secondary rounded-lg p-2.5 card-hover-effect">
                    <span className="text-muted-foreground block">{t('wallet.confirmations')}</span>
                    <span className="text-foreground font-medium mt-0.5 block">{currentNetwork.confirmations} {t('wallet.blocks')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Deposit Address */}
        {depositAddress && currentNetwork && (
          <Card className="bg-card border-border glow-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-muted-foreground font-medium">{t('wallet.depositAddress')}</label>
                <button
                  onClick={handleRefreshAddress}
                  aria-label={t('wallet.newAddress')}
                  className="text-muted-foreground hover:text-muted-foreground transition-colors flex items-center gap-1 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  {t('wallet.newAddress')}
                </button>
              </div>

              {/* QR Code placeholder with pulsing border */}
              <div className="flex justify-center mb-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-40 h-40 bg-white rounded-xl p-3 flex items-center justify-center qr-pulse-border"
                >
                  <div className="w-full h-full bg-background rounded-lg flex items-center justify-center relative overflow-hidden">
                    <QrCode className="h-20 w-20 text-primary" />
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-2 opacity-30">
                      {qrPattern.map((on, i) => (
                        <div
                          key={i}
                          className={`${on ? 'bg-primary' : 'bg-transparent'} rounded-[1px]`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Address display with monospace styling */}
              <div className="bg-secondary rounded-lg p-3 mb-3 border border-border hover:border-primary/20 transition-colors">
                <p className="text-sm text-foreground address-display text-center neon-glow-yellow break-all" dir="ltr">
                  {depositAddress}
                </p>
              </div>

              {/* Copy button with success animation */}
              <Button
                onClick={handleCopy}
                aria-label={t('actions.copy')}
                className={`w-full font-semibold h-10 ripple-effect ${
                  copied
                    ? 'bg-success hover:bg-success/90 text-background copy-success-animate'
                    : 'gradient-submit-btn text-background'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 me-2" />
                    {t('wallet.copied')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 me-2" />
                    {t('wallet.copyAddress')}
                  </>
                )}
              </Button>

              {/* Warning with animated icon */}
              <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5 warning-animate" />
                  <div className="space-y-1.5">
                    <p className="text-xs text-destructive font-medium">{t('wallet.important')}</p>
                    <ul className="text-[11px] text-muted-foreground space-y-1">
                      <li>• {t('wallet.depositWarning1').replace('{asset}', selectedSymbol).replace('{network}', currentNetwork.name)}</li>
                      <li>• {t('wallet.depositWarning2')}</li>
                      <li>• {t('wallet.depositWarning3').replace('{amount}', currentNetwork.minDeposit)}</li>
                      <li>• {t('wallet.depositWarning4').replace('{count}', String(currentNetwork.confirmations))}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                <Shield className="h-3 w-3 text-success" />
                <span>{t('wallet.securityNote')}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deposit History */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">{t('wallet.recentDeposits')}</h3>
              <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
                {t('wallet.viewAll')} <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2 fancy-scrollbar max-h-72 overflow-y-auto">
              {mockDepositHistory.map((deposit) => {
                const status = statusConfig[deposit.status];
                return (
                  <div key={deposit.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                        {deposit.icon}
                      </div>
                      <div>
                        <p className="text-sm text-foreground font-medium">
                          {t('wallet.assetDeposit').replace('{asset}', deposit.asset)}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{deposit.network}</span>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">{getTimeAgo(deposit.time)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-sm font-semibold text-success tabular-nums" dir="ltr">
                        +{deposit.amount} {deposit.asset}
                      </p>
                      <Badge className={`text-[10px] h-4 px-1.5 border-0 ${status.color} ${status.bg}`}>
                        {t(status.labelKey)}
                      </Badge>
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
    </ScrollArea>
  );
}
