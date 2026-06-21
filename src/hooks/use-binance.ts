"use client";

/**
 * QTBM CRYPTO — Real Market Data Hook
 *
 * Connects to Binance public WebSocket API for REAL live prices.
 * No API key needed — public market data is free.
 *
 * WebSocket stream: wss://stream.binance.com:9443/ws/<symbol>@trade
 * REST fallback: https://api.binance.com/api/v3/ticker/24hr
 */

import { useEffect, useState, useRef, useCallback } from "react";

export interface LivePrice {
  symbol: string;
  price: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  direction: "up" | "down" | null;
  timestamp: number;
}

const BINANCE_WS_BASE = "wss://stream.binance.com:9443/stream?streams=";
const BINANCE_REST_URL = "https://api.binance.com";

// Normalize symbol: BTC → BTCUSDT
function toBinanceSymbol(symbol: string): string {
  const s = symbol.toUpperCase().replace(/USDT$/, "").replace("/", "");
  return s === "USDT" ? "USDTUSDT" : `${s}USDT`;
}

// Normalize back: BTCUSDT → BTC
function fromBinanceSymbol(binanceSymbol: string): string {
  return binanceSymbol.replace(/USDT$/, "");
}

/**
 * Subscribe to real-time prices for multiple symbols via a single Binance
 * combined WebSocket stream.
 */
export function useLivePrices(symbols: string[]) {
  const [prices, setPrices] = useState<Record<string, LivePrice>>({);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!symbols.length) return;

    const streams = symbols
      .map(toBinanceSymbol)
      .map((s) => `${s.toLowerCase()}@trade`)
      .join("/");

    const wsUrl = `${BINANCE_WS_BASE}${streams}`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          // Combined stream format: { stream: "btcusdt@trade", data: {...} }
          const data = msg.data ?? msg;
          if (!data.s || !data.p) return;

          const symbol = fromBinanceSymbol(data.s);
          const newPrice = parseFloat(data.p);
          const oldPrice = prevPricesRef.current[symbol];
          const direction =
            oldPrice == null ? null : newPrice > oldPrice ? "up" : newPrice < oldPrice ? "down" : null;

          prevPricesRef.current[symbol] = newPrice;

          setPrices((prev) => ({
            ...prev,
            [symbol]: {
              symbol,
              price: newPrice,
              changePercent: prev[symbol]?.changePercent ?? 0,
              high: prev[symbol]?.high ?? newPrice,
              low: prev[symbol]?.low ?? newPrice,
              volume: prev[symbol]?.volume ?? 0,
              direction,
              timestamp: Date.now(),
            },
          }));
        } catch {
          // ignore malformed messages
        }
      };

      ws.onerror = () => setConnected(false);
      ws.onclose = () => setConnected(false);
    } catch {
      setConnected(false);
    }

    // Initial REST fetch for 24hr stats (change%, high, low, volume)
    (async () => {
      try {
        const binanceSymbols = symbols.map(toBinanceSymbol).join(",");
        const resp = await fetch(
          `${BINANCE_REST_URL}/api/v3/ticker/24hr?symbols=${encodeURIComponent(
            JSON.stringify(binanceSymbols.split(","))
          )}`
        );
        if (!resp.ok) return;
        const tickers = await resp.json();
        setPrices((prev) => {
          const next = { ...prev };
          for (const t of tickers) {
            const symbol = fromBinanceSymbol(t.symbol);
            const existing = next[symbol];
            if (existing) {
              next[symbol] = {
                ...existing,
                changePercent: parseFloat(t.priceChangePercent),
                high: parseFloat(t.highPrice),
                low: parseFloat(t.lowPrice),
                volume: parseFloat(t.volume),
              };
            } else {
              next[symbol] = {
                symbol,
                price: parseFloat(t.lastPrice),
                changePercent: parseFloat(t.priceChangePercent),
                high: parseFloat(t.highPrice),
                low: parseFloat(t.lowPrice),
                volume: parseFloat(t.volume),
                direction: null,
                timestamp: Date.now(),
              };
              prevPricesRef.current[symbol] = parseFloat(t.lastPrice);
            }
          }
          return next;
        });
      } catch {
        // REST is best-effort; WebSocket is primary
      }
    })();

    return () => {
      ws?.close();
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(",")]);

  return { prices, connected };
}

/**
 * Subscribe to a single symbol's real-time price.
 */
export function useLivePrice(symbol: string) {
  const { prices, connected } = useLivePrices([symbol]);
  return { price: prices[symbol] ?? null, connected };
}

/**
 * Fetch historical klines (candlestick) data from Binance REST API.
 * Used for chart rendering.
 */
export async function fetchKlines(
  symbol: string,
  interval: "1m" | "5m" | "15m" | "1h" | "4h" | "1d" = "1h",
  limit = 100
): Promise<number[][]> {
  const binanceSymbol = toBinanceSymbol(symbol);
  const resp = await fetch(
    `${BINANCE_REST_URL}/api/v3/klines?symbol=${binanceSymbol}&interval=${interval}&limit=${limit}`
  );
  if (!resp.ok) throw new Error(`Binance API error: ${resp.status}`);
  const data = await resp.json();
  // Each kline: [openTime, open, high, low, close, volume, closeTime, ...]
  return data.map((k: (string | number)[]) => [
    Number(k[0]), // time
    parseFloat(k[1] as string), // open
    parseFloat(k[2] as string), // high
    parseFloat(k[3] as string), // low
    parseFloat(k[4] as string), // close
    parseFloat(k[5] as string), // volume
  ]);
}

/**
 * Fetch order book depth from Binance.
 */
export async function fetchOrderBook(
  symbol: string,
  limit: 5 | 10 | 20 | 50 | 100 = 20
): Promise<{ bids: [number, number][]; asks: [number, number][] }> {
  const binanceSymbol = toBinanceSymbol(symbol);
  const resp = await fetch(
    `${BINANCE_REST_URL}/api/v3/depth?symbol=${binanceSymbol}&limit=${limit}`
  );
  if (!resp.ok) throw new Error(`Binance API error: ${resp.status}`);
  const data = await resp.json();
  return {
    bids: data.bids.map((b: string[]) => [parseFloat(b[0]), parseFloat(b[1])]),
    asks: data.asks.map((a: string[]) => [parseFloat(a[0]), parseFloat(a[1])]),
  };
}

/**
 * Fetch recent trades from Binance.
 */
export async function fetchRecentTrades(
  symbol: string,
  limit = 50
): Promise<{ price: number; qty: number; time: number; isBuyerMaker: boolean }[]> {
  const binanceSymbol = toBinanceSymbol(symbol);
  const resp = await fetch(
    `${BINANCE_REST_URL}/api/v3/trades?symbol=${binanceSymbol}&limit=${limit}`
  );
  if (!resp.ok) throw new Error(`Binance API error: ${resp.status}`);
  const data = await resp.json();
  return data.map((t: (string | number | boolean)[]) => ({
    price: parseFloat(t[1] as string),
    qty: parseFloat(t[2] as string),
    time: Number(t[4]),
    isBuyerMaker: Boolean(t[6]),
  }));
}

/**
 * Fetch all trading pairs from Binance (for markets list).
 */
export async function fetchAllTickers(): Promise<LivePrice[]> {
  const resp = await fetch(`${BINANCE_REST_URL}/api/v3/ticker/24hr`);
  if (!resp.ok) throw new Error(`Binance API error: ${resp.status}`);
  const data = await resp.json();
  return data
    .filter((t: { symbol: string }) => t.symbol.endsWith("USDT"))
    .map((t: {
      symbol: string;
      lastPrice: string;
      priceChangePercent: string;
      highPrice: string;
      lowPrice: string;
      volume: string;
      quoteVolume: string;
    }) => ({
      symbol: fromBinanceSymbol(t.symbol),
      price: parseFloat(t.lastPrice),
      changePercent: parseFloat(t.priceChangePercent),
      high: parseFloat(t.highPrice),
      low: parseFloat(t.lowPrice),
      volume: parseFloat(t.quoteVolume),
      direction: null as "up" | "down" | null,
      timestamp: Date.now(),
    }));
}
