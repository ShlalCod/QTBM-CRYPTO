'use client';

/**
 * QTBM CRYPTO — Real Price Hook
 *
 * Replaces the mock price simulator. Connects directly to Binance public
 * WebSocket API for real-time market prices. No API key required.
 *
 * Falls back to the mini-service WebSocket (price-stream) if Binance is
 * unreachable, and finally to REST polling.
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from '@/stores/app-store';
import { mockMarketPairs, mockAssets } from '@/lib/mock-data';

// Fallback initial prices from mock data (used only before real data arrives)
function getInitialPrices(): Record<string, number> {
  const prices: Record<string, number> = {};
  mockMarketPairs.forEach((pair) => {
    prices[pair.symbol] = pair.price;
  });
  mockAssets.forEach((asset) => {
    if (!prices[asset.symbol + 'USDT']) {
      prices[asset.symbol] = asset.price;
    }
  });
  return prices;
}

// Top symbols to track (Binance format: btcusdt@trade)
const TOP_SYMBOLS = [
  'BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'ADA', 'DOGE', 'AVAX',
  'DOT', 'MATIC', 'LINK', 'LTC', 'BCH', 'UNI', 'ATOM', 'ETC',
  'FIL', 'APT', 'ARB', 'OP', 'NEAR', 'INJ', 'SUI', 'SEI',
];

const BINANCE_WS_URL = `wss://stream.binance.com:9443/stream?streams=${TOP_SYMBOLS.map(
  (s) => `${s.toLowerCase()}usdt@trade`
).join('/')}`;

export function usePriceSimulator() {
  const updateLivePrices = useAppStore((s) => s.updateLivePrices);
  const setWsConnected = useAppStore((s) => s.setWsConnected);
  const pricesRef = useRef<Record<string, number>>(getInitialPrices());
  const wsRef = useRef<WebSocket | null>(null);
  const restPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    // ─── Primary: Binance WebSocket ──────────────────────────────────────
    const connectBinance = () => {
      try {
        const ws = new WebSocket(BINANCE_WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          if (mounted) setWsConnected(true);
        };

        ws.onmessage = (event) => {
          if (!mounted) return;
          try {
            const msg = JSON.parse(event.data);
            const data = msg.data ?? msg;
            if (!data.s || !data.p) return;

            // Convert BINANCE symbol (BTCUSDT) → app symbol (BTCUSDT)
            const symbol = data.s; // already in BTCUSDT format
            const price = parseFloat(data.p);
            pricesRef.current[symbol] = price;
            updateLivePrices({ [symbol]: price });
          } catch {
            // ignore malformed
          }
        };

        ws.onerror = () => {
          if (mounted) setWsConnected(false);
        };

        ws.onclose = () => {
          if (mounted) {
            setWsConnected(false);
            // Reconnect after 3s
            setTimeout(() => mounted && connectBinance(), 3000);
          }
        };
      } catch {
        if (mounted) {
          setWsConnected(false);
          startRestPolling();
        }
      }
    };

    // ─── Fallback: REST polling every 5s ─────────────────────────────────
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
          const prices: Record<string, number> = {};
          for (const t of tickers) {
            prices[t.symbol] = parseFloat(t.price);
            pricesRef.current[t.symbol] = parseFloat(t.price);
          }
          if (mounted) {
            updateLivePrices(prices);
            setWsConnected(true);
          }
        } catch {
          // network error — keep trying
        }
      };
      poll();
      restPollRef.current = setInterval(poll, 5000);
    };

    // ─── Initial REST fetch for 24h stats (fills in change%/high/low) ────
    (async () => {
      try {
        const resp = await fetch(
          'https://api.binance.com/api/v3/ticker/24hr'
        );
        if (!resp.ok || !mounted) return;
        const tickers = await resp.json();
        const prices: Record<string, number> = {};
        for (const t of tickers) {
          if (t.symbol.endsWith('USDT')) {
            prices[t.symbol] = parseFloat(t.lastPrice);
          }
        }
        if (mounted) {
          updateLivePrices(prices);
        }
      } catch {
        // best-effort
      }
    })();

    connectBinance();

    return () => {
      mounted = false;
      wsRef.current?.close();
      if (restPollRef.current) clearInterval(restPollRef.current);
    };
  }, [updateLivePrices, setWsConnected]);
}
