'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { mockEarnProducts, mockEarnSubscriptions, formatPrice, formatNumber } from '@/lib/mock-data';
import {
  TrendingUp,
  Lock,
  Shield,
  Clock,
  ArrowLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import type { EarnProduct } from '@/types';

type EarnTab = 'flexible' | 'locked' | 'staking';

// Earnings Calculator Component
function EarnCalculator({ products }: { products: EarnProduct[] }) {
  const [calcAmount, setCalcAmount] = useState('1000');
  const [selectedProduct, setSelectedProduct] = useState<string>(products[0]?.id || '');
  const product = products.find(p => p.id === selectedProduct) || products[0];

  const amount = parseFloat(calcAmount) || 0;
  const dailyEarning = amount * (product?.apr || 0) / 100 / 365;
  const monthlyEarning = dailyEarning * 30;
  const yearlyEarning = amount * (product?.apr || 0) / 100;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px] text-[#5E6673]">Amount (USD)</label>
          <Input
            type="number"
            value={calcAmount}
            onChange={(e) => setCalcAmount(e.target.value)}
            className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] h-8 text-xs mt-0.5 focus:border-[#F0B90B]"
            placeholder="Enter amount"
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-[#5E6673]">Product</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-[#2B3139] border border-[#2B3139] text-[#EAECEF] h-8 text-xs rounded-md px-2 mt-0.5 focus:border-[#F0B90B] focus:outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.asset} ({p.apr}% APR)
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#2B3139] rounded-lg p-2.5 text-center">
          <p className="text-[9px] text-[#5E6673]">Daily</p>
          <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+${dailyEarning.toFixed(2)}</p>
        </div>
        <div className="bg-[#2B3139] rounded-lg p-2.5 text-center">
          <p className="text-[9px] text-[#5E6673]">Monthly</p>
          <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+${monthlyEarning.toFixed(2)}</p>
        </div>
        <div className="bg-[#2B3139] rounded-lg p-2.5 text-center">
          <p className="text-[9px] text-[#5E6673]">Yearly</p>
          <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">+${yearlyEarning.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

const earnTabs: { id: EarnTab; label: string; icon: React.ElementType }[] = [
  { id: 'flexible', label: 'Flexible', icon: TrendingUp },
  { id: 'locked', label: 'Locked', icon: Lock },
  { id: 'staking', label: 'Staking', icon: Shield },
];

export default function EarnView() {
  const { navigateTo } = useAppStore();
  const [activeTab, setActiveTab] = useState<EarnTab>('flexible');
  const [subscribeProduct, setSubscribeProduct] = useState<EarnProduct | null>(null);
  const [subscribeAmount, setSubscribeAmount] = useState('');
  const [showMySubs, setShowMySubs] = useState(false);

  const filteredProducts = mockEarnProducts.filter((p) => p.type === activeTab);

  const handleSubscribe = () => {
    if (subscribeProduct && subscribeAmount) {
      setSubscribeProduct(null);
      setSubscribeAmount('');
    }
  };

  return (
    <ScrollArea className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139] h-9 w-9 lg:hidden"
            onClick={() => navigateTo('more')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-[#EAECEF]">QTBM Earn</h1>
            <p className="text-xs text-[#848E9C]">Grow your crypto holdings</p>
          </div>
        </div>

        {/* Summary Banner */}
        <Card className="bg-gradient-to-r from-[#F0B90B]/10 to-[#1E2329] border-[#F0B90B]/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#848E9C]">Total Earned</p>
                <p className="text-xl font-bold text-[#0ECB81] tabular-nums">$23.11</p>
                <p className="text-[10px] text-[#5E6673]">Across 3 active subscriptions</p>
              </div>
              <div className="w-12 h-12 bg-[#F0B90B]/10 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-[#F0B90B]" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#1E2329] rounded-lg p-1">
          {earnTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#2B3139] text-[#F0B90B] shadow-sm'
                    : 'text-[#848E9C] hover:text-[#EAECEF]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* My Subscriptions Toggle */}
        <button
          onClick={() => setShowMySubs(!showMySubs)}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-semibold text-[#EAECEF]">My Subscriptions</span>
          <Badge variant="outline" className="text-[10px] border-[#2B3139] text-[#848E9C]">
            {showMySubs ? 'Hide' : 'Show'}
          </Badge>
        </button>

        {showMySubs && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {mockEarnSubscriptions.map((sub) => (
              <Card key={sub.id} className="bg-[#1E2329] border-[#2B3139]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center text-lg">
                        {sub.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#EAECEF]">
                          {sub.amount} {sub.asset}
                        </p>
                        <p className="text-[10px] text-[#5E6673]">
                          {sub.type === 'flexible' ? 'Flexible' : sub.type === 'locked' ? `Locked ${sub.endDate ? '- ' + new Date(sub.endDate).toLocaleDateString() : ''}` : 'Staking'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#0ECB81] font-semibold tabular-nums">
                        +{sub.accruedRewards.toFixed(4)} {sub.asset}
                      </p>
                      <p className="text-[10px] text-[#5E6673]">APR {sub.apr}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        <Separator className="bg-[#2B3139]" />

        {/* Estimated Earnings Calculator */}
        <Card className="bg-[#1E2329] border-[#2B3139]">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-[#F0B90B]" />
              <h3 className="text-sm font-semibold text-[#EAECEF]">Earnings Calculator</h3>
            </div>
            <EarnCalculator products={filteredProducts} />
          </CardContent>
        </Card>

        <Separator className="bg-[#2B3139]" />

        {/* Earn Products */}
        <div>
          <h3 className="text-sm font-semibold text-[#EAECEF] mb-3">
            {activeTab === 'flexible' ? 'Flexible Products' : activeTab === 'locked' ? 'Locked Products' : 'Staking Products'}
          </h3>

          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-[#1E2329] border-[#2B3139] hover:border-[#F0B90B]/20 transition-colors card-depth">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#2B3139] flex items-center justify-center text-lg">
                        {product.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#EAECEF]">{product.asset}</p>
                          <Badge
                            className={`text-[9px] border-0 h-4 ${
                              product.type === 'flexible'
                                ? 'bg-[#0ECB81]/10 text-[#0ECB81]'
                                : product.type === 'locked'
                                ? 'bg-[#F0B90B]/10 text-[#F0B90B]'
                                : 'bg-[#8B5CF6]/10 text-[#8B5CF6]'
                            }`}
                          >
                            {product.type === 'flexible' ? 'Flexible' : product.type === 'locked' ? `${product.duration}d` : 'Staking'}
                          </Badge>
                          {/* Popular badge on high APY products */}
                          {product.apr >= 8 && (
                            <Badge className="text-[8px] border-0 h-4 px-1.5 bg-[#F6465D]/15 text-[#F6465D] hot-badge badge-shimmer font-bold">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-[#5E6673]">
                          Min: {product.minAmount} {product.asset}
                          {product.maxAmount ? ` · Max: ${product.maxAmount} ${product.asset}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0ECB81] tabular-nums gradient-text-gold">{product.apr}%</p>
                      <p className="text-[10px] text-[#5E6673]">APR</p>
                    </div>
                  </div>
                  {/* APY Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[9px] text-[#5E6673] mb-1">
                      <span>APY Level</span>
                      <span className="text-[#0ECB81]">{Math.round(Math.min(product.apr / 20 * 100, 100))}%</span>
                    </div>
                    <div className="h-1 bg-[#2B3139] rounded-full overflow-hidden loading-bar">
                      <div
                        className="apy-progress-bar"
                        style={{ width: `${Math.min(product.apr / 20 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-[#5E6673]">
                      Available: {formatNumber(product.available)} {product.asset}
                    </div>
                    <Button
                      className="bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] text-xs h-8 px-4 font-semibold press-scale"
                      onClick={() => setSubscribeProduct(product)}
                    >
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscribe Dialog */}
        <Dialog open={!!subscribeProduct} onOpenChange={(open) => !open && setSubscribeProduct(null)}>
          <DialogContent className="bg-[#1E2329] border-[#2B3139] text-[#EAECEF]">
            <DialogHeader>
              <DialogTitle className="text-[#EAECEF]">
                Subscribe to {subscribeProduct?.asset} {subscribeProduct?.type === 'flexible' ? 'Flexible' : subscribeProduct?.type === 'locked' ? `Locked (${subscribeProduct?.duration}d)` : 'Staking'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#848E9C]">APR</span>
                <span className="text-[#0ECB81] font-semibold">{subscribeProduct?.apr}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#848E9C]">Min Amount</span>
                <span className="text-[#EAECEF]">{subscribeProduct?.minAmount} {subscribeProduct?.asset}</span>
              </div>
              {subscribeProduct?.duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#848E9C]">Duration</span>
                  <span className="text-[#EAECEF]">{subscribeProduct.duration} days</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs text-[#848E9C]">Amount ({subscribeProduct?.asset})</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={`Enter ${subscribeProduct?.asset} amount`}
                    value={subscribeAmount}
                    onChange={(e) => setSubscribeAmount(e.target.value)}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] pr-16 h-11 text-sm focus:border-[#F0B90B] focus:ring-[#F0B90B]/20"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-9 text-[#F0B90B] text-xs font-semibold hover:bg-[#F0B90B]/10"
                    onClick={() => setSubscribeAmount(String(subscribeProduct?.maxAmount || subscribeProduct?.available || ''))}
                  >
                    MAX
                  </Button>
                </div>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <Button
                      key={pct}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-[#2B3139] text-[#848E9C] text-[10px] h-7 hover:bg-[#2B3139] hover:text-[#EAECEF]"
                      onClick={() => {
                        const max = subscribeProduct?.maxAmount || subscribeProduct?.available || 0;
                        setSubscribeAmount(String((max * pct) / 100));
                      }}
                    >
                      {pct}%
                    </Button>
                  ))}
                </div>
              </div>
              {subscribeAmount && subscribeProduct && (
                <div className="bg-[#2B3139] rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Estimated Daily</span>
                    <span className="text-[#0ECB81] tabular-nums">
                      +{((parseFloat(subscribeAmount) * subscribeProduct.apr) / 365).toFixed(6)} {subscribeProduct.asset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#848E9C]">Estimated Yearly</span>
                    <span className="text-[#0ECB81] tabular-nums">
                      +{(parseFloat(subscribeAmount) * subscribeProduct.apr / 100).toFixed(6)} {subscribeProduct.asset}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-[#F0B90B] hover:bg-[#F0B90B]/90 text-[#0B0E11] font-semibold h-11"
                onClick={handleSubscribe}
                disabled={!subscribeAmount || parseFloat(subscribeAmount) <= 0}
              >
                Confirm Subscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
}
