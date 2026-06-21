'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModalA11y } from '@/hooks/use-modal-a11y';
import {
  ArrowLeft,
  PieChart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Shield,
  AlertTriangle,
  Sparkles,
  Info,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/stores/app-store';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Time Range Selector ──────────────────────────────────────────────
const timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;
type TimeRange = (typeof timeRanges)[number];

// ── Mock Data ────────────────────────────────────────────────────────
function generateChartData(points: number, baseValue: number, volatility: number) {
  const data: number[] = [];
  let value = baseValue;
  for (let i = 0; i < points; i++) {
    value += (Math.random() - 0.45) * volatility;
    value = Math.max(baseValue * 0.85, Math.min(baseValue * 1.15, value));
    data.push(value);
  }
  return data;
}

const portfolioChartData = generateChartData(30, 44500, 600);

const assetAllocation = [
  { name: 'BTC', percent: 45, color: '#F0B90B', usdValue: 20555.51 },
  { name: 'ETH', percent: 25, color: '#627EEA', usdValue: 11419.73 },
  { name: 'BNB', percent: 15, color: '#D4A20B', usdValue: 6851.84 },
  { name: 'SOL', percent: 8, color: '#9945FF', usdValue: 3654.31 },
  { name: 'Others', percent: 7, color: '#848E9C', usdValue: 3197.51 },
];

const monthlyReturns = [
  { monthIndex: 0, value: 5.2 },
  { monthIndex: 1, value: -2.1 },
  { monthIndex: 2, value: 8.7 },
  { monthIndex: 3, value: 3.4 },
  { monthIndex: 4, value: -1.2 },
  { monthIndex: 5, value: 12.5 },
  { monthIndex: 6, value: 6.8 },
  { monthIndex: 7, value: -4.3 },
  { monthIndex: 8, value: 2.1 },
  { monthIndex: 9, value: 9.5 },
  { monthIndex: 10, value: -0.8 },
  { monthIndex: 11, value: 7.3 },
];

const topHoldings = [
  { asset: 'BTC', amount: 0.2341, avgBuy: 38250, current: 43250, allocation: 45 },
  { asset: 'ETH', amount: 3.215, avgBuy: 2890, current: 3520, allocation: 25 },
  { asset: 'BNB', amount: 10.5, avgBuy: 580, current: 612, allocation: 15 },
  { asset: 'SOL', amount: 25.2, avgBuy: 125, current: 148, allocation: 8 },
  { asset: 'ADA', amount: 5200, avgBuy: 0.45, current: 0.52, allocation: 3 },
  { asset: 'DOT', amount: 320, avgBuy: 7.2, current: 6.8, allocation: 2 },
  { asset: 'AVAX', amount: 48, avgBuy: 35, current: 38.5, allocation: 1.2 },
  { asset: 'LINK', amount: 85, avgBuy: 14.5, current: 16.2, allocation: 0.8 },
];

// ── Count-Up Animation Hook ─────────────────────────────────────────
function useCountUp(end: number, duration: number = 1200, startOnMount: boolean = true) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (startOnMount) {
      const timer = setTimeout(() => setStarted(true), 100);
      return () => clearTimeout(timer);
    }
  }, [startOnMount]);

  useEffect(() => {
    if (!started) return;
    let startTime: number | null = null;
    let rafId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [started, end, duration]);

  return value;
}

// ── Animated Number Component ────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2, className = '' }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; className?: string;
}) {
  const animatedValue = useCountUp(value);
  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}{animatedValue.toFixed(decimals)}{suffix}
    </span>
  );
}

// ── Stagger Container ────────────────────────────────────────────────
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Portfolio Value Chart ────────────────────────────────────────────
function PortfolioValueChart({ selectedRange }: { selectedRange: TimeRange }) {
  const { t, isRTL, language } = useTranslation();
  const isPositive = portfolioChartData[portfolioChartData.length - 1] > portfolioChartData[0];
  const chartColor = isPositive ? '#0ECB81' : '#F6465D';

  const currentValue = 45678.9;
  const change24h = 1234.5;
  const changePct = 2.78;

  const animatedValue = useCountUp(currentValue, 1500);
  const animatedChange = useCountUp(change24h, 1500);
  const animatedPct = useCountUp(changePct, 1500);

  const svgWidth = 600;
  const svgHeight = 200;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const minVal = Math.min(...portfolioChartData);
  const maxVal = Math.max(...portfolioChartData);
  const range = maxVal - minVal || 1;

  const points = portfolioChartData.map((val, i) => ({
    x: padding.left + (i / (portfolioChartData.length - 1)) * chartW,
    y: padding.top + chartH - ((val - minVal) / range) * chartH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgHeight - padding.bottom} L ${points[0].x} ${svgHeight - padding.bottom} Z`;

  const gradientId = `chartGradient-${selectedRange}`;

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 hover-lift">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">{t('portfolio.totalValue')}</p>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
              ${animatedValue.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn('text-sm font-semibold tabular-nums', isPositive ? 'text-success' : 'text-destructive')}>
              {isPositive ? '+' : '-'}${animatedChange.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            </span>
            <span className={cn(
              'text-xs font-semibold px-1.5 py-0.5 rounded',
              isPositive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            )}>
              {isPositive ? '+' : ''}{animatedPct.toFixed(2)}%
            </span>
          </div>
        </div>
        <Activity className="h-5 w-5 text-muted-foreground" />
      </div>

      {/* SVG Area Chart */}
      <div className="relative w-full mt-2" style={{ aspectRatio: '3/1' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line
              key={ratio}
              x1={padding.left}
              y1={padding.top + chartH * ratio}
              x2={svgWidth - padding.right}
              y2={padding.top + chartH * ratio}
              stroke="#2B3139"
              strokeWidth="0.5"
              strokeDasharray="4 4"
            />
          ))}
          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />
          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke={chartColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* End dot */}
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="3.5"
            fill={chartColor}
            className="animate-pulse-soft"
          />
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r="7"
            fill={chartColor}
            opacity="0.15"
          />
        </svg>
      </div>
    </div>
  );
}

// ── Donut Chart ──────────────────────────────────────────────────────
function AssetAllocationDonut() {
  const { t, language } = useTranslation();
  const size = 180;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const segments = useMemo(() => {
    const result: typeof assetAllocation[number][] = [];
    let accOffset = 0;
    for (const item of assetAllocation) {
      const segmentLength = (item.percent / 100) * circumference;
      const offset = accOffset;
      accOffset += segmentLength;
      result.push({ ...item, segmentLength, offset });
    }
    return result;
  }, [circumference]);

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 hover-lift">
      <div className="flex items-center gap-2 mb-4">
        <PieChart className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t('portfolio.assetAllocation')}</h3>
      </div>

      {/* SVG Donut */}
      <div className="flex justify-center mb-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#2B3139"
            strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((seg, i) => (
            <motion.circle
              key={seg.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.segmentLength} ${circumference - seg.segmentLength}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
              transform={`rotate(-90 ${center} ${center})`}
              initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
              animate={{
                opacity: 1,
                strokeDasharray: `${seg.segmentLength} ${circumference - seg.segmentLength}`,
              }}
              transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
            />
          ))}
          {/* Center text */}
          <text x={center} y={center - 8} textAnchor="middle" className="fill-foreground" fontSize="14" fontWeight="700">
            $45.6K
          </text>
          <text x={center} y={center + 10} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
            {t('portfolio.total')}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {assetAllocation.map((item) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 + assetAllocation.indexOf(item) * 0.06 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-foreground">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground tabular-nums">{item.percent}%</span>
              <span className="text-xs text-muted-foreground tabular-nums">${item.usdValue.toLocaleString(language)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Performance Metrics ──────────────────────────────────────────────
function PerformanceMetrics() {
  const { t } = useTranslation();
  const metrics = [
    {
      label: t('portfolio.totalReturn'),
      value: '+$12,450',
      subValue: '+37.4%',
      color: 'text-success',
      icon: TrendingUp,
      iconColor: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: t('portfolio.bestPerformer'),
      value: 'SOL',
      subValue: '+156.2%',
      color: 'text-success',
      icon: TrendingUp,
      iconColor: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: t('portfolio.worstPerformer'),
      value: 'DOGE',
      subValue: '-12.3%',
      color: 'text-destructive',
      icon: TrendingDown,
      iconColor: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: t('portfolio.sharpeRatio'),
      value: '1.84',
      subValue: '',
      color: 'text-primary',
      icon: BarChart3,
      iconColor: 'text-primary',
      bg: 'bg-primary/10',
      hasTooltip: true,
    },
  ];

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 hover-lift">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t('portfolio.performance')}</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="bg-background/40 rounded-lg p-3 border border-border/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{metric.label}</span>
                <div className="relative group">
                  {metric.hasTooltip && (
                    <>
                      <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full start-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                        <div className="bg-secondary text-foreground text-[10px] rounded px-2 py-1 whitespace-nowrap shadow-lg">
                          {t('portfolio.sharpeTooltip')}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon className={cn('h-4 w-4', metric.iconColor)} />
                <span className={cn('text-lg font-bold tabular-nums', metric.color)}>{metric.value}</span>
              </div>
              {metric.subValue && (
                <Badge className={cn('mt-1.5 text-[10px] font-semibold border-0', metric.bg, metric.color)}>
                  {metric.subValue}
                </Badge>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Monthly Returns Bar Chart ──────────────────────────────────────────
function MonthlyReturnsBarChart() {
  const { t, language } = useTranslation();
  const maxAbsValue = Math.max(...monthlyReturns.map((m) => Math.abs(m.value)));
  const barHeight = 120;
  const barWidth = 24;
  const gap = 8;
  const totalWidth = monthlyReturns.length * (barWidth + gap) - gap;

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 hover-lift">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t('portfolio.monthlyReturns')}</h3>
      </div>
      <div className="overflow-x-auto">
        <svg width={totalWidth + 20} height={barHeight + 30} viewBox={`0 0 ${totalWidth + 20} ${barHeight + 30}`} className="mx-auto">
          {/* Zero line */}
          <line x1={10} y1={barHeight / 2 + 5} x2={totalWidth + 10} y2={barHeight / 2 + 5} stroke="#2B3139" strokeWidth="1" />
          {monthlyReturns.map((month, i) => {
            const monthLabel = new Intl.DateTimeFormat(language, { month: 'short' }).format(new Date(2024, month.monthIndex, 1));
            const x = 10 + i * (barWidth + gap);
            const barH = (Math.abs(month.value) / maxAbsValue) * (barHeight / 2 - 5);
            const isPositive = month.value >= 0;
            const y = isPositive ? barHeight / 2 + 5 - barH : barHeight / 2 + 5;
            return (
              <g key={monthLabel}>
                <motion.rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={3}
                  fill={isPositive ? '#0ECB81' : '#F6465D'}
                  opacity={0.8}
                  initial={{ height: 0, y: barHeight / 2 + 5 }}
                  animate={{ height: barH, y }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.05, ease: 'easeOut' }}
                />
                <text x={x + barWidth / 2} y={barHeight + 20} textAnchor="middle" className="fill-muted-foreground" fontSize="9" fontWeight="500">
                  {monthLabel}
                </text>
                <text x={x + barWidth / 2} y={isPositive ? y - 3 : y + barH + 12} textAnchor="middle" className={isPositive ? 'fill-[#0ECB81]' : 'fill-destructive'} fontSize="8" fontWeight="600">
                  {month.value > 0 ? '+' : ''}{month.value}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Risk Analysis with SVG Gauge ────────────────────────────────────
function RiskAnalysis() {
  const { t, language } = useTranslation();
  const riskScore = 65;

  const riskMetrics = [
    { label: t('portfolio.volatility'), value: '34.2%', color: 'text-primary' },
    { label: t('portfolio.maxDrawdown'), value: '-18.5%', color: 'text-destructive' },
    { label: t('portfolio.beta'), value: '1.12', color: 'text-primary' },
  ];

  const getRiskLevel = (score: number) => {
    if (score < 33) return { labelKey: 'portfolio.riskLevelLow', color: 'text-success', gaugeColor: '#0ECB81' };
    if (score < 66) return { labelKey: 'portfolio.riskLevelMedium', color: 'text-primary', gaugeColor: '#F0B90B' };
    return { labelKey: 'portfolio.riskLevelHigh', color: 'text-destructive', gaugeColor: '#F6465D' };
  };

  const risk = getRiskLevel(riskScore);

  // SVG semi-circle gauge
  const gaugeSize = 180;
  const gaugeCenter = gaugeSize / 2;
  const gaugeRadius = 70;
  const gaugeStroke = 14;
  const angle = (riskScore / 100) * 180;
  const endAngleRad = ((angle - 180) * Math.PI) / 180;
  const needleX = gaugeCenter + (gaugeRadius - 20) * Math.cos(endAngleRad);
  const needleY = gaugeCenter + (gaugeRadius - 20) * Math.sin(endAngleRad);

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 hover-lift">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t('portfolio.riskAnalysis')}</h3>
      </div>

      {/* Risk Score Gauge */}
      <div className="flex justify-center mb-4">
        <svg width={gaugeSize} height={gaugeSize / 2 + 10} viewBox={`0 0 ${gaugeSize} ${gaugeSize / 2 + 10}`}>
          {/* Background arc */}
          <path
            d={`M ${gaugeCenter - gaugeRadius} ${gaugeSize / 2} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${gaugeCenter + gaugeRadius} ${gaugeSize / 2}`}
            fill="none"
            stroke="#2B3139"
            strokeWidth={gaugeStroke}
            strokeLinecap="round"
          />
          {/* Green segment */}
          <path
            d="M 20 90 A 70 70 0 0 1 70 22"
            fill="none"
            stroke="#0ECB81"
            strokeWidth={gaugeStroke}
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Yellow segment */}
          <path
            d="M 70 22 A 70 70 0 0 1 110 22"
            fill="none"
            stroke="#F0B90B"
            strokeWidth={gaugeStroke}
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Red segment */}
          <path
            d="M 110 22 A 70 70 0 0 1 160 90"
            fill="none"
            stroke="#F6465D"
            strokeWidth={gaugeStroke}
            strokeLinecap="round"
            opacity="0.7"
          />
          {/* Needle */}
          <line
            x1={gaugeCenter}
            y1={gaugeSize / 2}
            x2={needleX}
            y2={needleY}
            stroke={risk.gaugeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ '--gauge-rotation': `${(riskScore / 100) * 180 - 90}deg` } as React.CSSProperties}
            className="risk-gauge-needle"
          />
          <circle cx={gaugeCenter} cy={gaugeSize / 2} r="5" fill={risk.gaugeColor} opacity="0.8" />
          <circle cx={gaugeCenter} cy={gaugeSize / 2} r="2.5" fill="#0B0E11" />
        </svg>
      </div>

      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center">
          <span className={cn('text-2xl font-bold', risk.color)}>{riskScore}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
        <Badge className={cn('text-xs font-semibold border-0', risk.color)} style={{ background: risk.gaugeColor + '15' }}>
          {t(risk.labelKey)} {t('portfolio.riskSuffix')}
        </Badge>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-3 gap-3">
        {riskMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
            className="bg-background/40 rounded-lg p-3 border border-border/50 text-center"
          >
            <p className="text-[10px] text-muted-foreground mb-1">{metric.label}</p>
            <p className={cn('text-sm font-bold tabular-nums', metric.color)}>{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Monthly Returns Heatmap */}
      <div className="mt-4">
        <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">{t('portfolio.monthlyReturns')}</p>
        <div className="grid grid-cols-6 gap-1">
          {monthlyReturns.map((m, i) => {
            const monthLabel = new Intl.DateTimeFormat(language, { month: 'short' }).format(new Date(2024, m.monthIndex, 1));
            return (
            <motion.div
              key={monthLabel}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.04 }}
              className="heatmap-cell aspect-square flex flex-col items-center justify-center text-[10px]"
              style={{
                backgroundColor: m.value >= 0
                  ? `rgba(14, 203, 129, ${Math.min(0.15 + Math.abs(m.value) / 15, 0.7)})`
                  : `rgba(246, 70, 93, ${Math.min(0.15 + Math.abs(m.value) / 8, 0.7)})`
              }}
              title={`${monthLabel}: ${m.value > 0 ? '+' : ''}${m.value}%`}
            >
              <span className="font-medium text-foreground">{monthLabel}</span>
              <span className={cn('font-semibold', m.value >= 0 ? 'text-success' : 'text-destructive')}>{m.value > 0 ? '+' : ''}{m.value}%</span>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Top Holdings Table ───────────────────────────────────────────────
function TopHoldingsTable() {
  const { t, isRTL, language } = useTranslation();

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 hover-lift">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">{t('portfolio.topHoldings')}</h3>
      </div>

      <div className="overflow-x-auto -mx-4 sm:-mx-6 px-4 sm:px-6">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="text-[10px] text-muted-foreground uppercase tracking-wide">
              <th className="text-start pb-3 font-medium">{t('portfolio.asset')}</th>
              <th className="text-end pb-3 font-medium">{t('portfolio.amount')}</th>
              <th className="text-end pb-3 font-medium">{t('portfolio.avgBuy')}</th>
              <th className="text-end pb-3 font-medium">{t('portfolio.current')}</th>
              <th className="text-end pb-3 font-medium">{t('portfolio.pnlUsd')}</th>
              <th className="text-end pb-3 font-medium">{t('portfolio.pnlPct')}</th>
              <th className="text-end pb-3 font-medium">{t('portfolio.allocPct')}</th>
            </tr>
          </thead>
          <tbody>
            {topHoldings.map((holding, i) => {
              const pnl = (holding.current - holding.avgBuy) * holding.amount;
              const pnlPct = ((holding.current - holding.avgBuy) / holding.avgBuy) * 100;
              const isPositive = pnl >= 0;

              return (
                <motion.tr
                  key={holding.asset}
                  initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.04 }}
                  className="border-t border-border/50 hover:bg-secondary/20 transition-colors"
                >
                  <td className="py-2.5">
                    <span className="text-sm font-semibold text-foreground">{holding.asset}</span>
                  </td>
                  <td className="py-2.5 text-end text-xs text-muted-foreground tabular-nums">
                    {holding.amount.toLocaleString(language, { maximumFractionDigits: 4 })}
                  </td>
                  <td className="py-2.5 text-end text-xs text-muted-foreground tabular-nums">
                    ${holding.avgBuy.toLocaleString(language)}
                  </td>
                  <td className="py-2.5 text-end text-xs text-foreground tabular-nums font-medium">
                    ${holding.current.toLocaleString(language)}
                  </td>
                  <td className={cn('py-2.5 text-end text-xs font-semibold tabular-nums', isPositive ? 'text-success' : 'text-destructive')}>
                    {isPositive ? '+' : ''}${Math.abs(pnl).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  </td>
                  <td className={cn('py-2.5 text-end text-xs font-semibold tabular-nums', isPositive ? 'text-success' : 'text-destructive')}>
                    {isPositive ? '+' : ''}{pnlPct.toFixed(2)}%
                  </td>
                  <td className="py-2.5">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: '0%' }}
                          animate={{ width: `${holding.allocation}%` }}
                          transition={{ duration: 0.8, delay: 0.3 + i * 0.05, ease: 'easeOut' }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-end">{holding.allocation}%</span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── AI Rebalance Modal ────────────────────────────────────────────────
function AIRebalanceModal({ onClose }: { onClose: () => void }) {
  const { t, isRTL } = useTranslation();
  const [rebalancing, setRebalancing] = useState(false);
  const [done, setDone] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  useModalA11y({ open: true, onClose, ref: modalRef });

  const suggestions = [
    { actionKey: 'portfolio.reduce', asset: 'BTC', change: '-5%', current: '45%', suggested: '40%', color: 'text-destructive' },
    { actionKey: 'portfolio.increase', asset: 'ETH', change: '+3%', current: '25%', suggested: '28%', color: 'text-success' },
    { actionKey: 'portfolio.increase', asset: 'SOL', change: '+1.5%', current: '8%', suggested: '9.5%', color: 'text-success' },
    { actionKey: 'portfolio.increase', asset: 'Others', change: '+0.5%', current: '7%', suggested: '7.5%', color: 'text-success' },
  ];

  const handleRebalance = () => {
    setRebalancing(true);
    setTimeout(() => {
      setRebalancing(false);
      setDone(true);
    }, 2000);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('portfolio.rebalance')}
        className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-base font-semibold text-foreground">{t('portfolio.rebalance')}</h3>
            <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold">AI</Badge>
          </div>
          <Button variant="ghost" size="icon" aria-label={t('actions.close')} className="h-9 w-9 text-muted-foreground hover:text-foreground" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-5 space-y-4">
          {done ? (
            <motion.div className="flex flex-col items-center py-6" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircle2 className="h-12 w-12 text-success mb-3" />
              <p className="text-lg font-semibold text-success">{t('portfolio.rebalanceComplete')}</p>
              <p className="text-xs text-muted-foreground mt-1">{t('portfolio.rebalanceNote')}</p>
            </motion.div>
          ) : (
            <>
              <div className="flex items-start gap-2 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-foreground">{t('portfolio.rebalanceWarning')}</p>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold px-1">
                  <span>{t('portfolio.asset')}</span>
                  <span className="text-end">{t('portfolio.currentCol')}</span>
                  <span className="text-end">{t('portfolio.suggestedCol')}</span>
                  <span className="text-end">{t('portfolio.changeCol')}</span>
                </div>
                {suggestions.map((s, i) => (
                  <motion.div
                    key={s.asset}
                    initial={{ opacity: 0, x: isRTL ? 8 : -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="grid grid-cols-4 gap-2 px-3 py-2 bg-background/40 rounded-lg items-center"
                  >
                    <span className="text-sm font-semibold text-foreground">{s.asset === 'Others' ? t('portfolio.others') : s.asset}</span>
                    <span className="text-xs text-muted-foreground tabular-nums text-end">{s.current}</span>
                    <span className="text-xs text-foreground tabular-nums font-medium text-end">{s.suggested}</span>
                    <span className={cn('text-xs font-semibold tabular-nums text-end', s.color)}>{t(s.actionKey)} {s.change}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                className="w-full gradient-yellow hover:opacity-90 text-background font-semibold h-11 shadow-md shadow-primary/20"
                onClick={handleRebalance}
                disabled={rebalancing}
              >
                {rebalancing ? (
                  <span className="flex items-center gap-2">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="h-4 w-4" />
                    </motion.div>
                    {t('portfolio.rebalancing')}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    {t('portfolio.rebalanceNow')}
                  </span>
                )}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Rebalance Suggestion Card ────────────────────────────────────────
function RebalanceSuggestion({ onOpenModal }: { onOpenModal: () => void }) {
  const { t, isRTL } = useTranslation();

  return (
    <div className="gradient-border glass-card rounded-xl p-4 sm:p-6 hover-lift relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        background: 'linear-gradient(135deg, #F0B90B 0%, #0ECB81 50%, #F0B90B 100%)',
        backgroundSize: '200% 200%',
        animation: 'gradient-shift 6s ease infinite',
      }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">{t('portfolio.rebalance')}</h3>
          <Badge className="bg-primary/10 text-primary border-0 text-[10px] font-semibold ms-auto">
            AI
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">
              {t('portfolio.aiSuggests')} <span className="text-destructive font-semibold">{t('portfolio.reduceBtcBy')}</span>,{' '}
              <span className="text-success font-semibold">{t('portfolio.increaseEthBy')}</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground ps-6">
            {t('portfolio.rebalanceDesc')}
          </p>
        </div>

        <Button
          className="gradient-yellow hover:opacity-90 text-background font-semibold h-9 px-5 text-sm shadow-md shadow-primary/20 press-scale w-full sm:w-auto glow-pulse-yellow"
          onClick={onOpenModal}
        >
          <Sparkles className="h-4 w-4 me-1.5" />
          {t('portfolio.rebalanceNow')}
          <ChevronRight className={`h-4 w-4 ms-1 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────
export default function PortfolioAnalyticsView() {
  const { goBack } = useAppStore();
  const { t, isRTL } = useTranslation();
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [showRebalanceModal, setShowRebalanceModal] = useState(false);

  return (
    <ScrollArea className="h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-4rem)]">
      <motion.div
        className="p-4 sm:p-6 max-w-4xl mx-auto space-y-4"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* ── Header ── */}
        <motion.div variants={staggerItem} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('actions.back')}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary h-9 w-9 press-scale"
              onClick={goBack}
            >
              <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('portfolio.title')}</h1>
              <p className="text-[10px] text-muted-foreground">{t('portfolio.subtitle')}</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center bg-card rounded-lg p-0.5 border border-border/60">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={cn(
                  'px-2.5 py-1.5 text-[10px] font-semibold rounded-md transition-all duration-200 press-scale',
                  selectedRange === range
                    ? 'bg-primary text-background shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {range}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Portfolio Value Chart ── */}
        <motion.div variants={staggerItem}>
          <PortfolioValueChart selectedRange={selectedRange} />
        </motion.div>

        {/* ── Asset Allocation ── */}
        <motion.div variants={staggerItem}>
          <AssetAllocationDonut />
        </motion.div>

        {/* ── Performance Metrics ── */}
        <motion.div variants={staggerItem}>
          <PerformanceMetrics />
        </motion.div>

        {/* ── Monthly Returns Bar Chart ── */}
        <motion.div variants={staggerItem}>
          <MonthlyReturnsBarChart />
        </motion.div>

        {/* ── Risk Analysis ── */}
        <motion.div variants={staggerItem}>
          <RiskAnalysis />
        </motion.div>

        {/* ── Top Holdings Table ── */}
        <motion.div variants={staggerItem}>
          <TopHoldingsTable />
        </motion.div>

        {/* ── Rebalance Suggestion ── */}
        <motion.div variants={staggerItem}>
          <RebalanceSuggestion onOpenModal={() => setShowRebalanceModal(true)} />
        </motion.div>

        {/* Bottom spacing for mobile nav */}
        <div className="h-4" />
      </motion.div>
      {/* AI Rebalance Modal */}
      <AnimatePresence>
        {showRebalanceModal && (
          <AIRebalanceModal onClose={() => setShowRebalanceModal(false)} />
        )}
      </AnimatePresence>
    </ScrollArea>
  );
}
