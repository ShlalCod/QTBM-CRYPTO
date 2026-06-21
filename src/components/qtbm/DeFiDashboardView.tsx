'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Layers, Radio, ArrowUpRight, ArrowDownRight, Shield } from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { useLocaleFmt } from '@/hooks/use-locale-fmt';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type ProtocolCategory = 'all' | 'lending' | 'dex' | 'yield' | 'bridge';

const protocols = [
  { name: 'Aave', category: 'lending' as const, letter: 'A', color: '#B6509E', tvl: '$12.3B', metric: '3.2% APY', metricLabel: 'defiDashboard.apy' },
  { name: 'Uniswap', category: 'dex' as const, letter: 'U', color: '#FF007A', tvl: '$4.8B', metric: '$1.2B', metricLabel: 'defiDashboard.volume' },
  { name: 'Lido', category: 'yield' as const, letter: 'L', color: '#00A3FF', tvl: '$28.5B', metric: '3.9% APY', metricLabel: 'defiDashboard.apy' },
  { name: 'Curve', category: 'dex' as const, letter: 'C', color: '#F0B90B', tvl: '$3.2B', metric: '$890M', metricLabel: 'defiDashboard.volume' },
  { name: 'MakerDAO', category: 'lending' as const, letter: 'M', color: '#1AAB9B', tvl: '$8.1B', metric: '2.8% APY', metricLabel: 'defiDashboard.apy' },
  { name: 'Compound', category: 'lending' as const, letter: 'C', color: '#00D395', tvl: '$2.4B', metric: '4.1% APY', metricLabel: 'defiDashboard.apy' },
];

const myPositions = [
  { protocol: 'Aave', letter: 'A', color: '#B6509E', asset: '2.5 ETH', value: '$8,740', earned: '$234', rate: '3.2% APY' },
  { protocol: 'Lido', letter: 'L', color: '#00A3FF', asset: '1.0 ETH', value: '$3,496', earned: '$136', rate: '3.9% APY' },
  { protocol: 'Uniswap', letter: 'U', color: '#FF007A', asset: '$5,000 USDC/ETH', value: '$5,000', earned: '$89', rate: 'IL -$12' },
];

const yieldData = [
  { name: 'Compound', apy: 4.1, color: '#00D395' },
  { name: 'Lido', apy: 3.9, color: '#00A3FF' },
  { name: 'Aave', apy: 3.2, color: '#B6509E' },
  { name: 'MakerDAO', apy: 2.8, color: '#1AAB9B' },
  { name: 'Curve', apy: 2.1, color: '#F0B90B' },
];

function AnimatedCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const { formatNum } = useLocaleFmt();
  const ref = useRef(0);
  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = eased * target;
      setCount(ref.current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target]);
  return (
    <span className="tabular-nums">
      {prefix}{count < 10 ? count.toFixed(1) : formatNum(Math.round(count))}{suffix}
    </span>
  );
}

function RiskGauge({ value }: { value: number }) {
  const { t } = useTranslation();
  const radius = 70;
  const circumference = Math.PI * radius;
  const fillPercent = value / 100;
  const strokeDasharray = `${circumference * fillPercent} ${circumference}`;
  const getColor = (v: number) => {
    if (v < 35) return '#0ECB81';
    if (v < 65) return '#F0B90B';
    return '#F6465D';
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width="180" height="100" viewBox="0 0 180 100">
        <path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none"
          stroke="#2B3139"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M 10 90 A 70 70 0 0 1 170 90"
          fill="none"
          stroke={getColor(value)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          className="transition-all duration-1000"
        />
        <text x="90" y="70" textAnchor="middle" fill={getColor(value)} fontSize="24" fontWeight="bold">
          {value}
        </text>
        <text x="90" y="88" textAnchor="middle" fill="#5E6673" fontSize="10">
          {t('defiDashboard.riskScoreOf')}
        </text>
      </svg>
      <Badge className={`${value < 35 ? 'bg-success/10 text-success' : value < 65 ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'} border-0 text-xs font-semibold mt-1`}>
        {value < 35 ? t('defiDashboard.riskLow') : value < 65 ? t('defiDashboard.riskModerate') : t('defiDashboard.riskHigh')}
      </Badge>
    </div>
  );
}

export default function DeFiDashboardView() {
  const { navigateTo, isRTL } = useAppStore();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<ProtocolCategory>('all');

  const categories: { id: ProtocolCategory; label: string }[] = [
    { id: 'all', label: t('common.all') },
    { id: 'lending', label: t('defiDashboard.lending') },
    { id: 'dex', label: t('defiDashboard.dex') },
    { id: 'yield', label: t('defiDashboard.yield') },
    { id: 'bridge', label: t('defiDashboard.bridge') },
  ];

  const filteredProtocols = activeCategory === 'all'
    ? protocols
    : protocols.filter(p => p.category === activeCategory);

  const maxApy = Math.max(...yieldData.map(d => d.apy));

  return (
    <ScrollArea className="h-[calc(100dvh-4rem)]">
      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9"
            onClick={() => navigateTo('more')}
            aria-label={t('common.back')}
          >
            <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Button>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">{t('defiDashboard.title')}</h1>
          </div>
          <Badge className="bg-success/10 text-success border-0 text-[10px] font-semibold px-2 flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-success pulse-green" />
            {t('status.live')}
          </Badge>
        </div>

        {/* TVL Overview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-card to-secondary border-border overflow-hidden relative">
            <div className="absolute top-0 end-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-1/3 translate-x-1/3" />
            <div className="absolute bottom-0 start-0 w-20 h-20 bg-success/10 rounded-full translate-y-1/3 -translate-x-1/3" />
            <CardContent className="p-5 relative z-10">
              <p className="text-xs text-muted-foreground tracking-wider mb-1">{t('defiDashboard.totalValueLocked')}</p>
              <div className="flex items-end gap-3">
                <h2 className="text-3xl font-bold text-foreground animate-count-up">
                  <AnimatedCounter target={187.4} prefix="$" suffix="B" />
                </h2>
                <span className="text-sm font-semibold text-success flex items-center gap-0.5 mb-1">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  +2.3%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{t('defiDashboard.change24h')}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Protocol Categories */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide-mobile">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all press-scale ${
                activeCategory === cat.id
                  ? 'gradient-yellow text-background'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Top Protocols */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('defiDashboard.topProtocols')}</h3>
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              {filteredProtocols.map((protocol, i) => (
                <React.Fragment key={protocol.name}>
                  <div className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                        style={{ backgroundColor: protocol.color }}
                      >
                        {protocol.letter}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{protocol.name}</p>
                        <Badge className="bg-secondary text-muted-foreground border-0 text-[10px] px-1.5 py-0 h-4">
                          {protocol.category === 'lending' ? t('defiDashboard.lending') : protocol.category === 'dex' ? t('defiDashboard.dex') : protocol.category === 'yield' ? t('defiDashboard.yield') : t('defiDashboard.bridge')}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-end hidden sm:block">
                        <p className="text-[10px] text-muted-foreground">{t('defiDashboard.tvl')}</p>
                        <p className="text-sm font-semibold text-foreground">{protocol.tvl}</p>
                      </div>
                      <div className="text-end">
                        <p className="text-[10px] text-muted-foreground">{t(protocol.metricLabel)}</p>
                        <p className="text-sm font-semibold text-success">{protocol.metric}</p>
                      </div>
                      <Button className="h-7 px-3 text-[10px] bg-secondary hover:bg-secondary text-foreground border-0 press-scale">
                        {t('actions.deposit')}
                      </Button>
                    </div>
                  </div>
                  {i < filteredProtocols.length - 1 && <div className="border-t border-border mx-4" />}
                </React.Fragment>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* My DeFi Positions */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('defiDashboard.myPositions')}</h3>
          <div className="space-y-3">
            {myPositions.map((pos, i) => (
              <motion.div
                key={pos.protocol}
                initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                <Card className="bg-card border-border hover-lift">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                          style={{ backgroundColor: pos.color }}
                        >
                          {pos.letter}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{pos.protocol}</p>
                          <p className="text-xs text-muted-foreground">{t('defiDashboard.supplied')} {pos.asset}</p>
                        </div>
                      </div>
                      <div className="text-end">
                        <p className="text-sm font-semibold text-foreground">{pos.value}</p>
                        <p className="text-xs text-success">{t('defiDashboard.earned')} {pos.earned}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                      <span className="text-[10px] text-muted-foreground">{pos.rate}</span>
                      <Button variant="outline" className="h-7 px-3 text-[10px] border-destructive/30 text-destructive hover:bg-destructive/10 press-scale">
                        {t('defiDashboard.withdraw')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Yield Comparison Chart */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">{t('defiDashboard.yieldComparison')}</h3>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="space-y-3" dir="ltr">
                {yieldData.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{item.name}</span>
                    <div className="flex-1 h-2 bg-secondary rounded overflow-hidden relative">
                      <motion.div
                        className="h-full rounded"
                        style={{ backgroundColor: item.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.apy / maxApy) * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-foreground w-12 text-end">{item.apy}%</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3">{t('defiDashboard.apyLabel')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Risk Assessment */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            {t('defiDashboard.riskAssessment')}
          </h3>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex flex-col items-center">
              <RiskGauge value={65} />
              <p className="text-xs text-muted-foreground mt-2 text-center">{t('defiDashboard.riskDescription')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom spacing */}
        <div className="h-4" />
      </div>
    </ScrollArea>
  );
}
