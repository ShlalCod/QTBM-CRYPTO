'use client';

/**
 * QTBM CRYPTO — Real Price Hook (Optimized)
 *
 * - Binance WebSocket for live trade prices (24 symbols)
 * - Binance /ticker/24hr cached locally for 1 hour (was fetching 1MB every launch)
 * - Price updates throttled to every 3 seconds (was every trade = dozens/sec)
 * - REST fallback polling every 5s if WS fails
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { mockMarketPairs, mockAssets } from '@/lib/mock-data';
import { CACHE_KEYS, CACHE_TTL } from './use-local-cache';

function getInitialPrices(): Record<string, number> {
  const prices: Record<string, number> = {};
  mockMarketPairs.forEach((pair) => { prices[pair.symbol] = pair.price; });
  mockAssets.forEach((asset) => {
    if (!prices[asset.symbol + 'USDT']) prices[asset.symbol] = asset.price;
  });
  return prices;
}

const TOP_SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX',
  'DOT', 'MATIC', 'LINK', 'LTC', 'BCH', 'UNI', 'ATOM', 'ETC',
  'FIL', 'APT', 'ARB', 'OP', 'NEAR', 'INJ', 'SUI', 'SEI',
];

const BINANCE_WS_URL = `wss://stream.binance.com:9443/stream?streams=${TOP_SYMBOLS.map(
  (s) => `${s.toLowerCase()}usdt@trade`
).join('/')}`;

const THROTTLE_MS = 3000; // ← Update Zustand every 3 seconds, not every trade

async function getCachedItem(key: string): Promise<string | null> {
  try {
    return localStorage.getItem(key);
  } catch { return null; }
}

async function setCachedItem(key: string, value: string): Promise<void> {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export function usePriceSimulator() {
  const updateLivePrices = useAppStore((s) => s.updateLivePrices);
  const setWsConnected = useAppStore((s) => s.setWsConnected);
  const pricesRef = useRef<Record<string, number>>(getInitialPrices());
  const pendingPricesRef = useRef<Record<string, number>>({});
  const lastFlushRef = useRef<number>(0);
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const restPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Flush pending prices to Zustand (throttled)
  const flushPrices = () => {
    const pending = pendingPricesRef.current;
    if (Object.keys(pending).length === 0) return;
    pendingPricesRef.current = {};
    lastFlushRef.current = Date.now();
    updateLivePrices(pending);
  };

  // Queue a price update (will be flushed on throttle timer)
  const queuePrice = (symbol: string, price: number) => {
    pricesRef.current[symbol] = price;
    pendingPricesRef.current[symbol] = price;
    // If throttle time has passed, flush immediately
    const now = Date.now();
    if (now - lastFlushRef.current >= THROTTLE_MS) {
      flushPrices();
    } else if (!flushTimerRef.current) {
      // Schedule a flush for the remaining throttle window
      const delay = THROTTLE_MS - (now - lastFlushRef.current);
      flushTimerRef.current = setTimeout(() => {
        flushTimerRef.current = null;
        flushPrices();
      }, delay);
    }
  };

  useEffect(() => {
    let mounted = true;

    // ─── 1. Load cached Binance 24hr stats (1 hour TTL) ────────────────
    (async () => {
      const cachedRaw = await getCachedItem(CACHE_KEYS.BINANCE_24HR);
      if (cachedRaw) {
        try {
          const parsed = JSON.parse(cachedRaw);
          if (Date.now() - parsed.timestamp < CACHE_TTL.BINANCE_24HR) {
            const prices: Record<string, number> = parsed.data;
            Object.assign(pricesRef.current, prices);
            if (mounted) updateLivePrices(prices);
            return; // Cache still fresh, skip network fetch
          }
        } catch { /* ignore */ }
      }

      // Cache expired or missing — fetch from Binance
      try {
        const resp = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        if (!resp.ok || !mounted) return;
        const tickers = await resp.json();
        const prices: Record<string, number> = {};
        for (const t of tickers) {
          if (t.symbol.endsWith('USDT')) {
            prices[t.symbol] = parseFloat(t.lastPrice);
          }
        }
        // Save to cache
        await setCachedItem(CACHE_KEYS.BINANCE_24HR, JSON.stringify({
          data: prices,
          timestamp: Date.now(),
        }));
        Object.assign(pricesRef.current, prices);
        if (mounted) updateLivePrices(prices);
      } catch { /* best-effort */ }
    })();

    // ─── 2. Binance WebSocket for live trades ──────────────────────────
    const connectBinance = () => {
      try {
        const ws = new WebSocket(BINANCE_WS_URL);
        wsRef.current = ws;
        ws.onopen = () => { if (mounted) setWsConnected(true); };
        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const msg = JSON.parse(event.data);
            const data = msg.data ?? msg;
            if (!data.s || !data.p) return;
            queuePrice(data.s, parseFloat(data.p));
          } catch { /* ignore */ }
        };
        ws.onerror = () => { if (mounted) setWsConnected(false); };
        ws.onclose = () => {
          if (mounted) {
            setWsConnected(false);
            setTimeout(() => mounted && connectBinance(), 3000);
          }
        };
      } catch {
        if (mounted) { setWsConnected(false); startRestPolling(); }
      }
    };

    // ─── 3. REST fallback polling ──────────────────────────────────────
    const startRestPolling = () => {
      if (restPollRef.current) return;
      const poll = async () => {
        try {
          const symbolsParam = encodeURIComponent(
            JSON.stringify(TOP_SYMBOLS.map((s) => `${s}USDT`))
          );
          const resp = await fetch(
            `https://api.binance.com/api/v3/ticker/price?symbols=${symbolsParam}`
          );
          if (!resp.ok) return;
          const tickers = await resp.json();
          for (const t of tickers) {
            queuePrice(t.symbol, parseFloat(t.price));
          }
          if (mounted) setWsConnected(true);
        } catch { /* keep trying */ }
      };
      poll();
      restPollRef.current = setInterval(poll, 5000);
    };

    connectBinance();

    return () => {
      mounted = false;
      wsRef.current?.close();
      if (restPollRef.current) clearInterval(restPollRef.current);
      if (flushTimerRef.current) clearTimeout(flushTimerRef.current);
    };
  }, [updateLivePrices, setWsConnected]);
}
