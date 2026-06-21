'use client';

import React, { useState, useMemo } from 'react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
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
  const { t } = useTranslation();
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
          <label className="text-[10px] text-muted-foreground">{t('earn.amountUsd')}</label>
          <Input
            type="number"
            value={calcAmount}
            onChange={(e) => setCalcAmount(e.target.value)}
            className="bg-secondary border-border text-foreground h-8 text-xs mt-0.5 focus:border-primary"
            placeholder={t('earn.enterAmount')}
          />
        </div>
        <div className="flex-1">
          <label className="text-[10px] text-muted-foreground">{t('earn.product')}</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full bg-secondary border border-border text-foreground h-8 text-xs rounded-md px-2 mt-0.5 focus:border-primary focus:outline-none"
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
        <div className="bg-secondary rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">{t('earn.daily')}</p>
          <p className="text-xs text-success font-semibold tabular-nums">+${dailyEarning.toFixed(2)}</p>
        </div>
        <div className="bg-secondary rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">{t('earn.monthly')}</p>
          <p className="text-xs text-success font-semibold tabular-nums">+${monthlyEarning.toFixed(2)}</p>
        </div>
        <div className="bg-secondary rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">{t('earn.yearly')}</p>
          <p className="text-xs text-success font-semibold tabular-nums">+${yearlyEarning.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

const earnTabs: { id: EarnTab; labelKey: string; icon: React.ElementType }[] = [
  { id: 'flexible', labelKey: 'earn.flexible', icon: TrendingUp },
  { id: 'locked', labelKey: 'earn.locked', icon: Lock },
  { id: 'staking', labelKey: 'earn.staking', icon: Shield },
];

export default function EarnView() {
  const { navigateTo, isRTL } = useAppStore();
  const { t } = useTranslation();
  const { formatDate } = useLocaleFmt();
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
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9 lg:hidden"
            onClick={() => navigateTo('more')}
            aria-label={t('common.back')}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('earn.header')}</h1>
            <p className="text-xs text-muted-foreground">{t('earn.subtitle')}</p>
          </div>
        </div>

        {/* Summary Banner */}
        <Card className="bg-gradient-to-r from-primary/10 to-card border-primary/20" dir="ltr">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{t('earn.totalEarned')}</p>
                <p className="text-xl font-bold text-success tabular-nums">$23.11</p>
                <p className="text-[10px] text-muted-foreground">{t('earn.acrossSubs').replace('{count}', '3')}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 bg-card rounded-lg p-1">
          {earnTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-secondary text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* My Subscriptions Toggle */}
        <button
          onClick={() => setShowMySubs(!showMySubs)}
          className="w-full flex items-center justify-between py-2"
        >
          <span className="text-sm font-semibold text-foreground">{t('earn.mySubscriptions')}</span>
          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
            {showMySubs ? t('earn.hide') : t('earn.show')}
          </Badge>
        </button>

        {showMySubs && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            {mockEarnSubscriptions.map((sub) => (
              <Card key={sub.id} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                        {sub.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {sub.amount} {sub.asset}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {sub.type === 'flexible' ? t('earn.flexible') : sub.type === 'locked' ? `${t('earn.locked')} ${sub.endDate ? '- ' + formatDate(sub.endDate) : ''}` : t('earn.staking')}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-xs text-success font-semibold tabular-nums">
                        +{sub.accruedRewards.toFixed(4)} {sub.asset}
                      </p>
                      <p className="text-[10px] text-muted-foreground">APR {sub.apr}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        <Separator className="bg-secondary" />

        {/* Estimated Earnings Calculator */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">{t('earn.earningsCalculator')}</h3>
            </div>
            <EarnCalculator products={filteredProducts} />
          </CardContent>
        </Card>

        <Separator className="bg-secondary" />

        {/* Earn Products */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {activeTab === 'flexible' ? t('earn.flexibleProducts') : activeTab === 'locked' ? t('earn.lockedProducts') : t('earn.stakingProducts')}
          </h3>

          <div className="space-y-2">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="bg-card border-border hover:border-primary/20 transition-colors card-depth">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lg">
                        {product.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{product.asset}</p>
                          <Badge
                            className={`text-[10px] border-0 h-4 ${
                              product.type === 'flexible'
                                ? 'bg-success/10 text-success'
                                : product.type === 'locked'
                                ? 'bg-primary/10 text-primary'
                                : 'bg-purple-500/10 text-purple-500'
                            }`}
                          >
                            {product.type === 'flexible' ? t('earn.flexible') : product.type === 'locked' ? `${product.duration}d` : t('earn.staking')}
                          </Badge>
                          {/* Popular badge on high APY products */}
                          {product.apr >= 8 && (
                            <Badge className="text-[10px] border-0 h-4 px-1.5 bg-destructive/15 text-destructive hot-badge badge-shimmer font-bold">
                              {t('earn.popular')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {t('earn.min')}: {product.minAmount} {product.asset}
                          {product.maxAmount ? ` · ${t('earn.max')}: ${product.maxAmount} ${product.asset}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-end">
                      <p className="text-lg font-bold text-success tabular-nums gradient-text-gold">{product.apr}%</p>
                      <p className="text-[10px] text-muted-foreground">APR</p>
                    </div>
                  </div>
                  {/* APY Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{t('earn.apyLevel')}</span>
                      <span className="text-success">{Math.round(Math.min(product.apr / 20 * 100, 100))}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden loading-bar">
                      <div
                        className="apy-progress-bar"
                        style={{ width: `${Math.min(product.apr / 20 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-muted-foreground">
                      {t('earn.available')}: {formatNumber(product.available)} {product.asset}
                    </div>
                    <Button
                      className="bg-primary hover:bg-primary/90 text-background text-xs h-8 px-4 font-semibold press-scale"
                      onClick={() => setSubscribeProduct(product)}
                    >
                      {t('earn.subscribe')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscribe Dialog */}
        <Dialog open={!!subscribeProduct} onOpenChange={(open) => !open && setSubscribeProduct(null)}>
          <DialogContent className="bg-card border-border text-foreground rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {t('earn.subscribeTo')} {subscribeProduct?.asset} {subscribeProduct?.type === 'flexible' ? t('earn.flexible') : subscribeProduct?.type === 'locked' ? `${t('earn.locked')} (${subscribeProduct?.duration}d)` : t('earn.staking')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('earn.apr')}</span>
                <span className="text-success font-semibold">{subscribeProduct?.apr}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('earn.minAmount')}</span>
                <span className="text-foreground">{subscribeProduct?.minAmount} {subscribeProduct?.asset}</span>
              </div>
              {subscribeProduct?.duration && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('earn.duration')}</span>
                  <span className="text-foreground">{subscribeProduct.duration} {t('earn.days')}</span>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">{t('earn.amountAsset')} ({subscribeProduct?.asset})</label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={t('earn.enterAssetAmount')}
                    value={subscribeAmount}
                    onChange={(e) => setSubscribeAmount(e.target.value)}
                    className="bg-secondary border-border text-foreground pe-16 h-11 text-sm focus:border-primary focus:ring-primary/20"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute end-1 top-1 h-9 text-primary text-xs font-semibold hover:bg-primary/10"
                    onClick={() => setSubscribeAmount(String(subscribeProduct?.maxAmount || subscribeProduct?.available || ''))}
                  >
                    {t('earn.maxButton')}
                  </Button>
                </div>
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <Button
                      key={pct}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-border text-muted-foreground text-[10px] h-7 hover:bg-secondary hover:text-foreground"
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
                <div className="bg-secondary rounded-lg p-3 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('earn.estimatedDaily')}</span>
                    <span className="text-success tabular-nums">
                      +{((parseFloat(subscribeAmount) * subscribeProduct.apr) / 365).toFixed(6)} {subscribeProduct.asset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('earn.estimatedYearly')}</span>
                    <span className="text-success tabular-nums">
                      +{(parseFloat(subscribeAmount) * subscribeProduct.apr / 100).toFixed(6)} {subscribeProduct.asset}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-background font-semibold h-11"
                onClick={handleSubscribe}
                disabled={!subscribeAmount || parseFloat(subscribeAmount) <= 0}
              >
                {t('earn.confirmSubscription')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ScrollArea>
  );
}
