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
import type { Order, OrderBookEntry } from '@/types';

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
    <div className="border-t border-[#2B3139] p-2 chart-grid-bg relative">
      {/* Label */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] text-[#848E9C]">RSI(14)</span>
        <span className={`text-[10px] font-medium tabular-nums`} style={{ color: rsiColor }}>
          {currentRSI.toFixed(2)}
        </span>
      </div>
      <svg width="100%" height={h - 16} viewBox={`0 0 ${w} ${h - 16}`} preserveAspectRatio="none" className="w-full">
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
    <div className="border-t border-[#2B3139] p-2 chart-grid-bg relative">
      {/* Label */}
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[10px] text-[#848E9C]">MACD(12,26,9)</span>
        <span className="text-[10px] font-medium text-[#F0B90B] tabular-nums">{currentMACD.toFixed(2)}</span>
        <span className="text-[10px] font-medium text-[#627EEA] tabular-nums">{currentSignal.toFixed(2)}</span>
        <span className={`text-[10px] font-medium tabular-nums ${currentHist >= 0 ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
          {currentHist.toFixed(2)}
        </span>
      </div>
      <svg width="100%" height={h - 16} viewBox={`0 0 ${w} ${h - 16}`} preserveAspectRatio="none" className="w-full">
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
    <div className="border-t border-[#2B3139] p-2 chart-grid-bg relative">
      <div className="flex items-center gap-3 mb-1">
        <span className="text-[10px] text-[#848E9C]">BB(20,2)</span>
        <span className="text-[10px] font-medium text-[#F0B90B] tabular-nums">Upper: {bands.upper[bands.upper.length - 1]?.toFixed(2)}</span>
        <span className="text-[10px] font-medium text-[#848E9C] tabular-nums">SMA: {sma[sma.length - 1]?.toFixed(2)}</span>
        <span className="text-[10px] font-medium text-[#627EEA] tabular-nums">Lower: {bands.lower[bands.lower.length - 1]?.toFixed(2)}</span>
      </div>
      <svg width="100%" height={h - 16} viewBox={`0 0 ${w} ${h - 16}`} preserveAspectRatio="none" className="w-full">
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
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#0B0E11] border-b border-[#2B3139]">
        {(['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as TimeInterval[]).map((tf) => (
          <button
            key={tf}
            onClick={() => setIntervalState(tf)}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-all duration-200 ${
              interval === tf
                ? 'bg-[#2B3139] text-[#F0B90B] tf-breathe-glow'
                : 'text-[#5E6673] hover:text-[#848E9C]'
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
      <div className="flex items-center gap-1 px-2 py-1.5 bg-[#0B0E11] border-t border-b border-[#2B3139]">
        <span className="text-[10px] text-[#5E6673] mr-1 flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Indicator
        </span>
        {([
          { id: 'candle' as IndicatorTab, label: 'Candle' },
          { id: 'rsi' as IndicatorTab, label: 'RSI' },
          { id: 'macd' as IndicatorTab, label: 'MACD' },
          { id: 'bollinger' as IndicatorTab, label: 'Bollinger' },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setIndicatorTab(tab.id)}
            className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all duration-200 ${
              indicatorTab === tab.id
                ? 'bg-gradient-to-r from-[#F0B90B] to-[#F8D12F] text-[#0B0E11] shadow-sm shadow-[#F0B90B]/20'
                : 'bg-[#2B3139] text-[#848E9C] hover:text-[#EAECEF] hover:bg-[#2B3139]/80'
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
  const flashClass = direction === 'up' ? 'price-flash-up' : direction === 'down' ? 'price-flash-down' : '';
  const glowClass = isPositive ? 'glow-green' : 'glow-red';
  const priceGlowClass = isPositive ? 'price-glow-up' : 'price-glow-down';

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${glowClass} price-transition`}>
        {/* Enhanced LIVE badge with prominent pulse */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0ECB81]/15 border border-[#0ECB81]/25 live-badge-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] live-dot" />
          <span className="text-[9px] text-[#0ECB81] font-bold tracking-wider">LIVE</span>
        </div>
        <span
          key={price}
          className={`text-xl font-bold tabular-nums price-transition ${priceGlowClass} ${flashClass} ${
            isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'
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
    <svg width={w} height={h} className="w-full">
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
  const { asks, bids } = mockOrderBook;
  const maxAskTotal = asks[asks.length - 1]?.total || 1;
  const maxBidTotal = bids[bids.length - 1]?.total || 1;

  const displayPrice = livePrice || currentPrice;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2B3139] text-[10px] text-[#5E6673]">
        <span className="w-[38%] text-left">Price(USDT)</span>
        <span className="w-[30%] text-right">Amount(BTC)</span>
        <span className="w-[32%] text-right">Total</span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {/* Asks (sells) - reversed so lowest ask is at bottom (near spread) */}
        <div className="space-y-0">
          {asks.slice(0, 10).reverse().map((ask, i) => (
            <div key={`ask-${i}`} className="relative flex items-center px-3 py-[3px] text-[11px] order-book-row cursor-pointer">
              <div
                className="absolute right-0 top-0 bottom-0 depth-bar-animate"
                style={{
                  width: `${(ask.total / maxAskTotal) * 100}%`,
                  background: `linear-gradient(to left, rgba(246, 70, 93, ${0.04 + (ask.total / maxAskTotal) * 0.12}), rgba(246, 70, 93, 0.02))`,
                }}
              />
              <span className="w-[38%] text-[#F6465D] tabular-nums relative">{formatPrice(ask.price)}</span>
              <span className="w-[30%] text-right text-[#848E9C] tabular-nums relative">{ask.quantity.toFixed(4)}</span>
              <span className="w-[32%] text-right text-[#5E6673] tabular-nums relative">{formatNumber(ask.total, 0)}</span>
            </div>
          ))}
        </div>

        {/* Spread / Current Price */}
        <div className="flex items-center justify-center gap-2 py-1.5 border-y border-[#2B3139] bg-[#0B0E11]">
          <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
            {formatPrice(displayPrice)}
          </span>
          {isPositive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-[#0ECB81]" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-[#F6465D]" />
          )}
          <Badge className="text-[9px] h-4 px-1.5 bg-[#F0B90B]/10 text-[#F0B90B] border-0 font-medium spread-gradient-text">
            Spread: {formatPrice(asks[0]?.price - bids[0]?.price || 0)}
          </Badge>
        </div>

        {/* Bids (buys) */}
        <div className="space-y-0">
          {bids.slice(0, 10).map((bid, i) => (
            <div key={`bid-${i}`} className="relative flex items-center px-3 py-[3px] text-[11px] order-book-row cursor-pointer">
              <div
                className="absolute right-0 top-0 bottom-0 depth-bar-animate"
                style={{
                  width: `${(bid.total / maxBidTotal) * 100}%`,
                  background: `linear-gradient(to left, rgba(14, 203, 129, ${0.04 + (bid.total / maxBidTotal) * 0.12}), rgba(14, 203, 129, 0.02))`,
                }}
              />
              <span className="w-[38%] text-[#0ECB81] tabular-nums relative">{formatPrice(bid.price)}</span>
              <span className="w-[30%] text-right text-[#848E9C] tabular-nums relative">{bid.quantity.toFixed(4)}</span>
              <span className="w-[32%] text-right text-[#5E6673] tabular-nums relative">{formatNumber(bid.total, 0)}</span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

// ── Trade Panel Component ─────────────────────────────────────────────────────
function TradePanel({ pair, livePrice }: { pair: typeof mockMarketPairs[0]; livePrice: number | undefined }) {
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

  const handlePlaceOrder = () => {
    if (!amountNum) return;
    // Mock order placement
    alert(`${side.toUpperCase()} ${orderType.toUpperCase()} order: ${amount} ${pair.baseAsset} at ${orderType === 'market' ? 'Market' : price} ${pair.quoteAsset}`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Buy/Sell Toggle */}
      <div className="flex gap-1 p-2 pb-0 tab-spring-transition">
        <button
          onClick={() => setSide('buy')}
          className={`flex-1 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 touch-feedback ${
            side === 'buy'
              ? 'bg-[#0ECB81]/15 text-[#0ECB81] border-b-2 border-[#0ECB81]'
              : 'text-[#5E6673] hover:text-[#848E9C] border-b-2 border-transparent'
          }`}
        >
          Buy {pair.baseAsset}
        </button>
        <button
          onClick={() => setSide('sell')}
          className={`flex-1 py-2 rounded-t-md text-sm font-semibold transition-all duration-200 touch-feedback ${
            side === 'sell'
              ? 'bg-[#F6465D]/15 text-[#F6465D] border-b-2 border-[#F6465D]'
              : 'text-[#5E6673] hover:text-[#848E9C] border-b-2 border-transparent'
          }`}
        >
          Sell {pair.baseAsset}
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
                  ? 'bg-[#2B3139] text-[#F0B90B]'
                  : 'text-[#5E6673] hover:text-[#848E9C]'
              }`}
            >
              {type === 'stop_limit' ? 'Stop-Limit' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Stop Price (Stop-Limit only) */}
        {orderType === 'stop_limit' && (
          <div>
            <label className="text-[10px] text-[#5E6673]">Stop Price</label>
            <div className="flex items-center bg-[#2B3139] rounded h-8 px-2 mt-0.5">
              <Input
                type="number"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder="Stop price"
                className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-[#3B4451]"
              />
              <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">{pair.quoteAsset}</span>
            </div>
          </div>
        )}

        {/* Price (Limit & Stop-Limit) */}
        {orderType !== 'market' && (
          <div>
            <label className="text-[10px] text-[#5E6673]">Price</label>
            <div className="flex items-center bg-[#2B3139] rounded h-8 px-2 mt-0.5">
              <button onClick={() => setPrice(formatPrice(Math.max(0, priceNum - (currentPrice * 0.001))))} className="text-[#5E6673] hover:text-[#EAECEF] shrink-0">
                <Minus className="h-3 w-3" />
              </button>
              <Input
                type="number"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 mx-1 focus:ring-0 focus:outline-none tabular-nums text-center"
              />
              <button onClick={() => setPrice(formatPrice(priceNum + (currentPrice * 0.001)))} className="text-[#5E6673] hover:text-[#EAECEF] shrink-0">
                <Plus className="h-3 w-3" />
              </button>
              <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">{pair.quoteAsset}</span>
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="text-[10px] text-[#5E6673]">Amount</label>
          <div className="flex items-center bg-[#2B3139] rounded h-8 px-2 mt-0.5">
            <Input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="border-0 bg-transparent text-[#EAECEF] text-sm h-full p-0 focus:ring-0 focus:outline-none tabular-nums placeholder:text-[#3B4451]"
            />
            <span className="text-[10px] text-[#5E6673] shrink-0 ml-1">{pair.baseAsset}</span>
          </div>
        </div>

        {/* Percentage Slider */}
        <div>
          <Slider
            value={[percentSlider]}
            onValueChange={([v]) => handlePercentChange(v)}
            max={100}
            step={1}
            className="w-full [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-[#2B3139] [&_[data-slot=slider-range]]:bg-[#F0B90B] [&_[data-slot=slider-thumb]]:h-3.5 [&_[data-slot=slider-thumb]]:w-3.5 [&_[data-slot=slider-thumb]]:border-[#F0B90B]"
          />
          <div className="flex justify-between mt-1">
            {['25%', '50%', '75%', '100%'].map((pct) => (
              <button
                key={pct}
                onClick={() => handlePercentChange(parseInt(pct))}
                className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                  percentSlider === parseInt(pct)
                    ? 'bg-[#2B3139] text-[#F0B90B]'
                    : 'text-[#5E6673] hover:text-[#848E9C]'
                }`}
              >
                {pct}
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div>
          <label className="text-[10px] text-[#5E6673]">Total</label>
          <div className="flex items-center bg-[#2B3139] rounded h-8 px-2 mt-0.5">
            <span className="text-sm text-[#EAECEF] tabular-nums flex-1">
              {total > 0 ? formatPrice(total) : '0.00'}
            </span>
            <span className="text-[10px] text-[#5E6673] shrink-0">{pair.quoteAsset}</span>
          </div>
        </div>

        {/* Available Balance */}
        <div className="flex justify-between text-[10px]">
          <span className="text-[#5E6673]">Available</span>
          <span className="text-[#848E9C] tabular-nums">
            {side === 'buy' ? `${formatPrice(availableBalance)} ${pair.quoteAsset}` : `${availableBalance.toFixed(6)} ${pair.baseAsset}`}
          </span>
        </div>

        {/* Order Summary */}
        {amountNum > 0 && (
          <div className="bg-[#1E2329] rounded p-2 space-y-1">
            <div className="flex justify-between text-[10px]">
              <span className="text-[#5E6673]">Est. Fee ({feeAsset})</span>
              <span className="text-[#848E9C] tabular-nums">{fee.toFixed(6)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-[#5E6673]">Total ({pair.quoteAsset})</span>
              <span className="text-[#EAECEF] tabular-nums font-medium">{formatPrice(total + (side === 'buy' ? 0 : -fee))}</span>
            </div>
          </div>
        )}

        {/* Place Order Button */}
        <Button
          onClick={handlePlaceOrder}
          className={`w-full font-semibold h-10 text-sm ripple-effect relative overflow-hidden ${
            side === 'buy'
              ? 'bg-[#0ECB81] hover:bg-[#0ECB81]/90 text-white hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-[#F6465D] hover:bg-[#F6465D]/90 text-white hover:scale-[1.02] active:scale-[0.98]'
          } transition-transform duration-150`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {pair.baseAsset}
        </Button>
      </div>
    </div>
  );
}

// ── Open Orders Component ─────────────────────────────────────────────────────
function OpenOrders({ pairSymbol }: { pairSymbol: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>(mockOrders.filter(o => o.status === 'pending' || o.status === 'partially_filled'));

  const handleCancel = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  if (orders.length === 0) return null;

  return (
    <div className="border-t border-[#2B3139]">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#1E2329]/50 transition-colors"
      >
        <span className="text-xs font-semibold text-[#848E9C]">Open Orders ({orders.length})</span>
        <ChevronDown className={`h-4 w-4 text-[#5E6673] transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
      {!collapsed && (
        <ScrollArea className="max-h-48">
          <div className="px-4 pb-3">
            {/* Header */}
            <div className="grid grid-cols-7 gap-2 text-[10px] text-[#5E6673] pb-1 border-b border-[#2B3139]/50">
              <span>Pair</span>
              <span>Side</span>
              <span className="text-right">Price</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Filled</span>
              <span className="text-right">Time</span>
              <span className="text-center">Action</span>
            </div>
            {orders.map((order) => {
              const filledPct = order.quantity > 0 ? (order.filledQty / order.quantity) * 100 : 0;
              return (
                <div key={order.id} className="grid grid-cols-7 gap-2 text-[11px] py-1.5 border-b border-[#2B3139]/30 items-center">
                  <span className="text-[#EAECEF] font-medium">{order.market}</span>
                  <span className={order.side === 'buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}>
                    {order.side.charAt(0).toUpperCase() + order.side.slice(1)}
                  </span>
                  <span className="text-right text-[#EAECEF] tabular-nums">
                    {order.price ? formatPrice(order.price) : 'Market'}
                  </span>
                  <span className="text-right text-[#848E9C] tabular-nums">{order.quantity}</span>
                  <span className="text-right tabular-nums">
                    <span className={filledPct > 0 ? 'text-[#F0B90B]' : 'text-[#848E9C]'}>{filledPct.toFixed(0)}%</span>
                  </span>
                  <span className="text-right text-[#5E6673]">{new Date(order.createdAt).toLocaleTimeString()}</span>
                  <div className="flex justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancel(order.id)}
                      className="h-5 px-2 text-[10px] text-[#F6465D] hover:text-[#F6465D] hover:bg-[#F6465D]/10"
                    >
                      Cancel
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
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#2B3139]">
        <span className="text-[11px] font-semibold text-[#848E9C]">Recent Trades</span>
      </div>
      <div className="flex items-center justify-between px-3 py-0.5 text-[9px] text-[#5E6673]">
        <span className="w-[35%]">Price(USDT)</span>
        <span className="w-[30%] text-right">Amount(BTC)</span>
        <span className="w-[35%] text-right">Time</span>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        {mockTrades.map((trade, idx) => (
          <div key={trade.id} className={`flex items-center justify-between px-3 py-[2px] text-[11px] hover:bg-[#1E2329]/30 ${idx === 0 ? 'flash-highlight' : ''}`}>
            <span className={`w-[35%] tabular-nums ${trade.side === 'buy' ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
              {formatPrice(trade.price)}
            </span>
            <span className="w-[30%] text-right text-[#848E9C] tabular-nums">{trade.quantity}</span>
            <span className="w-[35%] text-right text-[#5E6673]">{new Date(trade.createdAt).toLocaleTimeString()}</span>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
}

// ── Pair Selector Dropdown ────────────────────────────────────────────────────
function PairSelector({ currentPair, onSelect }: { currentPair: typeof mockMarketPairs[0]; onSelect: (symbol: string) => void }) {
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
        className="flex items-center gap-1 text-[#EAECEF] hover:text-[#F0B90B] transition-colors"
      >
        <span className="text-lg font-bold">{currentPair.baseAsset}</span>
        <span className="text-sm text-[#5E6673]">/{currentPair.quoteAsset}</span>
        <ChevronDown className={`h-4 w-4 text-[#5E6673] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#1E2329] border border-[#2B3139] rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-2">
            <Input
              placeholder="Search pair..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="h-7 text-xs bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#3B4451] focus:border-[#F0B90B]"
            />
          </div>
          <ScrollArea className="max-h-64">
            {filtered.map((pair) => {
              const isPositive = pair.changePercent >= 0;
              return (
                <button
                  key={pair.symbol}
                  onClick={() => { onSelect(pair.symbol); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-[#2B3139] transition-colors ${
                    pair.symbol === currentPair.symbol ? 'bg-[#2B3139]/50' : ''
                  }`}
                >
                  <span>
                    <span className="text-[#EAECEF] font-medium">{pair.baseAsset}</span>
                    <span className="text-[#5E6673]">/{pair.quoteAsset}</span>
                  </span>
                  <span className={`tabular-nums ${isPositive ? 'text-[#0ECB81]' : 'text-[#F6465D]'}`}>
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
  const { selectedMarket, setSelectedMarket, livePrices, priceDirection } = useAppStore();

  const currentPair = mockMarketPairs.find(p => p.symbol === selectedMarket) || mockMarketPairs[0];

  // Get live price for the current pair
  const livePrice = livePrices[currentPair.symbol] || currentPair.price;
  const direction = priceDirection[currentPair.symbol] || null;
  const isPositive = currentPair.changePercent >= 0;

  return (
    <div className="flex flex-col h-full">
      {/* ─── Pair Header ─── */}
      <div className="px-3 py-2 border-b border-[#2B3139] bg-[#0B0E11]">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-4">
            <PairSelector
              currentPair={currentPair}
              onSelect={(symbol) => setSelectedMarket(symbol)}
            />
            <LivePriceDisplay price={livePrice} isPositive={isPositive} direction={direction} />
            <Badge className={`text-[10px] font-semibold ${
              isPositive
                ? 'bg-[#0ECB81]/10 text-[#0ECB81] border-0'
                : 'bg-[#F6465D]/10 text-[#F6465D] border-0'
            }`}>
              {isPositive ? <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" /> : <ArrowDownRight className="h-2.5 w-2.5 mr-0.5" />}
              {isPositive ? '+' : ''}{currentPair.changePercent.toFixed(2)}%
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#848E9C]">
            <div>
              <span className="text-[#5E6673]">24h High </span>
              <span className="text-[#0ECB81] tabular-nums">{formatPrice(currentPair.high)}</span>
            </div>
            <div>
              <span className="text-[#5E6673]">24h Low </span>
              <span className="text-[#F6465D] tabular-nums">{formatPrice(currentPair.low)}</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[#5E6673]">24h Vol </span>
              <span className="text-[#EAECEF] tabular-nums">{formatNumber(currentPair.quoteVolume)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Desktop Layout: Chart+OrderBook (2/3) | TradePanel+RecentTrades (1/3) ─── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Left side: Chart + Order Book + Open Orders */}
        <div className="flex-1 flex flex-col min-h-0 lg:border-r border-[#2B3139]">
          {/* Chart - with grid background */}
          <div className="flex-1 min-h-[200px] lg:min-h-0 relative">
            <div className="absolute inset-0 chart-grid-bg opacity-40 pointer-events-none z-0" />
            <div className="relative z-10 h-full">
              <CandlestickChart pairSymbol={currentPair.symbol} livePrice={livePrice} />
            </div>
          </div>

          {/* Order Book + Depth Chart */}
          <div className="h-64 lg:h-56 border-t border-[#2B3139]">
            {/* Depth Chart - compact */}
            <div className="px-3 py-1.5 border-b border-[#2B3139]/50">
              <DepthChart currentPrice={livePrice} isPositive={isPositive} />
            </div>
            <OrderBook currentPrice={livePrice} isPositive={isPositive} livePrice={livePrice} />
          </div>

          {/* Open Orders */}
          <OpenOrders pairSymbol={currentPair.symbol} />
        </div>

        {/* Right side: Trade Panel + Recent Trades */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col min-h-0 shrink-0">
          {/* Trade Panel - glass morphism */}
          <div className="border-b border-[#2B3139] glass-morphism">
            <TradePanel pair={currentPair} livePrice={livePrice} />
          </div>

          {/* Recent Trades */}
          <div className="flex-1 min-h-0">
            <RecentTrades />
          </div>
        </div>
      </div>
    </div>
  );
}
