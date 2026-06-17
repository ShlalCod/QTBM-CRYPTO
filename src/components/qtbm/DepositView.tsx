'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
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
    { id: 'btc', name: 'Bitcoin', fee: 'Free', minDeposit: '0.0001 BTC', confirmations: 1 },
  ],
  ETH: [
    { id: 'erc20', name: 'Ethereum (ERC20)', fee: 'Free', minDeposit: '0.001 ETH', confirmations: 12 },
    { id: 'arbitrum', name: 'Arbitrum One', fee: 'Free', minDeposit: '0.0001 ETH', confirmations: 1 },
    { id: 'optimism', name: 'Optimism', fee: 'Free', minDeposit: '0.0001 ETH', confirmations: 1 },
  ],
  BNB: [
    { id: 'bep2', name: 'BNB Beacon Chain (BEP2)', fee: 'Free', minDeposit: '0.01 BNB', confirmations: 1 },
    { id: 'bep20', name: 'BNB Smart Chain (BEP20)', fee: 'Free', minDeposit: '0.001 BNB', confirmations: 1 },
  ],
  SOL: [
    { id: 'sol', name: 'Solana', fee: 'Free', minDeposit: '0.01 SOL', confirmations: 1 },
  ],
  USDT: [
    { id: 'erc20', name: 'Ethereum (ERC20)', fee: 'Free', minDeposit: '1 USDT', confirmations: 12 },
    { id: 'bep20', name: 'BNB Smart Chain (BEP20)', fee: 'Free', minDeposit: '0.01 USDT', confirmations: 1 },
    { id: 'trc20', name: 'Tron (TRC20)', fee: 'Free', minDeposit: '1 USDT', confirmations: 20 },
    { id: 'sol', name: 'Solana (SPL)', fee: 'Free', minDeposit: '0.01 USDT', confirmations: 1 },
  ],
  XRP: [
    { id: 'xrp', name: 'XRP Ledger', fee: 'Free', minDeposit: '0.1 XRP', confirmations: 1 },
  ],
  ADA: [
    { id: 'ada', name: 'Cardano', fee: 'Free', minDeposit: '1 ADA', confirmations: 15 },
  ],
  DOGE: [
    { id: 'doge', name: 'Dogecoin', fee: 'Free', minDeposit: '1 DOGE', confirmations: 6 },
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

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  confirmed: { color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10', label: 'Confirmed' },
  completed: { color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10', label: 'Completed' },
  processing: { color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10', label: 'Processing' },
  pending: { color: 'text-[#848E9C]', bg: 'bg-[#848E9C]/10', label: 'Pending' },
  failed: { color: 'text-[#F6465D]', bg: 'bg-[#F6465D]/10', label: 'Failed' },
};

export default function DepositView() {
  const { goBack, selectedAsset } = useAppStore();
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
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy address');
    }
  };

  const handleRefreshAddress = () => {
    setDepositAddress(generateAddress(selectedNetwork));
    toast.success('New address generated');
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
          <div className="w-9 h-9 rounded-lg gradient-yellow flex items-center justify-center text-lg font-bold text-[#0B0E11]">
            {mockAssets.find(a => a.symbol === selectedSymbol)?.icon || '?'}
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#EAECEF]">Deposit</h1>
            <p className="text-[10px] text-[#848E9C]">{selectedSymbol} • {currentNetwork?.name || 'Select network'}</p>
          </div>
        </div>

        {/* Select Asset */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <label className="text-xs text-[#848E9C] font-medium mb-2 block">Select Asset</label>
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
                <ChevronDown className={`h-4 w-4 text-[#848E9C] transition-transform ${showAssetDropdown ? 'rotate-180' : ''}`} />
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
                        placeholder="Search asset..."
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
                                {balance.available.toLocaleString('en-US', { maximumFractionDigits: 4 })} {symbol}
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
              <label className="text-xs text-[#848E9C] font-medium mb-2 block">Select Network</label>
              {/* Network Cards */}
              <div className="grid gap-2 mb-3">
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
                      <p className="text-[10px] text-[#5E6673]">Deposit: {network.minDeposit} • Fee: {network.fee}</p>
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

              {/* Network info */}
              {currentNetwork && (
                <div className="grid grid-cols-3 gap-2 text-xs slide-up-enter">
                  <div className="bg-[#2B3139] rounded-lg p-2.5 card-hover-effect">
                    <span className="text-[#5E6673] block">Min Deposit</span>
                    <span className="text-[#EAECEF] font-medium mt-0.5 block">{currentNetwork.minDeposit}</span>
                  </div>
                  <div className="bg-[#2B3139] rounded-lg p-2.5 card-hover-effect">
                    <span className="text-[#5E6673] block">Deposit Fee</span>
                    <span className="text-[#0ECB81] font-medium mt-0.5 block neon-glow-green">{currentNetwork.fee}</span>
                  </div>
                  <div className="bg-[#2B3139] rounded-lg p-2.5 card-hover-effect">
                    <span className="text-[#5E6673] block">Confirmations</span>
                    <span className="text-[#EAECEF] font-medium mt-0.5 block">{currentNetwork.confirmations} blocks</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Deposit Address */}
        {depositAddress && currentNetwork && (
          <Card className="bg-[#1E2329] border-[#2B3139] glow-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-[#848E9C] font-medium">Deposit Address</label>
                <button
                  onClick={handleRefreshAddress}
                  className="text-[#5E6673] hover:text-[#848E9C] transition-colors flex items-center gap-1 text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  New Address
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
                  <div className="w-full h-full bg-[#0B0E11] rounded-lg flex items-center justify-center relative overflow-hidden">
                    <QrCode className="h-20 w-20 text-[#F0B90B]" />
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-2 opacity-30">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`${Math.random() > 0.5 ? 'bg-[#F0B90B]' : 'bg-transparent'} rounded-[1px]`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Address display with monospace styling */}
              <div className="bg-[#2B3139] rounded-lg p-3 mb-3 border border-[#2B3139] hover:border-[#F0B90B]/20 transition-colors">
                <p className="text-sm text-[#EAECEF] address-display text-center neon-glow-yellow">
                  {depositAddress}
                </p>
              </div>

              {/* Copy button with success animation */}
              <Button
                onClick={handleCopy}
                className={`w-full font-semibold h-10 ripple-effect ${
                  copied
                    ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-[#0B0E11] copy-success-animate'
                    : 'gradient-submit-btn text-[#0B0E11]'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Address
                  </>
                )}
              </Button>

              {/* Warning with animated icon */}
              <div className="mt-4 p-3 bg-[#F6465D]/5 border border-[#F6465D]/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#F6465D] shrink-0 mt-0.5 warning-animate" />
                  <div className="space-y-1.5">
                    <p className="text-xs text-[#F6465D] font-medium">Important</p>
                    <ul className="text-[11px] text-[#848E9C] space-y-1">
                      <li>• Deposit only <span className="text-[#EAECEF] font-medium">{selectedSymbol}</span> to this address on the <span className="text-[#EAECEF] font-medium">{currentNetwork.name}</span> network</li>
                      <li>• Depositing any other asset or using a different network may result in permanent loss</li>
                      <li>• Minimum deposit: <span className="text-[#EAECEF] font-medium">{currentNetwork.minDeposit}</span></li>
                      <li>• Requires <span className="text-[#EAECEF] font-medium">{currentNetwork.confirmations}</span> network confirmation(s) before crediting</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Security note */}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-[#5E6673]">
                <Shield className="h-3 w-3 text-[#0ECB81]" />
                <span>Your deposit address changes periodically for security. Always verify before sending.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deposit History */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#EAECEF]">Recent Deposits</h3>
              <button className="text-xs text-[#F0B90B] hover:text-[#F0B90B]/80 flex items-center gap-1 transition-colors">
                View All <ExternalLink className="h-3 w-3" />
              </button>
            </div>

            <div className="space-y-2 fancy-scrollbar max-h-72 overflow-y-auto">
              {mockDepositHistory.map((deposit) => {
                const status = statusConfig[deposit.status];
                return (
                  <div key={deposit.id} className="flex items-center justify-between py-2.5 border-b border-[#2B3139] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2B3139] flex items-center justify-center text-sm font-bold">
                        {deposit.icon}
                      </div>
                      <div>
                        <p className="text-sm text-[#EAECEF] font-medium">
                          {deposit.asset} Deposit
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-[#5E6673]">{deposit.network}</span>
                          <span className="text-[10px] text-[#5E6673]">•</span>
                          <span className="text-[10px] text-[#5E6673]">{getTimeAgo(deposit.time)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#0ECB81] tabular-nums">
                        +{deposit.amount} {deposit.asset}
                      </p>
                      <Badge className={`text-[9px] h-4 px-1.5 border-0 ${status.color} ${status.bg}`}>
                        {status.label}
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
