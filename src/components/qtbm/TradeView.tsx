'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from '@/stores/app-store';
import { mockMarketPairs, mockCandleData, mockOrderBook, mockOrders, mockTrades, mockWalletBalances, formatPrice, formatNumber } from '@/lib/mock-data';
import { ArrowUpRight, ArrowDownRight, ChevronDown, X, Minus, Plus, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import type { Order, OrderBookEntry } from '@/types';
import { useTranslation } from '@/lib/i18n';

type OrderType = 'limit' | 'market' | 'stop_limit';
type OrderSide = 'buy' | 'sell';
type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '1W';
type IndicatorTab = 'candle' | 'rsi' | 'macd' | 'bollinger';

// ── Indicator Calculation Functions ───────────────────────────────────────────
function calculateEMA(data: number[], period: number): number[] {
  const result: number[] = [];
  const k = 2 / (period + 1);
  if (data.length === 0) return result;
  // First EMA is SMA
  let sum = 0;
  for (let i = 0; i < Math.min(period, data.length); i++) {
    sum += data[i];
  }
  result[0] = sum / Math.min(period, data.length);
  for (let i = 1; i < data.length; i++) {
    result[i] = data[i] * k + result[i - 1] * (1 - k);
  }
  return result;
}

function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (prices.length < period + 1) return prices.map(() => 50);

  let avgGain = 0;
  let avgLoss = 0;

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) {
      avgGain += change;
    } else {
      avgLoss += Math.abs(change);
    }
  }
  avgGain /= period;
  avgLoss /= period;

  // Fill initial values
  for (let i = 0; i < period; i++) {
    rsi.push(50);
  }

  // First RSI
  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - 100 / (1 + firstRS));

  // Subsequent RSI values
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}

interface MACDResult {
  macd: number[];
  signal: number[];
  histogram: number[];
}

function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): MACDResult {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine = fastEMA.map((v, i) => v - slowEMA[i]);
  const signalLine = calculateEMA(macdLine, signalPeriod);
  const histogram = macdLine.map((v, i) => v - signalLine[i]);

  return { macd: macdLine, signal: signalLine, histogram };
}

// ── RSI Chart Component ───────────────────────────────────────────────────────
function RSIChart() {
  const closePrices = useMemo(() => mockCandleData.map(d => d.close), []);
  const rsiValues = useMemo(() => calculateRSI(closePrices, 14), [closePrices]);

  const w = 600;
  const h = 80;
  const padding = { top: 4, bottom: 4, left: 0, right: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const currentRSI = rsiValues[rsiValues.length - 1] ?? 50;
  const rsiColor = currentRSI >= 50 ? '#0ECB81' : '#F6465D';

  // Map RSI to y coordinate (0=bottom, 100=top)
  const toY = (val: number) => padding.top + chartH * (1 - val / 100);
  const toX = (i: number) => padding.left + (i / (rsiValues.length - 1)) * chartW;

  // Build RSI line path
  const linePath = rsiValues.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');

  // Build area fill path (between 30-70)
  const y30 = toY(30);
  const y70 = toY(70);
  const areaPath = `M${padding.left},${y70} L${padding.left + chartW},${y70} L${padding.left + chartW},${y30} L${padding.left},${y30} Z`;

  // RSI area (from line to bottom)
  const areaFillPath = `${linePath} L${toX(rsiValues.length - 1)},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

  return (
    <div className="border-t border-border p-2 chart-grid-bg relative">
      {/* Label */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-muted-foreground">RSI(14)</span>
        <span className={`text-[10px] font-medium tabular-nums`} style={{ color: rsiColor }}>
          {currentRSI.toFixed(2)}
        </span>
      </div>
      <svg width="100%" height={h - 16} viewBox={`0 0 ${w} ${h - 16}`} preserveAspectRatio="none" className="w-full" dir="ltr">
        <defs>
          <linearGradient id="rsiAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0B90B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#F0B90B" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="rsiZoneGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#848E9C" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#848E9C" stopOpacity="0.03" />
          </linearGradient>
        </defs>
        {/* Zone between 30-70 */}
        <path d={areaPath} fill="url(#rsiZoneGrad)" />
        {/* RSI area fill */}
        <path d={areaFillPath} fill="url(#rsiAreaGrad)" />
        {/* Overbought line 70 */}
        <line x1={padding.left} y1={y70} x2={padding.left + chartW} y2={y70} stroke="#F6465D" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.6" />
        {/* Oversold line 30 */}
        <line x1={padding.left} y1={y30} x2={padding.left + chartW} y2={y30} stroke="#0ECB81" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.6" />
        {/* Middle line 50 */}
        <line x1={padding.left} y1={toY(50)} x2={padding.left + chartW} y2={toY(50)} stroke="#5E6673" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
        {/* RSI line */}
        <path d={linePath} fill="none" stroke="#F0B90B" strokeWidth="1.5" />
        {/* Y-axis labels */}
        <text x={padding.left + chartW + 4} y={y70 + 3} fill="#F6465D" fontSize="8" opacity="0.7">70</text>
        <text x={padding.left + chartW + 4} y={toY(50) + 3} fill="#5E6673" fontSize="8" opacity="0.5">50</text>
        <text x={padding.left + chartW + 4} y={y30 + 3} fill="#0ECB81" fontSize="8" opacity="0.7">30</text>
      </svg>
    </div>
  );
}

// ── MACD Chart Component ──────────────────────────────────────────────────────
function MACDChart() {
  const closePrices = useMemo(() => mockCandleData.map(d => d.close), []);
  const { macd, signal, histogram } = useMemo(() => calculateMACD(closePrices, 12, 26, 9), [closePrices]);

  const w = 600;
  const h = 80;
  const padding = { top: 4, bottom: 4, left: 0, right: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const currentMACD = macd[macd.length - 1] ?? 0;
  const currentSignal = signal[signal.length - 1] ?? 0;
  const currentHist = histogram[histogram.length - 1] ?? 0;

  // Find range for scaling
  const allValues = [...macd, ...signal, ...histogram];
  const maxAbsVal = Math.max(Math.abs(Math.min(...allValues)), Math.abs(Math.max(...allValues)), 1);

  const toY = (val: number) => padding.top + chartH / 2 - (val / maxAbsVal) * (chartH / 2) * 0.9;
  const toX = (i: number) => padding.left + (i / (macd.length - 1)) * chartW;

  // MACD line path
  const macdPath = macd.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
  // Signal line path
  const signalPath = signal.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
  // Zero line
  const zeroY = toY(0);

  // Histogram bars
  const barWidth = Math.max(chartW / macd.length * 0.7, 1);

  return (
    <div className="border-t border-border p-2 chart-grid-bg relative">
      {/* Label */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[10px] text-muted-foreground">MACD(12,26,9)</span>
        <span className="text-[10px] font-medium text-primary tabular-nums">{currentMACD.toFixed(2)}</span>
        <span className="text-[10px] font-medium text-[#627EEA] tabular-nums">{currentSignal.toFixed(2)}</span>
        <span className={`text-[10px] font-medium tabular-nums ${currentHist >= 0 ? 'text-success' : 'text-destructive'}`}>
          {currentHist.toFixed(2)}
        </span>
      </div>
      <svg width="100%" height={h - 16} viewBox={`0 0 ${w} ${h - 16}`} preserveAspectRatio="none" className="w-full" dir="ltr">
        {/* Zero line */}
        <line x1={padding.left} y1={zeroY} x2={padding.left + chartW} y2={zeroY} stroke="#5E6673" strokeWidth="0.5" strokeDasharray="4,3" opacity="0.4" />
        {/* Histogram bars */}
        {histogram.map((v, i) => (
          <rect
            key={i}
            x={toX(i) - barWidth / 2}
            y={v >= 0 ? toY(v) : zeroY}
            width={barWidth}
            height={Math.abs(toY(v) - zeroY)}
            fill={v >= 0 ? 'rgba(14,203,129,0.5)' : 'rgba(246,70,93,0.5)'}
          />
        ))}
        {/* MACD line */}
        <path d={macdPath} fill="none" stroke="#F0B90B" strokeWidth="1.5" />
        {/* Signal line */}
        <path d={signalPath} fill="none" stroke="#627EEA" strokeWidth="1.5" />
        {/* Zero label */}
        <text x={padding.left + chartW + 4} y={zeroY + 3} fill="#5E6673" fontSize="8" opacity="0.5">0</text>
      </svg>
    </div>
  );
}

// ── Bollinger Bands Overlay SVG ───────────────────────────────────────────────
function BollingerBandsOverlay() {
  const { t } = useTranslation();
  const closePrices = useMemo(() => mockCandleData.map(d => d.close), []);
  const period = 20;
  const multiplier = 2;

  const sma: number[] = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < closePrices.length; i++) {
      if (i < period - 1) { result.push(closePrices[i]); continue; }
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += closePrices[j];
      result.push(sum / period);
    }
    return result;
  }, [closePrices]);

  const bands = useMemo(() => {
    const upper: number[] = [];
    const lower: number[] = [];
    for (let i = 0; i < closePrices.length; i++) {
      if (i < period - 1) { upper.push(closePrices[i] * 1.02); lower.push(closePrices[i] * 0.98); continue; }
      let sumSq = 0;
      for (let j = i - period + 1; j <= i; j++) sumSq += Math.pow(closePrices[j] - sma[i], 2);
      const stdDev = Math.sqrt(sumSq / period);
      upper.push(sma[i] + multiplier * stdDev);
      lower.push(sma[i] - multiplier * stdDev);
    }
    return { upper, lower };
  }, [closePrices, sma]);

  const w = 600;
  const h = 120;
  const padding = { top: 8, bottom: 8, left: 0, right: 40 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  const allVals = [...closePrices, ...bands.upper, ...bands.lower];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const range = maxVal - minVal || 1;

  const toY = (val: number) => padding.top + chartH * (1 - (val - minVal) / range);
  const toX = (i: number) => padding.left + (i / (closePrices.length - 1)) * chartW;

  const upperPath = bands.upper.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
  const lowerPath = bands.lower.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
  const smaPath = sma.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');

  // Fill area between upper and lower bands
  const fillPath = `${upperPath} L${toX(closePrices.length - 1)},${toY(bands.lower[closePrices.length - 1])} ${bands.lower.slice().reverse().map((v, ri) => {
    const i = closePrices.length - 1 - ri;
    return `L${toX(i)},${toY(v)}`;
  }).join(' ')} Z`;

  return (
    <div className="border-t border-border p-2 chart-grid-bg relative">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[10px] text-muted-foreground">BB(20,2)</span>
        <span className="text-[10px] font-medium text-primary tabular-nums">{t('trade.upper')}: {bands.upper[bands.upper.length - 1]?.toFixed(2)}</span>
        <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{t('trade.sma')}: {sma[sma.length - 1]?.toFixed(2)}</span>
        <span className="text-[10px] font-medium text-[#627EEA] tabular-nums">{t('trade.lower')}: {bands.lower[bands.lower.length - 1]?.toFixed(2)}</span>
      </div>
      <svg width="100%" height={h - 16} viewBox={`0 0 ${w} ${h - 16}`} preserveAspectRatio="none" className="w-full" dir="ltr">
        <defs>
          <linearGradient id="bbFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0B90B" stopOpacity="0.08" />
            <stop offset="50%" stopColor="#F0B90B" stopOpacity="0.03" />
            <stop offset="100%" stopColor="#F0B90B" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        {/* Fill between bands */}
        <path d={fillPath} fill="url(#bbFillGrad)" />
        {/* Upper band */}
        <path d={upperPath} fill="none" stroke="#F0B90B" strokeWidth="1" opacity="0.7" />
        {/* Lower band */}
        <path d={lowerPath} fill="none" stroke="#627EEA" strokeWidth="1" opacity="0.7" />
        {/* SMA middle line */}
        <path d={smaPath} fill="none" stroke="#848E9C" strokeWidth="1" strokeDasharray="4,3" opacity="0.6" />
      </svg>
    </div>
  );
}

// ── Candlestick Chart Component ──────────────────────────────────────────────
function CandlestickChart({ pairSymbol, livePrice }: { pairSymbol: string; livePrice: number | undefined }) {
  const { t } = useTranslation();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof import('lightweight-charts').createChart> | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [interval, setIntervalState] = useState<TimeInterval>('1h');
  const lastAddedTimeRef = useRef<number>(0);
  const [indicatorTab, setIndicatorTab] = useState<IndicatorTab>('candle');

  useEffect(() => {
    if (!chartContainerRef.current) return;

    let chart: ReturnType<typeof import('lightweight-charts').createChart> | null = null;
    let candleSeries: any = null;
    let volumeSeries: any = null;

    const initChart = async () => {
      const { createChart, candlestickSeries: CandlestickSeries, histogramSeries: HistogramSeries } = await import('lightweight-charts');

      if (!chartContainerRef.current) return;

      // Create chart
      chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: '#0B0E11' },
          textColor: '#5E6673',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: '#1E2329' },
          horzLines: { color: '#1E2329' },
        },
        crosshair: {
          mode: 0,
          vertLine: { color: '#2B3139', width: 1, style: 2, labelBackgroundColor: '#2B3139' },
          horzLine: { color: '#2B3139', width: 1, style: 2, labelBackgroundColor: '#2B3139' },
        },
        rightPriceScale: {
          borderColor: '#2B3139',
          scaleMargins: { top: 0.05, bottom: 0.25 },
        },
        timeScale: {
          borderColor: '#2B3139',
          timeVisible: true,
          secondsVisible: false,
        },
        handleScale: { axisPressedMouseMove: true },
        handleScroll: { vertTouchDrag: false },
      });

      chartRef.current = chart;

      // Candlestick series
      candleSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#0ECB81',
        downColor: '#F6465D',
        borderUpColor: '#0ECB81',
        borderDownColor: '#F6465D',
        wickUpColor: '#0ECB81',
        wickDownColor: '#F6465D',
      });

      candleSeriesRef.current = candleSeries;

      // Volume histogram series
      volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '',
      });

      volumeSeriesRef.current = volumeSeries;

      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });

      // Set data
      const candleData = mockCandleData.map(d => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      const volumeData = mockCandleData.map(d => ({
        time: d.time as any,
        value: d.volume,
        color: d.close >= d.open ? 'rgba(14,203,129,0.25)' : 'rgba(246,70,93,0.25)',
      }));

      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);

      // Track last time
      if (candleData.length > 0) {
        lastAddedTimeRef.current = candleData[candleData.length - 1].time as number;
      }

      chart.timeScale().fitContent();
    };

    initChart();

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [pairSymbol, interval]);

  // Update chart with live price
  useEffect(() => {
    if (!livePrice || !candleSeriesRef.current) return;
    const now = Math.floor(Date.now() / 1000);
    // Only add a new tick every 5 seconds at most
    if (now - lastAddedTimeRef.current < 5) {
      // Just update the last candle's close
      try {
        candleSeriesRef.current.update({
          time: lastAddedTimeRef.current as any,
          close: livePrice,
        });
      } catch {}
      return;
    }
    lastAddedTimeRef.current = now;
    try {
      candleSeriesRef.current.update({
        time: now as any,
        open: livePrice,
        high: livePrice,
        low: livePrice,
        close: livePrice,
      });
    } catch {}
  }, [livePrice]);

  return (
    <div className="flex flex-col h-full">
      {/* Time interval selector */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-background border-b border-border">
        {(['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as TimeInterval[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setIntervalState(tf)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
              interval === tf
                ? 'bg-secondary text-primary tf-breathe-glow'
                : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      {/* Chart container */}
      <div ref={chartContainerRef} className={`flex-1 min-h-0 ${indicatorTab === 'bollinger' ? 'hidden' : ''}`} />
      {/* Bollinger overlay replaces chart */}
      {indicatorTab === 'bollinger' && (
        <BollingerBandsOverlay />
      )}
      {/* Indicator Tab Bar - below the chart */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-background border-t border-b border-border">
        <span className="text-[10px] text-muted-foreground me-1 flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {t('trade.indicator')}
        </span>
        {([
          { id: 'candle' as IndicatorTab, label: t('trade.candle') },
          { id: 'rsi' as IndicatorTab, label: 'RSI' },
          { id: 'macd' as IndicatorTab, label: 'MACD' },
          { id: 'bollinger' as IndicatorTab, label: t('trade.bollinger') },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setIndicatorTab(tab.id)}
            className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
              indicatorTab === tab.id
                ? 'bg-gradient-to-r from-primary to-[#F8D12F] text-primary-foreground shadow-sm shadow-primary/20'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Indicator sub-chart - only one visible at a time */}
      <AnimatePresence mode="wait">
        {indicatorTab === 'rsi' && (
          <motion.div
            key="rsi-chart"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <RSIChart />
          </motion.div>
        )}
        {indicatorTab === 'macd' && (
          <motion.div
            key="macd-chart"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <MACDChart />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Live Price Display ──────────────────────────────────────────────────────
function LivePriceDisplay({ price, isPositive, direction }: { price: number; isPositive: boolean; direction: 'up' | 'down' | null }) {
  const { t } = useTranslation();
  const flashClass = direction === 'up' ? 'price-flash-up' : direction === 'down' ? 'price-flash-down' : '';
  const glowClass = isPositive ? 'glow-green' : 'glow-red';
  const priceGlowClass = isPositive ? 'price-glow-up' : 'price-glow-down';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${glowClass} price-transition`}>
        {/* Enhanced LIVE badge with prominent pulse */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-success/15 border border-success/25 live-badge-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-success live-dot" />
          <span className="text-[10px] text-success font-bold tracking-wider">{t('status.live')}</span>
        </div>
        <span
          key={price}
          className={`text-xl font-bold tabular-nums price-transition ${priceGlowClass} ${flashClass} ${
            isPositive ? 'text-success' : 'text-destructive'
          }`}
        >
          {formatPrice(price)}
        </span>
      </div>
    </div>
  );
}

// ── Depth Chart SVG Component ────────────────────────────────────────────────
function DepthChart({ currentPrice, isPositive }: { currentPrice: number; isPositive: boolean }) {
  const { asks, bids } = mockOrderBook;
  const maxAskTotal = asks[asks.length - 1]?.total || 1;
  const maxBidTotal = bids[bids.length - 1]?.total || 1;
  const maxTotal = Math.max(maxAskTotal, maxBidTotal);

  const w = 280;
  const h = 100;
  const midY = h / 2;

  // Build bid area points (left side, cumulative)
  const bidPoints = bids.slice(0, 10).map((bid, i) => ({
    x: (i / 9) * (w / 2),
    y: midY - (bid.total / maxTotal) * midY * 0.9,
  }));

  // Build ask area points (right side, cumulative)
  const askPoints = asks.slice(0, 10).map((ask, i) => ({
    x: w / 2 + (i / 9) * (w / 2),
    y: midY - (ask.total / maxTotal) * midY * 0.9,
  }));

  const bidArea = `0,${midY} ${bidPoints.map(p => `${p.x},${p.y}`).join(' ')} ${w / 2},${midY}`;
  const askArea = `${w / 2},${midY} ${askPoints.map(p => `${p.x},${p.y}`).join(' ')} ${w},${midY}`;
  const bidLine = bidPoints.map(p => `${p.x},${p.y}`).join(' ');
  const askLine = askPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={w} height={h} className="w-full" dir="ltr">
      <defs>
        <linearGradient id="bidDepthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ECB81" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0ECB81" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="askDepthGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F6465D" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F6465D" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Bid area */}
      <polygon fill="url(#bidDepthGrad)" points={bidArea} />
      <polyline fill="none" stroke="#0ECB81" strokeWidth="1.5" points={bidLine} />
      {/* Ask area */}
      <polygon fill="url(#askDepthGrad)" points={askArea} />
      <polyline fill="none" stroke="#F6465D" strokeWidth="1.5" points={askLine} />
      {/* Spread line */}
      <line x1={w / 2} y1={0} x2={w / 2} y2={h} stroke="#2B3139" strokeWidth="1" strokeDasharray="3,3" />
      {/* Price label */}
      <text x={w / 2} y={midY + 14} textAnchor="middle" fill={isPositive ? '#0ECB81' : '#F6465D'} fontSize="9" fontWeight="bold">
        {formatPrice(currentPrice)}
      </text>
    </svg>
  );
}

// ── Order Book Component ──────────────────────────────────────────────────────
function OrderBook({ currentPrice, isPositive, livePrice }: { currentPrice: number; isPositive: boolean; livePrice: number | undefined }) {
  const { t } = useTranslation();
  const { asks, bids } = mockOrderBook;
  const maxAskTotal = asks[asks.length - 1]?.total || 1;
  const maxBidTotal = bids[bids.length - 1]?.total || 1;

  const displayPrice = livePrice || currentPrice;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border text-[10px] text-muted-foreground">
        <span className="w-[38%] text-start">{t('trade.price')}(USDT)</span>
        <span className="w-[30%] text-end">{t('trade.amount')}(BTC)</span>
        <span className="w-[32%] text-end">{t('trade.total')}</span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {/* Asks (sells) - reversed so lowest ask is at bottom (near spread) */}
        <div className="space-y-0">
          {asks.slice(0, 10).reverse().map((ask, i) => (
            <div key={`ask-${i}`} className="relative flex items-center px-3 py-[3px] text-[11px] order-book-row cursor-pointer">
              <div
                className="absolute end-0 top-0 bottom-0 depth-bar-animate"
                style={{
                  width: `${(ask.total / maxAskTotal) * 100}%`,
                  background: `linear-gradient(to left, rgba(246, 70, 93, ${0.04 + (ask.total / maxAskTotal) * 0.12}), rgba(246, 70, 93, 0.02))`,
                }}
              />
              <span className="w-[38%] text-destructive tabular-nums relative">{formatPrice(ask.price)}</span>
              <span className="w-[30%] text-end text-muted-foreground tabular-nums relative">{ask.quantity.toFixed(4)}</span>
              <span className="w-[32%] text-end text-muted-foreground tabular-nums relative">{formatNumber(ask.total, 0)}</span>
            </div>
          ))}
        </div>

        {/* Spread / Current Price */}
        <div className="flex items-center justify-center gap-2 py-1.5 border-y border-border bg-background">
          <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
            {formatPrice(displayPrice)}
          </span>
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-success" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
          )}
          <Badge className="text-[10px] h-4 px-1.5 bg-primary/10 text-primary border-0 font-medium spread-gradient-text">
            {t('trade.spread')}: {formatPrice(asks[0]?.price - bids[0]?.price || 0)}
          </Badge>
        </div>

        {/* Bids (buys) */}
        <div className="space-y-0">
          {bids.slice(0, 10).map((bid, i) => (
            <div key={`bid-${i}`} className="relative flex items-center px-3 py-[3px] text-[11px] order-book-row cursor-pointer">
              <div
                className="absolute end-0 top-0 bottom-0 depth-bar-animate"
                style={{
                  width: `${(bid.total / maxBidTotal) * 100}%`,
                  background: `linear-gradient(to left, rgba(14, 203, 129, ${0.04 + (bid.total / maxBidTotal) * 0.12}), rgba(14, 203, 129, 0.02))`,
                }}
              />
              <span className="w-[38%] text-success tabular-nums relative">{formatPrice(bid.price)}</span>
              <span className="w-[30%] text-end text-muted-foreground tabular-nums relative">{bid.quantity.toFixed(4)}</span>
              <span className="w-[32%] text-end text-muted-foreground tabular-nums relative">{formatNumber(bid.total, 0)}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Trade Panel Component ─────────────────────────────────────────────────────
function TradePanel({ pair, livePrice }: { pair: typeof mockMarketPairs[0]; livePrice: number | undefined }) {
  const { t, language } = useTranslation();
  const [side, setSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('limit');
  const currentPrice = livePrice || pair.price;
  const [price, setPrice] = useState(formatPrice(currentPrice));
  const [amount, setAmount] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [percentSlider, setPercentSlider] = useState(0);

  // Update price when live price changes (only for market orders display)
  useEffect(() => {
    if (livePrice && orderType !== 'market') {
      // Don't override user input - just keep in sync for first render
    }
  }, [livePrice, orderType]);

  // Mock available balance
  const usdtBalance = mockWalletBalances.find(b => b.asset === 'USDT');
  const btcBalance = mockWalletBalances.find(b => b.asset === pair.baseAsset);
  const availableBalance = side === 'buy'
    ? usdtBalance?.available || 22150.30
    : btcBalance?.available || 0.9876;

  const priceNum = parseFloat(price) || currentPrice;
  const amountNum = parseFloat(amount) || 0;
  const total = priceNum * amountNum;
  const fee = total * 0.001; // 0.1% fee
  const feeAsset = side === 'buy' ? pair.baseAsset : pair.quoteAsset;

  const handlePercentChange = (pct: number) => {
    setPercentSlider(pct);
    if (side === 'buy') {
      const maxAmount = availableBalance / priceNum;
      setAmount((maxAmount * pct / 100).toFixed(6));
    } else {
      setAmount((availableBalance * pct / 100).toFixed(6));
    }
  };

  const handlePriceChange = (val: string) => {
    setPrice(val);
    setPercentSlider(0);
  };

  const handleAmountChange = (val: string) => {
    setAmount(val);
    setPercentSlider(0);
  };

  const handlePlaceOrder = async () => {
    if (!amountNum) return;
    const sideLabel = side === 'buy' ? t('orders.buy') : t('orders.sell');
    const typeLabel = orderType === 'stop_limit' ? t('orders.stopLimit') : orderType === 'limit' ? t('trade.limit') : t('orders.market');
    const priceLabel = orderType === 'market' ? t('orders.market') : price;

    // Execute via Cloud Function (real Firestore transaction)
    try {
      toast.loading(t('trade.placingOrder'), { id: 'trade-order' });
      const { executeTradeCall } = await import('@/lib/firestore');
      const result = await executeTradeCall({
        symbol: pair.symbol,
        side,
        quantity: amountNum,
        price: orderType === 'market' ? undefined : parseFloat(price),
        orderType,
      });
      toast.success(
        t('trade.orderPlaced')
          .replace('{side}', sideLabel)
          .replace('{type}', typeLabel)
          .replace('{amount}', amount)
          .replace('{asset}', pair.baseAsset)
          .replace('{price}', priceLabel)
          .replace('{quote}', pair.quoteAsset),
        { id: 'trade-order', description: `ID: ${result.tradeId}` }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Trade failed';
      toast.error(message, { id: 'trade-order' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Buy/Sell Toggle */}
      <div className="flex gap-1 p-2 pb-0 tab-spring-transition">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 touch-feedback ${
            side === 'buy'
              ? 'bg-success/15 text-success border-b-2 border-success'
              : 'text-muted-foreground hover:text-muted-foreground border-b-2 border-transparent'
          }`}
        >
          {t('trade.buy')} {pair.baseAsset}
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 touch-feedback ${
            side === 'sell'
              ? 'bg-destructive/15 text-destructive border-b-2 border-destructive'
              : 'text-muted-foreground hover:text-muted-foreground border-b-2 border-transparent'
          }`}
        >
          {t('trade.sell')} {pair.baseAsset}
        </button>
      </div>

      <div className="px-3 pb-3 space-y-2.5">
        {/* Order Type Tabs */}
        <div className="flex gap-1">
          {(['limit', 'market', 'stop_limit'] as OrderType[]).map((type) => (
            <button
              key={type}
              onClick={() => setOrderType(type)}
              className={`px-3 py-1.5 rounded text-[11px] font-medium transition-colors ${
                orderType === type
                  ? 'bg-secondary text-primary'
                  : 'text-muted-foreground hover:text-muted-foreground'
              }`}
            >
              {type === 'stop_limit' ? t('trade.stopLimit') : type === 'limit' ? t('trade.limit') : t('trade.market')}
            </button>
          ))}
        </div>

        {/* Stop Price (Stop-Limit only) */}
        {orderType === 'stop_limit' && (
          <div>
            <label className="text-[10px] text-muted-foreground">{t('trade.stopPrice')}</label>
            <div className="flex items-center bg-secondary rounded h-8 px-2 mt-0.5">
              <Input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder={t('trade.stopPrice')}
                className="border-0 bg-transparent text-foreground text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-muted-foreground/50"
              />
              <span className="text-[10px] text-muted-foreground shrink-0 ms-1">{pair.quoteAsset}</span>
            </div>
          </div>
        )}

        {/* Price (Limit & Stop-Limit) */}
        {orderType !== 'market' && (
          <div>
            <label className="text-[10px] text-muted-foreground">{t('trade.price')}</label>
            <div className="flex items-center bg-secondary rounded h-8 px-2 mt-0.5">
              <button onClick={() => setPrice(formatPrice(Math.max(0, priceNum - (currentPrice * 0.001))))} className="text-muted-foreground hover:text-foreground shrink-0">
                <Minus className="h-3 w-3" />
              </button>
              <Input
                type="number"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="border-0 bg-transparent text-foreground text-sm h-full p-0 mx-1 focus:ring-0 focus:outline-none tabular-nums text-center"
              />
              <button onClick={() => setPrice(formatPrice(priceNum + (currentPrice * 0.001)))} className="text-muted-foreground hover:text-foreground shrink-0">
                <Plus className="h-3 w-3" />
              </button>
              <span className="text-[10px] text-muted-foreground shrink-0 ms-1">{pair.quoteAsset}</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-[10px] text-muted-foreground">{t('trade.amount')}</label>
          <div className="flex items-center bg-secondary rounded h-8 px-2 mt-0.5">
            <Input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="border-0 bg-transparent text-foreground text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-muted-foreground/50"
            />
            <span className="text-[10px] text-muted-foreground shrink-0 ms-1">{pair.baseAsset}</span>
          </div>
        </div>

        {/* Percentage Slider */}
        <div>
          <Slider
            value={[percentSlider]}
            onValueChange={([v]) => handlePercentChange(v)}
            max={100}
            step={1}
            className="w-full [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-secondary [&_[data-slot=slider-range]]:bg-primary [&_[data-slot=slider-thumb]]:h-3.5 [&_[data-slot=slider-thumb]]:w-3.5 [&_[data-slot=slider-thumb]]:border-primary"
          />
          <div className="flex justify-between mt-1">
            {['25%', '50%', '75%', '100%'].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentChange(parseInt(pct))}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  percentSlider === parseInt(pct)
                    ? 'bg-secondary text-primary'
                    : 'text-muted-foreground hover:text-muted-foreground'
                }`}
              >
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div>
          <label className="text-[10px] text-muted-foreground">{t('trade.total')}</label>
          <div className="flex items-center bg-secondary rounded h-8 px-2 mt-0.5">
            <span className="text-sm text-foreground tabular-nums flex-1">
              {total > 0 ? formatPrice(total) : '0.00'}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">{pair.quoteAsset}</span>
          </div>
        </div>

        {/* Available Balance */}
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">{t('trade.available')}</span>
          <span className="text-muted-foreground tabular-nums">
            {side === 'buy' ? `${formatPrice(availableBalance)} ${pair.quoteAsset}` : `${availableBalance.toFixed(6)} ${pair.baseAsset}`}
          </span>
        </div>

        {/* Order Summary */}
        {amountNum > 0 && (
          <div className="bg-card rounded p-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">{t('trade.estFee')} ({feeAsset})</span>
              <span className="text-muted-foreground tabular-nums">{fee.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted-foreground">{t('trade.total')} ({pair.quoteAsset})</span>
              <span className="text-foreground tabular-nums font-medium">{formatPrice(total + (side === 'buy' ? 0 : -fee))}</span>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          className={`w-full font-semibold h-10 text-sm ripple-effect relative overflow-hidden ${
            side === 'buy'
              ? 'bg-success hover:bg-success/90 text-white hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-destructive hover:bg-destructive/90 text-white hover:scale-[1.02] active:scale-[0.98]'
          } transition-transform duration-150`}
        >
          {side === 'buy' ? t('trade.buy') : t('trade.sell')} {pair.baseAsset}
        </Button>
      </div>
    </div>
  );
}

// ── Open Orders Component ─────────────────────────────────────────────────────
function OpenOrders({ pairSymbol }: { pairSymbol: string }) {
  const { t, language } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders.filter(o => o.status === 'pending' || o.status === 'partially_filled'));

  const handleCancel = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  if (orders.length === 0) return null;

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-card/50 transition-colors"
      >
        <span className="text-xs font-semibold text-muted-foreground">{t('trade.openOrders')} ({orders.length})</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
      {!collapsed && (
        <ScrollArea className="max-h-48">
          <div className="px-4 pb-3">
            {/* Header */}
            <div className="grid grid-cols-7 gap-2 text-[10px] text-muted-foreground pb-1 border-b border-border/50">
              <span>{t('trade.pair')}</span>
              <span>{t('trade.side')}</span>
              <span className="text-end">{t('trade.price')}</span>
              <span className="text-end">{t('trade.amount')}</span>
              <span className="text-end">{t('trade.filled')}</span>
              <span className="text-end">{t('common.time')}</span>
              <span className="text-center">{t('trade.action')}</span>
            </div>
            {orders.map((order) => {
              const filledPct = order.quantity > 0 ? (order.filledQty / order.quantity) * 100 : 0;
              return (
                <div key={order.id} className="grid grid-cols-7 gap-2 text-[11px] py-1.5 border-b border-border/30 items-center">
                  <span className="text-foreground font-medium">{order.market}</span>
                  <span className={order.side === 'buy' ? 'text-success' : 'text-destructive'}>
                    {t('trade.' + order.side)}
                  </span>
                  <span className="text-end text-foreground tabular-nums">
                    {order.price ? formatPrice(order.price) : t('trade.market')}
                  </span>
                  <span className="text-end text-muted-foreground tabular-nums">{order.quantity}</span>
                  <span className="text-end tabular-nums">
                    <span className={filledPct > 0 ? 'text-primary' : 'text-muted-foreground'}>{filledPct.toFixed(0)}%</span>
                  </span>
                  <span className="text-end text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString(language === 'ar' ? 'ar' : undefined)}</span>
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                      className="h-5 px-2 text-[10px] text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      {t('trade.cancel')}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ── Recent Trades Component ───────────────────────────────────────────────────
function RecentTrades() {
  const { t, language } = useTranslation();
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border">
        <span className="text-[11px] font-semibold text-muted-foreground">{t('trade.recentTrades')}</span>
      </div>
      <div className="flex items-center justify-between px-3 py-0.5 text-[10px] text-muted-foreground">
        <span className="w-[35%]">{t('trade.price')}(USDT)</span>
        <span className="w-[30%] text-end">{t('trade.amount')}(BTC)</span>
        <span className="w-[35%] text-end">{t('common.time')}</span>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        {mockTrades.map((trade, idx) => (
          <div key={trade.id} className={`flex items-center justify-between px-3 py-[2px] text-[11px] hover:bg-card/30 ${idx === 0 ? 'flash-highlight' : ''}`}>
            <span className={`w-[35%] tabular-nums ${trade.side === 'buy' ? 'text-success' : 'text-destructive'}`}>
              {formatPrice(trade.price)}
            </span>
            <span className="w-[30%] text-end text-muted-foreground tabular-nums">{trade.quantity}</span>
            <span className="w-[35%] text-end text-muted-foreground">{new Date(trade.createdAt).toLocaleTimeString(language === 'ar' ? 'ar' : undefined)}</span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

// ── Pair Selector Dropdown ────────────────────────────────────────────────────
function PairSelector({ currentPair, onSelect }: { currentPair: typeof mockMarketPairs[0]; onSelect: (symbol: string) => void }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const popularPairs = mockMarketPairs.filter(p => p.quoteAsset === 'USDT');

  const filtered = search
    ? popularPairs.filter(p => p.symbol.toLowerCase().includes(search.toLowerCase()) || p.baseAsset.toLowerCase().includes(search.toLowerCase()))
    : popularPairs.slice(0, 12);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-foreground hover:text-primary transition-colors"
      >
        <span className="text-lg font-bold">{currentPair.baseAsset}</span>
        <span className="text-sm text-muted-foreground">/{currentPair.quoteAsset}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full start-0 mt-1 w-[280px] max-w-[calc(100vw-1.5rem)] bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <Input
              placeholder={t('markets.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="h-7 text-xs bg-secondary border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary"
            />
          </div>
          <ScrollArea className="max-h-64">
            {filtered.map((pair) => {
              const isPositive = pair.changePercent >= 0;
              return (
                <button
                  key={pair.symbol}
                  onClick={() => { onSelect(pair.symbol); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-secondary transition-colors ${
                    pair.symbol === currentPair.symbol ? 'bg-secondary/50' : ''
                  }`}
                >
                  <span>
                    <span className="text-foreground font-medium">{pair.baseAsset}</span>
                    <span className="text-muted-foreground">/{pair.quoteAsset}</span>
                  </span>
                  <span className={`tabular-nums ${isPositive ? 'text-success' : 'text-destructive'}`}>
                    {formatPrice(pair.price)}
                  </span>
                </button>
              );
            })}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ── Main TradeView Component ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
export default function TradeView() {
  const { t } = useTranslation();
  const { selectedMarket, setSelectedMarket, livePrices, priceDirection } = useAppStore();

  const currentPair = mockMarketPairs.find(p => p.symbol === selectedMarket) || mockMarketPairs[0];

  // Get live price for the current pair
  const livePrice = livePrices[currentPair.symbol] || currentPair.price;
  const direction = priceDirection[currentPair.symbol] || null;
  const isPositive = currentPair.changePercent >= 0;

  return (
    <div className="flex flex-col h-full">
      {/* ─── Pair Header (mobile-friendly: wraps stats below) ─── */}
      <div className="px-3 py-2 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Pair selector + price + badge — tight on mobile, spaced on desktop */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap min-w-0">
            <PairSelector
              currentPair={currentPair}
              onSelect={(symbol) => setSelectedMarket(symbol)}
            />
            <LivePriceDisplay price={livePrice} isPositive={isPositive} direction={direction} />
            <Badge className={`text-[10px] font-semibold shrink-0 ${
              isPositive
                ? 'bg-success/10 text-success border-0'
                : 'bg-destructive/10 text-destructive border-0'
            }`}>
              {isPositive ? <ArrowUpRight className="h-2.5 w-2.5 me-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 me-0.5" />}
              {isPositive ? '+' : ''}{currentPair.changePercent.toFixed(2)}%
            </Badge>
          </div>
          {/* 24h stats — wraps to second row on phones */}
          <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-muted-foreground flex-wrap">
            <div>
              <span className="text-muted-foreground">{t('trade.high24h')} </span>
              <span className="text-success tabular-nums">{formatPrice(currentPair.high)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('trade.low24h')} </span>
              <span className="text-destructive tabular-nums">{formatPrice(currentPair.low)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-muted-foreground">{t('trade.volume24h')} </span>
              <span className="text-foreground tabular-nums">{formatNumber(currentPair.quoteVolume)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Layout (< lg): vertical scroll, fixed section heights ───
          Each section has a fixed height on mobile so they don't overlap.
          Desktop (lg+): side-by-side 2-column layout. */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* Left/top: Chart + Order Book + Open Orders */}
        <div className="flex flex-col min-h-0 lg:flex-1 lg:border-r border-border">
          {/* Chart — fixed 340px on mobile (was flex-1 which collapsed to 0),
              flex-1 on desktop */}
          <div className="h-[340px] lg:h-auto lg:flex-1 lg:min-h-[200px] relative shrink-0" dir="ltr">
            <div className="absolute inset-0 chart-grid-bg opacity-40 pointer-events-none z-0" />
            <div className="relative z-10 h-full">
              <CandlestickChart pairSymbol={currentPair.symbol} livePrice={livePrice} />
            </div>
          </div>

          {/* Order Book + Depth Chart — fixed height on mobile */}
          <div className="h-[280px] lg:h-56 border-t border-border shrink-0">
            <div className="px-3 py-1.5 border-b border-border/50">
              <DepthChart currentPrice={livePrice} isPositive={isPositive} />
            </div>
            <OrderBook currentPrice={livePrice} isPositive={isPositive} livePrice={livePrice} />
          </div>

          {/* Open Orders — placed AFTER order book, not floating over it */}
          <OpenOrders pairSymbol={currentPair.symbol} />
        </div>

        {/* Right/bottom: Trade Panel + Recent Trades */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col min-h-0 shrink-0">
          {/* Trade Panel */}
          <div className="border-b border-border glass-morphism shrink-0">
            <TradePanel pair={currentPair} livePrice={livePrice} />
          </div>

          {/* Recent Trades — fixed height on mobile so it doesn't grow over chart */}
          <div className="h-[220px] lg:h-auto lg:flex-1 lg:min-h-0 shrink-0">
            <RecentTrades />
          </div>
        </div>
      </div>
    </div>
  );
}
