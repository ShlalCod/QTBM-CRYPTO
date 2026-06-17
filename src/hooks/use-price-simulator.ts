'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/stores/app-store';
import { mockMarketPairs, mockAssets } from '@/lib/mock-data';

// Initialize base prices from mock data
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

// Price info structure from the WebSocket server
interface PriceInfo {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
}

export function usePriceSimulator() {
  const updateLivePrices = useAppStore((s) => s.updateLivePrices);
  const setWsConnected = useAppStore((s) => s.setWsConnected);
  const pricesRef = useRef<Record<string, number>>(getInitialPrices());
  const socketRef = useRef<Socket | null>(null);
  const fallbackIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isUsingWebSocket = useRef(false);
  const hasLoggedFallback = useRef(false);

  // Client-side fallback simulation
  const tick = useCallback(() => {
    const updated = { ...pricesRef.current };

    Object.keys(updated).forEach((symbol) => {
      const currentPrice = updated[symbol];
      if (!currentPrice || currentPrice === 0) return;

      // Random change between -0.5% and +0.5%
      const changePercent = (Math.random() - 0.5) * 1.0; // ±0.5%
      const newPrice = currentPrice * (1 + changePercent / 100);

      // Determine decimal precision based on price magnitude
      let decimals: number;
      if (currentPrice >= 1000) decimals = 2;
      else if (currentPrice >= 1) decimals = 4;
      else if (currentPrice >= 0.01) decimals = 6;
      else decimals = 8;

      updated[symbol] = parseFloat(newPrice.toFixed(decimals));
    });

    pricesRef.current = updated;
    updateLivePrices(updated);
  }, [updateLivePrices]);

  // Start fallback client-side simulation
  const startFallback = useCallback(() => {
    if (isUsingWebSocket.current) return;
    if (!hasLoggedFallback.current) {
      console.debug('[PriceSimulator] Starting client-side fallback simulation');
    }

    // Initial set
    updateLivePrices(pricesRef.current);

    const startInterval = () => {
      const delay = 1000 + Math.random() * 2000;
      fallbackIntervalRef.current = setTimeout(() => {
        tick();
        startInterval();
      }, delay) as unknown as ReturnType<typeof setTimeout>;
    };

    startInterval();
  }, [tick, updateLivePrices]);

  // Stop fallback simulation
  const stopFallback = useCallback(() => {
    if (fallbackIntervalRef.current) {
      clearTimeout(fallbackIntervalRef.current as unknown as number);
      fallbackIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;

    // Try to connect to WebSocket price stream service
    try {
      const socket = io('/?XTransformPort=3003', {
        transports: ['websocket', 'polling'],
        forceNew: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 5000,
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        isUsingWebSocket.current = true;
        setWsConnected(true);
        stopFallback();
      });

      socket.on('price-update', (data: Record<string, PriceInfo>) => {
        // Convert PriceInfo map to simple price map
        const prices: Record<string, number> = {};
        for (const [symbol, info] of Object.entries(data)) {
          prices[symbol] = info.price;
        }
        pricesRef.current = prices;
        updateLivePrices(prices);
      });

      socket.on('ticker-update', (data: { symbol: string; price: number; direction: 'up' | 'down'; changePercent: number }) => {
        // Update the specific ticker in our ref
        pricesRef.current[data.symbol] = data.price;
        updateLivePrices({ ...pricesRef.current });
      });

      socket.on('disconnect', () => {
        setWsConnected(false);
        isUsingWebSocket.current = false;
        // Start fallback if not already running
        startFallback();
      });

      socket.on('connect_error', (error) => {
        if (!hasLoggedFallback.current) {
          console.debug('[PriceSimulator] WebSocket connection error, falling back to client simulation:', error.message);
          hasLoggedFallback.current = true;
        }
        isUsingWebSocket.current = false;
        setWsConnected(false);
        startFallback();
      });

      // Set a timeout - if we don't connect within 5 seconds, start fallback
      reconnectTimeout = setTimeout(() => {
        if (!isUsingWebSocket.current) {
          if (!hasLoggedFallback.current) {
            console.debug('[PriceSimulator] WebSocket connection timeout, starting fallback');
          }
          startFallback();
        }
      }, 5000);

    } catch (error) {
      if (!hasLoggedFallback.current) {
        console.debug('[PriceSimulator] Failed to initialize WebSocket, using client-side simulation:', error);
        hasLoggedFallback.current = true;
      }
      startFallback();
    }

    return () => {
      // Clean up WebSocket connection
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      // Clean up fallback
      stopFallback();
      // Clean up timeout
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      isUsingWebSocket.current = false;
      setWsConnected(false);
    };
  }, [updateLivePrices, setWsConnected, startFallback, stopFallback]);
}
