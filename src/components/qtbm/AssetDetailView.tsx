'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { mockAssets, mockWalletBalances, formatPrice, formatNumber } from '@/lib/mock-data';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  ShoppingCart,
  BarChart3,
  Globe,
  CircleDot,
  Coins,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';

// Mini sparkline SVG for price chart
function PriceSparkline({ data, width = 300, height = 80, positive }: { data: number[]; width?: number; height?: number; positive: boolean }) {
  if (data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const color = positive ? '#0ECB81' : '#F6465D';
  const gradientId = `spark-${positive ? 'green' : 'red'}-${Math.random().toString(36).slice(2, 7)}`;

  // Build area path
  const areaPath = `M0,${height} L${points.split(' ').join(' L')} L${width},${height} Z`;
  const linePath = `M${points}`;

  return (
    <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Asset descriptions
const assetDescriptions: Record<string, string> = {
  BTC: 'Bitcoin is the first decentralized cryptocurrency, created in 2009 by Satoshi Nakamoto. It operates on a peer-to-peer network using blockchain technology, enabling secure, transparent, and borderless transactions without the need for intermediaries.',
  ETH: 'Ethereum is a decentralized platform that enables smart contracts and decentralized applications (dApps). Created by Vitalik Buterin in 2015, it introduced programmable blockchain technology, powering DeFi, NFTs, and Web3 innovation.',
  BNB: 'BNB is the native cryptocurrency of the BNB Chain ecosystem, launched by Binance in 2017. It serves as the backbone for BSC transactions, smart contract execution, and offers various utility benefits across the Binance platform.',
  SOL: 'Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale. Known for its speed and low transaction costs, Solana processes up to 65,000 transactions per second.',
  XRP: 'XRP is the native token of the XRP Ledger, an open-source, permissionless blockchain. Created by Ripple, XRP enables fast, low-cost cross-border payments and is used by financial institutions worldwide.',
  ADA: 'Cardano is a proof-of-stake blockchain platform founded on peer-reviewed research and evidence-based development. ADA is its native token, used for transactions, staking, and governance within the ecosystem.',
  DOGE: 'Dogecoin is a cryptocurrency inspired by the "Doge" meme. What started as a joke in 2013 has grown into a widely used digital currency with a passionate community, known for tipping and charitable donations.',
  AVAX: 'Avalanche is a blazingly fast, low-cost, eco-friendly platform for launching dApps, enterprise blockchain deployments, and new financial primitives. AVAX is its native token used for fees, staking, and governance.',
  DOT: 'Polkadot enables cross-chain communication and interoperability, allowing multiple blockchains to work together seamlessly. DOT is used for governance, staking, and bonding to connect new chains.',
  LINK: 'Chainlink is a decentralized oracle network that provides real-world data to smart contracts on any blockchain. LINK is used to pay node operators for retrieving data and securing the network.',
  MATIC: 'Polygon is a protocol and framework for building and connecting Ethereum-compatible blockchain networks. MATIC is used for staking, governance, and paying transaction fees on the Polygon network.',
  UNI: 'Uniswap is a decentralized exchange protocol built on Ethereum. UNI is the governance token that allows holders to vote on protocol changes and participate in the development of the platform.',
  ATOM: 'Cosmos is an ever-expanding ecosystem of interconnected apps and services built for a decentralized future. ATOM is used for staking and governance in the Cosmos Hub.',
  LTC: 'Litecoin is a peer-to-peer cryptocurrency created in 2011 by Charlie Lee. Often called the "silver to Bitcoin\'s gold," it offers faster transaction confirmation times and a different hashing algorithm.',
  NEAR: 'NEAR Protocol is a sharded, proof-of-stake, layer-one blockchain designed to be usable and scalable. NEAR is its native token used for transaction fees, staking, and governance.',
  APT: 'Aptos is a scalable, safe, and upgradeable Layer 1 blockchain built with the Move programming language. APT is used for transaction fees, staking, and governance within the Aptos ecosystem.',
  ARB: 'Arbitrum is a Layer 2 scaling solution for Ethereum that uses optimistic rollups. ARB is the governance token that allows holders to vote on protocol upgrades and fund ecosystem development.',
  OP: 'Optimism is a Layer 2 scaling solution for Ethereum that uses optimistic rollups to deliver faster and cheaper transactions. OP is the governance token for the Optimism Collective.',
  FIL: 'Filecoin is a decentralized storage network that turns cloud storage into an algorithmic market. FIL is the native token used to pay for storage and retrieval of data on the network.',
  IMX: 'Immutable X is a Layer 2 scaling solution for NFTs on Ethereum, offering zero gas fees and carbon-neutral minting. IMX is the utility token used for staking, governance, and paying fees.',
};

export default function AssetDetailView() {
  const { goBack, selectedAsset, navigateTo } = useAppStore();
  
  const asset = mockAssets.find(a => a.symbol === selectedAsset) || mockAssets[0];
  const balance = mockWalletBalances.find(b => b.asset === asset.symbol);
  
  // Generate sparkline data
  const sparklineData = useMemo(() => {
    const data: number[] = [];
    let price = asset.price * (1 - asset.changePercent24h / 100 * 0.5);
    for (let i = 0; i < 48; i++) {
      const volatility = asset.price * 0.008;
      price += (Math.random() - 0.48) * volatility;
      price = Math.max(asset.low24h * 0.95, Math.min(asset.high24h * 1.05, price));
      data.push(price);
    }
    data[data.length - 1] = asset.price;
    return data;
  }, [asset.price, asset.changePercent24h, asset.low24h, asset.high24h]);

  const isPositive = asset.changePercent24h >= 0;

  const statsItems = [
    { label: 'Market Cap', value: '$' + formatNumber(asset.marketCap), icon: Globe },
    { label: '24h Volume', value: '$' + formatNumber(asset.volume24h), icon: BarChart3 },
    { label: '24h High', value: '$' + formatPrice(asset.high24h), icon: TrendingUp },
    { label: '24h Low', value: '$' + formatPrice(asset.low24h), icon: TrendingDown },
    { label: 'Circulating Supply', value: formatNumber(asset.marketCap / asset.price), icon: CircleDot },
    { label: 'Max Supply', value: asset.symbol === 'BTC' ? '21,000,000' : asset.symbol === 'ETH' ? '∞' : 'N/A', icon: Coins },
  ];

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
          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-full bg-[#2B3139] flex items-center justify-center text-lg font-bold">
              {asset.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#EAECEF]">{asset.name}</h1>
                <span className="text-xs text-[#5E6673] font-medium">{asset.symbol}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Display */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-bold text-[#EAECEF] tabular-nums">
                    ${formatPrice(asset.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-xs h-6 px-2 border-0 ${
                    isPositive ? 'bg-[#0ECB81]/10 text-[#0ECB81]' : 'bg-[#F6465D]/10 text-[#F6465D]'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {isPositive ? '+' : ''}{asset.changePercent24h.toFixed(2)}%
                  </Badge>
                  <span className="text-xs text-[#5E6673]">24h</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-[#5E6673]">24h Change</span>
                <span className={`text-sm font-semibold tabular-nums ${isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
                  {isPositive ? '+' : ''}{formatPrice(Math.abs(asset.change24h))}
                </span>
              </div>
            </div>

            {/* Mini Chart */}
            <PriceSparkline data={sparklineData} positive={isPositive} />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-[#EAECEF] mb-3">Market Statistics</h3>
            <div className="grid grid-cols-2 gap-3">
              {statsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-[#2B3139] rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="h-3 w-3 text-[#5E6673]" />
                      <span className="text-[10px] text-[#5E6673]">{item.label}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#EAECEF] tabular-nums">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Balance Card (if user holds this asset) */}
        {balance && (
          <Card className="bg-[#1E2329] border-[#2B3139]">
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-[#EAECEF] mb-3">Your {asset.symbol} Balance</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#2B3139] rounded-lg p-3">
                  <span className="text-[10px] text-[#5E6673] block">Total</span>
                  <p className="text-sm font-semibold text-[#EAECEF] tabular-nums mt-0.5">
                    {balance.total.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </p>
                  <p className="text-[10px] text-[#5E6673] tabular-nums">
                    ≈ ${formatPrice(balance.usdValue)}
                  </p>
                </div>
                <div className="bg-[#2B3139] rounded-lg p-3">
                  <span className="text-[10px] text-[#5E6673] block">Available</span>
                  <p className="text-sm font-semibold text-[#0ECB81] tabular-nums mt-0.5">
                    {balance.available.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </p>
                </div>
                <div className="bg-[#2B3139] rounded-lg p-3">
                  <span className="text-[10px] text-[#5E6673] block">In Orders</span>
                  <p className="text-sm font-semibold text-[#F0B90B] tabular-nums mt-0.5">
                    {balance.locked.toLocaleString('en-US', { maximumFractionDigits: 4 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* About Section */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-semibold text-[#EAECEF]">About {asset.name}</h3>
            </div>
            <p className="text-xs text-[#848E9C] leading-relaxed">
              {assetDescriptions[asset.symbol] || `${asset.name} is a digital asset traded on QTBM BANK. It represents a blockchain-based cryptocurrency with a market cap of $${formatNumber(asset.marketCap)} and 24-hour trading volume of $${formatNumber(asset.volume24h)}.`}
            </p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-[10px] h-5 border-[#2B3139] text-[#848E9C]">
                #{mockAssets.indexOf(asset) + 1} by Market Cap
              </Badge>
              <Badge variant="outline" className="text-[10px] h-5 border-[#2B3139] text-[#848E9C]">
                {asset.symbol}/USDT
              </Badge>
              {balance && (
                <Badge variant="outline" className="text-[10px] h-5 border-[#0ECB81]/30 text-[#0ECB81]">
                  In Portfolio
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => {
              useAppStore.getState().setSelectedMarket(`${asset.symbol}USDT`);
              navigateTo('trade');
            }}
            className="bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-[#0B0E11] font-semibold h-11"
          >
            <ShoppingCart className="h-4 w-4 mr-1.5" />
            Trade
          </Button>
          <Button
            onClick={() => {
              useAppStore.getState().setSelectedAsset(asset.symbol);
              navigateTo('deposit');
            }}
            className="bg-[#2B3139] hover:bg-[#363C45] text-[#EAECEF] font-semibold h-11 border border-[#2B3139]"
          >
            <ArrowDownRight className="h-4 w-4 mr-1.5" />
            Deposit
          </Button>
          <Button
            onClick={() => {
              useAppStore.getState().setSelectedAsset(asset.symbol);
              navigateTo('withdraw');
            }}
            className="bg-[#2B3139] hover:bg-[#363C45] text-[#EAECEF] font-semibold h-11 border border-[#2B3139]"
          >
            <ArrowUpRight className="h-4 w-4 mr-1.5" />
            Withdraw
          </Button>
        </div>

        {/* Bottom padding */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
